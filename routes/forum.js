const express = require("express");
const routes = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const Account = require("./account");
const Post = require("./post");

routes.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/wsvDB");

routes.use(
  session({
    secret: "Cs>&kv#g#NVE(b7l[+F#V%$B|TO*yHwn",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1800000,
    },
  })
);
routes.get("/", async (req, res) => {
  res.status(200);

  const sessionUsername = req.session.username;
  const sessionPassword = req.session.password;

  if (sessionUsername == undefined || sessionPassword == undefined) {
    res.redirect("/login");
  } else {
    if (CheckAccount(sessionUsername, sessionPassword)) {
      const user = await GetAccount(sessionUsername);
      if (user.banaccount && user.muteaccount) {
        res.redirect("/login");
      } else if (user.banaccount) {
        res.redirect("/login");
      } else if (user.muteaccount) {
        const posts = await Post.find();
        const showPost = [];

        posts.forEach((dataPost) => {
          const dataShowPost = `<div id="post-${dataPost.postid}" class="post"><div id="post-left-${dataPost.postid}" class="post-left"><h1><a href="/forum/user/${dataPost.authoruuid}">${dataPost.author}</a></h1><h1>[${dataPost.rank}]</h1><h3>${dataPost.createAt}</h3></div><div id="post-right-${dataPost.postid}" class="post-right"><h1><a href="/forum/post/${dataPost.postid}">${dataPost.title}</a></h1><p>${dataPost.subtitle}</p></div></div>`;
          showPost.push(dataShowPost);
        });
        if (showPost == "") {
          showPost.push(`<div id="none">Không có dử liệu</div>`);
        }
        res.render("forum-mute", {
          message: "Bạn bị cấm đăng bài/bình luận",
          content: showPost,
          ussername: user.username,
          rank: user.rank,
          accountLinnk: user.uuid,
        });
      } else {
        const posts = await Post.find();
        const showPost = [];

        posts.forEach((dataPost) => {
          const dataShowPost = `<div id="post-${dataPost.postid}" class="post"><div id="post-left-${dataPost.postid}" class="post-left"><h1><a href="/forum/user/${dataPost.authoruuid}">${dataPost.author}</a></h1><h1>[${dataPost.rank}]</h1><h4>${dataPost.createAt}</h3></div><div id="post-right-${dataPost.postid}" class="post-right"><h1><a href="/forum/post/${dataPost.postid}">${dataPost.title}</a></h1><p>${dataPost.subtitle}</p></div></div>`;
          showPost.push(dataShowPost);
        });
        if (showPost == "") {
          showPost.push(`<div id="none">Không có dử liệu</div>`);
        }
        res.render("forum", {
          content: showPost,
          ussername: user.username,
          rank: user.rank,
          accountLinnk: user.uuid,
        });
      }
    } else {
      res.redirect("/login");
    }
  }
});

async function CheckAccount(username, password) {
  const user = await Account.findOne({ username });
  if (!user) return false;
  if (user.password === password) {
    return true;
  } else {
    return false;
  }
}

async function GetAccount(username) {
  try {
    const user = await Account.findOne({ username });
    return user;
  } catch (err) {
    return err;
  }
}

module.exports = routes;

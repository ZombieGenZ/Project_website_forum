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
      res.redirect("/forum");
    } else {
      res.redirect("/login");
    }
  }
});

routes.get("/:id", async (req, res) => {
  res.status(200);

  const sessionUsername = req.session.username;
  const sessionPassword = req.session.password;

  if (sessionUsername == undefined || sessionPassword == undefined) {
    res.redirect("/login");
  } else {
    if (CheckAccount(sessionUsername, sessionPassword)) {
      const checkPostID = await CheckPostById(req.params.id);
      if (checkPostID != null) {
        const user = await GetAccountByUsernname(sessionUsername);
        const post = await GetPostById(req.params.id);
        if (user.rank == "Admin") {
          res.render("edit", {
            accountLinnk: user.uuid,
            ussername: user.username,
            rank: user.rank,
            title: post.title,
            subtitle: post.subtitle,
            content: post.content,
            postid: req.params.id,
          });
        } else if (post.author == user.username) {
          res.render("edit", {
            accountLinnk: user.uuid,
            ussername: user.username,
            rank: user.rank,
            title: post.title,
            subtitle: post.subtitle,
            content: post.content,
            postid: req.params.id,
          });
        } else {
          res.redirect(`/forum/post/${req.params.id}`);
        }
      } else {
        res.render("ERROR", {
          ErrorCode: "Error 404",
          ErrorMessage: `Không tìm thấy dử liệu phù hợp được yêu cầu`,
        });
      }
    } else {
      res.redirect("/login");
    }
  }
});

routes.post("/:id", async (req, res) => {
  res.status(200);

  const sessionUsername = req.session.username;
  const sessionPassword = req.session.password;

  const newTitle = req.body.title;
  const newSubTitle = req.body.subtitle;
  const newContent = req.body.content;

  if (sessionUsername == undefined || sessionPassword == undefined) {
    res.redirect("/login");
  } else {
    if (CheckAccount(sessionUsername, sessionPassword)) {
      const user = await GetAccountByUsernname(sessionUsername);
      const post = await GetPostById(req.params.id);
      if (newTitle == post.title && newSubTitle == post.subtitle && newContent == post.content) {
        res.render("edit-ERROR", {
          message: "Không có thay đổi nào được thực hiện",
          accountLinnk: user.uuid,
          ussername: user.username,
          rank: user.rank,
          title: post.title,
          subtitle: post.subtitle,
          content: post.content,
          postid: req.params.id,
        });
      }
      else {
        post.title = newTitle;
        post.subtitle = newSubTitle;
        post.content = newContent;
        const now = new Date();
        const years = now.getFullYear();
        const months = now.getMonth() < 10 ? "0" + String(now.getMonth()) : String(now.getMonth());
        const days = now.getDate() < 10 ? "0" + String(now.getDate()) : String(now.getDate());
        const hours = now.getHours() < 10 ? "0" + String(now.getHours()) : String(now.getHours());
        const minutes = now.getMinutes() < 10 ? "0" + String(now.getMinutes()) : String(now.getMinutes());
        const seconds = now.getSeconds() < 10 ? "0" + String(now.getSeconds()) : String(now.getSeconds());
        post.updateAt = `${hours}:${minutes}:${seconds} ${days}/${months}/${years}`;
        await post.save();
        res.redirect(`/forum/post/${req.params.id}`);
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

async function GetAccountByUsernname(username) {
  try {
    const user = await Account.findOne({ username });
    return user;
  } catch (err) {
    return err;
  }
}

async function GetPostById(postid) {
  try {
    const post = await Post.findOne({ postid });
    return post;
  } catch (err) {
    return err;
  }
}

async function CheckPostById(postid) {
  try {
    const post = await Post.findOne({ postid });
    return post;
  } catch (err) {
    return null;
  }
}

module.exports = routes;

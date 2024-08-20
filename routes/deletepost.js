const express = require("express");
const routes = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const Account = require("./account");
const Post = require("./post");
const Comment = require("./comment");

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
          await DeletePostById(req.params.id);
          await Comment.deleteMany({ commentform: `${req.params.id}` });
          res.redirect("/forum");
        } else if (post.author == user.username) {
          await DeletePostById(req.params.id);
          res.redirect("/forum");
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

async function DeletePostById(postid) {
  await Post.deleteOne({ postid: postid });
}

module.exports = routes;

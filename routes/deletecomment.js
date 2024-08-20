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
      const checkCommentID = await CheckCommentById(req.params.id);
      console.log(checkCommentID);
      if (checkCommentID != null) {
        const user = await GetAccountByUsernname(sessionUsername);
        const cmt = await GetCommentById(req.params.id);
        if (user.rank == "Admin") {
          await DeleteCommentById(req.params.id);
          res.redirect(`/forum/post/${cmt.commentfrom}`);
        } else if (cmt.authorcomment == user.username) {
          await DeleteCommentById(req.params.id);
          res.redirect(`/forum/post/${cmt.commentfrom}`);
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

async function GetCommentById(commentid) {
  try {
    const cmt = await Comment.findOne({ commentid: commentid });
    return cmt;
  } catch (err) {
    return err;
  }
}

async function CheckCommentById(commentid) {
  try {
    const cmt = await Comment.findOne({ commentid });
    return cmt;
  } catch (err) {
    return null;
  }
}

async function DeleteCommentById(commentid) {
  await Comment.deleteOne({ commentid: commentid });
}

module.exports = routes;

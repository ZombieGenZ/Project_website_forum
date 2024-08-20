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
        res.redirect("/forum");
      } else {
        res.render("create", {
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

routes.post("/", async (req, res) => {
  const sessionUsername = req.session.username;
  let title = req.body.title;
  let subtitle = req.body.subtitle;
  let content = req.body.content;

  const user = await GetAccount(sessionUsername);

  if (title == "" && subtitle == "" && content == "") {
    res.render("create-ERROR", {
      message: "Không được để trống tất cả các dử liệu",
      ussername: user.username,
      rank: user.rank,
      accountLinnk: user.uuid,
    });
  } else {
    try {
      title = title == "" ? "Không có tiêu đề" : title;
      subtitle = subtitle == "" ? "Không có nội dung ngắn" : subtitle;
      content = content == "" ? "Không có nội dung" : content;

      user.totalpost++;
      await user.save();

      CreateNewPost(
        title,
        subtitle,
        content,
        user.username,
        user.uuid,
        user.rank
      );

      res.redirect("/forum");
    } catch (err) {
      res.render("create-ERROR", {
        message: `${err}`,
        ussername: user.username,
        rank: user.rank,
        accountLinnk: user.uuid,
      });
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

async function CreateNewPost(
  title,
  subtitle,
  content,
  author,
  authoruuid,
  rank
) {
  try {
    await Post.create({
      title: title,
      subtitle: subtitle,
      content: content,
      author: author,
      authoruuid: authoruuid,
      rank: rank,
    });
  } catch (err) {
    throw err;
  }
}

module.exports = routes;

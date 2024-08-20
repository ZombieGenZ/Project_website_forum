const express = require("express");
const routes = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const Account = require("./account");

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

routes.get("/", (req, res) => {
  res.status(200);

  const sessionUsername = req.session.username;
  const sessionPassword = req.session.password;

  if (sessionUsername == undefined || sessionPassword == undefined) {
    res.render("login");
  } else {
    if (CheckAccount(sessionUsername, sessionPassword)) {
      res.redirect("/forum");
    } else {
      res.render("login");
    }
  }
});

routes.post("/", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("login-ERROR", {
      message: "Vui lòng nhập đầy đủ thông tin",
    });
  } else {
    const acceptLogin = await CheckAccount(username, password);
    if (acceptLogin == true) {
      const user = await GetAccount(username);
      if (user.banaccount) {
        res.render("login-ERROR", {
          message: `${user.username} đã bị khóa tài khoản`,
        });
      } else {
        req.session.username = username;
        req.session.password = password;
        req.session.save();
        res.redirect("/forum");
      }
    } else {
      res.render("login-ERROR", {
        message: "Tài khoản hoặc mật khẩu không chính xác",
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

module.exports = routes;

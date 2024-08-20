const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const Account = require("./account");

const routes = express.Router();

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
    res.render("register");
  } else {
    if (CheckAccount(sessionUsername, sessionPassword)) {
      res.redirect("/forum");
    } else {
      res.render("register");
    }
  }
});

routes.post("/", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const comfirmpassword = req.body.comfirmpassword;

  if (username === "" || password === "" || comfirmpassword === "") {
    res.render("register-ERROR", {
      message: "Vui lòng nhập đầy đủ thông tin",
    });
  } else {
    if (password === comfirmpassword) {
      try {
        const existingAccount = await FindAccount(username);
        if (existingAccount != null) {
          res.render("register-ERROR", { message: "Username đã tồn tại" });
        } else {
          if (username.length > 13) {
            res.render("register-ERROR", { message: "Username quá dài" });
          } else {
            CreateNewAccount(username, password);
            req.session.username = username;
            req.session.password = password;
            req.session.save();
            res.redirect("/login");
          }
        }
      } catch (err) {
        res.render("register-ERROR", { message: `${err}` });
      }
    } else {
      res.render("register-ERROR", {
        message: "Mật khẩu và xác nhận mật khẩu không trùng khớp",
      });
    }
  }
});

async function FindAccount(username) {
  try {
    const account = await Account.findOne({ username });
    return account;
  } catch (err) {
    return null;
  }
}

async function CreateNewAccount(username, password) {
  try {
    await Account.create({ username: username, password: password });
  } catch (err) {
    throw err;
  }
}

async function CheckAccount(username, password) {
  try {
    const account = await Account.findOne({ username });
    if (account.username === username && account.password === password) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return null;
  }
}

module.exports = routes;

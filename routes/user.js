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
      const checkUUID = await CheckAccountById(req.params.id);
      if (checkUUID != null) {
        const user = await GetAccountById(req.params.id);
        const me = await GetAccountByUsernname(sessionUsername);
        if (user.username == sessionUsername) {
          res.render("profile-me", {
            ussername: user.username,
            rank: user.rank,
            uuid: user.uuid,
            createAt: user.createAt,
            totalPost: user.totalpost,
            totalComment: user.totalcomment,
          });
        } else {
          if (me.rank == "Admin") {
            if (user.banaccount && user.muteaccount) {
              res.render("profile-ADMIN-ERROR", {
                message: `Người dùng ${user.username} đã bị cấm đăng bài/bình luận và bị khóa tài khoản`,
                ussername: user.username,
                rank: user.rank,
                accountLinnk: me.uuid,
                uuid: user.uuid,
                createAt: user.createAt,
                totalPost: user.totalpost,
                totalComment: user.totalcomment,
                actban: "unbanaccount",
                titleban: "Unban user",
                actmute: "unmuteaccount",
                titlemute: "Unmute user",
              });
            } else if (user.banaccount) {
              res.render("profile-ADMIN-ERROR", {
                message: `Người dùng ${user.username} đã bị khóa tài khoản`,
                ussername: user.username,
                rank: user.rank,
                accountLinnk: me.uuid,
                uuid: user.uuid,
                createAt: user.createAt,
                totalPost: user.totalpost,
                totalComment: user.totalcomment,
                actban: "unbanaccount",
                titleban: "Unban user",
                actmute: "muteaccount",
                titlemute: "Mute user",
              });
            } else if (user.muteaccount) {
              res.render("profile-ADMIN-ERROR", {
                message: `Người dùng ${user.username} đã bị cấm đăng bài/bình luận`,
                ussername: user.username,
                rank: user.rank,
                accountLinnk: me.uuid,
                uuid: user.uuid,
                createAt: user.createAt,
                totalPost: user.totalpost,
                totalComment: user.totalcomment,
                actban: "banaccount",
                titleban: "Ban user",
                actmute: "unmuteaccount",
                titlemute: "Unmute user",
              });
            } else {
              res.render("profile-ADMIN", {
                ussername: user.username,
                rank: user.rank,
                accountLinnk: me.uuid,
                uuid: user.uuid,
                createAt: user.createAt,
                totalPost: user.totalpost,
                totalComment: user.totalcomment,
                actban: "banaccount",
                titleban: "Ban user",
                actmute: "muteaccount",
                titlemute: "Mute user",
              });
            }
          }
          else {
            if (user.banaccount && user.muteaccount) {
              res.render("profile-ERROR", {
                message: `Người dùng ${user.username} đã bị cấm đăng bài/bình luận và bị khóa tài khoản`,
                ussername: user.username,
                rank: user.rank,
                accountLinnk: me.uuid,
                uuid: user.uuid,
                createAt: user.createAt,
                totalPost: user.totalpost,
                totalComment: user.totalcomment,
              });
            } else if (user.banaccount) {
              res.render("profile-ERROR", {
                message: `Người dùng ${user.username} đã bị khóa tài khoản`,
                ussername: user.username,
                rank: user.rank,
                accountLinnk: me.uuid,
                uuid: user.uuid,
                createAt: user.createAt,
                totalPost: user.totalpost,
                totalComment: user.totalcomment,
              });
            } else if (user.muteaccount) {
              res.render("profile-ERROR", {
                message: `Người dùng ${user.username} đã bị cấm đăng bài/bình luận`,
                ussername: user.username,
                rank: user.rank,
                accountLinnk: me.uuid,
                uuid: user.uuid,
                createAt: user.createAt,
                totalPost: user.totalpost,
                totalComment: user.totalcomment,
              });
            } else {
              res.render("profile", {
                ussername: user.username,
                rank: user.rank,
                accountLinnk: me.uuid,
                uuid: user.uuid,
                createAt: user.createAt,
                totalPost: user.totalpost,
                totalComment: user.totalcomment,
              });
            }
          }
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
  req.session.destroy();
  res.redirect("/login");
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

async function GetAccountById(uuid) {
  try {
    const user = await Account.findOne({ uuid });
    return user;
  } catch (err) {
    return err;
  }
}

async function CheckAccountById(uuid) {
  try {
    const user = await Account.findOne({ uuid });
    return user;
  } catch (err) {
    return null;
  }
}

module.exports = routes;

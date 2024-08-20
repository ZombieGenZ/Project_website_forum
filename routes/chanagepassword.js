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
      res.redirect("/forum");
    } else {
      res.redirect("/login");
    }
  }
});

routes.post("/:id", async (req, res) => {
  res.status(200);

  const sessionUsername = req.session.username;
  const sessionPassword = req.session.password;

  const password = req.body.password;
  const newPassword = req.body.newPassword;
  const newComfirmPassword = req.body.newComfirmPassword;

  if (sessionUsername == undefined || sessionPassword == undefined) {
    res.redirect("/login");
  } else {
    if (CheckAccount(sessionUsername, sessionPassword)) {
      const checkAccountID = await CheckAccountById(req.params.id);
      if (checkAccountID != null) {
        const user = await GetAccountByUsernname(sessionUsername);
        const account = await GetAccountById(req.params.id);
        if (user.username == account.username) {
          if (password == account.password) {
            if (newPassword == newComfirmPassword) {
              if (account.password != newPassword) {
                  account.password = newPassword;
                  account.save();
                  req.session.destroy();
                  res.redirect(`/login`);
              }
              else {
                res.render("profile-me-ERROR", {
                    message: "Mật khẩu mới không được giống mật khẩu cũ",
                    ussername: user.username,
                    rank: user.rank,
                    accountLinnk: user.uuid,
                    uuid: user.uuid,
                    createAt: user.createAt,
                    totalPost: user.totalpost,
                    totalComment: user.totalcomment,
                  });
              }
            } else {
              res.render("profile-me-ERROR", {
                message: "Mật khẩu và xác minh mật khẩu không trùng khớp",
                ussername: user.username,
                rank: user.rank,
                accountLinnk: user.uuid,
                uuid: user.uuid,
                createAt: user.createAt,
                totalPost: user.totalpost,
                totalComment: user.totalcomment,
              });
            }
          } else {
            res.render("profile-me-ERROR", {
              message: "Mật khẩu không chính xác",
              ussername: user.username,
              rank: user.rank,
              accountLinnk: user.uuid,
              uuid: user.uuid,
              createAt: user.createAt,
              totalPost: user.totalpost,
              totalComment: user.totalcomment,
            });
          }
        } else {
          res.redirect(`/forum/user/${req.params.id}`);
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

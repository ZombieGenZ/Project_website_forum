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
        const post = await GetPostById(req.params.id);
        const user = await GetAccountByUsernname(post.author);
        const me = await GetAccountByUsernname(sessionUsername);
        const comments = await Comment.find();
        const showComment = [];

        comments.forEach((dataComment) => {
          if (dataComment.commentfrom == req.params.id) {
            if (me.rank == "Admin") {
              const dataShowComment = `<div id="comment_id-${dataComment.commentid}" class="comment"><div id="headerComment_id-${dataComment.commentid}" class="header-commet"><a href="/forum/user/${dataComment.authoruuidcomment}">${dataComment.authorcomment}</a></div><p>${dataComment.timecomment}</p><div id="contentCommennt_id-${dataComment.commentid}" class="conntent-commennt">${dataComment.contentcomment}</div><a href="/forum/comment/delete/${dataComment.commentid}"><button id="delete">Delete</button></a></div>`;
              showComment.push(dataShowComment);
            } else if (me.username == dataComment.authorcomment) {
              const dataShowComment = `<div id="comment_id-${dataComment.commentid}" class="comment"><div id="headerComment_id-${dataComment.commentid}" class="header-commet"><a href="/forum/user/${dataComment.authoruuidcomment}">${dataComment.authorcomment}</a></div><p>${dataComment.timecomment}</p><div id="contentCommennt_id-${dataComment.commentid}" class="conntent-commennt">${dataComment.contentcomment}</div><a href="/forum/comment/delete/${dataComment.commentid}"><button id="delete">Delete</button></a></div>`;
              showComment.push(dataShowComment);
            } else {
              {
                const dataShowComment = `<div id="comment_id-${dataComment.commentid}" class="comment"><div id="headerComment_id-${dataComment.commentid}" class="header-commet"><a href="/forum/user/${dataComment.authoruuidcomment}">${dataComment.authorcomment}</a></div><p>${dataComment.timecomment}</p><div id="contentCommennt_id-${dataComment.commentid}" class="conntent-commennt">${dataComment.contentcomment}</div></div>`;
                showComment.push(dataShowComment);
              }
            }
          }
        });
        if (me.muteaccount) {
          if (me.rank == "Admin") {
            if (user.banaccount && user.muteaccount) {
              res.render("view-me-mute-ERROR", {
                message: `Người dùng ${user.username} đã bị cấm đăng bài/bình luận và bị khóa tài khoản`,
                ussername: me.username,
                rank: me.rank,
                title: post.title,
                subtitle: post.subtitle,
                content: post.content,
                author: post.author,
                authoruuid: post.authoruuid,
                postid: post.postid,
                createAt: post.createAt,
                accountLinnk: me.uuid,
                comment: showComment,
              });
            } else if (user.banaccount) {
              res.render("view-me-mute-ERROR", {
                message: `Người dùng ${user.username} đã bị khóa tài khoản`,
                ussername: me.username,
                rank: me.rank,
                title: post.title,
                subtitle: post.subtitle,
                content: post.content,
                author: post.author,
                authoruuid: post.authoruuid,
                postid: post.postid,
                createAt: post.createAt,
                accountLinnk: me.uuid,
                comment: showComment,
              });
            } else if (user.muteaccount) {
              res.render("view-me-mute-ERROR", {
                message: `Người dùng ${user.username} đã bị cấm đăng bài/bình luận`,
                ussername: me.username,
                rank: me.rank,
                title: post.title,
                subtitle: post.subtitle,
                content: post.content,
                author: post.author,
                authoruuid: post.authoruuid,
                postid: post.postid,
                createAt: post.createAt,
                accountLinnk: me.uuid,
                comment: showComment,
              });
            } else {
              res.render("view-me-mute", {
                ussername: me.username,
                rank: me.rank,
                title: post.title,
                subtitle: post.subtitle,
                content: post.content,
                author: post.author,
                authoruuid: post.authoruuid,
                postid: post.postid,
                createAt: post.createAt,
                accountLinnk: me.uuid,
                comment: showComment,
              });
            }
          } else {
            if (post.author == me.username) {
              res.render("view-me-mute", {
                ussername: me.username,
                rank: me.rank,
                title: post.title,
                subtitle: post.subtitle,
                content: post.content,
                author: post.author,
                authoruuid: post.authoruuid,
                postid: post.postid,
                createAt: post.createAt,
                accountLinnk: me.uuid,
                comment: showComment,
              });
            } else {
              if (user.banaccount && user.muteaccount) {
                res.render("view-mute-ERROR", {
                  message: `Người dùng ${user.username} đã bị cấm đăng bài/bình luận và bị khóa tài khoản`,
                  ussername: me.username,
                  rank: me.rank,
                  title: post.title,
                  subtitle: post.subtitle,
                  content: post.content,
                  author: post.author,
                  authoruuid: post.authoruuid,
                  postid: post.postid,
                  createAt: post.createAt,
                  accountLinnk: me.uuid,
                  comment: showComment,
                });
              } else if (user.banaccount) {
                res.render("view-mute-ERROR", {
                  message: `Người dùng ${user.username} đã bị khóa tài khoản`,
                  ussername: me.username,
                  rank: me.rank,
                  title: post.title,
                  subtitle: post.subtitle,
                  content: post.content,
                  author: post.author,
                  authoruuid: post.authoruuid,
                  postid: post.postid,
                  createAt: post.createAt,
                  accountLinnk: me.uuid,
                  comment: showComment,
                });
              } else if (user.muteaccount) {
                res.render("view-mute-ERROR", {
                  message: `Người dùng ${user.username} đã bị cấm đăng bài/bình luận`,
                  ussername: me.username,
                  rank: me.rank,
                  title: post.title,
                  subtitle: post.subtitle,
                  content: post.content,
                  author: post.author,
                  authoruuid: post.authoruuid,
                  postid: post.postid,
                  createAt: post.createAt,
                  accountLinnk: me.uuid,
                  comment: showComment,
                });
              } else {
                res.render("view-mute", {
                  ussername: me.username,
                  rank: me.rank,
                  title: post.title,
                  subtitle: post.subtitle,
                  content: post.content,
                  author: post.author,
                  authoruuid: post.authoruuid,
                  postid: post.postid,
                  createAt: post.createAt,
                  accountLinnk: me.uuid,
                  comment: showComment,
                });
              }
            }
          }
        } else {
          if (me.rank == "Admin") {
            if (user.banaccount && user.muteaccount) {
              res.render("view-me-ERROR", {
                message: `Người dùng ${user.username} đã bị cấm đăng bài/bình luận và bị khóa tài khoản`,
                ussername: me.username,
                rank: me.rank,
                title: post.title,
                subtitle: post.subtitle,
                content: post.content,
                author: post.author,
                authoruuid: post.authoruuid,
                postid: post.postid,
                createAt: post.createAt,
                accountLinnk: me.uuid,
                comment: showComment,
              });
            } else if (user.banaccount) {
              res.render("view-me-ERROR", {
                message: `Người dùng ${user.username} đã bị khóa tài khoản`,
                ussername: me.username,
                rank: me.rank,
                title: post.title,
                subtitle: post.subtitle,
                content: post.content,
                author: post.author,
                authoruuid: post.authoruuid,
                postid: post.postid,
                createAt: post.createAt,
                accountLinnk: me.uuid,
                comment: showComment,
              });
            } else if (user.muteaccount) {
              res.render("view-me-ERROR", {
                message: `Người dùng ${user.username} đã bị cấm đăng bài/bình luận`,
                ussername: me.username,
                rank: me.rank,
                title: post.title,
                subtitle: post.subtitle,
                content: post.content,
                author: post.author,
                authoruuid: post.authoruuid,
                postid: post.postid,
                createAt: post.createAt,
                accountLinnk: me.uuid,
                comment: showComment,
              });
            } else {
              res.render("view-me", {
                ussername: me.username,
                rank: me.rank,
                title: post.title,
                subtitle: post.subtitle,
                content: post.content,
                author: post.author,
                authoruuid: post.authoruuid,
                postid: post.postid,
                createAt: post.createAt,
                accountLinnk: me.uuid,
                comment: showComment,
              });
            }
          } else {
            if (post.author == me.username) {
              res.render("view-me", {
                ussername: me.username,
                rank: me.rank,
                title: post.title,
                subtitle: post.subtitle,
                content: post.content,
                author: post.author,
                authoruuid: post.authoruuid,
                postid: post.postid,
                createAt: post.createAt,
                accountLinnk: me.uuid,
                comment: showComment,
              });
            } else {
              if (user.banaccount && user.muteaccount) {
                res.render("view-ERROR", {
                  message: `Người dùng ${user.username} đã bị cấm đăng bài/bình luận và bị khóa tài khoản`,
                  ussername: me.username,
                  rank: me.rank,
                  title: post.title,
                  subtitle: post.subtitle,
                  content: post.content,
                  author: post.author,
                  authoruuid: post.authoruuid,
                  postid: post.postid,
                  createAt: post.createAt,
                  accountLinnk: me.uuid,
                  comment: showComment,
                });
              } else if (user.banaccount) {
                res.render("view-ERROR", {
                  message: `Người dùng ${user.username} đã bị khóa tài khoản`,
                  ussername: me.username,
                  rank: me.rank,
                  title: post.title,
                  subtitle: post.subtitle,
                  content: post.content,
                  author: post.author,
                  authoruuid: post.authoruuid,
                  postid: post.postid,
                  createAt: post.createAt,
                  accountLinnk: me.uuid,
                  comment: showComment,
                });
              } else if (user.muteaccount) {
                res.render("view-ERROR", {
                  message: `Người dùng ${user.username} đã bị cấm đăng bài/bình luận`,
                  ussername: me.username,
                  rank: me.rank,
                  title: post.title,
                  subtitle: post.subtitle,
                  content: post.content,
                  author: post.author,
                  authoruuid: post.authoruuid,
                  postid: post.postid,
                  createAt: post.createAt,
                  accountLinnk: me.uuid,
                  comment: showComment,
                });
              } else {
                res.render("view", {
                  ussername: me.username,
                  rank: me.rank,
                  title: post.title,
                  subtitle: post.subtitle,
                  content: post.content,
                  author: post.author,
                  authoruuid: post.authoruuid,
                  postid: post.postid,
                  createAt: post.createAt,
                  accountLinnk: me.uuid,
                  comment: showComment,
                });
              }
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
  const sessionUsername = req.session.username;

  const commnent = req.body.comment;

  const id = req.params.id;

  const post = await GetPostById(req.params.id);
  const me = await GetAccountByUsernname(sessionUsername);

  if (commnent == "") {
    if (post.author == me.username) {
      res.render("view-me-ERROR", {
        message: "Không thể để trống bình luận",
        ussername: me.username,
        rank: me.rank,
        title: post.title,
        subtitle: post.subtitle,
        content: post.content,
        author: post.author,
        authoruuid: post.authoruuid,
        postid: post.postid,
        createAt: post.createAt,
        accountLinnk: me.uuid,
      });
    } else {
      res.render("view-ERROR", {
        messsage: "Không thể để trống bình luận",
        ussername: me.username,
        rank: me.rank,
        title: post.title,
        subtitle: post.subtitle,
        content: post.content,
        author: post.author,
        authoruuid: post.authoruuid,
        postid: post.postid,
        createAt: post.createAt,
        accountLinnk: me.uuid,
      });
    }
  } else {
    me.totalcomment++;
    await me.save();

    CreateNewComment(req.params.id, me.username, me.uuid, commnent);
    setTimeout(() => {
      res.redirect(`/forum/post/${id}`);
    }, 300);
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

async function CreateNewComment(commentfrom, author, authoruuid, content) {
  try {
    await Comment.create({
      commentfrom: commentfrom,
      authorcomment: author,
      authoruuidcomment: authoruuid,
      contentcomment: content,
    });
  } catch (err) {
    throw err;
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

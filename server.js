const express = require("express");
const ejs = require("ejs");
const bodyParser = require('body-parser');
const { v4 } = require('uuid');
const crypto = require('crypto');
const mongoose = require("mongoose");
const session = require("express-session");
const port = 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(
    session({
      secret: "Cs>&kv#g#NVE(b7l[+F#V%$B|TO*yHwn",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1800000,
      },
    })
  );

app.get("/", (req, res) => {
    res.status(200);
    res.redirect('/login');
});

const loginRoutes = require("./routes/login");
const registerRoutes = require("./routes/register");
const forumRoutes = require("./routes/forum");
const userRoutes = require("./routes/user");
const createPostRoutes = require("./routes/create");
const postRoutes = require("./routes/show");
const editPostRoutes = require("./routes/editpost");
const deletePostRoutes = require("./routes/deletepost");
const deleteCommentRoutes = require("./routes/deletecomment");
const banAccountRoutes = require("./routes/banaccount");
const unBanAccountRoutes = require("./routes/unbanaccount");
const muteAccountRoutes = require("./routes/muteaccount");
const unMuteAccountRoutes = require("./routes/unmuteaccount");
const chanagePasswordRoutes = require("./routes/chanagepassword");


app.use('/login', loginRoutes);
app.use('/register', registerRoutes);
app.use('/forum', forumRoutes);
app.use('/forum/user', userRoutes);
app.use('/forum/post/create', createPostRoutes);
app.use('/forum/post', postRoutes);
app.use('/forum/post/edit', editPostRoutes);
app.use('/forum/post/delete', deletePostRoutes);
app.use('/forum/comment/delete', deleteCommentRoutes);
app.use('/forum/user/banaccount', banAccountRoutes);
app.use('/forum/user/unbanaccount', unBanAccountRoutes);
app.use('/forum/user/muteaccount', muteAccountRoutes);
app.use('/forum/user/unmuteaccount', unMuteAccountRoutes);
app.use('/forum/user/chanagepassword', chanagePasswordRoutes);

app.listen(port);
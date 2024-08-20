const mongoose = require("mongoose");
const { v4 } = require('uuid');
const crypto = require('crypto');

const post = new mongoose.Schema({
    postid: {
        type: String,
        required: true,
        immuitable: true,
        unique: true,
        default: function () {
            const randomBytes = crypto.randomBytes(16);
            const uuidString = v4({ uuid: randomBytes, random: randomBytes });
            return uuidString;
          },
    },
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    authoruuid: {
        type: String,
        required: true,
    },
    rank: {
        type: String,
        required: true,
    },
    comment: {
        type: Boolean,
        required: true,
        default: true,
    },
    createAt: {
        type: String,
        required: true,
        default: function() {
            const now = new Date();
            const years = now.getFullYear();
            const months = now.getMonth() < 10 ? "0" + String(now.getMonth()) : String(now.getMonth());
            const days = now.getDate() < 10 ? "0" + String(now.getDate()) : String(now.getDate());
            const hours = now.getHours() < 10 ? "0" + String(now.getHours()) : String(now.getHours());
            const minutes = now.getMinutes() < 10 ? "0" + String(now.getMinutes()) : String(now.getMinutes());
            const seconds = now.getSeconds() < 10 ? "0" + String(now.getSeconds()) : String(now.getSeconds());
            return `${hours}:${minutes}:${seconds} ${days}/${months}/${years}`;
          },
        immuitable: true,
    },
    updateAt: {
        type: String,
        required: true,
        default: function() {
            const now = new Date();
            const years = now.getFullYear();
            const months = now.getMonth() < 10 ? "0" + String(now.getMonth()) : String(now.getMonth());
            const days = now.getDate() < 10 ? "0" + String(now.getDate()) : String(now.getDate());
            const hours = now.getHours() < 10 ? "0" + String(now.getHours()) : String(now.getHours());
            const minutes = now.getMinutes() < 10 ? "0" + String(now.getMinutes()) : String(now.getMinutes());
            const seconds = now.getSeconds() < 10 ? "0" + String(now.getSeconds()) : String(now.getSeconds());
            return `${hours}:${minutes}:${seconds} ${days}/${months}/${years}`;
          },
    },
});

module.exports = mongoose.model("Post", post);
const mongoose = require("mongoose");
const { v4 } = require('uuid');
const crypto = require('crypto');

const account = new mongoose.Schema({
    uuid: {
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
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    rank: {
        type: String,
        required: true,
        default: "Member",
    },
    totalpost: {
        type: Number,
        required: true,
        default: 0,
    },
    totalcomment: {
        type: Number,
        required: true,
        default: 0,
    },
    banaccount: {
        type: Boolean,
        required: true,
        default: false,
    },
    muteaccount: {
        type: Boolean,
        required: true,
        default: false,
    },
    createAt: {
        type: String,
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

module.exports = mongoose.model("Account", account);
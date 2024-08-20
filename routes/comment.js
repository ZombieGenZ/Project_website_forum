const mongoose = require("mongoose");
const { v4 } = require('uuid');
const crypto = require('crypto');

const comment = new mongoose.Schema({
    commentid: {
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
    commentfrom: {
        type: String,
        required: true,
    },
    authorcomment: {
        type: String,
        required: true,
    },
    authoruuidcomment: {
        type: String,
        required: true,
    },
    timecomment: {
        type: Date,
        required: true,
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
    },
    contentcomment: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("Comment", comment);
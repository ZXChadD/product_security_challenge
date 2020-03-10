const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        max: 1024
    }
})

module.exports = mongoose.model('Blacklist', blacklistSchema)
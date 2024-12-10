var mongoose = require('mongoose');

var dailylogCommentsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    dailylogId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    text: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('DailylogCommentsSchema', dailylogCommentsSchema)
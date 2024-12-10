var mongoose = require('mongoose')
var dailylogFiresSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    dailylogId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    isFired: {
        type: Boolean,
        required: true
    }
})

module.exports = mongoose.model('DailylogFiresSchema', dailylogFiresSchema)
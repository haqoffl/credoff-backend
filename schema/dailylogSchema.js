var mongoose = require('mongoose')

var dailylogSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    text:{
        type:String,
        required:true
    },
    image:{
        type:String,
        
    },
    fires:{
        type:Number,
        default:0
    }
}
)

module.exports = mongoose.model("dailylogSchema",dailylogSchema)
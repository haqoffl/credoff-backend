var mongoose = require('mongoose')

var dailylogSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    github_id:{
        type:Number,
        required:true,
        unique:true
    },
    github_node_id:{
        type:String,
        required:true,
        unique:true
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
    video:{
        type:String,   
    },
    fires:{
        type:Number,
        default:0
    }
}
)

module.exports = mongoose.model("DailylogSchema",dailylogSchema)
var mongoose = require('mongoose')
var youtuberSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
    },
    github_node_id:{
        type:String,
        required:true,
        unique:true
    },
    github_id:{
        type:Number,
        required:true,
        unique:true
    },
    youtubeChannelName:{
        type:String,
        required:true
    },
    language:{
        type:String,
        required:true
    },

    url:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('YoutuberSchema',youtuberSchema)
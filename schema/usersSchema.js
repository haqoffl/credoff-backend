var mongoose = require('mongoose')
var usersSchema = mongoose.Schema({
    githubId:{
        type:String,
        required:true,
        unique:true
    },
    userName:{
        type:String,
        required:true,
        unique:true
    },
    fullName:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    role:{
        type:String,
        required:true
    },
    isYoutuber:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('UsersSchema',usersSchema)
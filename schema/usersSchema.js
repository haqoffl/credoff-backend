var mongoose = require('mongoose')
var usersSchema = new mongoose.Schema({
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
    fullName:{
        type:String,
        required:true
    },
    dateOfBirth:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true
    },
  
})

module.exports = mongoose.model('UsersSchema',usersSchema)
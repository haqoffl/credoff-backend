var mongoose = require('mongoose')
var learnerDetailSchema = new mongoose.Schema({
    learnerId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model("LearnerDetailSchema",learnerDetailSchema)
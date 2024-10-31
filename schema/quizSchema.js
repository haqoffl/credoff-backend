var mongoose = require('mongoose');

var quizSchema = new mongoose.Schema({
    tubeId : {
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    OGQ_quizzes:{
        type:[]
    }
    ,
    simple_quizzes:{
        type:[]
    },
    tags:{
        type:[String],
        required:true
    }
})

module.exports = mongoose.model('QuizSchema',quizSchema)


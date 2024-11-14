var mongoose = require('mongoose')
var certificationSchema = new mongoose.Schema({
    tubeId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    tubeName:{
        type:String,
        required:true
    },
    thumbnail:{
            type:String,
            required:true
    },
    learnerId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    learnerName:{
        type:String,
        required:true
    },
   
    language:{
        type:String,
        required:true
    },
 
    youtuberName:{
        type:String,
        required:true
    },
    youtuberChannelName:{
        type:String,
        required:true
    },
    scoredAtQuiz:{
        type:Number,
        required:true
    },
    totalQuizPoints:{
        type:Number,
        default:15
    },
    scoredOnAiEvaluationAtProject:{
type:Number,
required:true
    },
    totalSoredOnAiEvaluationAtProjectPoints:{
        type:Number,
        default:15
    },
    isMinted:{
        type:Boolean,
        default:false
    },
    issuedDate:{
        type:Date,
        
    },
  
})
module.exports = mongoose.model("CertificationSchema",certificationSchema)
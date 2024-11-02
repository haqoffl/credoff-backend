var mongoose = require('mongoose');
var tubeSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    thumbnail:{
type:String,
required:true
    },
    desc:{
        type:String,
        required:true
    },
    tags:{
        type:[String],
        required:true
    },

    terms:{
        type:[
            {
                filePath:{type:String,required:true},
                keywords:{type:[String],required:true},
            }
        ],
        required:true
    },
    conditions:{
        type:[
            {
                filePath:{type:String,required:true},
                commentStart:{type:String,required:true},
                commentEnd:{type:String,required:true},
                function:{type:String,required:true}
            }
        ],
        required:true
    },
    programming_language:{
        type:String,
        required:true
    },
    earned_amount:{
        type:Number,
        default:0
    },
    issued_certificate:{
        type:Number,
        default:0
    },
    ownedBy:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model("TubeSchema",tubeSchema)
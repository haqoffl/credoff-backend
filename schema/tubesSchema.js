var mongoose = require('mongoose');
var tubeSchema = mongoose.Schema({
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
                fileName:{type:String,required:true},
                keywords:{type:[String],required:true},
            }
        ],
        required:true
    },
    conditions:{
        type:[
            {
                fileName:{type:String,required:true},
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
    // ownedBy:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     required:true
    // }
})

module.exports = mongoose.model("TubeSchema",tubeSchema)
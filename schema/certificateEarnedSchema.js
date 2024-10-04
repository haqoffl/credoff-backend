var mongoose = require('mongoose')

var certificateEarnedSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    owned_ids:{
        type:[Number],
        default:[]
    }
})

module.exports = mongoose.model("CertificatedEarnedSchema",certificateEarnedSchema)
var mongoose = require('mongoose')
var tubeAnalyticsSchema = new mongoose.Schema({
    tubeId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    totalMint:{
        type:Number,
        default:0
    },
    minters:{
        type:[String]
    }
})

module.exports = mongoose.model("TubeAnalyticsSchama",tubeAnalyticsSchema)
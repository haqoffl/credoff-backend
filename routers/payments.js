var express = require('express')
const certificationSchema = require('../schema/certificationSchema')
const learnerDetailSchema = require('../schema/learnerDetailSchema')
var router = express.Router()

router.post('/',async(req,res)=>{
   try{
   if(req.body.event === "payment.captured"){
    console.log(req.body.payload.payment)
    let entity = req.body.payload.payment.entity
    let id = entity.notes.certificateid
    console.log(id)
    let ids = id.split('-')
    let learnerId = ids[1]
    let tubeId = ids[0]
    let issuedDate = new Date()
    let dt = await certificationSchema.updateOne({learnerId,tubeId,isMinted:true,issuedDate})
    let isLearnerDataExisit = await learnerDetailSchema.findOne({learnerId:learnerId})
    if(!isLearnerDataExisit){
        let learnerData =  new learnerDetailSchema({
            learnerId:learnerId,
            phoneNumber:entity.notes.phone,
            email:entity.notes.email
    })
    await learnerData.save()

    }
    res.status(200).send({message:"certificate generated successfully!",dt})


   }
    
    
   }catch(err){
    res.status(400).send({err,message:"internal server issue,try again later"})
   }
})


module.exports = router
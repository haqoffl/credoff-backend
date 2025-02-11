var express = require('express')
var crypto = require('crypto')
const certificationSchema = require('../schema/certificationSchema')
const learnerDetailSchema = require('../schema/learnerDetailSchema')
const tubesSchema = require('../schema/tubesSchema')
var router = express.Router()

router.post('/',async(req,res)=>{
   try{
   if(req.body.event === "payment.captured"){
    console.log(req.body.payload.payment)
    let entity = req.body.payload.payment.entity
    let id = entity.notes.certificateid
    console.log(id)
    let ids = id.split('-')
    let learnerId = ids[0]
    let tubeId = ids[1]
    let issuedDate = new Date()
    var webhook_secret_key = process.env.RAZORPAY_WEBHOOK_SECRET_KEY
    const shasum = crypto.createHmac('sha256', webhook_secret_key)
    shasum.update(JSON.stringify(req.body))
    const digest = shasum.digest('hex')
    if (digest !== req.headers['x-razorpay-signature']) {
        return res.status(400).send({ message: 'Invalid signature' });
    }else{
        let dt = await certificationSchema.updateOne({learnerId:learnerId,tubeId:tubeId},{$set:{isMinted:true,issuedDate:issuedDate}})
        let perCertificatePrice = 199
        let  commisionPercentagePerCertificate = 50
        let commissionForYoutuberPerCertificate = perCertificatePrice*(commisionPercentagePerCertificate/100)
        await tubesSchema.updateOne({_id:tubeId},{$inc:{issued_certificate:1,earned_amount:commissionForYoutuberPerCertificate}})
    
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



   }
    
    
   }catch(err){
    res.status(400).send({err,message:"internal server issue,try again later"})
   }
})

router.post("/free",async(req,res)=>{
    let {learnerId,tubeId} = req.body
   if(!learnerId || !tubeId){
    res.status(400).send({message:"insufficient body data"})
   }else{
    try{
        let dt = await certificationSchema.updateOne({learnerId:learnerId,tubeId:tubeId},{$set:{isMinted:true,issuedDate:Date.now()}})
        res.status(200).send({message:"certificate generated successfully!",dt})
   }catch(err){
    res.status(400).send({err,message:"internal server issue,try again later"})
   }
   }
})
module.exports = router
var express = require('express');
var router = express.Router();
const dailylogSchema = require('../schema/dailylogSchema');
const dailylogFiresSchema = require('../schema/dailylogFiresSchema');
let dailylogCommentsSchema = require('../schema/dailylogCommentsSchema')
let usersSchema = require('../schema/usersSchema')
var multer = require('multer')
const storage = require('../storageEngineForDailylog');

var upload = multer({storage})

router.post('/create',upload.single("image"),async(req,res)=>{
    try{
        let {userId,text} = req.body
        let isUserExist = await usersSchema.findOne({_id:userId})
        if(!isUserExist){
            res.status(400).send({message:"user does not exist"})
        }else{
            let dailyLog = new dailylogSchema({
                userId,
                date:new Date(),
                text,
                image:req.file.filename
            })
            let dt = await dailyLog.save()
            res.status(200).send(dt)
        }
     
    }catch(err){
        console.log(err)
        res.status(400).send({err})
    }
})
router.post('/fireDailyLog',async(req,res)=>{
    try{
        let {userId,dailylogId} = req.body
        let isUserExist = await usersSchema.findOne({_id:userId})
        let isAlreadyFired = await dailylogFiresSchema.findOne({userId,dailylogId})
        if(!isUserExist || isAlreadyFired){
            res.status(400).send({message:"try again later"})
        }else{
            let dt = await dailylogSchema.updateOne({_id:dailylogId},{$inc:{fires:1}})
            let fire = new dailylogFiresSchema({
                userId,
                dailylogId,
                isFired:true
            })
            await fire.save()
            res.status(200).send({dt,fire})
        }
      
    }catch(err){
        console.log(err)
        res.status(400).send({err})
    }
})
router.post('/comment',async(req,res)=>{
    try{
        let {userId,dailylogId,text} = req.body
        let isUserExist = await usersSchema.findOne({_id:userId})
   if(!userId,!dailylogId,!text){
    res.status(400).send({message:"insufficient body data"})
   }else{
    if(!isUserExist){
        res.status(400).send({message:"user does not exist"})
    }else{
        let dt = new dailylogCommentsSchema({
            userId,
            dailylogId,
            text
        })
        await dt.save()
        res.status(200).send(dt)
    }
   }
     
    }catch(err){
        console.log(err)
        res.status(400).send({err})
    }
})
module.exports = router
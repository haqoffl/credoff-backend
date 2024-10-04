var express = require('express');
const tubesSchema = require('../schema/tubesSchema');
var router = express.Router()

router.get('/',(req,res)=>{
    res.status(200).send({
        message:"tube router working"
    })
})

router.post('/createTube',async(req,res)=>{
    let {title,thumbnail,desc,tags,terms,conditions,programming_language} = req.body
    try{
        if(!title||!thumbnail||!desc||!tags||!terms||!conditions||!programming_language){
            res.status(400).send({
                message:"bad request"
            })
        }else{
            let tube = new tubesSchema({
                title,
                thumbnail,
                desc,
                tags,
                terms,
                conditions,
                programming_language
            })
            let data = await tube.save()
            res.status(200).send({
                message:"tube created",
                response:{id:data._id}
            })
            
        }
    }catch(err){
        res.status(500).send({
            message:"Internal server issue!. try again later",
            response:err
        })
    }
})

router.get('/getTubes',async(req,res)=>{
    let data =  await tubesSchema.find()
    res.status(200).send(data)
})


router.get('/getTube/:id',async(req,res)=>{
    let data =  await tubesSchema.findOne({_id:req.params.id})
    res.status(200).send(data)
})

module.exports = router
var express = require('express');
var axios = require('axios');
const tubesSchema = require('../schema/tubesSchema');
var router = express.Router()
var {OpenAI} =require("openai");
const certificationSchema = require('../schema/certificationSchema');
var openai = new OpenAI({apiKey:process.env.OPENAI_API_KEY})
router.post('/patternMatching',async(req,res)=>{
try{
    let {url,id} = req.body

let tube = await tubesSchema.findOne({_id:id})
terms = tube.terms
console.log("terms",terms)
let promises = terms.map(async(element,index) => {
    let scored_points = 0
    let total_points = element.keywords.length
    console.log(element.keywords)
    //getting code from raw github
    let raw_github_domain = url.replace("github.com","raw.githubusercontent.com")
    let github_raw_url = raw_github_domain+"/refs/heads/main"+encodeURIComponent(element.filePath)
    let response = await axios.get(github_raw_url)
    let code = `${response.data}`
    //splitting lines of the code
    let split_code = code.split('\n');

    //triming the space of each array of code lines
    let trim_code = split_code.map((val)=>{
        return val.trim()
    })

    //removing empty string in array
    let remove_unwanted_space_in_code = trim_code.filter((val)=>{
            return val != ""  
    })
    

    element.keywords.forEach(elem =>{
        // finding index of keyword
        let index =  remove_unwanted_space_in_code.findIndex(val=>{
             return val == elem
         })
         //checking whether the the keyword includes in code
         let is_there = code.includes(elem)
     
         if(is_there == true || index != -1){
                 scored_points++;
         }
     })
     return ({index,scored_points,total_points})
});

let resp = await Promise.all(promises);
res.status(200).send(resp)
}catch(err){
    res.status(400).send({message:"internal issue",err})
}

})

router.post('/projectValidation',async(req,res)=>{
    try{
        let {url,id} = req.body
        let tube = await tubesSchema.findOne({_id:id})
        terms = tube.terms
        let promises = tube.conditions.map(async(val)=>{
            let raw_github_domain = url.replace("github.com","raw.githubusercontent.com")
        let github_raw_url = raw_github_domain+"/refs/heads/main/"+encodeURIComponent(val.filePath)
        console.log(github_raw_url)
        let response = await axios.get(github_raw_url)
        let code = `${response.data}`
        let start_comment = val.commentStart
        let end_comment = val.commentEnd
        let start = code.indexOf(start_comment);
        let end = code.indexOf(end_comment);
        let extractedCode =code.slice(start+start_comment.length,end).trim()
    
            return {extractedCode, function:val.function}
    
        })
        
        let code_promise = await Promise.all(promises)
        let ai_promise = code_promise.map(async(val)=>{
        let completion = await openai.chat.completions.create({
            model:"gpt-4o-mini-2024-07-18",
            messages:[
                {role:"system",content:"you are expert at all programming language."+val.function+" and write very comment,suggestion and points out of 10 about it"},
                {role:"user",content:val.extractedCode.toString()}
            ],
            response_format:{
                type:"json_schema",
                json_schema:{
                    name:"response_schema",
                    schema:{
                        type:"object",
                        properties:{
                        isCorrect:{type:"boolean"},
                        comment:{type:"string"},
                        points:{type:"integer"}
                        },
                        additionalProperties:false,
                        required:["isCorrect","comment","points"]
                    }
                }
            }
        })

        return completion.choices[0].message.content
        })
        let result = await Promise.all(ai_promise)
        res.status(200).send(result)
    }catch(err){
        console.log(err)
        res.status(400).send(err)
    }
})



router.post('/MarkEvaluationComplete',async(req,res)=>{
let {tubeId,tubeName,thumbnail,learnerId,learnerName,language,youtuberName,youtuberChannelName,quizScore,aiScore,git_fullName,git_name,git_url, git_description,git_language,git_stars,git_forks,git_pushed_at,git_visibility} = req.body

try{
    let isAlreadyMark = await certificationSchema.findOne({tubeId,learnerId})
    if(!isAlreadyMark){
        let certScehma = new certificationSchema({
            tubeId,
            tubeName,
            thumbnail,
            learnerId,
            learnerName,
            language,
            youtuberName,
            youtuberChannelName,
            scoredAtQuiz:quizScore,
            scoredOnAiEvaluationAtProject:aiScore,
            git_fullName,
            git_name,
            git_url,
            git_description,
            git_language,
            git_stars,
            git_forks,
            git_pushed_at,
           git_visibility
        })
        let dt = await certScehma.save()
        res.status(200).send(dt)
    }else{
        res.status(201).send({message:"you can't mark the same certificate again!"})
    }

}catch(err){
    res.status(400).send({message:"internal issue",err})
}

})

router.get('/getAllCertificates/:learnerId',async(req,res)=>{
try{
    let {learnerId} = req.params
    if(!learnerId){
        res.status(400).send({message:"insufficient body data"})
    }else{
        let dt = await certificationSchema.find({learnerId})
        res.status(200).send(dt)
    }
}catch(err){
    console.log(err)
    res.status(400).send({message:"internal issue",err})
}
})

router.get('/getCertificate/:learnerId/:tubeId',async(req,res)=>{
    console.log("triggered")
    try{
        let {learnerId,tubeId} = req.params
        if(!learnerId || !tubeId){
            res.status(400).send({message:"insufficient body data"})
        }else{
            let dt = await certificationSchema.findOne({learnerId,tubeId})
            res.status(200).send(dt)
        }
    }catch(err){
        console.log(err)
        res.status(400).send({message:"internal issue",err})
    }
    })
 
 
module.exports = router
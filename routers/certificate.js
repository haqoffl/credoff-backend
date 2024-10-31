var express = require('express');
var axios = require('axios');
const tubesSchema = require('../schema/tubesSchema');
var router = express.Router()
var {OpenAI} =require("openai")
var openai = new OpenAI()
router.post('/patternMatching',async(req,res)=>{
let {url,id} = req.body

let tube = await tubesSchema.findOne({_id:id})
terms = tube.terms

let promises = terms.map(async(element,index) => {
    let scored_points = 0
    let total_points = element.keywords.length
    //getting code from raw github
    let raw_github_domain = url.replace("github.com","raw.githubusercontent.com")
    let github_raw_url = raw_github_domain+"/refs/heads/main/"+encodeURIComponent(element.fileName)
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

})

router.post('/projectValidation',async(req,res)=>{
    try{
        let {url,id} = req.body
        let tube = await tubesSchema.findOne({_id:id})
        terms = tube.terms
        let promises = tube.conditions.map(async(val)=>{
            let raw_github_domain = url.replace("github.com","raw.githubusercontent.com")
        let github_raw_url = raw_github_domain+"/refs/heads/main/"+encodeURIComponent(val.fileName)
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
                {role:"system",content:"you are expert at all programming language."+val.function+" and write very short comment about it"},
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
                        comment:{type:"string"}
                        },
                        additionalProperties:false,
                        required:["isCorrect","comment"]
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



module.exports = router
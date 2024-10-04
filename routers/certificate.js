var express = require('express');
var axios = require('axios');
const tubesSchema = require('../schema/tubesSchema');
var router = express.Router()

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

router.get('/quiz/model/choose',async(req,res)=>{
    
})

module.exports = router
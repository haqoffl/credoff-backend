var express = require('express')
var router = express.Router()
var axios = require('axios')
const youtuberSchema = require('../schema/youtuberSchema')
const usersSchema = require('../schema/usersSchema')

//router for getting github access token
router.get('/logViaGithub/reqAccessToken/:clientId/:code/',async(req,res)=>{
    console.log("called");
    let {clientId,code} = req.params
    axios.post('https://github.com/login/oauth/access_token/?client_id='+clientId+"&client_secret="+process.env.GITHUB_CLIENT_SECRET+"&code="+code,{Headers:{"Accept": "application/json"}}).then(async (resp)=>{
    console.log(resp.data)
        res.status(200).send(resp.data)
    }).catch(err=>{
        console.log(err)
        res.status(400).send(err)
    })
    
})

//router for storing user account details in our database
router.post('/createAccount/youtuber',async(req,res)=>{
    let {fullName,channelName,channelURL,language,oauthToken} = req.body
if(!fullName||!channelName||!channelURL||!language||!oauthToken){
    res.status(400).send({message:"inaccurate data"})
}else{
    axios.get('https://api.github.com/user', {
        headers: {
            'Authorization': `Bearer ${oauthToken}`
        }
    })
    .then(async response => {
        let isThere = await youtuberSchema.findOne({github_id:response.data.id});
        if(!isThere){
        try{
            let ys = new youtuberSchema({
                fullName,
                youtubeChannelName:channelName,
                language,
                github_node_id:response.data.node_id,
                github_id:response.data.id,
                url:channelURL
            })
         let data = await ys.save()
         res.status(200).send({youtuberId:data._id,github_id:data.github_id,github_node_id:data.github_node_id,message:"account created"})
        }catch(err){
            console.log(err)
            res.status(400).send({message:"something went wrong"})
        }
        }else{
            res.status(200).send("account already created!")
        }
    })
    .catch(error => {
        console.error('Error fetching user data:', error); 
    });
}


})

router.post('/createAccount/learner',async(req,res)=>{
    let {fullName,dateOfBirth,role,oauthToken} = req.body
if(!fullName||!dateOfBirth||!role||!oauthToken){
    res.status(400).send({message:"inaccurate data"})
}else{
    axios.get('https://api.github.com/user', {
        headers: {
            'Authorization': `Bearer ${oauthToken}`
        }
    })
    .then(async response => {
        let isThere = await usersSchema.findOne({github_id:response.data.id});
        if(!isThere){
        try{
            let ls = new usersSchema({
                fullName,
               dateOfBirth,
               role,
               github_id:response.data.id,
               github_node_id:response.data.node_id
            })
         let data = await ls.save()
         res.status(200).send({learnerId:data._id,github_id:data.github_id,github_node_id:data.github_node_id,message:"account created"})
        }catch(err){
            console.log(err)
            res.status(400).send({message:"something went wrong"})
        }
        }else{
            res.status(200).send("account already created!")
        }
    })
    .catch(error => {
        console.error('Error fetching user data:', error); 
    });
}


})

//router for check whether the users created account in our side and let them login


router.post('/loginToCredoff/learner',async(req,res)=>{
    axios.get('https://api.github.com/user', {
        headers: {
            'Authorization': `Bearer ${req.body.oauthToken}`
        }
    }).then(async(response)=>{
        let isLearner = await usersSchema.findOne({github_id:response.data.id});
        if(isLearner){
            res.status(200).send({learnerId:isLearner._id,name:isLearner.fullName,github_id:isLearner.github_id,github_node_id:isLearner.github_node_id})
        }else{
            res.status(400).send({message:"account not created yet"})
        }

    }).catch(err=>{
        res.status(400).send({message:"internal server issue"})
    })
})
router.post('/loginToCredoff/youtuber',async(req,res)=>{
    axios.get('https://api.github.com/user', {
        headers: {
            'Authorization': `Bearer ${req.body.oauthToken}`
        }
    }).then(async response=>{
        let isYoutuber = await youtuberSchema.findOne({github_id:response.data.id});
    
        if(isYoutuber){
            res.status(200).send({youtuberId:isYoutuber._id,name:isYoutuber.fullName,github_id:isYoutuber.github_id,github_node_id:isYoutuber.github_node_id,channelName:isYoutuber.youtubeChannelName,language:isYoutuber.language})
        }else{
            res.status(400).send({message:"account not created yet!"})
        }
        }).catch(err=>{
console.log(err)
res.status(400).send({message:"internal issue,try again later"})
        })
})

function userValidate(req,res,next){
    axios.get('https://api.github.com/user', {
        headers: {
            'Authorization': `Bearer ${req.body.oauthToken}`
        }
    }).then(res=>{
        next()
    }).catch(err=>{
        res.status(400).send({err})
      
    })
}
router.post('/validateLearner/',userValidate,async(req,res)=>{
if(!req.body.oauthToken || !req.body.id){
    res.status(400).send("insufficient body data")

}else{
   try{
    let isLearner = await usersSchema.findOne({_id:req.body.id});
    if(isLearner){
        res.status(200).send({userStatus:"good"})
    }else{
        res.status(400).send({message:"account not created yet"})
    }
   }catch(err){
    res.status(404).send({message:"internal server issue",err})
   }
}
    
})

router.post('/validateYoutuber',userValidate,async(req,res)=>{
if(!req.body.oauthToken || !req.body.id){
res.status(400).send("insufficient body data")
}else{
   try{
    let isYoutuber = await youtuberSchema.findOne({_id:req.body.id});
    
    if(isYoutuber){
        res.status(200).send({userStatus:"good"})
    }else{
        res.status(400).send({message:"account not created yet!"})
    }
   }catch(err){
    res.status(404).send({err,message:"internal server issue try again later"})
   }
}
})

router.post('/updateLearner',async(req,res)=>{
    let {id,fullName,dob}  = req.body
  if(!id){
    res.status(400).send({message:"insufficient data"})
  }else{
   try{
    let getData = await usersSchema.findOne({_id:id})
    let fn = !fullName?getData.fullName:fullName
    let dateOfBir = !dob?getData.dateOfBirth:dob
    await usersSchema.updateOne({_id:id},{$set:{fullName:fn,dateOfBirth:dateOfBir}})
    res.status(200).send({message:"account updated successfully!"})
   }catch(err){
    res.status(400).send(err)
   }
  }
})

router.post('/updateYoutuber',async(req,res)=>{
    let {id,fullName,channelName,channelURL,language} = req.body
    if(!id){
        res.status(400).send({message:"insufficient data"})
    }else{
        try{
            let getData = await youtuberSchema.findOne({_id:id})
            let fn = !fullName?getData.fullName:fullName
            let cn = !channelName?getData.youtubeChannelName:channelName
            let cu = !channelURL?getData.url:channelURL
            let lang = !language?getData.language:language
            await youtuberSchema.updateOne({_id:id},{$set:{fullName:fn,youtubeChannelName:cn,url:cu,language:lang}})
            res.status(200).send({message:"account updated"})
        }catch(err){
          
            res.status(400).send(err)
        }
    }
})

router.get('/githubRepos/:accessToken',async(req,res)=>{
    console.log("hello")
    let {accessToken} = req.params
    axios.get('https://api.github.com/user', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }).then(resp=>{
        axios.get(`https://api.github.com/users/${resp.data.login}/repos`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }                                   
        }).then(resp_2=>{
            res.status(200).send(resp_2.data)
        }).catch(err=>{
            console.log(err)
            res.status(400).send({message:"internal server issue,try again later",err})
        })
    }).catch(err=>{
        console.log(err)
        res.status(400).send({message:"internal server issue,try again later",err})
    })
})
module.exports = router
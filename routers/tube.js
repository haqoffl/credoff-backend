var express = require('express');
const tubesSchema = require('../schema/tubesSchema');
var router = express.Router()
var {OpenAI} = require('openai');
var multer = require('multer')
const quizSchema = require('../schema/quizSchema');
var youtuberSchema = require('../schema/youtuberSchema')
const storage = require('../storageEngine');
var openai = new OpenAI({apiKey:process.env.OPENAI_API_KEY})
var upload = multer({storage})

router.get('/',(req,res)=>{
    res.status(200).send({
        message:"tube router working"
    })
})



router.post('/createTube',upload.single("image"),async(req,res)=>{
    let {title,desc,tags,terms,conditions,programming_language,id} = JSON.parse(req.body.data)
    console.log(JSON.parse(req.body.data))

    try{
        if(!title||!desc||!tags||!terms||!conditions||!programming_language){
            res.status(400).send({
                message:"bad request"
            })
        }else{
            let tube = new tubesSchema({
                title,
                thumbnail:req.file.filename,
                desc,
                tags,
                terms,
                conditions,
                programming_language,
                ownedBy:id
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



router.put('/updatetube/basic',async(req,res)=>{
    try{
        let {id,_title,_desc,_tags,_terms,_condition,_programming_language} = req.body
    let dt = await tubesSchema.findOne({_id:id})
   let update =  await tubesSchema.updateOne({_id:id},
    {$set:{
        title: _title || dt.title,
        desc: _desc || dt.desc,
        tags: _tags || dt.tags,
        programming_language: _programming_language || dt.programming_language,
        terms: (_terms&&_terms.length >0) == true ? _terms:dt.terms,
        conditions: (_condition&&_condition.length >0) == true ? _condition:dt.conditions
        
    }},{runValidators:true})

    res.status(200).send(update)
    }catch(err){
        res.status(400).send({err})
    }
})

router.get('/getTubes',async(req,res)=>{
    let data =  await tubesSchema.find()
    res.status(200).send(data)
})


router.get('/getTube/:id',async(req,res)=>{
   try{
    let data =  await tubesSchema.findOne({_id:req.params.id})
    let youtuber = await youtuberSchema.findOne({_id:data.ownedBy})

    res.status(200).send({data,info:{
        fullName:youtuber.fullName,language:youtuber.language,channelName:youtuber.youtubeChannelName
    }})   
   }catch(err){
    res.status(400).send({
        message:"internal server issue",
        err
    })
   }
})

router.get('/getTubes/:ownerId',async(req,res)=>{
    let dt = await tubesSchema.find({ownedBy:req.params.ownerId})
    res.status(200).send(dt)
})

router.post('/ai-quiz-generate',async(req,res)=>{

    try{

        let {tube_id} = req.body;
        console.log(tube_id)
        let tube = await tubesSchema.findOne({_id:tube_id});
        let tags = tube.tags
    if(!tube_id){
        res.status(400).send({
            message:"tube id not found"
        })
    }else{
       let isQuizAlreadyExist = await quizSchema.findOne({tubeId:tube_id})
       if(isQuizAlreadyExist){
           res.status(200).send({
               message:"quiz already exists"
           })
       }else{
        let language = tube.programming_language
        const sq_completion = await openai.chat.completions.create({
            model:"gpt-4o-mini-2024-07-18",
            messages:[
                {role:"system",content:"you are expert at all programming language. create 30 to 40 different quizzes from easy to hard under the given tags with question, 4 options and correct answer"},
                {role:"user",content:"tags:" +tags.toString()+" in "+language}
            ],
            response_format:{
                type:"json_schema",
                json_schema:{
                    name:"response_schema",
                    schema:{
                        type:"object",
                        properties:{
                            quizzes:{
                                type:"array",
                                items:{
                                    type:"object",
                                    properties:{
                                      question:{
                                            type:"string"
                                      } ,
                                      options:{
                                            type:"array",
                                            items:{
                                                type:"string"
                                            }
                                      },
                                      answer:{
                                        type:"number"
                                      } 
                                    },
                                    required:["question","options","answer"],
                                    additionalProperties:false
                                }
                            }
                        },
                        required:["quizzes"],
                        additionalProperties:false
                    },
                    strict:true
                }
            },
        })
        const ogq_completion = await openai.chat.completions.create({
            model:"gpt-4o-mini-2024-07-18",
            messages:[
                {role:"system",content:"you are expert at all programming language. create 25 simple coding quiz to predict the output of the code with question,code,4 options,correct answer and programming language extension like py,cpp,js etc.. for given tags"},
                {role:"user",content:"tags:" +tags.toString()+" in "+language}
            ],
            response_format:{
                type:"json_schema",
                json_schema:{
                    name:"response_schema",
                    schema:{
                        type:"object",
                        properties:{
                            quizzes:{
                                type:"array",
                                items:{
                                    type:"object",
                                    properties:{
                                        question:{type:"string"},
                                        code:{type:"string"},
                                        options:{type:"array",items:{type:"string"}},
                                        answer:{type:"number"},
                                        extension:{
                                            type:"string",
                                        }
                                    },
                                    additionalProperties:false,
                                    required:["question","code","options","answer","extension"]
                                }
                            },
                        },
                        additionalProperties:false,
                        required:["quizzes"]
                    },
                    strict:true
                }
            }
        })
    
        console.log(sq_completion.choices[0].message)
        console.log(ogq_completion.choices[0].message)
        let sq_obj = JSON.parse(sq_completion.choices[0].message.content)
        let ogq_obj = JSON.parse(ogq_completion.choices[0].message.content)
        let dt = new quizSchema({
            tubeId:tube_id,
            simple_quizzes: sq_obj.quizzes,
            OGQ_quizzes:ogq_obj.quizzes,
            tags: tags

        })
        let quiz = await dt.save()
        res.status(201).send({
            message:"quiz generated",
           _id: quiz._id
        })
    }
    

        
       }
    
    }catch(err){
        res.status(400).send({
            message:"internal issue",
            err:err
        })
    }
})

router.get('/fetch-quizzes/:id',async(req,res)=>{
try{
    function shuffle(arr) {
        let array  =arr
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      }

    function getRandomItems(array, count) {
        const shuffled =  shuffle(array);
        return shuffled.slice(0, count);
    }
    
    let quizzes = await quizSchema.findOne({tubeId:req.params.id})
    let ogq_quiz = getRandomItems(quizzes.OGQ_quizzes,8);
    let sim_quiz = getRandomItems(quizzes.simple_quizzes,7)
    let total_quizzes = [...ogq_quiz,...sim_quiz]
    
    res.status(200).send({total_quizzes})
}catch(err){
    res.status(400).send(err)
}
})

router.delete('/deleteTube/:tubeId',async(req,res)=>{
    try{
        let dt = await tubesSchema.deleteOne({_id:req.params.tubeId})
    res.status(200).send(dt)
    }catch(err){
        res.status(400).send({
            message:"internal server issue,try again later",
            err
        })
    }
})
module.exports = router


//,nodemon,loops,express,schema,openAI api,axios,Gemini AI API,conditon statements,pakage.json '



//12725824
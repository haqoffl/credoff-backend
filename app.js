var express = require('express');
require('dotenv').config()
var morgan = require('morgan')
const cors = require('cors');
const { default: mongoose } = require('mongoose');
var app = express()

//importing routers

var tube = require('./routers/tube')
var certificate = require('./routers/certificate')
//use
app.use(express.json());
app.use(morgan('dev'))
app.use(cors())
app.use("/tube",tube)
app.use('/certificate',certificate)
// endpoint
app.get('/',(req,res)=>{
    res.status(200).send({message:"server is live"})
})

//listening server
let port = process.env.PORT
app.listen(port,()=>{
    console.log("server is running")
})

//connecting with mongodb
let connectToMongo = async()=>{
    try{
        mongoose.set("strictQuery",false)
        mongoose.connect(process.env.MONGO_URI)
        console.log('Mongo connected')
    
    }catch(err){
    console.log(err)
    }
    }
    let conn = connectToMongo()
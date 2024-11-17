var express = require('express');
require('dotenv').config()
var morgan = require('morgan')
const cors = require('cors');
const { default: mongoose } = require('mongoose');
var app = express()
var Grid = require('gridfs-stream')
//importing routers

var tube = require('./routers/tube')
var certificate = require('./routers/certificate')
var users = require('./routers/users')
var payments = require('./routers/payments')
//use
app.use(cors())
app.use(express.json());
app.use(morgan('dev'))
app.use('/users',users)
app.use("/tube",tube)
app.use('/certificate',certificate)
app.use('/payments',payments)
// endpoint
app.get('/',(req,res)=>{
    res.status(200).send({message:"server is live"})
})

app.get('/thumbnail/:id',async(req,res)=>{
    let gfs =    Grid(connection,mongoose.mongo);
    let collection = gfs.collection('Thumbnails');
    let result = await collection.findOne({filename:req.params.id})

    if(!result){
        console.log("no image")
      res.status(400).send("there is no image url")
      }else{
        console.log(result._id)
        gridFSBucket = new mongoose.mongo.GridFSBucket(connection.db,{bucketName:'Thumbnails'});
        let readStream = gridFSBucket.openDownloadStream(result._id);
        readStream.pipe(res)
      }
})

app.get('/certificate',async(req,res)=>{
let html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta property="og:title" content="Ajihar Ali earned a React Course Certificate!" />
        <meta property="og:description" content="Earned this certificate by passing the AI evaluation." />
        <meta property="og:image" content="https://8c65-2406-7400-ca-f643-2d3b-5386-6898-b121.ngrok-free.app/thumbnail/4fht53wzm3fkwfhj" />
        <meta property="og:url" content="https://8c65-2406-7400-ca-f643-2d3b-5386-6898-b121.ngrok-free.app" />
        <title>Ajihar's Certificate</title>
    </head>
    <body>
        
    </body>
    </html>`

    res.status(200).send(html)
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

    let connection = mongoose.createConnection(process.env.MONGO_URI);


    //id: 91720352
    //node_id: "U_kgDOBXeKoA"
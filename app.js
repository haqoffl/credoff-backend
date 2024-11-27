var express = require('express');
require('dotenv').config()
var morgan = require('morgan')
const cors = require('cors');
const { default: mongoose } = require('mongoose');
var app = express()
var Grid = require('gridfs-stream')
var path = require('path')
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


app.get('/thumbnail/:id',async(req,res)=>{
    let connection = mongoose.createConnection(process.env.MONGO_URI);

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

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,'../ui/build')))
    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname,'../ui/build/index.html'))
    })
  
}


//listening server
let port = process.env.PORT
app.listen(port,()=>{
    console.log("server is running")
})

//connecting with mongodb

const connectToMongo = async () => {
    try {
        mongoose.set("strictQuery", false); // Disable strict query for backward compatibility
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true, // Recommended for compatibility
            useUnifiedTopology: true, // Recommended for new topology engine
            maxPoolSize: 50 // Set the connection pool size to 50
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1); // Exit the process on a failure to connect
    }
};

connectToMongo();




    //id: 91720352
    //node_id: "U_kgDOBXeKoA"
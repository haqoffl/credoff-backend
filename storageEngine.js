var{GridFsStorage}=require('multer-gridfs-storage')
var uniqid = require('uniqid')
const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file:(req,file)=>{
        return new Promise((resolve,reject)=>{
            if(file.mimetype === "image/jpeg"||file.mimetype==="image/png"||file.mimetype==="image/gif"||file.mimetype==="image/jpg"){
                const fileInfo = {
                        filename: uniqid(),
                        bucketName:req.body.isDailyLog === 'true'?"DailyLogsImages":"Thumbnails"
                }
                resolve(fileInfo)
            }else{
                reject(fileInfo)
            }
        })
    }
})



module.exports = storage
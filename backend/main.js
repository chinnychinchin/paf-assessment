//Required libraries
const morgan = require('morgan')
const express = require('express')
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const mysql2 = require('mysql2/promise');
const cors = require('cors');

//AWS configuration
const endpoint = new AWS.Endpoint('fra1.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: endpoint,
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
})

//MySQL configuration
const pool = mysql2.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB_NAME || 'paf2020',
    port: process.env.MYSQL_PORT || 3306,
    timezone: '+08:00',
    connectionLimit: 4
})

//SQL statements
const SQL_AUTH_USER = "select count(*) as count from user where user_id = ? and password = ? COLLATE utf8mb4_bin";

//Convert to promises
const readFile = (path) => new Promise((resolve,reject) => {

    fs.readFile(path, (err, buffer) => {

        if(err == null){
            console.log("readFile resolved")
            resolve(buffer)
        }
        else{
            console.log("readFile rejected")
            reject(err)
        }

    })

})

const putImage = (file, buffer) => new Promise((resolve, reject) => {

    const params = {
        Bucket: 'chins',
        Key: file.filename,
        Body: buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
        ACL: "public-read"
    }

    s3.putObject(params, (err, result) => {

        if(err == null) {
            resolve(result)
        }
        else{
            reject(err)
        }

    })

})

    


//Express server config
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000
const app = express()
app.use(morgan('combined'))

//Start app
const p0 = new Promise((resolve,reject) => {

    if(!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_ACCESS_KEY){
        reject("Incorrect s3 cedentials")
    }
    else{
        resolve()
    }

})

const p1 = pool.getConnection();

Promise.all([p0,p1]).then(async result => {

    const conn = result[1];
    await conn.ping();
    console.log(">>> Pinging database...")
    app.listen(PORT, () => {console.log(`Your app started on port ${PORT} at ${new Date()}`)});
    conn.release()

}).catch(e => {console.log("Unable to start app.", e)})


//Routes
app.use(express.urlencoded({extended:true}));
app.use(cors())

//Login route 
app.post('/login', async(req, res) => {

    const rb = req.body;
    console.log(rb)
    const conn = await pool.getConnection();
    try{
		const [result,_] = await conn.query(SQL_AUTH_USER, [rb.user_id, rb.password])
		console.log(result)
        if(result[0].count == 0){
            res.status(401).type('application/json').json({"message": "Authentication failed."})
        }
        else{
            res.status(200).type('application/json').json({"message": "user exists."})
        }
        
    }
    catch(e){
        res.status(500).type('application/json').json({e})
    }
    finally{
        conn.release();
    }

})


//Upload route
let multipart = multer({dest: `${__dirname}/tmp/uploads`})
app.post('/upload', multipart.single("image"), async(req, res) => {

	console.log(req.file);
	console.log(req.body)
	res.status(200).type('application/json').json({"message": "received on backend"})


})
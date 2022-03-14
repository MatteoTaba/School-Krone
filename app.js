/*
    Client-side Javascript for uploading a file to IPFS
*/ 

import ipfsAPI from 'ipfs-api';
import express from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import mysql from 'mysql';
import fs from 'fs';

//_____________________________________IPFS CONFIGURATION_____________________________________

var ipfs = ipfsAPI('127.0.0.1', '5001', {protocol: 'http'});

ipfs.version((err, version) => {
        if(err) {
            console.error('Error getting the IPFS version', err);
            return;
        }
        console.log('Your IPFS node is ready, version: ',version.version)
    });

//_____________________________________EXPRESS CONFIGURATION_____________________________________

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());

//_____________________________________DATABASE CONFIGURATION_____________________________________

const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'students_files'
});

//_____________________________________GET REQUEST TO RENDER THE PAGE HOME.EJS_____________________________________

app.get('/', (req, res) => {
   res.render('home');
});

//_____________________________________POST REQUEST TO UPLOAD THE FILE_____________________________________

app.post('/upload', (req, res) => {
    //get the student name
    const studentName = req.body.name;
    console.log("Student name: " + studentName);

    //get the wallet address
    const walletAddress = req.body.address;
    console.log("Wallet address: " + walletAddress);

    //get the whole file we need
    const file = req.files.file;
    console.log('File: ', file);

    //file name that we get from the body (from the form)
    const fileName = req.body.fileName;
    console.log('File is ready: ', file.name);

    //create the filePath, it's necessary to create a folder called "files"
    const filePath = 'files/' + fileName;
    console.log('File path: ', filePath);

    
    //download the file into our server using the mv function. Param: filePath, where the file has to be moved and async(err), callback function with an error
    file.mv(filePath, async(err) => {
        if(err) {
            console.log('Error: failed to download the file');
            return res.status(500).send(err);
        }

        console.log('Successfully download the file');

        //call the addFile function with the right parameters
        const fileHashIPFS = await addFile(fileName, filePath);

        //once we have the hash we can delete the file from the files folder
        fs.unlink(filePath, (err) => {
            if(err) console.log(err);
        });

        //insert student's data into the db
        pool.getConnection((err, connection) => {
            if(err) throw err
                connection.query('INSERT INTO students_files SET student_name = ?, wallet_address = ?, ipfs_hash = ?', [studentName, walletAddress, fileHashIPFS], (err, rows) => {
                connection.release() 
                if (!err) {
                    console.log('Student entry successfully created');
                } else {
                    console.log(err)
                }
            })
        })

        //render the upload page with the right accessible parameters
        res.render('upload', { studentName, fileName, fileHashIPFS, walletAddress });
    });

});

//_____________________________________FUNCTION WHICH ACTUALLY UPLOADS THE FILE TO IPFS_____________________________________

const addFile = async (fileName, filePath) => {
    /*
        read the content of the file in the specified path. 
        The return value is in the form of one of the allowed data formats to upload a file to IPFS
    */
    const fileContent = fs.readFileSync(filePath);
    console.log('File content: ', fileContent);

    //add the file to IPFS
    const fileAdded = await ipfs.add({ path: fileName, content: fileContent });
    console.log('Your file on IPFS: ', fileAdded);
    
    //return CID of the file
    return fileAdded[0].hash;
};

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});

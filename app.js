/**
 * Client-side Javascript for uploading a file to IPFS.
 */ 

import { create } from 'ipfs-http-client';
import ipfsAPI from 'ipfs-api';
import express from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import { Buffer } from 'buffer';

//library for interacting with files
import fs from 'fs';

//connect to IPFS daemon using default settings:localhost and port 5001
var ipfs = ipfsAPI('127.0.0.1', '5001', {protocol: 'http'});

ipfs.version((err, version) => {
        if(err) {
            console.error('Error getting the IPFS version', err);
            return;
        }
        console.log('Your IPFS node is ready, version: ',version.version)
    });

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());

//get request to render the page home.ejs
app.get('/', (req, res) => {
    res.render('home');
});

//post request to upload the file
app.post('/upload', (req, res) => {
    //get the file we need
    const file = req.files.file;

    //file name that we get from the body (from the form)
    const fileName = req.body.fileName;
    console.log('File is ready: ', file.name);

    //set the filePath, it's necessary to create a folder called "files"
    const filePath = 'files/' + fileName;
    console.log('File path: ', filePath);

    
    //Download the file into our server using the mv function. Param: filePath, where the file has to be moved and async(err), callback function with an error
    file.mv(filePath, async(err) => {
        if(err) {
            console.log('Error: failed to download the file');
            return res.status(500).send(err);
        }

        console.log('Successfully download the file');

        //call the addFile function with the right parameters
        const fileHash = await addFile(fileName, filePath);

        //once we have the hash we can delete the file from the files folder
        fs.unlink(filePath, (err) => {
            if(err) console.log(err);
        });

        //render the upload page with the right parameters
        res.render('upload', { fileName, fileHash });
    });

});

const addFile = async (fileName, filePath) => {
    //convert the file into a buffer, one of the allowed data formats for IPFS
    const fileBuffer = { path: fileName, content: Buffer.from(filePath) };
    console.log('fileBuffer: ', fileBuffer);

    //add the buffer to IPFS
    const filesAdded = await ipfs.add(fileBuffer);
    console.log('your hash: ', filesAdded);
    
    return filesAdded.hash;
};

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});

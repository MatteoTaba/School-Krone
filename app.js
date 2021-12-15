/*
 * Client-side JavaScript part
 */

import { create } from 'ipfs-http-client';
import ipfsAPI from 'ipfs-api';
import express from'express';
import bodyParser from'body-parser';
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

































/**
//import regeneratorRuntime from "regenerator-runtime";
//Before this make sure to run npm install ipfs-http-client
//const ipfsClient = require('ipfs-http-client');
//import IPFS from "./ipfs";
import IPFSClient from './ipfs-http-client';
//const ipfs = await IPFS.create("http://localhost:5001");
//const version = await ipfs.version();
//console.log(version)
let fileToUpload = null;

//Connect to the daemon API server. Now we can start executing commands on the ipfs object to interact with the network
//const ipfs=ipfsClient('http://localhost:5001');

/**ipfs.on('ready', () => {
    console.log('Your IPFS node is ready.');

    ipfs.version((err, version) => {
        if(err) {
            console.error('Error getting the IPFS version', err);
            return;
        }
        console.log('version: ',version.version)
    });
});

document.addEventListener('DOMContentLoaded', e => {
    init();
});

function init() {
    setFileInput();
    setUploadBtn();
}

function setFileInput() {
    let $ = document.getElementById('myFile');
    $.onchange = function () {
        if (!this.files || !this.files[0]) {
            return;
        }

        fileToUpload = this.files[0];
        console.log('Your file is ready', myFile);

        document
            .getElementById('inputFileName')
            .innerText = myFile.name;
    }
}

function setUploadBtn() {
    let $ = document.getElementById('submitBtn');
    $.onclick = () => {
        prepareFile(myFile);
    }

    document.addEventListener('upload-started', e => {
        $
            .classList
            .add('is-loading');
    });

    document.addEventListener('upload-done', e => {
        $
            .classList
            .remove('is-loading');
    });
}

function prepareFile(file) {
    document.dispatchEvent(new Event('upload-started'));

    let reader = new FileReader();

    reader.onload = e => {
        uploadFile(node.types.Buffer.from(e.target.result));
    }

    reader.readAsArrayBuffer(file);
}

function uploadFile(file) {
    node
        .files
        .add(file, (err, fileAdded) => {
            document.dispatchEvent(new Event('upload-done'));

            if (err) {
                displayError(err);
                return;
            }

            document
                .getElementById('result')
                .innerHTML = '<a id="viewFileBtn" href="https://ipfs.io/ipfs/' + fileAdded[0].hash + '" target="_blank" class="button is-info is-medium" style="margin-top:20px;">View' +
                    ' file</a>';
        });
}

function displayError(err) {
    document
        .getElementById('errorMsg')
        .innerText = err;
}
/**App = {

    constructor() {
        //these two lines allow to reference "this" keyword inside of captureFile and onSubmit functions
        this.captureFile = this.captureFile.bind(this)
        this.onSubmit = this.onSubmit.bind(this);
    },
    
    captureFile(event) {
        console.log('capture file...');
        //event.preventDefault();
        //const uploadedFile = document.getElementById('myFile');
        //const file=fileSelector.datafile.value;
        //console.log(file);
        //const files = event.target.files;
        //const reader = new window.FileReader();
        //reader.readAsArrayBuffer(file);
        //reader.onloadend = () => {
            //this.setState({ buffer: Buffer.from(reader.result) });
            //console.log('buffer', this.state.buffer);
        //}
    },

    onSubmit(event) {
        //used to stay in the same html page while clicking on the submit button, because the default behaviour would submit a form
        event.preventDefault();
        console.log('on submit...');
    }
    
} */

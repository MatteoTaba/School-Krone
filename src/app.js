/*
 * Client-side JavaScript part
 */
//import 'regenerator-runtime/runtime';

import IPFS from 'ipfs'; 
import regeneratorRuntime from "regenerator-runtime";


let fileToUpload = null;
//Before this make sure to run npm install ipfs-http-client
const ipfsClient = require('ipfs-http-client');
//Connect to the daemon API server. Now we can start executing commands on the ipfs object to interact with the network
const ipfs=ipfsClient('http://localhost:5001');

ipfs.on('ready', () => {
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

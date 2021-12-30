/**
 * Client-side Javascript for sending tokens to students
 */ 
import express from 'express';
import bodyParser from 'body-parser';
import Web3 from 'web3';

/** Web3 Provider is a server/website running geth or parity node which talks to the Ethereum blockchain. 
 *  To initiate our web3 provider, we’ll instantiate a Web3 instance passing as the constructor the URL of the provider (Ganache).
 */ 
var web3;

async function initWeb3() {
    if (typeof web3 !== 'undefined') {
        //If a web3 instance is already provided by Meta Mask.
        console.log("DENTRO");
        web3 = new Web3(new Web3.currentProvider);
    } 
    else {
        //Specify default instance if no web3 instance provided
        web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    }
} 

async function getLastBlockNumber() {
    const latestBlockNumber = await web3.eth.getBlock("latest")
    console.log(latestBlockNumber)
    return latestBlockNumber
}

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//get request to render the page send-token.ejs
app.get('/', (req, res) => {
    initWeb3();
    getLastBlockNumber();
    res.render('send-token');
});


app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});

// const sendToken = {
   
//     web3Provider: null,

//     init: function() {
//         console.log("App initialized")
//         return sendToken.initWeb3();
//     },

//     initWeb3: function() {
//         //if(typeof web3 !== 'undefined') {
//             // If a web3 instance is already provided by Meta Mask.
//             sendToken.web3Provider = web3.currentProvider;
//             web3 = new Web3(web3.currentProvider);
//         //} else {
//             // Specify default instance if no web3 instance provided
//             //sendToken.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
//             //web3 = new Web3(sendToken.web3Provider);
//         //}
//     }  
// }
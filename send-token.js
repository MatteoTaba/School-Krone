/*
    Client-side Javascript for sending tokens to students
*/ 

import express from 'express';
import bodyParser from 'body-parser';
import Web3 from 'web3';
import fileUpload from 'express-fileupload';
import {Transaction} from 'ethereumjs-tx';
import { Buffer } from 'buffer';

//_____________________________________CONFIGURATION OF EXPRESS_____________________________________
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(fileUpload());


var adminAddress = '0x23B7241e2859eA79e9ba4b2c89b208cE57B8D63d';
var studentAddress = '0x2a5CEBd83c3634Fa7992765EA44bc1982D97d7A9';


/*_____________________________________INITIALIZE WEB3_____________________________________
    To query the Ethereum blockchain, we will need access to an Ethereum node: with Web3.js we can connect to our own 
    node or an existing node (we'll use Infura). 
    Web3.js is a collection of libraries that allows programmers to interact with the smart contract deployed on the blockchain.
    It allows, for examples, to gather blockchain data and send transactions.
*/

const ethNetwork = 'https://ropsten.infura.io/v3/3717c0649f8e41fa8b57738c452831a9';
var web3 = new Web3(new Web3.providers.HttpProvider(ethNetwork));
console.log("Web3 correctly initialized. Version: " + web3.version);

//fetch the admin balance to test the correct web3 initialization
web3.eth.getBalance(adminAddress, async (err, result) => {
    if (err) {
        console.log(err);
        return;
    }
    let ETHBalance = web3.utils.fromWei(result, "ether");
    console.log("Account balance (ETH): " + ETHBalance + " ETH");
}); 

//_____________________________________INITIALIZE SKR SMART CONTRACT_____________________________________

var contractAddress='0xdf3f210158Cc1ff6910C15BCaB0b851Ac8f38f76';
var contractAbi= [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_initialSupply",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "_spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "_from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getHash",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "ipfsHash",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "x",
                "type": "string"
            }
        ],
        "name": "sendHash",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

var contract= new web3.eth.Contract(contractAbi, contractAddress);
console.log("Contract correctly initiated. Contract address: " + contract.options.address);

//fetch the token information
const tokenName = await contract.methods.name().call();
console.log("Token name: " + tokenName.toString());

const tokenSymbol = await contract.methods.symbol().call();
console.log("Token symbol: " + tokenSymbol.toString());

var SKRBalance = await contract.methods.balanceOf(adminAddress).call();
console.log("Account balance (SKR): " + SKRBalance.toString() + " SKR");


//get request to render the page send-token.ejs
app.get('/', (req, res) => {
    res.render('send-token', { SKRBalance });
});


app.post('/token-payment', (req, res) => {
    //get the address of the teacher
    const teacherAddress = req.body.address;
    console.log("Teacher address: " + teacherAddress);

    //get the amount of token to send
    const tokenAmount = req.body.tokenAmount;
    console.log("Token amount: " + tokenAmount);

    sendToken(teacherAddress, studentAddress, tokenAmount);

    res.render('payment', { SKRBalance });
});

async function sendToken(senderAddress, recipientAddress, amount) {

    var count = await web3.eth.getTransactionCount(adminAddress);
    console.log("Count: " + count);

    //CHECK
    var data = await contract.methods.transfer(studentAddress, 10);
    console.log("Data: " + data);

    var gasPrice = 2000000000000;
    console.log("Gas price: " + gasPrice);

    var gasLimit = 90000;
    console.log("Gas limit: " + gasLimit);

    var rawTransaction = {
        "from": adminAddress,
        "nonce": web3.utils.toHex(count),
        "gasPrice": web3.utils.toHex(gasPrice),
        "gasLimit": web3.utils.toHex(gasLimit),
        "to": studentAddress,
        "value": "0x0",
        "data": data,
        "chainId": 0x03
    };
    
    const privKey = Buffer.from('7157b66ca33f38a2e3a8dc416feac6eb72dd198d65d6d42ede1aeb33334d1cd7', 'hex');

    //var tx = new Transaction(rawTransaction);
     //console.log("Transaction: " + tx);

// tx.sign(privKey);
// var serializedTx = tx.serialize();

// web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
//   if (!err)
//       console.log(hash);
//   else
//       console.log(err);
// });
    // await contract.methods.transfer(recipientAddress, amount).send( {from: senderAddress} ).then(receipt => {
    //     console.log(receipt);
    //     console.log("Fatto");
    // });
}

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
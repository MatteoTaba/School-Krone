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


const adminAddress = '0x23B7241e2859eA79e9ba4b2c89b208cE57B8D63d';
const studentAddress = '0x2a5CEBd83c3634Fa7992765EA44bc1982D97d7A9';
const polAddress = '0xFf794Ba8842734A27C7D7c1CB8D16356D8755248';

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

var contractAddress='0xAaf1e1773f039D54F7EcDFdb8Ba79872455E76d1';
var contractAbi= [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_teacherAddress",
                "type": "address"
            }
        ],
        "name": "addTeacher",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
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
                "name": "_studentAddress",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_hash",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "payStudent",
        "outputs": [],
        "stateMutability": "nonpayable",
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
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
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
                "name": "_teacherAddress",
                "type": "address"
            }
        ],
        "name": "verifyTeacher",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
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

const studentIPFSHash = 'QmXJuLjAwtDL35n9tWgWAtrRvqFB9ci8ReXpWyv4kduuRC';

//get request to render the page send-token.ejs
app.get('/', (req, res) => {
    res.render('send-token', { SKRBalance });
});

//post request to send the tokens
app.post('/token-payment', (req, res) => {
    //get the address of the teacher
    const teacherAddress = req.body.address;
    console.log("Teacher address: " + teacherAddress);

    const studentAddress = req.body.sAddress;
    console.log("Student address: " + studentAddress);

    //get the amount of token to send
    const tokenAmount = req.body.tokenAmount;
    console.log("Token amount: " + tokenAmount);

    sendToken(teacherAddress, studentAddress, tokenAmount);

    res.render('payment');
});

async function sendToken(senderAddress, recipientAddress, amount) {

    //HOW TO SET IT UP? SHOULD I USE SENDER ADDRESS INSTEAD OF ADMIN ADDRESS?
    var count = await web3.eth.getTransactionCount(adminAddress);
    console.log("Count: " + count);

    var data = await contract.methods.payStudent(recipientAddress, studentIPFSHash, amount).encodeABI();
    console.log("Data: " + data);

    //CHECK
    var gasPrice = web3.utils.toHex(2 * 1e9);
    console.log("Gas price: " + gasPrice);

    //CHECK
    var gasLimit = web3.utils.toHex(90000);
    console.log("Gas limit: " + gasLimit);

    //CHECK NONCE AND FROM VALUE
    var rawTransaction = {
        "from": senderAddress,
        "nonce": web3.utils.toHex(count),
        "gasPrice": gasPrice,
        "gasLimit": gasLimit,
        "to": contractAddress,
        "value": "0x0",
        "data": data,
        "chainId": 0x03
    };
    
    //IS IT OK TO HAVE IT AS A PLAINTEXT?
    const privKey = Buffer.from('7157b66ca33f38a2e3a8dc416feac6eb72dd198d65d6d42ede1aeb33334d1cd7', 'hex');

    var tx = new Transaction(rawTransaction, { chain: 'ropsten' });
    tx.sign(privKey);
    var serializedTx = tx.serialize();
    console.log("Serialized transaction: " + serializedTx.toString('hex'));

    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
        if (!err) { 
            console.log("Hash: " + hash);
            return hash;
        }  
        else
            console.log(err);
    });
}

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
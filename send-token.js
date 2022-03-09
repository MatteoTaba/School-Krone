/*
    Client-side Javascript for sending tokens to students
*/ 

import express from 'express';
import bodyParser from 'body-parser';
import Web3 from 'web3';
import fileUpload from 'express-fileupload';
import { Transaction } from 'ethereumjs-tx';
import { Buffer } from 'buffer';
import mysql from 'mysql';

//_____________________________________CONFIGURATION OF EXPRESS_____________________________________

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(fileUpload());

//_____________________________________DATABASE CONFIGURATION_____________________________________

const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'students_files'
});

/*_____________________________________INITIALIZE WEB3_____________________________________
    To query the Ethereum blockchain, we will need access to an Ethereum node: with Web3.js we can connect to our own 
    node or an existing node (we'll use Infura). 
    Web3.js is a collection of libraries that allows programmers to interact with the smart contract deployed on the blockchain.
    It allows, for examples, to gather blockchain data and send transactions.
*/

const ethNetwork = 'https://ropsten.infura.io/v3/3717c0649f8e41fa8b57738c452831a9';
var web3 = new Web3(new Web3.providers.HttpProvider(ethNetwork));
console.log("Web3 correctly initialized. Version: " + web3.version);

//address of the smart contract creator
const adminAddress = '0x23B7241e2859eA79e9ba4b2c89b208cE57B8D63d';

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

//_____________________________________GET REQUEST TO RENDER THE PAGE SEND-TOKEN.EJS AND INIT DB_____________________________________

app.get('/', (req, res) => {
     pool.getConnection((err, connection) => {
        if(err) throw err
            //select only students with a mark = 0, which they still are unpaid
            connection.query('SELECT * FROM students_files WHERE mark = 0', (err, rows) => {
            connection.release()
            if (!err) {
                res.render('send-token', { SKRBalance, rows });
            } else {
                console.log(err)
            }
            console.log('The unpaid students are: \n', rows)
        })
    })
});

//_____________________________________POST REQUEST TO SEND TOKENS_____________________________________

app.post('/token-payment', (req, res) => {
    //get the address of the teacher
    const teacherAddress = req.body.address;
    console.log("Teacher address: " + teacherAddress);

    //get the student id equal to the one in the db
    const studentAddressId = req.body.sAddress;
    console.log("Student address ID: " + studentAddressId);

    //get the amount of token to send
    const tokenAmount = req.body.tokenAmount;
    console.log("Token amount: " + tokenAmount);

    //initialize student address and the related IPFS hash
    var studentAddress = "";
    var studentIPFSHash = "";

    //read the student-to-pay data using the previous id
    pool.getConnection((err, connection) => {
        if(err) throw err
            connection.query('SELECT wallet_address, ipfs_hash FROM students_files WHERE id = ? ', [studentAddressId], (err, rows) => {
            connection.release() 
            if (!err) {
                studentAddress = rows[0].wallet_address;
                console.log('Student address to pay: ', studentAddress);
                studentIPFSHash = rows[0].ipfs_hash;
                console.log('Student IPFS hash: ', studentIPFSHash);
                
                //call the payment function with the right parameters
                sendToken(teacherAddress, studentAddress, tokenAmount, studentIPFSHash);
            } else {
                console.log(err);
            }
        })
    })

    //update the student's mark once the tokens have been sent
    pool.getConnection((err, connection) => {
        if(err) throw err
            connection.query('UPDATE students_files SET mark = 1 WHERE id = ?', [studentAddressId], (err, rows) => {
            connection.release()
            if (!err) {
                console.log('Mark updated');
            } else {
                console.log(err)
            }
        })
    });

    //render the payment page
    res.render('payment');
});

//_____________________________________FUNCTION WHICH ACTUALLY CREATES THE TRANSACTION_____________________________________

async function sendToken(senderAddress, recipientAddress, amount, studentIPFSHash) {
    //count will be used as a nonce
    var count = await web3.eth.getTransactionCount(senderAddress, 'pending');
    console.log("Count: " + count);

    //call the payStudent function of the SKR smart contract
    var data = await contract.methods.payStudent(recipientAddress, studentIPFSHash, amount).encodeABI();
    console.log("Data: " + data);

    //gas price is always constant in test networks
    const gasPrice = 2 * 1e9;
    console.log("Gas price: " + gasPrice);

    //gas limit is always constant in test networks
    const gasLimit = 90000;
    console.log("Gas limit: " + gasLimit);

    //create a raw transaction
    var rawTransaction = {
        "from": senderAddress,
        "nonce": web3.utils.toHex(count),
        "gasPrice": web3.utils.toHex(gasPrice),
        "gasLimit": web3.utils.toHex(gasLimit),
        "to": contractAddress,
        "value": "0x0",
        "data": data,
        "chainId": 0x03
    };
    
    //private key which will be used to sign the transaction
    const privKey = Buffer.from('7157b66ca33f38a2e3a8dc416feac6eb72dd198d65d6d42ede1aeb33334d1cd7', 'hex');

    //transaction creation
    var tx = new Transaction(rawTransaction, { chain: 'ropsten' });
    tx.sign(privKey);
    var serializedTx = tx.serialize();
    console.log("Serialized transaction: " + serializedTx.toString('hex'));

    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
        if (!err) { 
            console.log("Transaction hash: " + hash);
            return hash;
        }  
        else
            console.log(err);
    });
}

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
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

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

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

function initContracts() {
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
    var contractAddress='0xdf3f210158Cc1ff6910C15BCaB0b851Ac8f38f76';
    var contract= new web3.eth.Contract(contractAbi, contractAddress);
    
    console.log("Contract correctly initiated. Contract address: " + contract.options.address);

    web3.eth.getBalance("0x23B7241e2859eA79e9ba4b2c89b208cE57B8D63d", function(err, result) {
        if (err) {
            console.log(err)
        } else {
            console.log(web3.utils.fromWei(result, "ether") + " ETH")
        }
    })

    // contract.methods.balanceOf("0x23B7241e2859eA79e9ba4b2c89b208cE57B8D63d").call(function(err, res) {
    // if (err) {
    //     console.log("An error occured", err);
    //     return
    // }
    //     console.log("The balance is: ",res)
    // });
}

//get request to render the page send-token.ejs
app.get('/', (req, res) => {
    initWeb3();
    getLastBlockNumber();
    initContracts();
    
    res.render('send-token');
});


app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
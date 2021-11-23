/*
  - require function allows to read the SchoolKrone and SchoolKroneSale contracts in solidity from the project directory 
  - we assign this to a variable (SchoolKrone and SKRSale) that we'll deploy in the next step
  - artifacts creates a contract abstraction that truffle can use to run in a JS runtime environment such as the truffle console
*/
var SchoolKrone = artifacts.require("./SKR.sol");

//when the contract is deployed we call its constructor with the value _initalSupply = 1M
module.exports = function (deployer) {
  deployer.deploy(SchoolKrone, 1000000);
};

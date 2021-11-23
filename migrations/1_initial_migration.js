/*
  The initial migration that is going to get run whenever
  we deploy the smart contract.
  We need migrations when we deploy a smart contract 
  because whenever we do that we are creating transactions
  and writing into the blockchain changing its state.
  So when we push a smart contract to the blockchain we are
  migrating its state from a point A to a new point B.
*/
const Migrations = artifacts.require("Migrations.sol");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};

/**
 * Test for our smart contract "SKR"
*/

//import our contract file
var TestToken=artifacts.require("./SKR.sol");

contract('TestToken', function(accounts) {
	var tokenInstance;

	it('initializes the contract with the correct values', function() {
		return TestToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name){
			assert.equal(name, 'School Krone', 'has the correct name');
			return tokenInstance.symbol();
		}).then(function(symbol){
			assert.equal(symbol, 'SKR', 'has the correct symbol');
		});
	});

	it('allocates the initial supply upon deployment', function() {
		return TestToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1M');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance){
			assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to the admin account');
		});	
	});

	it('transfers token ownership', function() {
		return TestToken.deployed().then(function(instance) {
			tokenInstance = instance;
			//test 'require' statement first by transferring something larger than the sender's balance
			//call doesn't create any real transaction so it doesn't write into the blockchain, transfer does (line 46)
			return tokenInstance.transfer.call(accounts[1], 99999999999999999999999); 
		}).then(assert.fail).catch(function(error) {
			assert(error.message, 'error message must contain revert');
			return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
		}).then(function(success) {
			assert.equal(success, true, 'it returns true');
			return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
		}).then(function(receipt) {
			//transfer event must have all the required args
			assert.equal(receipt.logs[0].event,'Transfer', 'should be the "Transfer" event');
			assert.equal(receipt.logs[0].args._from, accounts[0],'logs the account the tokens are transferred from');
			assert.equal(receipt.logs[0].args._to, accounts[1],'logs the account the tokens are transferred to');
			assert.equal(receipt.logs[0].args._value, 250000,'logs the transfer amount');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 250000, 'adds the amount to the receiving account');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 750000, 'deducts the amount from the sending account');
		});
	});

	it('approves tokens for delegated transfers', function() {
		return TestToken.deployed().then(function (instance) {
			tokenInstance = instance;
			//we are taking our contract TestToken as a tokenInstance and we're calling the approve function with call
			return tokenInstance.approve.call(accounts[1], 100);
		}).then(function(success) {
			assert.equal(success, true, 'it returns true');
			return tokenInstance.approve(accounts[1], 100);
		}).then(function(receipt) {
			assert.equal(receipt.logs[0].event,'Approval', 'should be the "Approval" event');
			assert.equal(receipt.logs[0].args._owner, accounts[0],'logs the account the tokens are authorized by');
			assert.equal(receipt.logs[0].args._spender, accounts[1],'logs the account the tokens are authorized to');
			assert.equal(receipt.logs[0].args._value, 100,'logs the transfer amount');
			return tokenInstance.allowance(accounts[0], accounts[1]);
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
		});
	});

	it('handles delegated token transfers', function() {
		return TestToken.deployed().then(function (instance) {
			tokenInstance = instance;
			fromAccount = accounts[2];
			toAccount = accounts[3];
			spendingAccount = accounts[4];
			//transfer some tokens to fromAccount
			return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
		}).then(function(receipt) {
			//approve spendingAccount to spend 10 tokens from fromAccount
			return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });		
		}).then(function(receipt) {
			//try transferring something larger than the sender's balance
			return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
		}).then(assert.fail).catch(function(error) {
			assert(error.message.toString().indexOf('revert') >= 0, 'cannot transfer value larger than balance');
			//try transferring something larger than the approved amount
			return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
		}).then(assert.fail).catch(function(error) {
			assert(error.message.toString().indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
			return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
		}).then(function(success) {
			assert.equal(success, true);
			return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
		}).then(function(receipt) {
			assert.equal(receipt.logs[0].event,'Transfer', 'should be the "Transfer" event');
			assert.equal(receipt.logs[0].args._from, fromAccount,'logs the account the tokens are transferred from');
			assert.equal(receipt.logs[0].args._to, toAccount,'logs the account the tokens are transferred to');
			assert.equal(receipt.logs[0].args._value, 10,'logs the transfer amount');
			return tokenInstance.balanceOf(fromAccount);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 90, 'deducts the amount from the sending account');
			return tokenInstance.balanceOf(toAccount);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 10, 'adds the amount from the receiving account');	
			return tokenInstance.allowance(fromAccount, spendingAccount);
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
		});
	}); 

	it('test the allowed teachers', function() {
		return TestToken.deployed().then(function (instance) {
			tokenInstance = instance;
			teacherAddress = accounts[1];
			notAllowedAddress = accounts[3];
			studentAddress = accounts[2];
			return tokenInstance.addTeacher(teacherAddress);
		}).then(function(receipt) {
			tokenInstance.verifyTeacher(teacherAddress);
		}).then(function(receipt) {
			return tokenInstance.payStudent(studentAddress, 10, {from: notAllowedAddress} );
		}).then(assert.fail).catch(function(error) {
			assert(error.message.toString().indexOf('revert') >= 0, 'this teacher is not allowed');
		}).then(function(receipt) {
			return tokenInstance.payStudent(studentAddress, 10, {from: teacherAddress} );
		}).then(function(receipt) {
			return tokenInstance.balanceOf(studentAddress);
		})
	});
});

/**
 * Smart contract which is going to implement the ERC20
 * standard. It's going to be in charge of governing
 * the behavior of the cryptocurrency itself
*/

pragma solidity >=0.4.22 <0.9.0; //version of Solidity we are going to use

contract SKR {

	//total number of token
	uint256 public totalSupply; 

	//associate the unique Ethereum address with the associated balance
	mapping(address => uint256) public balanceOf; 

	//associate the amount which a spender is still allowed to withdraw from the owner's account
	mapping(address => mapping(address => uint)) public allowance;

	//name of the token
	string public name = "School Krone";

	//symbol of the token
	string public symbol = "SKR";

	//transfer event which is triggered when tokens are transferred
	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value
	);

	//approve event which is triggered in the approve function
	event Approval(
		address indexed _owner,
		address indexed _spender,
		uint256 _value
	);


	/**
	 * Constructor which:
	 	* allocates the initial supply
	 	* maps the key that is the address (msg.sender) with the value of the initial supply
	 	* msg.sender corresponds to the account which deploys the contract
	 		*msg is a global variable that has several different values that we can read from
	 		*sender is the address of who call the function
	*/
	constructor(uint256 _initialSupply) public {
		balanceOf[msg.sender] = _initialSupply;
		totalSupply = _initialSupply; 
	}

	/**
	 * Function which allows to transfer a certain amount of token (_value) to a recipient (_to)
	*/
	function transfer(address _to, uint256 _value) public returns(bool success){
		//exception if the sender's account doesn't have enough tokens.
		require(balanceOf[msg.sender] >= _value);

		//transfer the balance
		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;

		//trigger a transfer event
		emit Transfer(msg.sender, _to, _value);

		//returns a boolean
		return true;
	}

	/**
	 * Function which allows _spender to withdraw from the owner's account multiple times, up to the _value amount
	*/
	function approve (address _spender, uint256 _value) public returns (bool success){
		//set the allowance
		allowance[msg.sender][_spender] = _value;

		//trigger an approve event
		emit Approval(msg.sender, _spender, _value);

		return true;
	}
	/**
	 * Function which transfers _value amount of tokens from address _from to address _to, and MUST fire the Transfer event
	*/
	function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
		//require _from has enough tokens
		require(_value <= balanceOf[_from]);

		//require allowance is big enough so msg.sender cannot spend more than how much he's allowed to on behalf of _from account
		require(_value <= allowance[_from][msg.sender]);

		//change the balance
		balanceOf[_from] -= _value;
		balanceOf[_to] += _value;

		//update the allowance
		allowance[_from][msg.sender] -= _value;

		//transfer event
		emit Transfer(_from, _to, _value);

		return true;	
	}

}

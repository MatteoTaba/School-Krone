/*
 * Smart contract which is going to implement the ERC20
 * standard. It's going to be in charge of governing
 * the behavior of the cryptocurrency itself
*/
pragma experimental ABIEncoderV2;
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

	//ipfs hash which will be saved inside the blockchain
	string public ipfsHash;

	//owner of the contract
	address public owner;

	//this mapping receive the teacher and return if he is allowed or not
	mapping(address => bool) allowedTeachers;

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


	/*
	 * constructor which:
	 	* allocates the initial supply
	 	* maps the key that is the address (msg.sender) with the value of the initial supply
	 	* set the owner as msg.sender
	 	* msg.sender corresponds to the account which deploys the contract
	 		*msg is a global variable that has several different values that we can read from
	 		*sender is the address of who call the function
	*/
	constructor(uint256 _initialSupply) public {
		balanceOf[msg.sender] = _initialSupply;
		totalSupply = _initialSupply;
		owner = msg.sender;
	}

	//function which allows to transfer a certain amount of token (_value) to a recipient (_to)
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

	//function which allows _spender to withdraw from the owner's account multiple times, up to the _value amount
	function approve (address _spender, uint256 _value) public returns (bool success){
		//set the allowance
		allowance[msg.sender][_spender] = _value;

		//trigger an approve event
		emit Approval(msg.sender, _spender, _value);

		return true;
	}
	
	//function which transfers _value amount of tokens from address _from to address _to, and MUST fire the Transfer event
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

	//_______________Student payment integration_______________//

	modifier _ownerOnly() {
		require(msg.sender == owner, "Ownable: caller is not the owner"); 
      _;
	}

	//once used on a function then only the mentioned caller can call this function
	modifier _allowedOnly(address _address) {
      require((msg.sender == owner || allowedTeachers[_address]), "You need to be allowed");
      _;
  	}

  	function addTeacher(address _teacherAddress) public _ownerOnly {
  		allowedTeachers[_teacherAddress] = true;
  	}

  	function verifyTeacher(address _teacherAddress) public view returns (bool success) {
  		bool isTeacherAllowed = allowedTeachers[_teacherAddress];
  		return isTeacherAllowed;
  	}

	//function which will manage the token payment
	function payStudent(address _studentAddress, uint256 _amount) public _allowedOnly(msg.sender) {
		transfer(_studentAddress, _amount);
	}
}

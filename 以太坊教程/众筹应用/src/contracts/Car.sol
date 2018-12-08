pragma solidity ^0.4.22; 
contract Car { 
	string public brand; 
	constructor(string initialBrand) public { 
		brand = initialBrand; 
	} 
	function setBrand(string newBrand) public {
		brand = newBrand; 
	}
}


pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Voting.sol";

contract TestVoting {
  uint public initialBalance = 3 ether;

  function testInitialBalanceUsingDeployedContract() public {
    Voting voting = Voting(DeployedAddresses.Voting());

    uint expected = 10000;

    Assert.equal(voting.totalTokens(), expected, "Total tokens should be 10000.");
  }

  function testBuyTokens() public {
    // Voting voting = Voting(DeployedAddresses.Voting());
    // voting.buy.value(1 ether)();
    // uint expected = 9900;
    // Assert.equal(voting.tokenBalance(), expected, "Token balance should be 9900 after buy 1 ether");
    Voting voting = Voting(DeployedAddresses.Voting());  
		voting.buy.value(1 ether)();  
		Assert.equal(voting.tokenBalance(), 9900, "9900 tokens	should have been available"); 

  }

}

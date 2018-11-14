var Voting = artifacts.require("./Voting.sol");

contract('Voting', function(accounts) {
    it("should be able to buy tokens", function() {
        var instance;
        var tokensSold;
        var userTokens;
        return Voting.deployed().then(function(i) {
            instance = i;
            return i.buy({value: web3.toWei(1, 'ether')});
        }).then(function() {
            return instance.tokenSold();
        }).then(function(balance) {
            tokensSold = balance;
            return instance.voterDetails(web3.eth.accounts[0]);
        }).then(function(tokenDetails) {
            userTokens = tokenDetails[0];
        });
        assert.equal(tokensSold.valueOf(), 100, "100 tokens were not sold");
        assert.equal(userTokens.valueOf(), 100, "100 tokens were not sold");
    });
    it("should be able to vote for candidate", function(){
        var instance;
        return Voting.deployed().then(i=>{
            instance = i;
            return i.buy({value: web3.toWei(1, 'ether')});
        }).then(()=>{
            return instance.voteForCandidate('Alice', 10);
        }).then(()=>{
            return instance.voterDetails(web3.eth.accounts[0]);
        }).then(details=>{
            assert.equal(details[1][0].valueOf(), 10, "user votes for Alice should be 10");
        });
    });
});


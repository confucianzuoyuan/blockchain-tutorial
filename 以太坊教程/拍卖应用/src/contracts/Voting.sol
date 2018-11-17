pragma solidity ^0.4.18;

contract Voting{
    struct voter{
        address voterAddress;
        uint tokenNum;
        uint[] tokensVoteForCandidates;
    }
    uint public totalTokens;
    uint public tokenBalance;
    uint public tokenPrice;
    bytes32[] public candidateList;
    mapping(bytes32=>uint) public votesReceived;
    mapping(address=>voter) public voterInfo;

    constructor(uint totalSupply, uint price, bytes32[] candidateNames) public{
        totalTokens = totalSupply;
        tokenBalance = totalSupply;
        tokenPrice = price;
        candidateList = candidateNames;
    }
    function buy() payable public returns(uint){
        uint tokensToBuy = msg.value / tokenPrice;
        require(tokensToBuy <= tokenBalance);
        voterInfo[msg.sender].voterAddress = msg.sender;
        voterInfo[msg.sender].tokenNum += tokensToBuy;
        tokenBalance -= tokensToBuy;
        return tokensToBuy;
    }
    function voteForCandidate(bytes32 candidate, uint voteTokens) public{
        uint index = indexOfCandidate(candidate);
        require(index != uint(-1));
        if( voterInfo[msg.sender].tokensVoteForCandidates.length == 0 ){
            for(uint i=0; i < candidateList.length; i++){
                voterInfo[msg.sender].tokensVoteForCandidates.push(0);
            }
        }
        uint availableTokens = voterInfo[msg.sender].tokenNum - totalUsedTokens(voterInfo[msg.sender].tokensVoteForCandidates);
        require(availableTokens >= voteTokens);
        votesReceived[candidate] += voteTokens;
        voterInfo[msg.sender].tokensVoteForCandidates[index] += voteTokens;
    }
    function totalVotesFor(bytes32 candidate) public view returns(uint){
        return votesReceived[candidate];
    }
    function totalUsedTokens(uint[] votesForCandidate) public pure returns(uint){
        uint usedTokens = 0;
        for(uint i=0; i < votesForCandidate.length; i++){
            usedTokens += votesForCandidate[i];
        }
        return usedTokens;
    }
    function indexOfCandidate(bytes32 candidate) public view returns(uint){
        for(uint i = 0; i < candidateList.length; i++){
            if(candidate == candidateList[i])
                return i;
        }
        return uint(-1);
    }
    function tokenSold() public view returns(uint){
        return totalTokens - tokenBalance;
    }
    function voterDetails(address voterAddr) public view returns(uint, uint[]) {
        return ( voterInfo[voterAddr].tokenNum, voterInfo[voterAddr].tokensVoteForCandidates);
    }
    function allCandidate() public view returns(bytes32[]) {
        return candidateList;
    }
    function transfer(address _to) public{
        _to.transfer(address(this).balance);
    }
}
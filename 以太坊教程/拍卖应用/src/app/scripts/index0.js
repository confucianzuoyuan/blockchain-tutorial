import {default as Web3} from 'web3';
import {default as contract} from 'truffle-contract';
import voting_artifacts from '../../build/contracts/Voting.json';

const Voting = contract(voting_artifacts);

let candidates = {};
let tokenPrice = null;

window.buyTokens = function(){
    let tokensToBuy = $("#buy").val();
    let _value = tokensToBuy * tokenPrice;
    Voting.deployed().then(votingInst=>{
        votingInst.buy({value: web3.toWei(_value,'ether'), from: web3.eth.accounts[0]}).then(()=>{
            votingInst.tokenSold().then(amount=>{
                $("#tokens-sold").html(amount.toString());
            });
            web3.eth.getBalance(votingInst.address, (err, balance)=>{
                $("#contract-balance").html(web3.fromWei(balance.toString(),'ether')+"ETH");
            });
        });
    });
}

window.voteForCandidate = function(){
    let candidateName = $("#candidate").val();
    let voteTokens = $("#vote-tokens").val();
    $("#candidate").val("");
    $("#vote-tokens").val("");
    Voting.deployed().then(votingInst=>{
        votingInst.voteForCandidate(candidateName, voteTokens,{from: web3.eth.accounts[0]}).then(()=>{
            votingInst.totalVotesFor(candidateName).then(count=>{
                $("#" + candidates[candidateName]).html(count.toString());
            });
        });
    });
}

window.lookupVoterInfo = function(){
    let _address = $("#voter-info").val();
    Voting.deployed().then(votingInst=>{
        votingInst.voterDetails(_address).then(res=>{
            $("#tokens-bought").html("Tokens Bought: "+ res[0].toString());
            let candidateNames = Object.keys(candidates);
            $("#votes-cast").empty();
            $("#votes-cast").append("Votes cast per candidate: <br>");
            for(let i=0; i <candidateNames.length; i++){
                $("#votes-cast").append(candidateNames[i] + ": " +res[1][i].toString() + "<br>");
            }
        });
    });
}

$(document).ready(function(){
    if(typeof web3 != 'undefined'){
        window.web3 = new Web3(web3.currentProvider);
    } else{
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    Voting.setProvider(web3.currentProvider);
    populateCandidates();
})

function populateCandidates(){
    Voting.deployed().then(votingInst=>{
        votingInst.allCandidate().then(candidateArray=>{
            for(let i = 0; i < candidateArray.length; i++){
                candidates[web3.toUtf8(candidateArray[i])] = 'candidate-' + i;
            }
            setupCandidateRows();
            populateCandidateVotes();
            populateTokenData();
        });
    });
}

function setupCandidateRows(){
    Object.keys(candidates).forEach(candidate=>{
        $("#candidate-rows").append("<tr><td>" + candidate + "</td><td id='" + candidates[candidate] + "'></td></tr>");
    });
}
function populateCandidateVotes(){
    let candidateNames = Object.keys(candidates);
    for(let i=0; i < candidateNames.length; i++){
        Voting.deployed().then(votingInst=>{
            votingInst.totalVotesFor(candidateNames[i]).then(count=>{
                $("#"+candidates[candidateNames[i]]).html(count.toString());
            });
        });
    }
}
function populateTokenData(){
    Voting.deployed().then(votingInst=>{
        votingInst.totalTokens().then(amount=>{
            $("#tokens-total").html(amount.toString());
        });
        votingInst.tokenSold().then(amount=>{
            $("#tokens-sold").html(amount.toString());
        });
        votingInst.tokenPrice().then(price=>{
            tokenPrice = web3.fromWei(price.toString(),'ether');
            $("#token-cost").html(web3.fromWei(price.toString(),'ether')+"ETH");
        });
        web3.eth.getBalance(votingInst.address, (err,balance)=>{
            $("#contract-balance").html(web3.fromWei(balance.toString(),'ether')+"ETH");
        });
    });
}
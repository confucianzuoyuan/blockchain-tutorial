pragma solidity ^0.4.20;

library SafeMath { 
    function mul(uint a, uint b) internal pure returns (uint) { 
        uint c = a * b; 
        assert(a == 0 || c / a == b); 
        return c;
    }
    function div(uint a, uint b) internal pure returns (uint) { 
        // assert(b > 0); // Solidity automatically throws when dividing by 0 
        uint c = a / b; 
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold 
        return c; 
    } 
    function sub(uint a, uint b) internal pure returns (uint) { 
        assert(b <= a); 
        return a - b; 
    } 
    function add(uint a, uint b) internal pure returns (uint) { 
        uint c = a + b; 
        assert(c >= a); 
        return c; 
    } 
}

contract ProjectList {
    using SafeMath for uint;
    address[] public projects;
    //mapping(uint => address) public projects;
    //uint projectsCount;

    constructor() public {
        //projectsCount = 0;
    }
    function createProject(string _description, uint _minInvest, uint _maxInvest, uint _goal) public {
        address newProject = new Project(msg.sender, _description, _minInvest, _maxInvest, _goal);
        projects.push(newProject);
        //projectsCount += 1;
        //projects[projectsCount] = newProject;
    }
    function getProjects() public view returns(address[]){
        return projects;
    }
}

contract Project {
    using SafeMath for uint;
    struct Payment{
        string description;
        uint amount;
        address receiver;
        bool completed;
        //address[] voters;
        mapping(address => bool) voters;
        uint voterCount;
    }
    address public owner;
    string public description;
    uint public minInvest;
    uint public maxInvest;
    uint public goal;
    //address[] public investors;
    mapping(address => uint) public investors;
    uint public investorCount;

    Payment[] public payments;

    modifier ownerOnly(){
        require(msg.sender == owner, "Message sender must be owner.");
        _;
    }

    constructor(address _owner, string _description, uint _minInvest, uint _maxInvest, uint _goal) public{
        owner =  _owner;
        description = _description;
        minInvest = _minInvest;
        maxInvest = _maxInvest;
        goal = _goal;
    }

    function contribute() public payable {
        require(msg.value >= minInvest, "Invest value should be larger than minInvest.");
        require(msg.value <= maxInvest, "Invest value should be less than maxInvest.");
        //require(msg.value + address(this).balance <= goal, "Total amount should not exceed goal.");
        require(address(this).balance <= goal, "Total amount should not exceed goal.");
        if(investors[msg.sender] == 0){
            investorCount += 1;
        }
        investors[msg.sender] += msg.value;
    }

    function createPayment(string _description, uint _amount, address _receiver) public  ownerOnly{
        Payment memory newPayment = Payment({
            description: _description,
            amount: _amount,
            receiver: _receiver,
            completed: false,
            voterCount: 0
        });
        payments.push(newPayment);
    }

    function voteForPayment(uint index) public{
        Payment storage payment = payments[index];

        require(investors[msg.sender] > 0, "Messge sender should be investor.");
        require(!payment.voters[msg.sender], "Message sender should not has voted.");

        //payment.voters.push(msg.sender);
        payment.voters[msg.sender] = true;
        payment.voterCount += 1;
    }

    function doPayment(uint index) public ownerOnly{
        Payment storage payment = payments[index];
        require(!payment.completed, "Payment should not be completed.");
        require(address(this).balance >= payment.amount, "Balance should be larger than amount of payment.");
        require(payment.voterCount > (investorCount / 2), "Voters should be more than 1/2 of investors.");
        payment.receiver.transfer(payment.amount);
        payment.completed = true;
    }

    function getSummary() public view returns (string, uint, uint, uint, uint, uint, uint, address){
        return (
            description,
            minInvest,
            maxInvest,
            goal,
            address(this).balance,
            investorCount,
            payments.length,
            owner
        );
    }
}
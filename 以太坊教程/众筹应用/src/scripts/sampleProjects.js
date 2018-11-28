const Web3 = require('web3');
// const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const config = require('config');
const web3 = new Web3(new Web3.providers.HttpProvider(config.get('providerUrl')));

const ProjectList = require('../compiled/ProjectList.json');
const address = require('../address.json');

const contract = new web3.eth.Contract(JSON.parse(ProjectList.interface), address);

(async () =>{
    const projects = [
        {
            description: "Ethereum DApp Tutorial",
            minInvest: web3.utils.toWei('0.01', 'ether'),
            maxInvest: web3.utils.toWei('0.1', 'ether'),
            goal: web3.utils.toWei('1', 'ether')
        },{
            description: 'Ethereum Video Tutorial',
            minInvest: web3.utils.toWei('0.1', 'ether'),
            maxInvest: web3.utils.toWei('1', 'ether'),
            goal: web3.utils.toWei('5', 'ether')
        }
    ];
    const accounts = await web3.eth.getAccounts();
    const owner = accounts[0];

    const results = await Promise.all(projects.map(p=>{
        return contract.methods.createProject(p.description, p.minInvest, p.maxInvest, p.goal)
            .send({from: owner, gas: '2000000'});
    }));
    console.log(results);
})();
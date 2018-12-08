const assert = require('assert');
const path = require('path');

const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const Project = require(path.resolve(__dirname, '../compiled/Project.json'));
const ProjectList = require(path.resolve(__dirname, '../compiled/ProjectList.json'));

let project;
let projectList;
let accounts;

describe('Project Contract Test', ()=>{
    beforeEach(async ()=>{
        accounts = await web3.eth.getAccounts();

        projectList = await new web3.eth.Contract(JSON.parse(ProjectList.interface))
            .deploy({data: ProjectList.bytecode})
            .send({from: accounts[0], gas: '5000000'});

        await projectList.methods.createProject('Ethereum DApp Tutorial', 100, 10000, 1000000)
            .send({from: accounts[0], gas: '1000000'});
        
        const [address] = await projectList.methods.getProjects().call();

        project = await new web3.eth.Contract(JSON.parse(Project.interface), address);       
    });

    it('should get Project and ProjectList addresses', ()=>{
        assert.ok(projectList.options.address);
        assert.ok(project.options.address);
    });

    it('should get correct properties for project', async ()=>{
        let owner = await project.methods.owner().call();
        let description = await project.methods.description().call();
        let minInvest = await project.methods.minInvest().call();
        let maxInvest = await project.methods.maxInvest().call();
        let goal = await project.methods.goal().call();

        assert.equal(owner, accounts[0]);
        assert.equal(description, "Ethereum DApp Tutorial");
        assert.equal(minInvest, 100);
        assert.equal(maxInvest, 10000);
        assert.equal(goal, 1000000);
    });

    it('should contribute', async ()=>{
        let investor = accounts[1];
        await project.methods.contribute()
            .send({from: investor, value: '10000'});
        let amount = await project.methods.investors(investor).call();
        assert.equal(amount, 10000);
    });

    it('should have minInvest', async ()=>{
        try{
            let investor = accounts[1];
            await project.methods.contribute()
                .send({from: investor, value: '10001'});
            assert.ok(false);
        } catch(err){
            assert.ok(err);
        }
    });

    it('should not exceed goal', async ()=>{
        try{
            let investor = accounts[1];
            await project.methods.contribute()
                .send({from: investor, value: '10000'});
            let amount = await project.methods.investors(investor).call();
            assert.equal(amount, 10000);
            let investor2 = accounts[2];
            await project.methods.contribute()
                .send({from: investor, value: '10000'});
            let amount2 = await project.methods.investors(investor).call();
            assert.equal(amount2, 10000);
        } catch(err){
            assert.ok(false);
        }
    });
});
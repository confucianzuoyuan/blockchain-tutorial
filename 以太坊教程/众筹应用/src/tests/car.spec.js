const assert = require('assert');
const path = require('path');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());

const contractPath = path.resolve(__dirname, '../compiled/Car.json');
const {interface, bytecode} = require(contractPath);

let contract;
let accounts;
const initialBrand = 'BMW';

describe('#contract', ()=>{
	before(()=>{
		console.log("测试开始！");
	});
        beforeEach( async ()=>{
            accounts = await web3.eth.getAccounts();
            contract = await new web3.eth.Contract(JSON.parse(interface))
                                .deploy({data:bytecode, arguments: [initialBrand]})
                                .send({from: accounts[0], gas: 3000000});
	    console.log("合约已部署！");
        });
	after(()=>{
		console.log("测试结束！");
	});
	afterEach(()=>{
		console.log("当前测试完成!");
	});
        it('deployed contract sucessfully',()=>{
            assert.ok(contract.options.address);
        });
		it('should has a initial brand', async ()=>{
			let brand = await contract.methods.brand().call();
			assert.equal(brand, initialBrand);
		});
		it('should set a new brand', async ()=>{
			const newBrand = 'Audi';
			await contract.methods.setBrand(newBrand)
					.send({from: accounts[0]});
			let brand = await contract.methods.brand().call();
			assert.equal(brand, newBrand);
		});
});

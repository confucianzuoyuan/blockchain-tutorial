const Web3 = require('web3')
// const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const config = require('config');
const web3 = new Web3(new Web3.providers.HttpProvider(config.get('providerUrl')));
const fs = require('fs-extra');
const path = require('path');
// 1. get bytecode
const filePath = path.resolve(__dirname, '../compiled/ProjectList.json');
const {interface, bytecode} = require(filePath);

(async () =>{
    // 2. get accounts
	let accounts = await web3.eth.getAccounts();
	// 3. get contract instance and deploy
	console.time("deploy time");
	let result = await new web3.eth.Contract(JSON.parse(interface))
				 .deploy({data:'0x' + bytecode})
				 .send({from: accounts[0], gas: 5000000});
	console.timeEnd("deploy time");

	const contractAddress = result.options.address;
	console.log("contract address: ", contractAddress);
	const addressFile = path.resolve(__dirname, '../address.json');
	fs.writeFileSync(addressFile, JSON.stringify(contractAddress));
	console.log("write address successfully to: ", addressFile);
	process.exit();
})();

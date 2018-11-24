const fs = require('fs-extra');
const solc = require('solc');
const path = require('path');
// 1. cleanup
const compiledPath = path.resolve(__dirname, '../compiled');
fs.removeSync(compiledPath);
fs.ensureDirSync(compiledPath);

const contractFiles = fs.readdirSync(path.resolve(__dirname, '../contracts'));
contractFiles.forEach(contractFile => {
	// compile
	const contractPath = path.resolve(__dirname, '../contracts', contractFile);
	const contractSource = fs.readFileSync(contractPath, 'utf-8');
	let compileResult = solc.compile(contractSource, 1);

	if (Array.isArray(compileResult.errors) && compileResult.errors.length) {
		throw new Error(compileResult.errors[0]);
	}

	Object.keys(compileResult.contracts).forEach(name => {
		let contractName = name.replace(/^:/, '');
		let filePath = path.resolve(compiledPath, `${contractName}.json`);
		fs.outputJsonSync(filePath, compileResult.contracts[name]);
		console.log("Saving json file to ", filePath);
	});
});

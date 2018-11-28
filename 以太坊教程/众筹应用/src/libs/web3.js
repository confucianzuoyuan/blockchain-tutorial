import Web3 from 'web3';
import getConfig from 'next/config';
const {publicRuntimeConfig} = getConfig();

let web3;

if(typeof window !== 'undefined' && typeof window.web3 !== 'undefined'){
    web3 = new Web3(window.web3.currentProvider);
} else {
    // web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    web3 = new Web3(new Web3.providers.HttpProvider(publicRuntimeConfig.providerUrl));
}

export default web3;

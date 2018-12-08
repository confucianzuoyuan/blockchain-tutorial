import web3 from './web3';
import Project from '../compiled/Project.json';

const getContract = function(address){ 
    let contract = new web3.eth.Contract(JSON.parse(Project.interface), address);
    return contract;
}

export default getContract;
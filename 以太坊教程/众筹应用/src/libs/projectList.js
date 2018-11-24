import web3 from './web3';
import ProjectList from '../compiled/ProjectList.json';
import address from '../address.json';

const contract = new web3.eth.Contract(JSON.parse(ProjectList.interface),address);

export default contract;
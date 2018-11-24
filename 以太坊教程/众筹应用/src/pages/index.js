import React from 'react';
import web3 from '../libs/web3';
import { Grid, Button, Typography, Card, CardContent, CardActions, LinearProgress } from '@material-ui/core';
import {Link} from '../routes';
import ProjectList from '../libs/projectList';
import Project from '../libs/project';
import withRoot from '../libs/withRoot';

import Layout from '../components/Layout';
import InfoBlock from '../components/InfoBlock';

class Index extends React.Component {
    // constructor(props){
    //     super(props);
    //     this.state = {
    //         accounts: []
    //     };
    //     // this.web3 = new Web3(window.web3.currentProvider);
    // }
    // async componentDidMount(){

    //     const accounts = await web3.eth.getAccounts();
    //     const balances = await Promise.all(accounts.map(account => web3.eth.getBalance(account)));
    //     this.setState({accounts: accounts.map((account,i)=>{
    //        return {address: account, balance: balances[i]}
    //     })});
    // }
    static async getInitialProps({req}){
        const addressList = await ProjectList.methods.getProjects().call();
        const summaryList = await Promise.all(
            addressList.map(address=> Project(address).methods.getSummary().call())
        );
        const projects = addressList.map((address, i)=>{
            let [descrition, minInvest, maxInvest, 
                goal, balance, investorCount, paymentCount, owner] = Object.values(summaryList[i]);
            return {
                address,
                descrition,
                minInvest,
                maxInvest,
                goal,
                balance,
                investorCount,
                paymentCount,
                owner
            };
        });
        return {projects};
    }

    render() {
        return (
            <Layout>
                {/* <ul>
                    {
                        this.state.accounts.map(
                            account =>(
                                    <li key={account.address}>
                                        {account.address}->{web3.utils.fromWei(account.balance, 'ether')}
                                    </li>
                                )
                        )
                    }
                </ul> */}
                <Grid container spacing={16}>
                    {this.props.projects.map(this.renderProject)}
                </Grid>
            </Layout>
        );
    }

    renderProject(project){
        let progress = project.balance / project.goal * 100;
        return (
            <Grid item md={6} key={project.address}>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant="headline" component="h2">
                            {project.descrition}
                        </Typography>
                        <LinearProgress style={{ margin: '10px 0' }} color="primary" variant="determinate" value={progress}></LinearProgress>
                        <Grid container spacing={16}>
                            <InfoBlock title={ `${web3.utils.fromWei(project.goal, "ether")} ETH` } description="募资上限" />
                            <InfoBlock title={`${web3.utils.fromWei(project.minInvest, 'ether')} ETH`} description="最小投资金额" />
                            <InfoBlock title={`${web3.utils.fromWei(project.maxInvest, 'ether')} ETH`} description="最大投资金额" />
                            <InfoBlock title={`${project.investorCount}人`} description="参投人数" />
                            <InfoBlock title={`${web3.utils.fromWei(project.balance, 'ether')} ETH`} description="已募资金额" />
                        </Grid>
                    </CardContent>
                    <CardActions>
                        <Link route={`/projects/${project.address}`}>
                            <Button size="small" color="primary">
                                立即投资
                            </Button>
                        </Link>
                        <Link route={`/projects/${project.address}`}>
                            <Button size="small" color="secondary">
                                查看详情
                            </Button>
                        </Link>
                    </CardActions>
                </Card>
            </Grid>
        );
    }
}

export default withRoot(Index);

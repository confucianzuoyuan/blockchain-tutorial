import React from 'react';
import {Grid, Button, Typography, LinearProgress, Paper, TextField, CircularProgress, Table, TableHead, TableBody, TableRow, TableCell, Tab} from '@material-ui/core';
import {Link} from '../../routes';
import withRoot from '../../libs/withRoot';
import Layout from '../../components/Layout';
import InfoBlock from '../../components/InfoBlock';

import web3 from '../../libs/web3';
import Project from '../../libs/project';
import ProjectList from '../../libs/projectList';

class ProjectDetail extends React.Component {
    static async getInitialProps({query}){
        const contract = Project(query.address);

        let summary = await contract.methods.getSummary().call();
        let [description, minInvest, maxInvest, 
            goal, balance, investorCount, paymentCount, owner] = Object.values(summary);

        let tasks = [];
        for(let i=0; i < paymentCount; i++){
            tasks.push(contract.methods.payments(i).call());
        }
        let payments = await Promise.all(tasks);
        let project = {
            address: query.address,
            description,
            minInvest,
            maxInvest,
            goal,
            balance,
            investorCount,
            paymentCount,
            owner,
            payments
        };

        return {project};
    }

    constructor(props) {
        super(props);

        this.state = {
            amount: 0,
            errmsg: '',
            loading: false,
            isVoting: false
        }
        this.onSubmit = this.contributeProject.bind(this);
    }

    getInputHandler(key){
        return event=>{
            this.setState({[key]: event.target.value});
        };
    }

    async contributeProject() {
        let {amount} = this.state;

        let {minInvest, maxInvest} = this.props.project;
        let minInvestInETH = web3.utils.fromWei(minInvest, 'ether');
        let maxInvestInETH = web3.utils.fromWei(maxInvest, 'ether');

        if(amount <= 0){
            return this.setState({ errmsg: '项目最小投资金额必须大于0' });
        }
        if(parseInt(amount) < parseInt(minInvestInETH)){
            return this.setState({errmsg: '投资金额必须大于最小投资金额'});
        }
        if(parseInt(amount) > parseInt(maxInvestInETH)){
            return this.setState({errmsg: '投资金额必须小于最大投资金额'});
        }

        try{
            this.setState({loading: true});

            let accounts = await web3.eth.getAccounts();
            let sender = accounts[0];

            const contract = Project(this.props.project.address);
            let result = await contract.methods.contribute()
                            .send({from: sender, value: web3.utils.toWei(amount, 'ether'), gas: '5000000'});
            this.setState({errmsg: "投资成功!", amount: 0});

            setTimeout(()=>{
                location.reload();
            }, 1000);
        } catch(err){
            console.log(err);
            this.setState({errmsg: err.message || err.toString()});
        } finally {
            this.setState({loading: false});
        }
    }

    async voteForPayment(index) {
        try{
            this.setState({isVoting: index});

            const accounts = await web3.eth.getAccounts();
            const sender = accounts[0];

            const contract = Project(this.props.project.address);

            let isInvestor = await contract.methods.investors(sender).call();
            if(!isInvestor){
                return window.alert("只有投资人才有投票权");
            }

            let result = await contract.methods.voteForPayment(index)
                                .send({from: sender, gas: "5000000"});
            window.alert("投票成功!");

            setTimeout(()=>{
                location.reload();
            }, 1000);
        } catch(err){
            window.alert(err.message || err.toString());
        } finally{
            this.setState({isVoting: false});
        }
    }

    render(){
        return (
            <Layout>
                <Typography variant="title" color="inherit" style={{ margin: '15px 0' }}>
                    项目基本信息
                </Typography>
                {this.renderBasicInfo(this.props.project)}
                <Typography variant="title" color="inherit" style={{ margin: '30px 0 15px' }}>
                    资金支出信息
                </Typography>
                {this.renderPayments(this.props.project)}
            </Layout>
        );
    }

    renderBasicInfo(project) {
        let progress = project.balance / project.goal * 100;
        return (
            <Paper style={{ padding: '15px' }}>
                <Typography gutterBottom variant="headline" component="h2">
                    {project.descrition}
                </Typography>
                <LinearProgress style={{ margin: '10px 0' }} color="primary" variant="determinate" value={progress}></LinearProgress>
                <Grid container spacing={16}>
                    <InfoBlock title={`${web3.utils.fromWei(project.goal, "ether")} ETH`} description="募资上限" />
                    <InfoBlock title={`${web3.utils.fromWei(project.minInvest, 'ether')} ETH`} description="最小投资金额" />
                    <InfoBlock title={`${web3.utils.fromWei(project.maxInvest, 'ether')} ETH`} description="最大投资金额" />
                    <InfoBlock title={`${project.investorCount}人`} description="参投人数" />
                    <InfoBlock title={`${web3.utils.fromWei(project.balance, 'ether')} ETH`} description="已募资金额" />
                </Grid>
                <Grid container spacing={16}>
                    <Grid item md={12}>
                        <TextField 
                            required
                            id="amount"
                            label="投资金额"
                            style={{ marginRight: '15px' }}
                            value={this.state.amount}
                            onChange={this.getInputHandler('amount')}
                            margin="normal"
                            InputProps={{ endAdornment: 'ETH' }}/>
                        <Button size="small" variant="raised" color="primary" onClick={this.onSubmit}>
                            {this.state.loading ? <CircularProgress color="secondary" size={24} /> : '立即投资'}
                        </Button>
                        { !!this.state.errmsg && (
                        <Typography component="p" style={{ color: 'red' }}>
                            {this.state.errmsg}
                        </Typography>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        );    
    }

    renderPayments(project){
        return (
            <Paper style={{ padding: '15px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>用途</TableCell>
                            <TableCell>金额</TableCell>
                            <TableCell>收款方</TableCell>
                            <TableCell>完成状态</TableCell>
                            <TableCell>投票状态</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            project.payments.map((payment,index)=>
                                this.renderPaymentRow(payment,index,project)
                            )
                        }
                    </TableBody>
                </Table>
                <Link route={`/projects/${project.address}/payments/create`}>
                <Button variant="raised" color="primary">
                    创建资金支出请求
                </Button>
                </Link>
            </Paper>
        );
    }
    renderPaymentRow(payment, index, project){
        let canVote = !payment.completed;
        return (
            <TableRow key={payment.id}>
                <TableCell>{payment.description}</TableCell>
                <TableCell>{web3.utils.fromWei(payment.amount,'ether')}</TableCell>
                <TableCell>{payment.receiver}</TableCell>
                <TableCell>{payment.completed?"是":"否"}</TableCell>
                <TableCell>{payment.voterCount}/{project.investorCount}</TableCell>
                <TableCell>
                    {canVote && (
                        <Button size="small" color="primary" onClick={()=>this.voteForPayment(index)}>
                            {this.isVoting(index) ? <CircularProgress color="secondary" size={24}/> : "投赞成票"}
                        </Button>
                    )}
                </TableCell>
            </TableRow>
        );
    }

    isVoting(index){
        return ( typeof this.state.isVoting === "number" && this.state.isVoting === index);
    }
}

export default withRoot(ProjectDetail);

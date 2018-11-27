import React from 'react';
import { Grid, Button, Typography, TextField, Paper, CircularProgress } from '@material-ui/core';
import {Router} from '../../../routes';
import withRoot from '../../../libs/withRoot';
import Layout from '../../../components/Layout';

import web3 from '../../../libs/web3';
import Project from '../../../libs/project';
import { TextEncoder } from 'util';

class PaymentCreate extends React.Component {
    static async getInitialProps({query}){
        const contract = Project(query.address);
        let summary = await contract.methods.getSummary().call();
        let description = summary[0];
        let paymentsCount = summary[6];
        let owner = summary[7];

        return {
            project: {
                address: query.address,
                description,
                paymentsCount,
                owner
            }
        };
    }

    constructor(props){
        super(props);
        this.state = {
            description: '',
            amount: '',
            receiver: 0,
            errmsg: '',
            loading: false
        };
        this.onSubmit = this.createPayment.bind(this);
    }

    getInputHandler(key){
        return event => {
            console.log(event.target.value);
            this.setState({[key]: event.target.value});
        }
    }
    
    async createPayment(){
        let {description, amount, receiver} = this.state;

        if(!description){
            return this.setState({errmsg: "支出理由不能为空"});
        }
        if(amount <= 0){
            return this.setState({errmsg: "支出金额应大于0"});
        }
        if(!web3.utils.isAddress(receiver)){
            return this.setState({errmsg: "收款人地址不合法"});
        }

        let amountInWei = web3.utils.toWei(amount, 'ether');
        try{
            this.setState({loading: true});

            const accounts = await web3.eth.getAccounts();
            const sender = accounts[0];

            if(sender !== this.props.project.owner){
                return window.alert('只有项目方才能创建资金支出请求');
            }

            const contract = Project(this.props.project.address);
            let result = await contract.methods.createPayment(description, amountInWei, receiver)
                                .send({from: sender, gas: '5000000'});
            console.log(result);
            this.setState({errmsg: '资金支出请求创建成功'});

            setTimeout(()=>{
                Router.pushRoute(`/projects/${this.props.project.address}`);
            }, 1000);
        } catch(err) {
            this.setState({errmsg: err.message || err.toString()});
        } finally {
            this.setState({loading: false});
        }
    }

    render(){
        return (
            <Layout>
                <Typography variant="title" color="inherit" style={{ marginTop: '15px' }}>
                    创建资金支出请求
                </Typography>
                <Paper style={{ width: '60%', padding: '15px', marginTop: '15px' }}>
                    <form noValidate autoComplete="off" style={{ marginBottom: '15px' }}>
                        <TextField 
                            fullWidth
                            required
                            id="description"
                            label="支出理由"
                            value={this.state.description}
                            onChange={this.getInputHandler("description")}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            required
                            id="amount"
                            label="支出金额"
                            value={this.state.amount}
                            onChange={this.getInputHandler('amount')}
                            margin="normal"
                            InputProps={{ endAdornment: 'ETH' }}
                        />
                        <TextField
                            fullWidth
                            required
                            id="receiver"
                            label="收款方"
                            value={this.state.receiver}
                            onChange={this.getInputHandler('receiver')}
                            margin="normal"
                        />
                    </form>
                    <Button variant="raised" size="large" color="primary" onClick={this.onSubmit}>
                        {this.state.loading ? <CircularProgress color="secondary" size={24}/> : "创建"}
                    </Button>
                    {!!this.state.errmsg && (
                        <Typography component="p" style={{ color: 'red' }}>
                            {this.state.errmsg}
                        </Typography>
                    )}
                </Paper>
            </Layout>
        );
    }
}

export default withRoot(PaymentCreate);

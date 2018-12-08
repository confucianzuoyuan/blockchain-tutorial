'use strict';

var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');

var fabric_client = new Fabric_Client();

var channel = fabric_client.newChannel('atguiguchannel');
var peer = fabric_client.newPeer('grpc://localhost:7051');
channel.addPeer(peer);
var order = fabric_client.newOrderer('grpc://localhost:7050')
channel.addOrderer(order);

var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:'+store_path);
var tx_id = null;

Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {
	fabric_client.setStateStore(state_store);
	var crypto_suite = Fabric_Client.newCryptoSuite();
	var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
	crypto_suite.setCryptoKeyStore(crypto_store);
	fabric_client.setCryptoSuite(crypto_suite);

	return fabric_client.getUserContext('zuoyuan', true);
}).then((user_from_store) => {
	if (user_from_store && user_from_store.isEnrolled()) {
		console.log('加载用户zuoyuan成功！');
		member_user = user_from_store;
	} else {
		throw new Error('获取用户zuoyuan失败.... 运行registerUser.js');
	}

    // 为当前用户获取一个交易id对象
	tx_id = fabric_client.newTransactionID();
	console.log("交易id: ", tx_id._transaction_id);

	// createCar chaincode function - requires 5 args, ex: args: ['CAR12', '本田', '雅阁', '黑色', '孙老师'],
	// changeCarOwner chaincode function - requires 2 args , ex: args: ['CAR10', '左老师'],
    // 必须将提案发送到背书节点
	var request = {
		chaincodeId: 'atguigucar',
		fcn: '',
		args: [''],
		chainId: 'atguiguchannel',
		txId: tx_id
	};

    // 将交易提案发送给peer节点, 也就是背书节点
	return channel.sendTransactionProposal(request);
}).then((results) => {
	var proposalResponses = results[0];
	var proposal = results[1];
	let isProposalGood = false;
	if (proposalResponses && proposalResponses[0].response &&
		proposalResponses[0].response.status === 200) {
			isProposalGood = true;
			console.log('交易提案没有问题, 是一个好提案');
		} else {
			console.error('交易提案有问题, 是一个坏提案');
		}
	if (isProposalGood) {
		console.log(util.format(
			'发送提案成功并且接收到了提案响应: Status - %s, message - "%s"',
			proposalResponses[0].response.status, proposalResponses[0].response.message));

        // 构造一个请求发送到orderer排序节点，来将交易commit
		var request = {
			proposalResponses: proposalResponses,
			proposal: proposal
		};

        // 设置交易的监听者，并设置30秒的超时时间
        // 如果交易在超时时间内没有commit，那么报告一个超时状态
		var transaction_id_string = tx_id.getTransactionID(); //获取交易id字符串
		var promises = [];

		var sendPromise = channel.sendTransaction(request);
		promises.push(sendPromise);

        // 当为fabric客户端指派了一个用户的时候, 初始化一个event_hub。
		let event_hub = channel.newChannelEventHub(peer);

		let txPromise = new Promise((resolve, reject) => {
            // 定义了一个名为handle的定时器
			let handle = setTimeout(() => {
				event_hub.unregisterTxEvent(transaction_id_string);
				event_hub.disconnect();
				resolve({event_status : 'TIMEOUT'});
			}, 3000);
			event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                // 这个回调函数用来处理交易事件的状态
                // 首先清除掉定时器, 前提是在3秒以内回调函数被调用
				clearTimeout(handle);

				var return_status = {event_status : code, tx_id : transaction_id_string};
				if (code !== 'VALID') {
					console.error('交易无效，错误码为: ' + code);
					resolve(return_status);
				} else {
					console.log('交易已经提交到节点，节点地址是: ' + event_hub.getPeerAddr());
					resolve(return_status);
				}
			}, (err) => {
				reject(new Error('eventhub出问题了 ::'+err));
			},
				{disconnect: true} // 完成以后断开连接
			);
			event_hub.connect();

		});
		promises.push(txPromise);

        // 执行所有的promise，等待所有的promise执行完
        // 这里要注意Promise.all强制promises数组中的promise顺序执行
		return Promise.all(promises);
	} else {
		throw new Error('发送交易失败. Response null or status is not 200. exiting...');
	}
}).then((results) => {
	if (results && results[0] && results[0].status === 'SUCCESS') {
		console.log('成功将交易发送至orderer排序节点');
	} else {
		console.error('交易排序错误，错误码为: ' + results[0].status);
	}

	if(results && results[1] && results[1].event_status === 'VALID') {
		console.log('成功将改变commit到账本');
	} else {
		console.log('交易未被commit到账本，原因是::'+results[1].event_status);
	}
}).catch((err) => {
	console.error('invoke失败 :: ' + err);
});

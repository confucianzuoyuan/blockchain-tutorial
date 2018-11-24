'use strict';
const util = require('util');
const helper = require('./helper.js');
const logger = helper.getLogger('invoke-chaincode');

const invokeChaincode = async function(peerNames, channelName, chaincodeName, fcn, args, username, org_name) {
	logger.debug(util.format('\n============ 激活通道上的交易 %s ============\n', channelName));
	let error_message = null;
	let tx_id_string = null;
	try {
		let client = await helper.getClientForOrg(org_name, username);
		logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
		let channel = client.getChannel(channelName);
		if(!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			logger.error(message);
			throw new Error(message);
		}
		var tx_id = client.newTransactionID();
        // 获取交易id
		tx_id_string = tx_id.getTransactionID();

        // 构建发送到背书节点的请求
		let request = {
			targets: peerNames,
			chaincodeId: chaincodeName,
			fcn: fcn,
			args: args,
			chainId: channelName,
			txId: tx_id
		};

		let results = await channel.sendTransactionProposal(request);

		// the returned object has both the endorsement results
		// and the actual proposal, the proposal will be needed
		// later when we send a transaction to the orderer
		let proposalResponses = results[0];
		let proposal = results[1];

		// lets have a look at the responses to see if they are
		// all good, if good they will also include signatures
		// required to be committed
		let all_good = true;
		for (let i in proposalResponses) {
			let one_good = false;
			if (proposalResponses && proposalResponses[i].response &&
				proposalResponses[i].response.status === 200) {
				one_good = true;
				logger.info('invoke chaincode proposal was good');
			} else {
				logger.error('invoke chaincode proposal was bad');
			}
			all_good = all_good & one_good;
		}

		if (all_good) {
			logger.info(util.format(
				'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
				proposalResponses[0].response.status, proposalResponses[0].response.message,
				proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));

			// wait for the channel-based event hub to tell us
			// that the commit was good or bad on each peer in our organization
			let promises = [];
			let event_hubs = channel.getChannelEventHubsForOrg();
			event_hubs.forEach((eh) => {
				logger.debug('invokeEventPromise - setting up event');
				let invokeEventPromise = new Promise((resolve, reject) => {
					let event_timeout = setTimeout(() => {
						let message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
						logger.error(message);
						eh.disconnect();
					}, 3000);
					eh.registerTxEvent(tx_id_string, (tx, code, block_num) => {
						logger.info('The chaincode invoke chaincode transaction has been committed on peer %s',eh.getPeerAddr());
						logger.info('Transaction %s has status of %s in blocl %s', tx, code, block_num);
						clearTimeout(event_timeout);

						if (code !== 'VALID') {
							let message = util.format('The invoke chaincode transaction was invalid, code:%s',code);
							logger.error(message);
							reject(new Error(message));
						} else {
							let message = 'The invoke chaincode transaction was valid.';
							logger.info(message);
							resolve(message);
						}
					}, (err) => {
						clearTimeout(event_timeout);
						logger.error(err);
						reject(err);
					},
						// the default for 'unregister' is true for transaction listeners
						// so no real need to set here, however for 'disconnect'
						// the default is false as most event hubs are long running
						// in this use case we are using it only once
						{unregister: true, disconnect: true}
					);
					eh.connect();
				});
				promises.push(invokeEventPromise);
			});

			var orderer_request = {
				txId: tx_id,
				proposalResponses: proposalResponses,
				proposal: proposal
			};
			var sendPromise = channel.sendTransaction(orderer_request);
			// put the send to the orderer last so that the events get registered and
			// are ready for the orderering and committing
			promises.push(sendPromise);
			let results = await Promise.all(promises);
			logger.debug(util.format('------->>> R E S P O N S E : %j', results));
			let response = results.pop(); //  orderer results are last in the results
			if (response.status === 'SUCCESS') {
				logger.info('Successfully sent transaction to the orderer.');
			} else {
				error_message = util.format('Failed to order the transaction. Error code: %s',response.status);
				logger.debug(error_message);
			}

			// now see what each of the event hubs reported
			for(let i in results) {
				let event_hub_result = results[i];
				let event_hub = event_hubs[i];
				logger.debug('Event results for event hub :%s',event_hub.getPeerAddr());
				if(typeof event_hub_result === 'string') {
					logger.debug(event_hub_result);
				} else {
					if(!error_message) error_message = event_hub_result.toString();
					logger.debug(event_hub_result.toString());
				}
			}
		} else {
			error_message = util.format('Failed to send Proposal and receive all good ProposalResponse');
			logger.debug(error_message);
		}
	} catch (error) {
		logger.error('Failed to invoke due to error: ' + error.stack ? error.stack : error);
		error_message = error.toString();
	}

	if (!error_message) {
		let message = util.format(
			'Successfully invoked the chaincode %s to the channel \'%s\' for transaction ID: %s',
			org_name, channelName, tx_id_string);
		logger.info(message);

		return tx_id_string;
	} else {
		let message = util.format('Failed to invoke chaincode. cause:%s',error_message);
		logger.error(message);
		throw new Error(message);
	}
};

exports.invokeChaincode = invokeChaincode;

const fs = require('fs');
const path = require('path');
const
const helper = require('./helper.js');
const logger = helper.getLogger('Create-Channel');
//Attempt to send a request to the orderer with the sendTransaction method
const createChannel = async function(channelName, channelConfigPath, username, orgName) {
	logger.debug('\n====== Creating Channel \'' + channelName + '\' ======\n');
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(orgName);
		logger.debug('Successfully got the fabric client for the organization "%s"', orgName);

		// read in the envelope for the channel config raw bytes
		var envelope = fs.readFileSync(path.join(__dirname, channelConfigPath));
		// extract the channel config bytes from the envelope to be signed
		var channelConfig = client.extractChannelConfig(envelope);

		//Acting as a client in the given organization provided with "orgName" param
		// sign the channel config bytes as "endorsement", this is required by
		// the orderer's channel creation policy
		// this will use the admin identity assigned to the client when the connection profile was loaded
		let signature = client.signChannelConfig(channelConfig);

		let request = {
			config: channelConfig,
			signatures: [signature],
			name: channelName,
			txId: client.newTransactionID(true) // get an admin based transactionID
		};

		// send to orderer
		var response = await client.createChannel(request)
		logger.debug(' response ::%j', response);
		if (response && response.status === 'SUCCESS') {
			logger.debug('Successfully created the channel.');
			let response = {
				success: true,
				message: 'Channel \'' + channelName + '\' created Successfully'
			};
			return response;
		} else {
			logger.error('\n!!!!!!!!! Failed to create the channel \'' + channelName +
				'\' !!!!!!!!!\n\n');
			throw new Error('Failed to create the channel \'' + channelName + '\'');
		}
	} catch (err) {
		logger.error('Failed to initialize the channel: ' + err.stack ? err.stack :	err);
		throw new Error('Failed to initialize the channel: ' + err.toString());
	}
};

exports.createChannel = createChannel;

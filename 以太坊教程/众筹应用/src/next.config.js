const config = require('config');

module.exports = {
    serverRuntimeConfig: {},
    publicRuntimeConfig: {
        providerUrl: config.get('providerUrl')
    }
};

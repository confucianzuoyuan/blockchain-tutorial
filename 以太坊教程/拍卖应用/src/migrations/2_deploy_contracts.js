var EcommerceStore = artifacts.require('./EcommerceStore.sol')

module.exports = function (deployer) {
  deployer.deploy(EcommerceStore);
}
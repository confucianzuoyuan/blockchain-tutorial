'use strict';

var Fabric_Client = require('fabric-client');
var Fabric_CA_Client = require('fabric-ca-client');

var path = require('path');
var util = require('util');
var os = require('os');

var fabric_client = new Fabric_Client();
var fabric_ca_client = null;
var admin_user = null;
var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log(' Store path:'+store_path);

// 根据fabric-client/config/default.json中的'key-value-store'配置来创建key-value存储
Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {
    // 将store赋值给fabric客户端
    fabric_client.setStateStore(state_store);
    var crypto_suite = Fabric_Client.newCryptoSuite();
    // 使用同样的位置来存储状态(这里保存了用户的证书)和加密信息(保存了用户的密钥)
    var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
    crypto_suite.setCryptoKeyStore(crypto_store);
    fabric_client.setCryptoSuite(crypto_suite);
    // tls相关设置
    var	tlsOptions = {
    	trustedRoots: [],
    	verify: false
    };
    // 当TLS enabled时，务必将http改成https。
    fabric_ca_client = new Fabric_CA_Client('http://localhost:7054', tlsOptions , 'ca.atguigu.com', crypto_suite);

    // 首先查看admin用户是否已经登记
    return fabric_client.getUserContext('admin', true);
}).then((user_from_store) => {
    if (user_from_store && user_from_store.isEnrolled()) {
        console.log('Successfully loaded admin from persistence');
        admin_user = user_from_store;
        return null;
    } else {
        // 需要CA服务器来登记admin用户
        return fabric_ca_client.enroll({
          enrollmentID: 'admin',
          enrollmentSecret: 'adminpw'
        }).then((enrollment) => {
          console.log('用户"admin"登记成功！')
          return fabric_client.createUser(
              {username: 'admin',
                  mspid: 'Org1MSP',
                  cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
              });
        }).then((user) => {
          admin_user = user;
          return fabric_client.setUserContext(admin_user);
        }).catch((err) => {
          console.error('admin登记和持久化失败. Error: ' + err.stack ? err.stack : err);
          throw new Error('Failed to enroll admin');
        });
    }
}).then(() => {
    console.log('将admin用户指派给了fabric客户端 ::' + admin_user.toString());
}).catch((err) => {
    console.error('登记用户admin失败: ' + err);
});

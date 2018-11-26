const util = require('util');
const path = require('path');
const hfc = require('fabric-client');
const file = 'network-config.yaml';

// 初始化fabric客户端用到的一些配置，例如将setup文件放在哪个路径等等
hfc.setConfigSetting('network-connection-profile-path',path.join(__dirname, 'artifacts' ,file));
hfc.setConfigSetting('Org1-connection-profile-path',path.join(__dirname, 'artifacts', 'org1.yaml'));
hfc.setConfigSetting('Org2-connection-profile-path',path.join(__dirname, 'artifacts', 'org2.yaml'));

hfc.addConfigFile(path.join(__dirname, 'config.json'));

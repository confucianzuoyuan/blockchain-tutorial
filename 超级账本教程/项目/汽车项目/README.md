1. 创建项目文件夹

```
$ mkdir atguigucar
```

2. 编写配置文件

参见`项目`文件夹中的代码`configtx.yaml`, `crypto-config.yaml`, `docker-compose.yaml`

编写`.env`文件

```
COMPOSE_PROJECT_NAME=net
```

生成密钥等工件

把`fabric-projects`中的bin文件夹拷贝过来，当然也可以设置到全局的环境变量里面

```
#!/bin/sh
export FABRIC_CFG_PATH=${PWD}
CHANNEL_NAME=atguiguchannel

# 新建文件夹 
mkdir config
mkdir crypto-config

# 生成加密相关的材料
./bin/cryptogen generate --config=./crypto-config.yaml

# 为排序节点生成创世区块
./bin/configtxgen -profile OneOrgOrdererGenesis -outputBlock ./config/genesis.block

# 生成通道配置交易
./bin/configtxgen -profile OneOrgChannel -outputCreateChannelTx ./config/channel.tx -channelID $CHANNEL_NAME

# 生成锚节点交易
./bin/configtxgen -profile OneOrgChannel -outputAnchorPeersUpdate ./config/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
```

在docker-compose.yaml中有一个地方要替换

就是fabric-ca密钥需要替换

3. 启动docker

```
$ docker-compose -f docker-compose.yaml up -d ca.atguigu.com orderer.atguigu.com peer0.org1.atguigu.com couchdb
```

4. 创建通道

```
# 创建通道 
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.atguigu.com/msp" peer0.org1.atguigu.com peer channel create -o orderer.atguigu.com:7050 -c atguiguchannel -f /etc/hyperledger/configtx/channel.tx
# 将peer0.org1.atguigu.com添加到通道里面
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.atguigu.com/msp" peer0.org1.atguigu.com peer channel join -b atguiguchannel.block
```

5. 启动cli

```
docker-compose -f docker-compose.yaml up -d cli
```

6. 安装，初始化链代码等操作

```
LANGUAGE=golang
CC_SRC_PATH=github.com/atguigucar/go
```

```
# 安装链代码
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/users/Admin@org1.atguigu.com/msp" cli peer chaincode install -n atguigucar -v 1.0 -p "$CC_SRC_PATH" -l "$LANGUAGE"
# 初始化链代码
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/users/Admin@org1.atguigu.com/msp" cli peer chaincode instantiate -o orderer.atguigu.com:7050 -C atguiguchannel -n atguigucar -l "$LANGUAGE" -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"
# 使用invode初始化账本
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/users/Admin@org1.atguigu.com/msp" cli peer chaincode invoke -o orderer.atguigu.com:7050 -C atguiguchannel -n atguigucar -c '{"function":"initLedger","Args":[""]}'
```

7. npm install将需要的sdk安装

8. 执行node程序

```
node enrollAdmin.js
node registerUser.js
node query.js
node query.js
```

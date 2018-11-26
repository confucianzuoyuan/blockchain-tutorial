1. 创建项目文件夹

```
$ mkdir atguigucar
```

2. 编写配置文件

参见`项目`文件夹中的代码`configtx.yaml`, `crypto-config.yaml`, `docker-compose.yaml`

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
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/users/Admin@org1.atguigu.com/msp" cli peer chaincode install -n atguigucar -v 1.0 -p "$CC_SRC_PATH" -l "$LANGUAGE"
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/users/Admin@org1.atguigu.com/msp" cli peer chaincode instantiate -o orderer.atguigu.com:7050 -C atguiguchannel -n atguigucar -l "$LANGUAGE" -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/users/Admin@org1.atguigu.com/msp" cli peer chaincode invoke -o orderer.atguigu.com:7050 -C atguiguchannel -n atguigucar -c '{"function":"initLedger","Args":[""]}'
```

```
#!/bin/bash
# 启动容器
docker-compose -f docker-compose.yml up -d ca.atguigu.com orderer.atguigu.com peer0.org1.atguigu.com couchdb

# 创建通道 
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.atguigu.com/msp" peer0.org1.atguigu.com peer channel create -o orderer.atguigu.com:7050 -c mychannel -f /etc/hyperledger/configtx/channel.tx
# peer0.org1.atguigu.com加入通道
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.atguigu.com/msp" peer0.org1.atguigu.com peer channel join -b mychannel.block
```

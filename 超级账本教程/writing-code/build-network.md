首先在fabric-projects文件夹中新建一个文件

```sh
$ vim crypto-config.yaml
```

在里面写入

```yaml
OrdererOrgs:
  - Name: Orderer          # 排序节点
    Domain: atguigu.com
    Specs:
      - Hostname: orderer
PeerOrgs:
  - Name: Org1            # 组织1
    Domain: org1.atguigu.com
    EnableNodeOUs: true
    Template:
      Count: 2
    Users:
      Count: 1
  - Name: Org2            # 组织2
    Domain: org2.atguigu.com
    EnableNodeOUs: true
    Template:
      Count: 2
    Users:
      Count: 1
```

在终端中执行：

```sh
$ ./bin/cryptogen generate --config=./crypto-config.yaml
```

应该会看到

```
org1.atguigu.com
org2.atguigu.com
```

编写另一个配置文件

```sh
$ vim configtx.yaml
```

```yaml
Organizations:

    - &OrdererOrg
        Name: OrdererOrg
        ID: OrdererMSP
        MSPDir: crypto-config/ordererOrganizations/atguigu.com/msp
        Policies:
            Readers:
                Type: Signature
                Rule: "OR('OrdererMSP.member')"
            Writers:
                Type: Signature
                Rule: "OR('OrdererMSP.member')"
            Admins:
                Type: Signature
                Rule: "OR('OrdererMSP.admin')"

    - &Org1
        Name: Org1MSP
        ID: Org1MSP
        MSPDir: crypto-config/peerOrganizations/org1.atguigu.com/msp
        Policies:
            Readers:
                Type: Signature
                Rule: "OR('Org1MSP.admin', 'Org1MSP.peer', 'Org1MSP.client')"
            Writers:
                Type: Signature
                Rule: "OR('Org1MSP.admin', 'Org1MSP.client')"
            Admins:
                Type: Signature
                Rule: "OR('Org1MSP.admin')"

        AnchorPeers:
            - Host: peer0.org1.atguigu.com
              Port: 7051

    - &Org2
        Name: Org2MSP
        ID: Org2MSP
        MSPDir: crypto-config/peerOrganizations/org2.atguigu.com/msp
        Policies:
            Readers:
                Type: Signature
                Rule: "OR('Org2MSP.admin', 'Org2MSP.peer', 'Org2MSP.client')"
            Writers:
                Type: Signature
                Rule: "OR('Org2MSP.admin', 'Org2MSP.client')"
            Admins:
                Type: Signature
                Rule: "OR('Org2MSP.admin')"

        AnchorPeers:
            - Host: peer0.org2.atguigu.com
              Port: 7051

Capabilities:
    Channel: &ChannelCapabilities
        V1_3: true

    Orderer: &OrdererCapabilities
        V1_1: true

    Application: &ApplicationCapabilities
        V1_3: true
        V1_2: false
        V1_1: false

Application: &ApplicationDefaults

    Organizations:

    Policies:
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"

Orderer: &OrdererDefaults

    OrdererType: solo

    Addresses:
        - orderer.atguigu.com:7050

    BatchTimeout: 2s

    BatchSize:

        MaxMessageCount: 10
        AbsoluteMaxBytes: 99 MB
        PreferredMaxBytes: 512 KB

    Kafka:
        Brokers:
            - 127.0.0.1:9092

    Organizations:
    Policies:
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"
        BlockValidation:
            Type: ImplicitMeta
            Rule: "ANY Writers"

Channel: &ChannelDefaults
    Policies:
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"

    Capabilities:
        <<: *ChannelCapabilities

Profiles:

    TwoOrgsOrdererGenesis:
        <<: *ChannelDefaults
        Orderer:
            <<: *OrdererDefaults
            Organizations:
                - *OrdererOrg
            Capabilities:
                <<: *OrdererCapabilities
        Consortiums:
            SampleConsortium:
                Organizations:
                    - *Org1
                    - *Org2
    TwoOrgsChannel:
        Consortium: SampleConsortium
        Application:
            <<: *ApplicationDefaults
            Organizations:
                - *Org1
                - *Org2
            Capabilities:
                <<: *ApplicationCapabilities
```

然后运行

```
$ export FABRIC_CFG_PATH=$PWD
$ ./bin/configtxgen -profile TwoOrgsOrdererGenesis -outputBlock ./channel-artifacts/genesis.block
```

# 创建通道交易的配置

```sh
$ export CHANNEL_NAME=mychannel  && ./bin/configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME
```

```sh
$ ./bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
```

# 启动网络

```sh
$ docker-compose -f docker-compose-cli.yaml up -d
```

进入docker cli

```sh
$ docker exec -it cli bash
```

进入cli以后，配置环境变量。

```sh
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/users/Admin@org1.atguigu.com/msp
export CORE_PEER_ADDRESS=peer0.org1.atguigu.com:7051
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/peers/peer0.org1.atguigu.com/tls/ca.crt
```


```sh
$ export CHANNEL_NAME=mychannel
$ peer channel create -o orderer.atguigu.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/atguigu.com/orderers/orderer.atguigu.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

```sh
$ peer channel join -b mychannel.block
```

```sh
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.atguigu.com/users/Admin@org2.atguigu.com/msp CORE_PEER_ADDRESS=peer0.org2.atguigu.com:7051 CORE_PEER_LOCALMSPID="Org2MSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.atguigu.com/peers/peer0.org2.atguigu.com/tls/ca.crt peer channel join -b mychannel.block
```

```sh
peer channel update -o orderer.atguigu.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/Org1MSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/atguigu.com/orderers/orderer.atguigu.com/msp/tlscacerts/tlsca.atguigu.com-cert.pem
```

```sh
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.atguigu.com/users/Admin@org2.atguigu.com/msp CORE_PEER_ADDRESS=peer0.org2.atguigu.com:7051 CORE_PEER_LOCALMSPID="Org2MSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.atguigu.com/peers/peer0.org2.atguigu.com/tls/ca.crt peer channel update -o orderer.atguigu.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/Org2MSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/atguigu.com/orderers/orderer.atguigu.com/msp/tlscacerts/tlsca.atguigu.com-cert.pem
```
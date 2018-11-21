首先在fabric-projects文件夹中新建一个文件

```sh
$ vim crypto-config.yaml
```

在里面写入

```yaml
OrdererOrgs:
  - Name: Orderer          # 排序节点
    Domain: atguigu.com    # 域名
    Specs:
      - Hostname: orderer  # 主机
PeerOrgs:
  - Name: Org1            # 组织1
    Domain: org1.atguigu.com
    EnableNodeOUs: true   # 如果设置了EnableNodeOUs，就在msp下生成config.yaml文件
    Template:
      Count: 2            # 有两个节点
    Users:
      Count: 1            # 除了Admin还有多少用户
  - Name: Org2            # 组织2
    Domain: org2.atguigu.com
    EnableNodeOUs: true
    Template:
      Count: 2
    Users:
      Count: 1
```

Cryptogen使用一个文件 - “crypto-config.yaml” - 包含网络拓扑，并允许我们为组织和属于这些组织的组件生成一组证书和密钥。每个组织都配置了一个唯一的根证书(ca-cert)，它将特定组件(对等节点和排序节点)绑定到该组织。通过为每个组织分配一个唯一的CA证书，我们模仿一个典型的网络，其中参与的成员会使用它自己的证书颁发机构。Hyperledger Fabric中的交易和通信由实体的私钥(keystore)签名，然后通过公钥(signcerts)进行验证。

网络实体的命名约定如下 - “{{.Hostname}}.{{.Domain}}”。因此，使用我们的排序节点作为参考点，我们留下一个名为 - “orderer.atguigu.com”的排序节点，它与“Orderer”的MSP ID相关联。

在终端中执行：

```sh
$ ./bin/cryptogen generate --config=./crypto-config.yaml
```

运行cryptogen工具后，生成的证书和密钥将保存到名为crypto-config的文件夹中。

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
# 这一部分主要定义一系列的组织结构，根据服务对象类型的不同，包括Orderer组织和普通的应用组织。
# Orderer类型组织包括名称、ID、MSP文件路径、管理员策略等，应用类型组织还会配置锚点Peer信息。这些组织都会被Profiles部分引用使用。
Organizations:

    - &OrdererOrg # orderer组织也就是排序组织
        Name: OrdererOrg
        ID: OrdererMSP # MSP的ID
        MSPDir: crypto-config/ordererOrganizations/atguigu.com/msp # MSP相关文件所在本地路径
        # 背书策略
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

    - &Org1 # 组织1
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

        # AnchorPeers defines the location of peers which can be used
        # for cross org gossip communication.  Note, this value is only
        # encoded in the genesis block in the Application section context
        AnchorPeers:
            - Host: peer0.org1.atguigu.com
              Port: 7051

    - &Org2 # 组织2
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

    OrdererType: solo # 排序算法：是solo还是kafka, 中心化和半中心化的区别

    Addresses:
        - orderer.atguigu.com:7050

    # BatchTimeout是配置多久产生一个区块，默认是2秒，通常在项目实践中，我们发现交易量并不大，如果配置的时间过小就会产生很多空的区块，配置时间太长，则发现等待产生区块的时间太长。具体时间由交易频率和业务量决定。我们实际项目中，通常配置在30秒。
    BatchTimeout: 2s

    BatchSize:

        # MaxMessageCount是配置在一个区块中允许的交易数的最大值。默认值是10。交易数设置过小，导致区块过多，增加orderer的负担，因为要orderer要不断的打包区块，然后deliver给通道内的所有peer,这样还容易增加网络负载，引起网络拥堵。我们实际项目中通常配置500，不过具体还应该看业务情况，因为如果每个交易包含的数据的size如果太大，那么500个交易可能导致一个区块太大，因此需要根据实际业务需求权衡。
        # 这里有2个参数可以配置区块的出块策略，那么究竟那个因素优先发生作用呢？实际上根据Fabric设计的出块策略，BatchTimeout和MaxMessageCount的任何一个参数条件满足，都会触发产生新的区块。举个例子，假设我们配置了出块时间BatchTimeout为30秒，块内交易最大数量MaxMessageCount为500。第一种情况，当出块时间为20秒(时间上还没达到出块要求)，但是交易数已经累积到500个了，这个时候也会触发新的区块产生。第二种情况，交易数才1个，但是出块时间已经30秒了，这个时间也会触发新的区块产生，尽管这个新的区块里只有一个交易。
        # Fabric的这种出块策略设计相比还是比较灵活的，可配置的。相比而言，在比特币中，大家都知道出块机制是固定的，就是每隔10分钟（600秒）产生一个区块，就一个陌生，不可更改。而以太坊类似，也是基于事件的出块策略，只是时间更短，每15秒产生一个区块。因此，Fabric的出块策略在设计上还是比较进步的。

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

# 定义了一系列的Profile，每个Profile代表了某种应用场景下的通道配置模板，包括Orderer系统通道模板或应用通道模板，有时候也混合放到一起。
# Orderer系统通道模板必须包括Orderer、Consortiums信息：
# 一般建议将Profile分为Orderer系统通道配置和应用通道配置两种。
Profiles:

    TwoOrgsOrdererGenesis: # Orderer系统通道配置。通道为默认配置，添加一个OrdererOrg组织；联盟为默认的SampleConsortium联盟，添加了两个组织。
        <<: *ChannelDefaults
        Orderer:
            <<: *OrdererDefaults
            Organizations: # 属于Orderer通道的组织
                - *OrdererOrg
            Capabilities:
                <<: *OrdererCapabilities
        Consortiums:
            SampleConsortium: # 创建更多应用通道时的联盟
                Organizations:
                    - *Org1
                    - *Org2
    TwoOrgsChannel: # 应用通道配置。默认配置的应用通道。添加了两个组织。联盟为SampleConsortium
        Consortium: SampleConsortium # 联盟
        Application:
            <<: *ApplicationDefaults
            Organizations: # 初始加入应用通道的组织
                - *Org1
                - *Org2
            Capabilities:
                <<: *ApplicationCapabilities
```

然后运行

```
$ mkdir channel-artifacts
$ export FABRIC_CFG_PATH=$PWD
$ ./bin/configtxgen -profile TwoOrgsOrdererGenesis -outputBlock ./channel-artifacts/genesis.block
```

configtxgen工具用于创建四个配置工件：

* 排序节点genesis block
* 通道configuration transaction
* 和两个“anchor peer transactions” - 每个对等节点的组织一个。

排序节点区块是排序服务的创世区块，并且通道配置交易文件在通道创建时被广播到排序节点。 正如名称所暗示的那样，主播节点交易在此通道上指定每个组织的主播节点。

Configtxgen使用一个文件 - configtx.yaml - 包含示例网络的定义。有三个成员 - 一个排序节点的组织（OrdererOrg）和两个对等节点的组织（Org1和Org2），每个对等节点的组织管理和维护两个对等节点。该文件还指定了一个联盟 - SampleConsortium - 由这两个对等节点组织组成。请特别注意此文件顶部的“配置文件”部分。你会注意到我们有两个唯一的头部。一个用于排序节点创世区块 - TwoOrgsOrdererGenesis - ，一个用于我们的通道 - TwoOrgsChannel。

# 创建通道交易的配置

```sh
$ export CHANNEL_NAME=mychannel  && ./bin/configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME
```

```sh
$ ./bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
```

```sh
$ ./bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org2MSP
```

# 启动网络

启动网络之前，参照`./write-codker-compose-file.md`中的步骤，编写docker集群配置文件。

然后编写`.env`:

```
COMPOSE_PROJECT_NAME=net
IMAGE_TAG=latest
```

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
$ peer channel create -o orderer.atguigu.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/atguigu.com/orderers/orderer.atguigu.com/msp/tlscacerts/tlsca.atguigu.com-cert.pem
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

```sh
peer chaincode install -n mycc -v 1.0 -p github.com/chaincode/simpleasset/go/
```

```sh
peer chaincode instantiate -o orderer.atguigu.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/atguigu.com/orderers/orderer.atguigu.com/msp/tlscacerts/tlsca.atguigu.com-cert.pem -C $CHANNEL_NAME -n mycc -v 1.0 -c '{"Args":["a", "100"]}' -P "AND ('Org1MSP.peer','Org2MSP.peer')"
```

```sh
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.atguigu.com/users/Admin@org2.atguigu.com/msp CORE_PEER_ADDRESS=peer0.org2.atguigu.com:7051 CORE_PEER_LOCALMSPID="Org2MSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.atguigu.com/peers/peer0.org2.atguigu.com/tls/ca.crt peer chaincode install -n mycc -v 1.0 -p github.com/chaincode/simpleasset/go/
```

```sh
peer chaincode invoke -o orderer.atguigu.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/atguigu.com/orderers/orderer.atguigu.com/msp/tlscacerts/tlsca.atguigu.com-cert.pem -C $CHANNEL_NAME -n mycc --peerAddresses peer0.org1.atguigu.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/peers/peer0.org1.atguigu.com/tls/ca.crt --peerAddresses peer0.org2.atguigu.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.atguigu.com/peers/peer0.org2.atguigu.com/tls/ca.crt -c '{"Args":["get","a"]}'
```

```sh
peer chaincode invoke -o orderer.atguigu.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/atguigu.com/orderers/orderer.atguigu.com/msp/tlscacerts/tlsca.atguigu.com-cert.pem -C $CHANNEL_NAME -n mycc --peerAddresses peer0.org1.atguigu.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/peers/peer0.org1.atguigu.com/tls/ca.crt --peerAddresses peer0.org2.atguigu.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.atguigu.com/peers/peer0.org2.atguigu.com/tls/ca.crt -c '{"Args":["set","b", "300"]}'
```

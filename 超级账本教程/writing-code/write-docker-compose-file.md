1. 在项目文件夹中新建一个base文件夹。

```sh
$ mkdir base & cd base
```

然后新建一个文件

```sh
$ vim docker-compose-base.yaml
```

然后写入

```yaml
version: '2'

services:

  orderer.atguigu.com:
    container_name: orderer.atguigu.com
    image: hyperledger/fabric-orderer:$IMAGE_TAG
    environment:
      - ORDERER_GENERAL_LOGLEVEL=INFO
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_GENESISMETHOD=file
      - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
      # enabled TLS
      - ORDERER_GENERAL_TLS_ENABLED=true
      - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: orderer
    volumes:
    - ../channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block
    - ../crypto-config/ordererOrganizations/atguigu.com/orderers/orderer.atguigu.com/msp:/var/hyperledger/orderer/msp
    - ../crypto-config/ordererOrganizations/atguigu.com/orderers/orderer.atguigu.com/tls/:/var/hyperledger/orderer/tls
    - orderer.atguigu.com:/var/hyperledger/production/orderer
    ports:
      - 7050:7050

  peer0.org1.atguigu.com:
    container_name: peer0.org1.atguigu.com
    extends:
      file: peer-base.yaml
      service: peer-base
    environment:
      - CORE_PEER_ID=peer0.org1.atguigu.com
      - CORE_PEER_ADDRESS=peer0.org1.atguigu.com:7051
      - CORE_PEER_GOSSIP_BOOTSTRAP=peer1.org1.atguigu.com:7051
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.org1.atguigu.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
    volumes:
        - /var/run/:/host/var/run/
        - ../crypto-config/peerOrganizations/org1.atguigu.com/peers/peer0.org1.atguigu.com/msp:/etc/hyperledger/fabric/msp
        - ../crypto-config/peerOrganizations/org1.atguigu.com/peers/peer0.org1.atguigu.com/tls:/etc/hyperledger/fabric/tls
        - peer0.org1.atguigu.com:/var/hyperledger/production
    ports:
      - 7051:7051
      - 7053:7053

  peer1.org1.atguigu.com:
    container_name: peer1.org1.atguigu.com
    extends:
      file: peer-base.yaml
      service: peer-base
    environment:
      - CORE_PEER_ID=peer1.org1.atguigu.com
      - CORE_PEER_ADDRESS=peer1.org1.atguigu.com:7051
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer1.org1.atguigu.com:7051
      - CORE_PEER_GOSSIP_BOOTSTRAP=peer0.org1.atguigu.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
    volumes:
        - /var/run/:/host/var/run/
        - ../crypto-config/peerOrganizations/org1.atguigu.com/peers/peer1.org1.atguigu.com/msp:/etc/hyperledger/fabric/msp
        - ../crypto-config/peerOrganizations/org1.atguigu.com/peers/peer1.org1.atguigu.com/tls:/etc/hyperledger/fabric/tls
        - peer1.org1.atguigu.com:/var/hyperledger/production

    ports:
      - 8051:7051
      - 8053:7053

  peer0.org2.atguigu.com:
    container_name: peer0.org2.atguigu.com
    extends:
      file: peer-base.yaml
      service: peer-base
    environment:
      - CORE_PEER_ID=peer0.org2.atguigu.com
      - CORE_PEER_ADDRESS=peer0.org2.atguigu.com:7051
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.org2.atguigu.com:7051
      - CORE_PEER_GOSSIP_BOOTSTRAP=peer1.org2.atguigu.com:7051
      - CORE_PEER_LOCALMSPID=Org2MSP
    volumes:
        - /var/run/:/host/var/run/
        - ../crypto-config/peerOrganizations/org2.atguigu.com/peers/peer0.org2.atguigu.com/msp:/etc/hyperledger/fabric/msp
        - ../crypto-config/peerOrganizations/org2.atguigu.com/peers/peer0.org2.atguigu.com/tls:/etc/hyperledger/fabric/tls
        - peer0.org2.atguigu.com:/var/hyperledger/production
    ports:
      - 9051:7051
      - 9053:7053

  peer1.org2.atguigu.com:
    container_name: peer1.org2.atguigu.com
    extends:
      file: peer-base.yaml
      service: peer-base
    environment:
      - CORE_PEER_ID=peer1.org2.atguigu.com
      - CORE_PEER_ADDRESS=peer1.org2.atguigu.com:7051
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer1.org2.atguigu.com:7051
      - CORE_PEER_GOSSIP_BOOTSTRAP=peer0.org2.atguigu.com:7051
      - CORE_PEER_LOCALMSPID=Org2MSP
    volumes:
        - /var/run/:/host/var/run/
        - ../crypto-config/peerOrganizations/org2.atguigu.com/peers/peer1.org2.atguigu.com/msp:/etc/hyperledger/fabric/msp
        - ../crypto-config/peerOrganizations/org2.atguigu.com/peers/peer1.org2.atguigu.com/tls:/etc/hyperledger/fabric/tls
        - peer1.org2.atguigu.com:/var/hyperledger/production
    ports:
      - 10051:7051
      - 10053:7053
```

然后接着写

```yaml
version: '2'

services:
  peer-base:
    image: hyperledger/fabric-peer:$IMAGE_TAG
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      # the following setting starts chaincode containers on the same
      # bridge network as the peers
      # https://docs.docker.com/compose/networking/
      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=${COMPOSE_PROJECT_NAME}_byfn
      - CORE_LOGGING_LEVEL=INFO
      #- CORE_LOGGING_LEVEL=DEBUG
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_GOSSIP_USELEADERELECTION=true
      - CORE_PEER_GOSSIP_ORGLEADER=false
      - CORE_PEER_PROFILE_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: peer node start
```

然后在和base同级的目录下，创建一个新文件

```sh
$ vim docker-compose-cli.yaml
```

在里面写入

```yaml
version: '2'

volumes:
  orderer.atguigu.com:
  peer0.org1.atguigu.com:
  peer1.org1.atguigu.com:
  peer0.org2.atguigu.com:
  peer1.org2.atguigu.com:

networks:
  atguigu:

services:

  orderer.atguigu.com:
    extends:
      file:   base/docker-compose-base.yaml
      service: orderer.atguigu.com
    container_name: orderer.atguigu.com
    networks:
      - atguigu 

  peer0.org1.atguigu.com:
    container_name: peer0.org1.atguigu.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer0.org1.atguigu.com
    networks:
      - atguigu 

  peer1.org1.atguigu.com:
    container_name: peer1.org1.atguigu.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer1.org1.atguigu.com
    networks:
      - atguigu 

  peer0.org2.atguigu.com:
    container_name: peer0.org2.atguigu.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer0.org2.atguigu.com
    networks:
      - atguigu 

  peer1.org2.atguigu.com:
    container_name: peer1.org2.atguigu.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer1.org2.atguigu.com
    networks:
      - atguigu 

  cli:
    container_name: cli
    image: hyperledger/fabric-tools:$IMAGE_TAG
    tty: true
    stdin_open: true
    environment:
      - GOPATH=/opt/gopath
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      #- CORE_LOGGING_LEVEL=DEBUG
      - CORE_LOGGING_LEVEL=INFO
      - CORE_PEER_ID=cli
      - CORE_PEER_ADDRESS=peer0.org1.atguigu.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/peers/peer0.org1.atguigu.com/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/peers/peer0.org1.atguigu.com/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/peers/peer0.org1.atguigu.com/tls/ca.crt
      - CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/users/Admin@org1.atguigu.com/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: /bin/bash
    volumes:
        - /var/run/:/host/var/run/
        - ./chaincode/:/opt/gopath/src/github.com/chaincode
        - ./crypto-config:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/
        - ./scripts:/opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/
        - ./channel-artifacts:/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts
    depends_on:
      - orderer.atguigu.com
      - peer0.org1.atguigu.com
      - peer1.org1.atguigu.com
      - peer0.org2.atguigu.com
      - peer1.org2.atguigu.com
    networks:
      - atguigu
```

编写完毕！

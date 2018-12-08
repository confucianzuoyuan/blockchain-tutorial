编写一个简单的链码

路径：`fabric-projects/chaincode/simpleasset/go/`

```go
package main

import (
    "fmt"

    "github.com/hyperledger/fabric/core/chaincode/shim"
    "github.com/hyperledger/fabric/protos/peer"
)

// 初始化一个空结构体
type SimpleAsset struct {
}

// Init函数在chaincode初始化时被调用，也就是instantiation时被调用。
// 当chaincode升级后，需要重新调用初始化函数。
func (t *SimpleAsset) Init(stub shim.ChaincodeStubInterface) peer.Response {
    // 从提交的交易中获取参数
    args := stub.GetStringArgs()
    if len(args) != 2 {
            return shim.Error("Incorrect arguments. Expecting a key and a value")
    }

    // 在账本ledger上存储key/value值
    err := stub.PutState(args[0], []byte(args[1]))
    if err != nil {
            return shim.Error(fmt.Sprintf("Failed to create asset: %s", args[0]))
    }
    return shim.Success(nil)
}

// 交易时会调用Invode函数，这个Invode里面包含了最简单的get和set函数。
// 对KV进行get/set
func (t *SimpleAsset) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
    // 提取要调用的函数fn和参数
    fn, args := stub.GetFunctionAndParameters()

    var result string
    var err error
    if fn == "set" {
            result, err = set(stub, args)
    } else { // 默认调用get函数 
            result, err = get(stub, args)
    }
    if err != nil {
            return shim.Error(err.Error())
    }

    //返回payload
    return shim.Success([]byte(result))
}

// set一对k/v值，如果已经存在v，直接覆盖
func set(stub shim.ChaincodeStubInterface, args []string) (string, error) {
    if len(args) != 2 {
            return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
    }

    err := stub.PutState(args[0], []byte(args[1]))
    if err != nil {
            return "", fmt.Errorf("Failed to set asset: %s", args[0])
    }
    return args[1], nil
}

// get一个key的值
func get(stub shim.ChaincodeStubInterface, args []string) (string, error) {
    if len(args) != 1 {
            return "", fmt.Errorf("Incorrect arguments. Expecting a key")
    }

    value, err := stub.GetState(args[0])
    if err != nil {
            return "", fmt.Errorf("Failed to get asset: %s with error: %s", args[0], err)
    }
    if value == nil {
            return "", fmt.Errorf("Asset not found: %s", args[0])
    }
    return string(value), nil
}

// main函数
func main() {
    if err := shim.Start(new(SimpleAsset)); err != nil {
            fmt.Printf("Error starting SimpleAsset chaincode: %s", err)
    }
}
```

部署链码

下载所需包

```sh
$ go get -u github.com/hyperledger/fabric/core/chaincode/shim
```

```sh
$ docker exec -it cli bash
```

```sh
$ export CHANNEL_NAME=atguiguchannel
```

# 安装链码为1.0版本

应用程序通过chaincode与区块链帐本交互。因此，我们需要在每个将执行和背书我们交易的对等节点上安装链代码，然后在通道上实例化链代码。

首先，将链代码安装到四个对等节点之一上。这些命令将指定的源代码放在我们的对等节点文件系统上。

每个链代码名称和版本只能安装一个版本的源代码。源代码存在于对等节点基于链代码名称和版本的文件系统中;它与语言无关。类似地，实例化的链代码容器将反映对等节点上安装的任何语言。

注意这里要先把链代码写好。

```sh
$ peer chaincode install -n simpleasset -v 1.0 -p github.com/chaincode/simpleasset/go/
```

在Org2组织也安装链代码

```sh
$ CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.atguigu.com/users/Admin@org2.atguigu.com/msp CORE_PEER_ADDRESS=peer0.org2.atguigu.com:7051 CORE_PEER_LOCALMSPID="Org2MSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.atguigu.com/peers/peer0.org2.atguigu.com/tls/ca.crt peer chaincode install -n simpleasset -v 1.0 -p github.com/chaincode/simpleasset/go/
```

# 初始化链码，a=100

接下来，在通道上实例化链码。这将初始化通道上的链代码，设置链代码的背书策略，并为目标对等节点启动链代码容器。记下-P参数。这是我们的策略，我们在此策略中指定针对要验证的链代码交易所需的请求级别。

在下面的命令中，你会注意到我们将策略指定为-P "AND ('Org1MSP.peer','Org2MSP.peer')"。这意味着我们需要来自属于Org1和Org2的对等节点的“背书”（即两个背书）。如果我们将语法更改为OR，那么我们只需要一个背书。

```sh
$ peer chaincode instantiate -o orderer.atguigu.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/atguigu.com/orderers/orderer.atguigu.com/msp/tlscacerts/tlsca.atguigu.com-cert.pem -C $CHANNEL_NAME -n simpleasset -v 1.0 -c '{"Args":["a", "100"]}' -P "AND ('Org1MSP.peer','Org2MSP.peer')"
```


调用

```sh
$ peer chaincode invoke -o orderer.atguigu.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/atguigu.com/orderers/orderer.atguigu.com/msp/tlscacerts/tlsca.atguigu.com-cert.pem -C $CHANNEL_NAME -n simpleasset --peerAddresses peer0.org1.atguigu.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/peers/peer0.org1.atguigu.com/tls/ca.crt --peerAddresses peer0.org2.atguigu.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.atguigu.com/peers/peer0.org2.atguigu.com/tls/ca.crt -c '{"Args":["get","a"]}'
```

调用

```sh
$ peer chaincode invoke -o orderer.atguigu.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/atguigu.com/orderers/orderer.atguigu.com/msp/tlscacerts/tlsca.atguigu.com-cert.pem -C $CHANNEL_NAME -n simpleasset --peerAddresses peer0.org1.atguigu.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/peers/peer0.org1.atguigu.com/tls/ca.crt --peerAddresses peer0.org2.atguigu.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.atguigu.com/peers/peer0.org2.atguigu.com/tls/ca.crt -c '{"Args":["set","b", "300"]}'
```

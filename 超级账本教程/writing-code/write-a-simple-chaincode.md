编写一个简单的链码

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
$ peer chaincode install -n simpleasset -v 1.0 -p github.com/chaincode/simpleasset/go/
```

```sh
$ peer chaincode instantiate -o orderer.atguigu.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/atguigu.com/orderers/orderer.atguigu.com/msp/tlscacerts/tlsca.atguigu.com-cert.pem -C $CHANNEL_NAME -n simpleasset -v 1.0 -c '{"Args":["init","a", "100"]}' -P "AND ('Org1MSP.peer','Org2MSP.peer')"
```

```sh
$ peer chaincode get -C $CHANNEL_NAME -n simpleasset -c '{"Args":["get", "a"]}'
```

```sh
$ peer chaincode set -C $CHANNEL_NAME -n simpleasset -c '{"Args":["set", "a", "200"]}'
```

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type AtguiguCarContract struct {
}

// Make: 制造商
// Model: 车型
// Colour: 颜色
// Owner: 所有人
type Car struct {
	Make   string `json:"make"`
	Model  string `json:"model"`
	Colour string `json:"colour"`
	Owner  string `json:"owner"`
}

// 链代码初始化
func (s *AtguiguCarContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

// 指定要运行的函数
func (s *AtguiguCarContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

    // 获取参数：需要调用的函数名和以及传进函数的参数
	function, args := APIstub.GetFunctionAndParameters()
    // 通过判断函数名来调用函数
	if function == "queryCar" {
		return s.queryCar(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "createCar" {
		return s.createCar(APIstub, args)
	} else if function == "queryAllCars" {
		return s.queryAllCars(APIstub)
	} else if function == "changeCarOwner" {
		return s.changeCarOwner(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

// 查询车辆信息
func (s *AtguiguCarContract) queryCar(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	carAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(carAsBytes)
}

// 初始化账本，将一些数据写入
func (s *AtguiguCarContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	cars := []Car{
		Car{Make: "丰田", Model: "普莱斯", Colour: "蓝色", Owner: "佟老师"},
		Car{Make: "福特", Model: "野马", Colour: "红色", Owner: "宋老师"},
		Car{Make: "现代", Model: "途胜", Colour: "绿色", Owner: "沈老师"},
		Car{Make: "大众", Model: "帕萨特", Colour: "黄色", Owner: "韩老师"},
		Car{Make: "特斯拉", Model: "S", Colour: "黑色", Owner: "武老师"},
		Car{Make: "劳斯莱斯", Model: "幻影", Colour: "紫色", Owner: "左老师"},
	}

	i := 0
	for i < len(cars) {
		fmt.Println("i is ", i)
		carAsBytes, _ := json.Marshal(cars[i])
		APIstub.PutState("CAR"+strconv.Itoa(i), carAsBytes)
		fmt.Println("Added", cars[i])
		i = i + 1
	}

	return shim.Success(nil)
}

// 创建一辆车辆
func (s *AtguiguCarContract) createCar(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	var car = Car{Make: args[1], Model: args[2], Colour: args[3], Owner: args[4]}

	carAsBytes, _ := json.Marshal(car)
	APIstub.PutState(args[0], carAsBytes)

	return shim.Success(nil)
}

// 查询所有的车辆信息
func (s *AtguiguCarContract) queryAllCars(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "CAR0"
	endKey := "CAR999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- 查询所有车辆信息:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

// 改变车辆的所有人
func (s *AtguiguCarContract) changeCarOwner(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	carAsBytes, _ := APIstub.GetState(args[0])
	car := Car{}

	json.Unmarshal(carAsBytes, &car)
	car.Owner = args[1]

	carAsBytes, _ = json.Marshal(car)
	APIstub.PutState(args[0], carAsBytes)

	return shim.Success(nil)
}

// main函数和单元测试相关
func main() {
	err := shim.Start(new(AtguiguCarContract))
	if err != nil {
		fmt.Printf("Error creating new Atguigu Car Contract: %s", err)
	}
}

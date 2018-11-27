package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type Group int

const (
    Admin Group = iota
    Borrower
)

type BookManager struct {
}

type BookList struct {
	BookList []string `json:"booklist"`
}

type Book struct {
	Name   string `json:"name"`
	Author string `json:"author"`
	Price  int `json:"price"`
	Borrower string `json:"borrower"`
	BorrowHistory []string `json:"borrowhistory"`
}

type User struct {
	Name string `json:"name"`
	Group Group `json:"group"`
	Books map[string]int `json:"books"`
}

func (s *BookManager) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *BookManager) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()
	if function == "queryBook" {
		return s.queryBook(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "createBook" {
		return s.createBook(APIstub, args)
	} else if function == "queryAllBooks" {
		return s.queryAllBooks(APIstub)
	} else if function == "borrowBook" {
		return s.borrowBook(APIstub, args)
	} else if function == "userRegister" {
		return s.userRegister(APIstub, args)
	} else if function == "returnBook" {
		return s.returnBook(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

// 还书接收参数：借书人姓名，书名
func (s *BookManager) returnBook(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	userKey := args[0]
	userAsBytes, err := APIstub.GetState(userKey)
	if err != nil {
		return shim.Error("user not found.")
	}

	var userInfo User
	err = json.Unmarshal(userAsBytes, &userInfo)
	if err != nil {
		return shim.Error("UserInfo Json Unmarshal Error.")
	}

	bookAsBytes, err := APIstub.GetState(args[1])
	if err != nil {
		return shim.Error("book not found.")
	}

	var bookInfo Book
	err = json.Unmarshal(bookAsBytes, &bookInfo)
	if err != nil {
		return shim.Error("Json Unmarshal Error!")
	}

	if value, ok := userInfo.Books[bookInfo.Name]; ok {
		fmt.Println("value: ", value)
		delete(userInfo.Books, bookInfo.Name)
	} else {
		fmt.Println("key not found")
		return shim.Error("User did not borrow the book.")
	}

	bookInfo.Borrower = ""

	return shim.Success(nil)

}


// 接收两个参数：借书人的姓名，书的名字
func (s *BookManager) borrowBook(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	userKey := args[0]
	userAsBytes, err := APIstub.GetState(userKey)
	if err != nil {
		return shim.Error("user not found.")
	}

	var userInfo User
	err = json.Unmarshal(userAsBytes, &userInfo)
	if err != nil {
		return shim.Error("Json Unmarshal Error.")
	}

	bookAsBytes, err := APIstub.GetState(args[1])
	if err != nil {
		return shim.Error("book not found.")
	}

	var bookInfo Book
	err = json.Unmarshal(bookAsBytes, &bookInfo)
	if err != nil {
		return shim.Error("Json Unmarshal Error!")
	}

	if bookInfo.Borrower == "" {
		bookInfo.Borrower = userInfo.Name
	} else {
		return shim.Error("book borrowed out.")
	}

	bookInfo.BorrowHistory = append(bookInfo.BorrowHistory, args[0])
	bookInfo.Borrower = args[0]

	bookAsBytes, _ = json.Marshal(bookInfo)
	APIstub.PutState(bookInfo.Name, bookAsBytes)



	userInfo.Books[bookInfo.Name] = 1
	userAsBytes, _ = json.Marshal(userInfo)
	APIstub.PutState(userKey, userAsBytes)

	return shim.Success(nil)
}

// 接收参数：姓名，角色
func (s *BookManager) userRegister(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	name := args[0]
	group := args[1]

	user := User{}

	if string(group) == "ADMIN" {
		user = User{Name: string(name), Group: Admin, Books: nil}
	} else if string(group) == "BORROWER" {
		user = User{Name: string(name), Group: Borrower, Books: nil}
	}

	userAsBytes, _ := json.Marshal(user)

	key := string(name)

	APIstub.PutState(key, userAsBytes)

	return shim.Success(nil)
}

// 接收参数：书名
func (s *BookManager) queryBook(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	bookAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(bookAsBytes)
}

func (s *BookManager) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	books := []Book{
		Book{Name: "Compilers", Author: "Alfred V. Aho", Price: 100, Borrower: "", BorrowHistory: []string{}},
		Book{Name: "Introduction to Algorithms", Author: "Charles E. Leiserson", Price: 100, Borrower:"", BorrowHistory: []string{}},
		Book{Name: "Pattern Recognition and Machine Learning", Author: "Christopher M. Bishop", Price: 100, Borrower:"", BorrowHistory: []string{}},
		Book{Name: "Data Structures And Algorithm Analysis In C", Author: "Mark Allen Weiss", Price: 50, Borrower:"", BorrowHistory: []string{}},
		Book{Name: "Modern Operating Systems", Author: "Andrew S. Tanenbaum", Price: 70, Borrower:"", BorrowHistory: []string{}},
		Book{Name: "Computer Networks", Author: "Andrew S. Tanenbaum", Price: 80, Borrower:"", BorrowHistory: []string{}},
		Book{Name: "Database Design for Mere Mortals", Author: "Michael J. Hernandez", Price: 45, Borrower:"", BorrowHistory: []string{}},
		Book{Name: "Computer Systems: A Programmer's Perspective", Author: "David and Bryant and Randal O'Hallaron", Price: 34, Borrower:"", BorrowHistory: []string{}},
	}

	i := 0
	for i < len(books) {
		fmt.Println("i is ", i)
		bookAsBytes, _ := json.Marshal(books[i])
		APIstub.PutState(books[i].Name, bookAsBytes)
		fmt.Println("Added", books[i])
		i = i + 1
	}

	booklist := BookList{}
	for i < len(books) {
		booklist.BookList = append(booklist.BookList, books[i].Name)
	}
	booklistAsBytes, _ := json.Marshal(booklist)
	APIstub.PutState("BookList", booklistAsBytes)

	return shim.Success(nil)
}

// 创建新书：角色，书名，作者，价格
func (s *BookManager) createBook(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	if args[0] == "Borrower" {
		return shim.Error("Borrower cannot create books.")
	}

	price, err := strconv.Atoi(args[3])
	if err != nil {
		return shim.Error("Price must be number.")
	}
	var book = Book{Name: args[1], Author: args[2], Price: price, Borrower: "", BorrowHistory: []string{}}

	bookAsBytes, _ := json.Marshal(book)
	APIstub.PutState(args[1], bookAsBytes)

	booklistAsBytes, _ := APIstub.GetState("booklist")

	var booklist []string
	err = json.Unmarshal(booklistAsBytes, &booklist)
	if err != nil {
		return shim.Error("Json Unmarshal Error!")
	}

	booklist = append(booklist, args[1])
	booklistAsBytes, _ = json.Marshal(booklist)
	APIstub.PutState("booklist", booklistAsBytes)

	return shim.Success(nil)
}

func (s *BookManager) queryAllBooks(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "BOOK0"
	endKey := "BOOK999"

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
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllBooks:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func main() {
	err := shim.Start(new(BookManager))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}

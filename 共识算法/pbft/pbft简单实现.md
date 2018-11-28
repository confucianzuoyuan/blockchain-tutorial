## PBFT（拜占庭容错）

基于拜占庭将军问题，一致性的确保主要分为这三个阶段：预准备（pre-prepare）、准备(prepare)和确认(commit)。流程如下图所示：

![pbft示意图](./pbft.png)

其中C为发送请求端，0123为服务端，3为宕机的服务端，具体步骤如下：

1. Request：请求端C发送请求到任意一节点，这里是0
2. Pre-Prepare：服务端0收到C的请求后进行广播，扩散至123
3. Prepare：123,收到后记录并再次广播，1->023，2->013，3因为宕机无法广播
4. Commit：0123节点在Prepare阶段，若收到超过一定数量的相同请求，则进入Commit阶段，广播Commit请求
5. Reply：0123节点在Commit阶段，若收到超过一定数量的相同请求，则对C进行反馈

## 代码实现

```go
package main
import (
	"os"
	"fmt"
	"net/http"
	"io"
)
//声明节点信息,代表各个小国家
type nodeInfo struct {
	//标示
	id string
	//准备访问的方法
	path string
	//服务器做出的相应
	writer http.ResponseWriter
}
//存放四个国家的地址
var nodeTable = make(map[string]string)
//拜占庭在Fabric中的使用
func main() {
	//获取执行的参数
	userId :=os.Args[1]//获取执行的第一个参数
	fmt.Println(userId)
	//./main Apple
	//创建四个国家的地址
	nodeTable = map[string]string {
		"Apple":"localhost:1111",
		"MS":"localhost:1112",
		"Google":"localhost:1113",
		"IBM":"localhost:1114",
	}
	node:=nodeInfo{userId,nodeTable[userId],nil}
	fmt.Println(node)
	//http协议的回调函数
	//http://localhost:1111/req?warTime=8888
	http.HandleFunc("/req",node.request)
	http.HandleFunc("/prePrepare",node.prePrepare)
	http.HandleFunc("/prepare",node.prepare)
	http.HandleFunc("/commit",node.commit)
	//启动服务器
	if err:=http.ListenAndServe(node.path,nil);err!=nil {
		fmt.Print(err)
	}
}
//此函数是http访问时候req命令的请求回调函数
func (node *nodeInfo)request(writer http.ResponseWriter,request *http.Request){
	//设置允许解析参数
	request.ParseForm()
	//如果有参数值，则继续处理
	if (len(request.Form["warTime"])>0){
		node.writer = writer
		//激活主节点后，广播给其他节点,通过Ａpple向其他节点做广播
		node.broadcast(request.Form["warTime"][0],"/prePrepare")
	}
}
//由主节点向其他节点做广播
func (node *nodeInfo)broadcast(msg string ,path string ){
	//遍历所有的国家
	for nodeId,url:=range nodeTable {
		if nodeId == node.id {
			continue
		}
		//调用Get请求
		//http.Get("http://localhost:1112/prePrepare?warTime=8888&nodeId=Apple")
		http.Get("http://"+url+path+"?warTime="+msg+"&nodeId="+node.id)
	}
}
func (node *nodeInfo)prePrepare(writer http.ResponseWriter,request *http.Request) {
	request.ParseForm()
	//fmt.Println("hello world")
	//在做分发
	if(len(request.Form["warTime"])>0){
		//分发给其他三个人
		node.broadcast(request.Form["warTime"][0],"/prepare")
	}
}
func (node *nodeInfo)prepare(writer http.ResponseWriter,request *http.Request){
	request.ParseForm()
	//调用验证
	if len(request.Form["warTime"])>0{
		fmt.Println(request.Form["warTime"][0])
	}
	if len(request.Form["nodeId"])>0 {
		fmt.Println(request.Form["nodeId"][0])
	}
	node.authentication(request)
}
var authenticationsuccess = true
var authenticationMap = make(map[string]string)
//获得除了本节点外的其他节点数据
func (node *nodeInfo)authentication(request *http.Request) {
	//接收参数
	request.ParseForm()
	if authenticationsuccess!=false  {
		if len(request.Form["nodeId"])>0 {
			authenticationMap[request.Form["nodeId"][0]]="ok"
		}
	}
	if len(authenticationMap)>len(nodeTable)/3 {
		//则拜占庭原理实现,通过commit反馈给浏览器
		node.broadcast(request.Form["warTime"][0],"/commit")
	}
}
func (node *nodeInfo)commit(writer http.ResponseWriter,request *http.Request){
	//给浏览器反馈相应
	io.WriteString(node.writer,"ok")
}
```

如何运行：开启4个终端，eg：go run main.go Apple …
然后在浏览器输入：http://localhost:1112/req?warTime=1234

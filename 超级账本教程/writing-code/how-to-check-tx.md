# 如何看交易

```sh
$ docker logs -f cli
```

# 如何看链代码日志

检查各个链代码容器，以查看针对每个容器执行的单独交易。以下是每个容器的组合输出：

```sh
$ docker logs dev-peer0.org2.atguigu.com-simplechaincode-1.0
04:30:45.947 [BCCSP_FACTORY] DEBU : Initialize BCCSP [SW]
ex02 Init
Aval = 100, Bval = 200

$ docker logs dev-peer0.org1.atguigu.com-simplechaincode-1.0
04:31:10.569 [BCCSP_FACTORY] DEBU : Initialize BCCSP [SW]
ex02 Invoke
Query Response:{"Name":"a","Amount":"100"}
ex02 Invoke
Aval = 90, Bval = 210

$ docker logs dev-peer1.org2.atguigu.com-simplechaincode-1.0
04:31:30.420 [BCCSP_FACTORY] DEBU : Initialize BCCSP [SW]
ex02 Invoke
Query Response:{"Name":"a","Amount":"90"}
```

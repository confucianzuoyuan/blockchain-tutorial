```sh
$ sudo add-apt-repository ppa:longsleep/golang-backports
$ sudo apt-get update
$ sudo apt-get install golang-go
```

这样安装会把go安装在目录`/usr/lib/go-1.11/bin`。

配置环境变量

```sh
$ export PATH=$PATH:$GOROOT/bin:$GOPATH/bin
```

如果需要快捷方式，可以进行软链接。

问题解决：

如果`add-opt-repository`没有安装，使用以下命令

```sh
$ apt-get install software-properties-common
```

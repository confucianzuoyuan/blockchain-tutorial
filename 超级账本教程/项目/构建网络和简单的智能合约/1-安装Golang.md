```sh
$ sudo add-apt-repository ppa:longsleep/golang-backports
$ sudo apt-get update
$ sudo apt-get install golang-go
```

这样安装会把go安装在目录`/usr/lib/go-1.11/bin`。

配置环境变量

将下列exports到你的~/.bashrc。GOROOT环境变量指定了你的golang二进制文件的路径，GOPATH指定了你工程的工作空间的路径。

```
export GOROOT=/usr/lib/go-1.11
export GOPATH=$HOME/go
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin
```

然后

```
$ source ~/.bashrc
```

问题解决：

如果`add-opt-repository`没有安装，使用以下命令

```sh
$ apt-get install software-properties-common
```

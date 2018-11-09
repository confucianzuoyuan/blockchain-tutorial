1. 安装docker.

```sh
$ docker --version
$ docker-compose --version
```

通过以上两个命令检查docker安装情况。

2. 安装go语言.

3. 安装docker镜像以及fabric-samples.

```sh
$ curl -sSL http://bit.ly/2ysbOFE | bash -s 1.3.0
```

如果没有curl工具，先安装curl。

如果上面的命令无法执行，说明网速不行。可以把脚本下载下来在本地运行。见`./code/bootstrap.sh`。

```sh
sh bootstrap.sh
```

或者

```sh
bash bootstrap.sh
```

如果想手动下载下面列出的可执行文件，则可以使用以下命令

```sh
bash bootstrap.sh -b
```

手动下载可执行文件的地址为(*针对ubuntu*)：

```
https://nexus.hyperledger.org/content/repositories/releases/org/hyperledger/fabric/hyperledger-fabric/linux-amd64-1.3.0/
```
和
```
https://nexus.hyperledger.org/content/repositories/releases/org/hyperledger/fabric-ca/hyperledger-fabric-ca/linux-amd64-1.3.0/
```

推荐手动下载。解压后拷贝到fabric-samples的bin文件夹中。

这个脚本除了安装docker镜像，还会clone下来fabric-samples文件夹，并将以下可执行程序下载到bin文件中。
* configtxgen
* configtxlator
* cryptogen
* discover
* idemixgen
* orderer
* peer
* fabric-ca-client

设置环境变量，也可以不设置。

```sh
$ export PATH=<path to download location>/bin:$PATH
```

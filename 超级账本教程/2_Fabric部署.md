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

如果上面的命令无法执行，说明网速不行。可以把脚本下载下来在本地运行。见`./bootstrap.sh`。

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

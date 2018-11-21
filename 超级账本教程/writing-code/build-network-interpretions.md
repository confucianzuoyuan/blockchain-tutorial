执行链代码的解释，将以simplechaincode为例子

* createChannel的输出是一个创世区块 - <your_channel_name> .block - 它存储在对等节点的文件系统中，并包含从channel.tx指定的通道配置。
* 对所有四个对等节点执行joinChannel命令，该命令将先前生成的创世区块作为输入。此命令指示对等节点加入<your_channel_name>并创建以<your_channel_name>.block开头的链。
* 现在我们有一个由四个对等节点和两个组织组成的通道。这是我们的TwoOrgsChannel配置。
* peer0.org1.atguigu.com和peer1.org1.atguigu.com属于Org1; peer0.org2.atguigu.com和peer1.org2.atguigu.com属于Org2
* 这些关系是通过crypto-config.yaml定义的，MSP路径是在我们的docker compose中指定的。
* 然后更新Org1MSP（peer0.org1.atguigu.com）和Org2MSP（peer0.org2.atguigu.com）的主播节点。我们通过将Org1MSPanchors.tx和Org2MSPanchors.tx工件以及我们的通道名称传递给排序服务来实现这一目的。
* 链代码 - simplechaincode - 安装在peer0.org1.atguigu.com和peer0.org2.atguigu.com上
* 然后在peer0.org2.atguigu.com上“实例化”链代码。实例化将链代码添加到通道，启动目标对等节点的容器，并初始化与链代码关联的键值对。该示例的初始值是[“a”，“100”, “b”，“200”]。这个“实例化”会产生一个名为dev-peer0.org2.atguigu.com-simplechaincode-1.0的容器。
* 实例化也传递了背书策略的论据。该策略定义为-P "AND ('Org1MSP.peer','Org2MSP.peer')"，表示任何交易必须由与Org1和Org2绑定的对等节点背书。
* 向peer0.org1.atguigu.com发出针对“a”值的查询。链代码以前安装在peer0.org1.atguigu.com上，因此这将为Org1 peer0启动一个名为dev-peer0.org1.atguigu.com-simplechaincode-1.0的容器。还将返回查询结果。没有发生写入操作，因此对“a”的查询仍将返回值“100”。
* 调用被发送到peer0.org1.atguigu.com以将“10”从“a”移动到“b”
* 然后将链代码安装在peer1.org2.atguigu.com上
* 查询被发送到peer1.org2.atguigu.com以获取“a”的值。这将启动名为dev-peer1.org2.atguigu.com-mycc-1.0的第三个链代码容器。返回值90，正确反映上一个事务，在此期间，键“a”的值被修改为10。

链代码必须安装在对等节点上才能成功对帐本执行读/写操作。此外，对等节点不启动链代码容器，直到针对该链代码执行“init”或传统的交易 - 读/写 - （例如，查询“a”的值）。 该交易导致容器启动。此外，通道中的所有对等节点都保持帐本的精确副本，其包括用于以区块的形式存储不可变的有序记录的区块链，以及用于维护当前状态快照的状态数据库。这包括那些没有安装链代码的对等节点（如上例中的peer1.org1.atguigu.com）。 最后，链代码在安装后可以访问（如上例中的peer1.org2.atguigu.com）因为它已经被实例化了。

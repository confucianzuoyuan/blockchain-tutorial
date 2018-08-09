# 1，引言

## 1.1 欢迎

### 以太坊和 IPFS 上的去中心化 eBay

欢迎来到课程去中心化的 eBay。这是一个中级课程，你将会构建一个类似 eBay 的商场，卖家可以在这里拍卖售出他们的产品，买家也可以出价购买。

所有的商业逻辑和数据将会放在以太坊区块链上，这使得它是一个完全去中心化的应用。在以太坊上存储图片和大文本十分昂贵（由于 EVM 的限制，有时甚至是不可能）。为了解决这个问题，我们将会把图片和大文本存储在 IPFS(Inter Planetary File System)。在本课程中，我们将会学习更多有关 IPFS 的知识，并把它集成到应用中。

## 1.2 为什么要去中心化？

在开始构建我们的应用之前，非常值得花一分钟时间理解为什么要在像以太坊这样的去中心化平台上搭建一个商场。

eBay 已经获得了巨大成功，因为它使得买卖都相当便利。在互联网成为主流之前，人们只能在小范围内，或向邻居买卖商品。当越来越多的人使用互联网，出现了像 eBay 这样的公司，无论来自世界的任何一个地方，你都可以在网上买卖商品。无论是商家还是消费者，eBay 都是极好的。

尽管 eBay 方便了大家，也改善了贸易和经济，它也有一些缺点。

  - 1，参与的商家受制于公司。在任何时候，公司可以自行决定在它们的平台上对商家进行封号，而如果商家恰好依存于此，那么就是一个巨大的打击。

  - 2，商家陈列商品要交费，卖出商品也要交佣金。收费本身并没有错，毕竟 eBay 提供了服务。但是，陈列费有时太高了，这导致商家最后盈利很少，或是将成本转嫁到消费者身上。

  - 3，商家/消费者无法拥有自身数据。评论，购买历史等等所有数据都为公司所有。比如，如果一个商家想要换一个提供商，想要导出它原来的评论或是其他数据都非常不容易，或者几乎不可能。

在以太坊上构建商场就解决了这些问题。商家的账户不会被封，数据是公开的，所以很容易导出数据，相对于中心化公司，交易费也会低得多。

## 1.3 项目细节

现在你已经知道为什么以及我们要构建的应用是什么，让我们大致来看一下在这个项目中将要实现的所有功能：

  - 1，列出商品。商场应该能够让商家陈列商品。我们会实现让任何人免费陈列商品的功能。为了便于查询，我们会将数据同时存在链上和链下的数据库。

  - 2，将文件放到 IFPS： 我们会实现一个将图片和产品介绍（大文本）上传到 IPFS 的功能。

  - 3，浏览产品：我们会实现基于目录，拍卖时间等过滤和浏览商品的功能。

  - 4，拍卖：跟 eBay 一样，我们会实现 Vickery 拍卖对商品出价。与中心化应用不同，以太坊上的一切都是公开的，我们的实现将会有些不同。我们的实现将会类似于 ENS 的工作方式。

  - 5，托管合约（Escrow Contract）：一旦出价结束，商品有了赢家以后，我们会创建在买方，卖方和一个任意第三方的托管合约。

  - 6，2/3 签名：我们会加入防欺诈保护，方式为实现 2/3 多重签名，即三个参与者有两个同意才会将资金释放给卖方，或是将资金返还给买方。

## 1.4 先修课程

为了成功地完成课程，你应该对以下语言/技术有几本理解：

  - 1，Solidity：合约将会使用 solidity 编程语言。第一节课没有覆盖的内容(以太坊上的投票)都会这里深入合约时进行解释。如果你还没有完成第一节课，你必须至少写过一两个简单的 solidity 合约。对 truffle 有基本的了解将会十分有帮助。

  - 2，HTML/CSS: 相比投票课程，本课程将会有更多的 HTML 和 CSS 代码。你应该对使用 HTML/CSS 构建前端有基本的了解。

  - 3，Javascript: 我们将会进一步使用 JavaScript。它会在服务端将数据保存到数据库，查询数据库并将结果返回给前端。web3.js 用于前端与区块链交互。为了适用各种背景的学生，我们已经保持 JavaScript 代码尽可能地简单。

  - 4，Database: 在这节课，我们会用 MongoDB 在链下保存产品信息。无须特定了解 MongoDB ，但是基本的数据库知识还是必要的。

# 2，实现计划 

## 2.1 应用架构

在开始实现代码之前，先来看一下在本课程我们将要构建的 Dapp 的架构。

  - 1，Web 前端：web 前端由 HTML，CSS 和 JavaScript 组合而成（大量使用了 web3js）。用户将会通过这个前端应用于区块链，IPFS 和 NodeJS 服务器交互。

  - 2，区块链：这是应用的核心，所有的代码和交易都在链上。商店里的所有商品，用户的出价和托管合约都在链上。

  - 3，MongoDB：尽管产品存储在区块链上，但是通过查询区块链来显示产品，应用各种过滤（比如只显示某一类的产品，显示即将过期的产品等等）。我们会用 MongoDB 数据库来存储商品信息，并通过查询 MongoDB 来显示产品。

  - 4，NodeJS 服务器：这是后端服务器，前端通过它与区块链通信。我们会给前端暴露一些简单的 API 从数据库中查询和检索产品。

  - 5，IPFS: 当一个用户在商店里上架一个商品，前端会将产品文件和介绍上传到 IPFS，并将所上传文件的哈希存到链上。 
  
  架构图：
  
  ![架构图](./images/ebay-dapp-architecture.png)

## 2.2 应用流程图

为了理解我们在上一节谈到的那些组件，让我们来看看一下用户上架一个商品的流程是怎样的。

- 1，当用户输入产品细节（名字，起价，图片，描述信息等等）并点击保存后，web 前端将会包含一个 HTML 表格。(1)

- 2，web 前端将产品图片和介绍上传到 IPFS，并返回这些所上传内容的链接。你可以在 这里 查看 IPFS 的链接示例。(2) 和 (3)

- 3，web 前端然后会调用合约将产品信息和 IPFS 链接存储到链上。当合约成功地将产品加入到区块链，就会触发一个事件。事件包含了所有的产品信息。(4)和(5)

- 4，NodeJS 服务器用来监听这些事件，当事件被合约触发时，服务器读取时间内容并将产品信息插入到 MongoDB。(6), (7) 和 (8)

流程图：

![流程图](./images/ebay-list-item.png)

## 2.3 实现步骤

1，我们首先会用 solidity 和 truffle 框架实现合约，将合约部署到 ganache 并通过 truffle 控制台与合约进行交互。

2，然后我们会学习 IPFS，安装并通过命令行与它交互。

3，后端实现完成后，我们会构建前端与合约和 IPFS 进行交互。我们也会在前端实现出价和显示拍卖的功能。

4，我们会安装 MongoDB 并设计存储产品的数据结构。

5，一旦数据库启动运行，我们会实现 NodeJS 服务端代码，以监听合约事件，并记录向控制台的请求。我们然后会实现向数据库中插入产品的代码。

6，我们将会更新前端从数据库而不是从区块链查询产品。

7，我们会实现托管合约以及对应的前端，参与者可以从来向买方/买房释放或撤回资金。

# 3，以太坊合约

## 3.1，Truffle项目

要做的第一件事就是启动 truffle 项目。按照右侧指示创建 truffle 项目。

在接下来的几节，我们将会实现合约。下面是将要在合约中实现的几个用户场景：

1，用户应该能够将产品添加到区块链。我们首先会定义想要一个在链上存储的所有产品细节的结构。

2，实现将产品加入区块链的函数。

3，实现出价（bid）的功能，任何都可以对商品提交一个不公开的竞价。

4，实现证明出价金额的公开函数（reveal function）

```sh
$ mkdir ebay_dapp
$ cd ebay_dapp
$ truffle unbox webpack
$ rm contracts/ConvertLib.sol contracts/MetaCoin.sol
```

## 3.2，电子商务产品

>在 contracts 目录下创建一个新的文件，将右侧内容添加到里面。下面是合约细节。

### 存储产品和元数据的数据结构

1，struct Product: 当用户想要在商店列出一个商品时，他们必须要输入关于产品的所有细节。我们将所有的产品信息存储在一个 struct 里面。struct 里面的大部分元素都应当清晰明了。你应该能够注意到有两个元素 imageLink 和 descLink。除了在链上存储产品图片和大的描述文本，我们还会存储 IPFS 链接（下节会有更多介绍），当我们要渲染网页时，会从这些链接中获取这些细节。

2，enum: 很多编程语言都有枚举（enum）的概念。它是一个用户定义类型，可以被转换为整型。在我们的案例中，我们会将产品的条件和状态存储为枚举类型。所以，Open 的 ProductStatus 在链上存储为 0，已售出则为 1，如此类推。它也可以使得代码更加易读（相比于将 ProductStatus 声明为 0，1，2）

3，productIndex: 我们会给加入到商店的每个商品赋予一个 id。这就是一个计数器，每当一个商品加入到商店则加 1 。

4，productIdInStore: 这是一个 mapping，用于跟踪哪些商品在哪个商店。

5，stores mapping: 任何人都可以免费列出商店里的产品。我们通过 mapping 跟踪谁插入了商品。键位商家的账户地址，值为 productIndex 到 Product 结果的 mapping。

比如，现在商店还没有任何商品。账户地址为(0x64fcba11d3dce1e3f781e22ec2b61001d2c652e5) 的用户向店里添加了一个 iPhone，他想要卖掉这个 iPhone。我们的 stores mapping 现在就会是：0x64fcba11d3dce1e3f781e22ec2b61001d2c652e5 => {1 => "struct with iphone details"}

用 truffle compile 编译合约，在继续之前请确保没有任何问题。

>debug 合约里的问题可能非常麻烦。我们推荐每一节完成后都编译一下，以便于早发现，早治疗。

`EcommerceStore.sol`

```
pragma solidity ^0.4.13;

contract EcommerceStore {
 enum ProductStatus { Open, Sold, Unsold }
 enum ProductCondition { New, Used }

 uint public productIndex;
 mapping (address => mapping(uint => Product)) stores;
 mapping (uint => address) productIdInStore;

 struct Product {
  uint id;
  string name;
  string category;
  string imageLink;
  string descLink;
  uint auctionStartTime;
  uint auctionEndTime;
  uint startPrice;
  address highestBidder;
  uint highestBid;
  uint secondHighestBid;
  uint totalBids;
  ProductStatus status;
  ProductCondition condition;
 }

 function EcommerceStore() public {
  productIndex = 0;
 }
}
```

## 3.3，向商店添加商品

向链上添加并检索产品

既然我们已经定义了产品的数据结构，让我们将产品添加到区块链并进行检索。我们建议你尝试按照下面的指引实现函数，右侧实现仅作参考之用。

1，新建一个叫做 addProductToStore 的函数，参数为构建 product 结构的所需内容（除了出价相关的变量）。

2，与上一节讨论的 productIndex 类似，计数加 1。

3，使用 require 来验证 auctionStartTime 小于 auctionEndTime。

4，初始化 Product 结构，并用传入函数的参数进行填充。

5，将初始化后的结构存储在 stores mapping。

6，同时在 productionIdInStore mapping 中记录是谁添加了商品。

7，创建一个叫做 getProduct 的函数，它将 productId 作为一个参数，在 stores mapping 中查询商品，返回商品细节，

>每一轮拍卖我们会以秒存储开始和结束时间。

>startPrice 存储的单位为 wei。

如果你留心的话，我们在两个函数中都用了一个叫做 memory 的关键字来存储商品。之所以用这个关键字，是为了告诉 EVM 这个对象仅作为临时变量。一旦函数执行完毕，该变量就会从内存中清除。

```
function addProductToStore(string _name, string _category, string _imageLink, string _descLink, uint _auctionStartTime,
  uint _auctionEndTime, uint _startPrice, uint _productCondition) public {
  require (_auctionStartTime < _auctionEndTime);
  productIndex += 1;
  Product memory product = Product(productIndex, _name, _category, _imageLink, _descLink, _auctionStartTime, _auctionEndTime,
                   _startPrice, 0, 0, 0, 0, ProductStatus.Open, ProductCondition(_productCondition));
  stores[msg.sender][productIndex] = product;
  productIdInStore[productIndex] = msg.sender;
}

function getProduct(uint _productId) view public returns (uint, string, string, string, string, uint, uint, uint, ProductStatus, ProductCondition) {
  Product memory product = stores[productIdInStore[_productId]][_productId];
  return (product.id, product.name, product.category, product.imageLink, product.descLink, product.auctionStartTime,
      product.auctionEndTime, product.startPrice, product.status, product.condition);
}
```

运行`truffle compile`。

## 3.4，控制台交互

如果你还没有启动 ganache，启动 ganache 并部署合约，看一下你是否能与合约交互。

1，打开 terminal 启动 ganache。

2，像右侧这样编辑 migration 文件，保存并将合约部署到区块链。

3，启动 truffle 控制台并向区块链添加一个商品。你可以给图片和描述链接随机输入一些内容（在实现 IPFS 的相关功能呢后，我们会来改进这一点）。

4，通过 product id 检索你插入的商品（由于这是你添加的第一个商品，所以 product id 将会是 1）。

代码：

`terminal 1`

```
$ npm install -g ganache-cli
$ ganache-cli
```

`terminal 2`

将`migrations/2_deploy_contracts.js`修改为：

```
var EcommerceStore = artifacts.require("./EcommerceStore.sol");

module.exports = function(deployer) {
 deployer.deploy(EcommerceStore);
};
```

然后运行

```
$ truffle migrate
$ truffle console
```

如果运行`truffle migrate`报错，那么需要修改`truffle.js`中的地址为本地跑起来的`ganache-cli`的地址。

例如：

```js
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    }
  }
};
```

运行`truffle console`以后，进入控制台，运行以下命令。

```
truffle(development)>  amt_1 = web3.toWei(1, 'ether');
'1000000000000000000'
truffle(development)>  current_time = Math.round(new Date() / 1000);
truffle(development)>  EcommerceStore.deployed().then(function(i) {i.addProductToStore('iphone 6', 'Cell Phones & Accessories', 'imagelink', 'desclink', current_time, current_time + 200, amt_1, 0).then(function(f) {console.log(f)})});
truffle(development)>  EcommerceStore.deployed().then(function(i) {i.getProduct.call(1).then(function(f) {console.log(f)})})
```

## 3.5，eBay拍卖

### 拍卖是如何工作的

我们成功地向区块链添加了一个产品。现在，用户应该能够像在 eBay 上一样对你的商品进行出价。eBay 有几种不同类型的拍卖，比如增量竞价（incremental bidding），自动竞价（automatic bidding）等等。更多内容可见 这里。下面是 eBay 自动竞价的一个工作案例：

比如说一个商品标价为 10 美元。只要高于 10 美元，你可以任意出价：

1，Alice 出价 10.50 美元。那么，她就是拍卖的一个有力竞争者。

2，Mary 现在看到的出价是 10.50 美元，但是她出价 15 美元。尽管她出价 15 美元，但是 eBay 显示的最高价格为 10.75 美元。虽然 Alice 输掉了出价，但是她可以再次竞价。

3，John 现在看到的出价是 10.75 美元，然后他出价 12 美元，但是 eBay 会代表 Mary 出价（因为 Mary 已经出价 15 美元），并将价格提升到 12.25 美元（比 John 的出价高了 0.25 美元）。所以，John 输掉了竞价。

4，现在 Alice 打算出价 17 美元。因为 Alice 的出价高于 Mary，eBay 将出价调整到 15.25 美元（比 Mary 的出价高 0.25 美元）。Mary 输掉了竞价（如果她想的话可以再次出一个更高的价）

5，没有人再出价了，所以 Alice 赢得了拍卖。即使 Alice 出价 17 美元，但是她只需要支付 15.25 美元。

## 3.6，暗标拍卖

我们刚刚学的拍卖类型叫做 Vickery Auction。

任何人都可以监控交易来观察是否有其他人为一个商品出价。回到上一节的例子，当 Mary 出价 15 美元时，除了 Mary 和 eBay 没有人知道她到底出价多少。但是在以太坊上，每个人都会知道她出价多少，这实际上就会变成一个公开拍卖。为了解决这个问题，我们会使用一个稍微不同于 Vickery auction 的形式，出价者提交一个经过加密的竞价，这样就不会有人知道出价到底是多少。在拍卖结束的时候，所有参与竞价的人都出示自己的出价，大家就可以看到每个人都出价多少。合约会验证密封出价与公开出价是否一致，然后决定最终的赢家。赢家支付金额为第二高的出价。这与 ENS 的拍卖非常类似。

另一个非常不一样的地方是，在 eBay 中，当你出价时，你提交的是赢得竞价的金额，但是实际支付金额并不是所提交的出价。我们的情况则不同，当用户出价的时候必须同时发送 ETH。在以太坊中，所谓出价者就是账户地址而已，如果你通过支付来出价，就无法保证最高出价者会实际赢得拍卖。当竞价结束，所有输掉竞价的人将会收回各自出价的 ETH。

还是上一节的例子，让我们来看一下它在区块链上到底是如何工作的。

>Alice 为商品出价 10.50 美元

在我们的系统中，如果 Alice 想要出价 10.50 美元，她将会对出价进行隐藏 sha3($10.50, "secretstring")，产生一个哈希 比如说 3fc3ac1afb93b6c29dc1a7d03cbff392ab89638475ed0fe7a3923facfe1dab67（我们会在下一节复习哈希的有关细节）。然后她将这个字符串发送出去，同时发送价值 15 美元的 ETH。看到这笔交易的任何人就都知道了她发送了 15 美元，但是没有人知道她只出价 10.50 美元。

>Mary 现在看到出价是 10.50 美元，但是她送出了 15 美元。

在这种情况下，Mary 并不知道 Alice 出价 10.50 美元。她知道 Alice 送出了 15 美元。如果 Mary 想要出价 15 美元，她可以对 sha3($15, "marysecretstring") 进行哈希，并发送哈希后的字符串，同时还有 15 美元或者更多的 ETH。

类似地，每个人都可以对想要购买的商品进行出价。

注意，用户可能会发送一个小于实际出价的数额来迷惑其他人。比如：Alice 出价 sha3($30, "secretstring")，但是实际只给合约转了 20 美元。在这种情况下，当她揭示出价时，合约会将这些钱归还回去，因为这是一个无效的出价。

>John 现在看到目前的出价是 10.75 美元，而他出价 12 美元

在这种情况下，John 仅出价 12 美元，因为这就是它愿意支付的金额。

>现在 Alice 决定出价 17 美元

尽管 Alice 已经出价了一次，她仍然可以再次出价。失败的任何报价，Alice 都会取回自己的钱。

## 3.7，揭示报价

一旦拍卖结束，所有的出价者都必须揭示各自报价。为了揭示报价，出价者必须向合约发送他们出价的金额和 secret string（他们用 secret string 对出价进行了哈希）。合约通过将报价金额与 secret string 进行组合构造出哈希后的报价，然后与出价者之前所发送的哈希后的字符串进行匹配。如果匹配成功，则出价有效。否则出价无效，合约会返还相应的资金。

还是回到之前的例子，来看一下揭示报价是如何工作的。

### Alice 揭示报价

Alice 通过向合约发送 10.50 美元和 “secretstring” 来揭示她的报价。合约使用同一个算法来生成哈希。在这个例子中，所生成的哈希会与 Alice 所发送的3fc3ac1afb93b6c29dc1a7d03cbff392ab89638475ed0fe7a3923facfe1dab67 一样。由于这是一个有效出价并且 Alice 发送了 15 美元，合约会记录它为有效出价，并将 15 - 10.5 = 4.5 美元返还给 Alice。

### Mary 揭示报价

类似地，Mary 也要揭示她的出价。因为她出价 15 美元，她就是最高的出价者。合约会替换掉 Alice，Mary 成为最高的出价者，Alice 成为第二高的出价者。因为 Alice 没有赢得竞价，所以她会拿回自己所有的钱。

### John 揭示报价

John 仅出价 12 美元。当揭示报价时，因为 John 输掉了竞价所以他会立刻收到返还的资金。

在本例中， Mary 赢得竞价，并支付 10.50 美元（第二高的报价）。

## 3.8，合约代码

现在我们已经知道出价和揭示出价是如何工作了。下面让我们来实现这些功能。

我们需要有一种途径来存储用户的出价。让我们来创建一个 struct 保存出价信息。注意 struct 里面的 value 字段是出价者实际发送 ETH 的数量，而不是当前实际出价的数量。当前出价的数量被加密了。只有发送的数量是已知的，它会被用于填充 value 字段。

为了方便地查询用户给哪个商品出价，出价多少。让我们给 product struct 加入一个 mapping mapping (address => mapping (bytes32 => Bid)) bids;。键为出价者的地址，值为哈希后的出价字符串到 bid struct 的 mapping。

`Bid Struct`

```
struct Bid {
  address bidder;
  uint productId;
  uint value;
  bool revealed;
}
```

`Product Struct`

```
struct Product {
  ....
  ....
  mapping (address => mapping (bytes32 => Bid)) bids;
}
```

### 出价

bid 函数有两个参数，product id 和加密后的 bid 字符串。bid 函数本身非常直观。我们从 stores mapping 检索产品，构建 bid struct 并把它加入到 mapping（我们上面刚刚初始化了）。我们有一些验证（require 语句）也很直观。你会注意到代码里的关键词 now。它仅仅是当前块的时间戳，也就是，当 bid 函数被调用时，表明一笔交易被创建。这笔交易被矿工打包到块里。每个块都有一个对应的时间戳（用来告诉你这个块被挖出来的时间）。now 就等同于那个时间戳。

在上两节，我们谈到了对 bid 进行哈希。sha3 是一个密码学上的哈希函数，对于任何长度的任意字符串，它都可以生成一个固定长度的唯一字符串。所生成的字符串对于给定的任意字符串都是独一无二的，也就是说，没有两个任意字符串能够通过 sha3 哈希算法生成一样固定长度的哈希。

让我们来看一下为什么这对我们的场景十分有用（生成密封的出价）。为了生成一个密封出价，我们使用了 ethereumjs-util library's sha3 function。如果 Alice 想要生成一个出价，她只需要调用 sha3 函数，传入她打算出价的数量和 secret。

```js
sha3("10.5" + "secretstring").toString('hex') => c2f8990ee5acd17d421d22647f20834cc37e20d0ef11087e85774bccaf782737
```

这是传入 bid() 函数的 bytes32 字符串。任何看到该字符串的人都不知道 Alice 的出价是 10.5。

`Bid function`

```js
function bid(uint _productId, bytes32 _bid) payable public returns (bool) {
  Product storage product = stores[productIdInStore[_productId]][_productId];
  require (now >= product.auctionStartTime);
  require (now <= product.auctionEndTime);
  require (msg.value > product.startPrice);
  require (product.bids[msg.sender][_bid].bidder == 0);
  product.bids[msg.sender][_bid] = Bid(msg.sender, _productId, msg.value, false);
  product.totalBids += 1;
  return true;
}
```

### 揭示出价

revealing 函数稍显复杂。为了更好地理解代码，让我们首先来捋一下逻辑。揭示出价就是要告诉合约你出价了多少。方式就是将的 secret string 和你打算出价的数量发送给合约。合约将同样的 sha3 算法应用于出价数量和 secret，并检查所生成的哈希是否在 bids mapping 里面。当执行检查的时候，可能会出现以下场景：

1，没有找到相关的哈希。这意味着用户尝试揭示不曾出价过的数量。在这种情况下，仅抛出一个异常（revealBid 函数的第 6 行）

2，出价数量小于发送数量：比如用户出价 10 美元，但是只发送了 5 美元。因为这是无效的，所以我们只需要将这 5 美元返回给用户即可。

3，出价数量大于等于发送数量：这是一个有效出价。现在我们会检查是否应该记录此次出价。

4，首次揭示：如果这是第一个有效的出价揭示，我们会把它记录为最高出价，同时记录是谁出的价。我们也会将第二高的出价设置为商品的起始价格（如果没有其他揭示报价，就由这个用户支付起始价格。还记得赢家总是支付第二高的价格吗？）。（Lines 15 - 19）

5，更高的出价：如果用户揭示了出价，并且他们的出价高于现有所揭示的最高出价，我们将会记录该出价者，将其出价记录为最高出价，并设置第二高的出价为旧的出价数量。（Lines 21 - 25）

6，更低的出价：如果出价比最高出价要低，这是一个会失败的出价。但是我们也会检查它是否低于第二高的出价。如果是的话，只需要返还资金即可，因为他们已经输掉了竞价，否则将该出价设置为第二高的出价。

在所有情况中，我们会返还发送数量与实际出价的差额，也就是，如果 Alice 出价 10 美元，但是发送了 15 美元，在揭示出价以后，将会返回给 Alice 5 美元。

### getter 函数

让我们也实现两个简单的 getter 函数，分别返回最高出价者信息和一个商品的总出价。这些信息将会用于在网页显示出价信息，同时为了有助于在 truffle 控制台进行测试。

`Reveal function`

```js
function revealBid(uint _productId, string _amount, string _secret) public {
 Product storage product = stores[productIdInStore[_productId]][_productId];
 require (now > product.auctionEndTime);
 bytes32 sealedBid = sha3(_amount, _secret);

 Bid memory bidInfo = product.bids[msg.sender][sealedBid];
 require (bidInfo.bidder > 0);
 require (bidInfo.revealed == false);

 uint refund;

 uint amount = stringToUint(_amount);

 if(bidInfo.value < amount) {
  // They didn't send enough amount, they lost
  refund = bidInfo.value;
 } else {
  // If first to reveal set as highest bidder
  if (address(product.highestBidder) == 0) {
   product.highestBidder = msg.sender;
   product.highestBid = amount;
   product.secondHighestBid = product.startPrice;
   refund = bidInfo.value - amount;
  } else {
   if (amount > product.highestBid) {
    product.secondHighestBid = product.highestBid;
    product.highestBidder.transfer(product.highestBid);
    product.highestBidder = msg.sender;
    product.highestBid = amount;
    refund = bidInfo.value - amount;
   } else if (amount > product.secondHighestBid) {
    product.secondHighestBid = amount;
    refund = amount;
   } else {
    refund = amount;
   }
  }
 }
 product.bids[msg.sender][sealedBid].revealed = true;

 if (refund > 0) {
  msg.sender.transfer(refund);
 }
}
```

`Getter & Helper functions`

```js
function highestBidderInfo(uint _productId) view public returns (address, uint, uint) {
  Product memory product = stores[productIdInStore[_productId]][_productId];
  return (product.highestBidder, product.highestBid, product.secondHighestBid);
}

function totalBids(uint _productId) view public returns (uint) {
  Product memory product = stores[productIdInStore[_productId]][_productId];
  return product.totalBids;
}

function stringToUint(string s) pure private returns (uint) {
  bytes memory b = bytes(s);
  uint result = 0;
  for (uint i = 0; i < b.length; i++) {
    if (b[i] >= 48 && b[i] <= 57) {
      result = result * 10 + (uint(b[i]) - 48);
    }
  }
  return result;
}
```

然后，

```sh
$ truffle compile
$ truffle migrate
```
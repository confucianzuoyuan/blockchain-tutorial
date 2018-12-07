```
org1.example.com/
├── ca     # 存放组织Org1的根证书和对应的私钥文件，默认采用EC算法，证书为自签名。组织内的实体将基于该根证书作为证书根。
│   ├── ca.org1.example.com-cert.pem
│   └── dfb841b77804d726eea25231ae5e89a31901ca0538688a6d764731148f0bdc5b_sk
├── msp    # 存放代表该组织的身份信息。
│   ├── admincerts         # 组织管理员的身份验证证书，被根证书签名。
│   │   └── Admin@org1.example.com-cert.pem
│   ├── cacerts # 组织的根证书，同ca目录下文件。
│   │   └── ca.org1.example.com-cert.pem
│   └── tlscacerts          # 用于TLS的CA证书，自签名。
│       └── tlsca.org1.example.com-cert.pem
├── peers   # 存放属于该组织的所有Peer节点
│   ├── peer0.org1.example.com    # 第一个peer的信息，包括其msp证书和tls证书两类。
│   │   ├── msp # msp相关证书
│   │   │   ├── admincerts  # 组织管理员的身份验证证书。Peer将基于这些证书来认证交易签署者是否为管理员身份。
│   │   │   │   └── Admin@org1.example.com-cert.pem
│   │   │   ├── cacerts     # 存放组织的根证书
│   │   │   │   └── ca.org1.example.com-cert.pem
│   │   │   ├── keystore    # 本节点的身份私钥，用来签名
│   │   │   │   └── 59be216646c0fb18c015c58d27bf40c3845907849b1f0671562041b8fd6e0da2_sk
│   │   │   ├── signcerts   # 验证本节点签名的证书，被组织根证书签名
│   │   │   │   └── peer0.org1.example.com-cert.pem
│   │   │   └── tlscacerts  # TLS连接用到身份证书，即组织TLS证书
│   │   │       └── tlsca.org1.example.com-cert.pem
│   │   └── tls # tls相关证书
│   │       ├── ca.crt      # 组织的根证书
│   │       ├── server.crt  # 验证本节点签名的证书，被组织根证书签名
│   │       └── server.key  # 本节点的身份私钥，用来签名
│   └── peer1.org1.example.com    # 第二个peer的信息，结构类似。（此处省略。）
│       ├── msp
│       │   ├── admincerts
│       │   │   └── Admin@org1.example.com-cert.pem
│       │   ├── cacerts
│       │   │   └── ca.org1.example.com-cert.pem
│       │   ├── keystore
│       │   │   └── 82aa3f8f9178b0a83a14fdb1a4e1f944e63b72de8df1baeea36dddf1fe110800_sk
│       │   ├── signcerts
│       │   │   └── peer1.org1.example.com-cert.pem
│       │   └── tlscacerts
│       │       └── tlsca.org1.example.com-cert.pem
│       └── tls
│           ├── ca.crt
│           ├── server.crt
│           └── server.key
├── tlsca    # 存放tls相关的证书和私钥。
│   ├── 00e4666e5f56804274aadb07e2192db2f005a05f2f8fcfd8a1433bdb8ee6e3cf_sk
│   └── tlsca.org1.example.com-cert.pem
└── users    # 存放属于该组织的用户的实体
    ├── Admin@org1.example.com    # 管理员用户的信息，其中包括msp证书和tls证书两类。
    │   ├── msp # msp相关证书
    │   │   ├── admincerts     # 组织根证书作为管理员身份验证证书
    │   │   │   └── Admin@org1.example.com-cert.pem
    │   │   ├── cacerts        # 存放组织的根证书
    │   │   │   └── ca.org1.example.com-cert.pem
    │   │   ├── keystore       # 本用户的身份私钥，用来签名
    │   │   │   └── fa719a7d19e7b04baebbe4fa3c659a91961a084f5e7b1020670be6adc6713aa7_sk
    │   │   ├── signcerts      # 管理员用户的身份验证证书，被组织根证书签名。要被某个Peer认可，则必须放到该Peer的msp/admincerts目录下
    │   │   │   └── Admin@org1.example.com-cert.pem
    │   │   └── tlscacerts     # TLS连接用的身份证书，即组织TLS证书
    │   │       └── tlsca.org1.example.com-cert.pem
    │   └── tls # 存放tls相关的证书和私钥。
    │       ├── ca.crt       # 组织的根证书
    │       ├── server.crt   # 管理员的用户身份验证证书，被组织根证书签名
    │       └── server.key   # 管理员用户的身份私钥，被组织根证书签名。
    └── User1@org1.example.com    # 第一个用户的信息，包括msp证书和tls证书两类
        ├── msp # msp证书相关信息
        │   ├── admincerts   # 组织根证书作为管理者身份验证证书。
        │   │   └── User1@org1.example.com-cert.pem
        │   ├── cacerts      # 存放组织的根证书
        │   │   └── ca.org1.example.com-cert.pem
        │   ├── keystore     # 本用户的身份私钥，用来签名
        │   │   └── 97f2b74ee080b9bf417a4060bfb737ce08bf33d0287cb3eef9b5be9707e3c3ed_sk
        │   ├── signcerts    # 验证本用户签名的身份证书，被组织根证书签名
        │   │   └── User1@org1.example.com-cert.pem
        │   └── tlscacerts   # TLS连接用的身份证书，被组织根证书签名。
        │       └── tlsca.org1.example.com-cert.pem
        └── tls # 组织的根证书
            ├── ca.crt       # 组织的根证书
            ├── server.crt   # 验证用户签名的身份证书，被根组织证书签名
            └── server.key   # 用户的身份私钥用来签名。
```

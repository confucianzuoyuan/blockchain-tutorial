package main

import (
	"bytes"
	"encoding/gob"
	"log"
	"time"
)

type Block struct {
	// 时间戳
	Timestamp int64
	// 交易
	Transactions []*Transaction
	// 上一个区块的哈希
	PrevBlockHash []byte
	// 当前区块哈希
	Hash []byte
	// 随机数
	Nonce int
	// 区块高度
	Height int
}

// 新产生一个区块，挖矿的函数
func NewBlock(transactions []*Transaction, prevBlockHash []byte, height int) *Block {
	block := &Block{time.Now().Unix(), transactions, prevBlockHash, []byte{}, 0, height}
	// 工作量证明
	pow := NewProofOfWork(block)
	nonce, hash := pow.Run()

	block.Hash = hash[:]
	block.Nonce = nonce

	return block
}

// 新建创世区块，使用coinbase
func NewGenesisBlock(coinbase *Transaction) *Block {
	return NewBlock([]*Transaction{coinbase}, []byte{}, 0)
}

// 将交易进行哈希
func (b *Block) HashTransactions() []byte {
	var transactons [][]byte

	for _, tx := range b.Transactions {
		transactons = append(transactons, tx.Serialize())
	}
	// 使用交易产生merkle tree
	mTree := NewMerkleTree(transactons)

	return mTree.RootNode.Data
}

// Block 结构体的 序列化函数，将 结构体b 序列化为一个字节数组
func (b *Block) Serialize() []byte {
	var result bytes.Buffer
	encoder := gob.NewEncoder(&result)

	err := encoder.Encode(b)
	if err != nil {
		log.Panic(err)
	}

	return result.Bytes()
}

// 反序列化为一个Block结构体，上一个函数的反函数
func DeserializeBlock(d []byte) *Block {
	var block Block

	decoder := gob.NewDecoder(bytes.NewReader(d))
	err := decoder.Decode(&block)
	if err != nil {
		log.Panic(err)
	}

	return &block
}

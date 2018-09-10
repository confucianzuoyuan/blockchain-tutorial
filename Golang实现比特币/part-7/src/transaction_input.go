package main

import (
	"bytes"
)

// 输入交易：交易id，输出Vout，签名，公钥
type TXInput struct {
	Txid      []byte
	Vout      int
	Signature []byte
	PubKey    []byte
}

// UsesKey 方法检查输入使用了指定密钥来解锁一个输出。注意到输入存储的是原生的公钥（也就是没有被哈希的公钥），但是这个函数要求的是哈希后的公钥。
func (in *TXInput) UsesKey(pubKeyHash []byte) bool {
	lockingHash := HashPubKey(in.PubKey)

	return bytes.Compare(lockingHash, pubKeyHash) == 0
}

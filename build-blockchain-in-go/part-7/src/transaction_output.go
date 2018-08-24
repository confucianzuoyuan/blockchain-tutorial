package main

import (
	"bytes"
	"encoding/gob"
	"log"
)

// 交易输出结构体
type TXOutput struct {
	Value      int
	PubKeyHash []byte
}

// Lock 只是简单地锁定了一个输出。当我们给某个人发送币时，我们只知道他的地址，因为这个函数使用一个地址作为唯一的参数。
// 然后，地址会被解码，从中提取出公钥哈希并保存在 PubKeyHash 字段。
func (out *TXOutput) Lock(address []byte) {
	pubKeyHash := Base58Decode(address)
	pubKeyHash = pubKeyHash[1 : len(pubKeyHash)-4]
	out.PubKeyHash = pubKeyHash
}

// IsLockedWithKey 检查是否提供的公钥哈希被用于锁定输出。
func (out *TXOutput) IsLockedWithKey(pubKeyHash []byte) bool {
	return bytes.Compare(out.PubKeyHash, pubKeyHash) == 0
}

// 创建一笔新的交易输出
func NewTXOutput(value int, address string) *TXOutput {
	txo := &TXOutput{value, nil}
	txo.Lock([]byte(address))

	return txo
}

// 交易输出数组
type TXOutputs struct {
	Outputs []TXOutput
}

// 将交易输出数组序列化为字节数组
func (outs TXOutputs) Serialize() []byte {
	var buff bytes.Buffer

	enc := gob.NewEncoder(&buff)
	err := enc.Encode(outs)
	if err != nil {
		log.Panic(err)
	}

	return buff.Bytes()
}

// 反序列化
func DeserializeOutputs(data []byte) TXOutputs {
	var outputs TXOutputs

	dec := gob.NewDecoder(bytes.NewReader(data))
	err := dec.Decode(&outputs)
	if err != nil {
		log.Panic(err)
	}

	return outputs
}

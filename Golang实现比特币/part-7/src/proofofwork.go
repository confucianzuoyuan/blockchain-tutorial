package main

import (
	"bytes"
	"crypto/sha256"
	"fmt"
	"math"
	"math/big"
)

var (
	// 随机数的最大值
	maxNonce = math.MaxInt64
)

// 16表示算出来的哈希前16位必须为0，用16进制表示就是前4位必须是0
const targetBits = 16

// 工作量证明的结构体
type ProofOfWork struct {
	block  *Block
	target *big.Int
}

func NewProofOfWork(b *Block) *ProofOfWork {
	// target 初始化为 1
	target := big.NewInt(1)
	// target 左移 256 - targetBits 位
	// 256 是一个SHA-256哈希的位数，我们将要使用SHA-256哈希算法
	target.Lsh(target, uint(256-targetBits))

	pow := &ProofOfWork{b, target}

	return pow
}

func (pow *ProofOfWork) prepareData(nonce int) []byte {
	// 合并操作
	data := bytes.Join(
		[][]byte{
			pow.block.PrevBlockHash,
			pow.block.HashTransactions(),
			IntToHex(pow.block.Timestamp),
			IntToHex(int64(targetBits)),
			IntToHex(int64(nonce)),
		},
		[]byte{},
	)

	return data
}

func (pow *ProofOfWork) Run() (int, []byte) {
	var hashInt big.Int
	var hash [32]byte
	nonce := 0

	fmt.Printf("Mining a new block")
	// maxNonce 是用来避免溢出的
	for nonce < maxNonce {
		// 准备数据
		data := pow.prepareData(nonce)

		// 产生哈希值
		hash = sha256.Sum256(data)
		// 余数
		if math.Remainder(float64(nonce), 100000) == 0 {
			fmt.Printf("\r%x", hash)
		}
		hashInt.SetBytes(hash[:])

		// 如果hashInt < pow.target, 则等于 -1
		if hashInt.Cmp(pow.target) == -1 {
			break
		} else {
			nonce++
		}
	}
	fmt.Print("\n\n")

	return nonce, hash[:]
}

// 校验工作量证明
func (pow *ProofOfWork) Validate() bool {
	var hashInt big.Int

	data := pow.prepareData(pow.block.Nonce)
	hash := sha256.Sum256(data)
	hashInt.SetBytes(hash[:])

	isValid := hashInt.Cmp(pow.target) == -1

	return isValid
}

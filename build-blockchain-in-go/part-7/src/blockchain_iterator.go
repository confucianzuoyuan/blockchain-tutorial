package main

import (
	"log"

	"github.com/boltdb/bolt"
)

// 区块链迭代器，用来迭代boltDB存储的区块链。
type BlockchainIterator struct {
	currentHash []byte
	db          *bolt.DB
}

// 返回上一个区块
func (i *BlockchainIterator) Next() *Block {
	var block *Block

	err := i.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(blocksBucket))
		encodedBlock := b.Get(i.currentHash)
		block = DeserializeBlock(encodedBlock)

		return nil
	})

	if err != nil {
		log.Panic(err)
	}

	i.currentHash = block.PrevBlockHash

	return block
}

// https://www.jianshu.com/p/e002931bb38b
// base58的讲解
package main

import (
	"bytes"
	"math/big"
)

var b58Alphabet = []byte("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz")

// Base58Encode 将 字节数组 编码成 Base58
func Base58Encode(input []byte) []byte {
	var result []byte

	x := big.NewInt(0).SetBytes(input) // 将 字节数组 转换成 big.Int 类型

	base := big.NewInt(int64(len(b58Alphabet)))
	zero := big.NewInt(0)
	mod := &big.Int{} // mod is a *big.Int of value 0

	for x.Cmp(zero) != 0 {
		// 例如：x = 15, y = 7, 则返回 x = 2, mod = 1
		x.DivMod(x, base, mod)
		result = append(result, b58Alphabet[mod.Int64()])
	}

	if input[0] == 0x00 {
		result = append(result, b58Alphabet[0])
	}

	ReverseBytes(result)

	return result
}

// Base58Decode 解码 Base58Encode 编码过的数据
func Base58Decode(input []byte) []byte {
	result := big.NewInt(0)

	for _, b := range input {
		// IndexByte 查找 b 在 b58Alphabet 中的索引
		charIndex := bytes.IndexByte(b58Alphabet, b)
		result.Mul(result, big.NewInt(58))
		result.Add(result, big.NewInt(int64(charIndex)))
	}

	decoded := result.Bytes()

	if input[0] == b58Alphabet[0] {
		// 如果有三个点，则是将两个数组拼接在一起。
		decoded = append([]byte{0x00}, decoded...)
	}

	return decoded
}

package gcm_encryption

import (
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "encoding/base64"
    "io"
)

func EncryptString(data []byte, key []byte) (string, error) {
	nonceAndCipherText, err := Encrypt(data, key)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(nonceAndCipherText), nil
}

func DecryptString(data string, key []byte) ([]byte, error) {
	bytes, err := base64.URLEncoding.DecodeString(data)
	if err != nil {
		return []byte{}, err
	}
	return Decrypt(bytes, key)
}

func Encrypt(data []byte, key []byte) ([]byte, error) {
	block, err1 := aes.NewCipher(key)
	if err1 != nil {
		return []byte{}, err1
	}

	nonce := make([]byte, 12)
	if _, err2 := io.ReadFull(rand.Reader, nonce); err2 != nil {
		return []byte{}, err2
	}

	aesgcm, err3 := cipher.NewGCM(block)
	if err3 != nil {
		return []byte{}, err3
	}

	ciphertext := aesgcm.Seal(nil, nonce, data, nil)
	return append(nonce, ciphertext...), nil
}

func Decrypt(data []byte, key []byte) ([]byte, error) {
	nonce := data[:12]
	ciphertext := data[12:]

	block, err2 := aes.NewCipher(key)
	if err2 != nil {
		return []byte{}, err2
	}

	aesgcm, err3 := cipher.NewGCM(block)
	if err3 != nil {
		return []byte{}, err3
	}

	plaintext, err4 := aesgcm.Open(nil, nonce, ciphertext, nil)
	if err4 != nil {
		return []byte{}, err4
	}
	return plaintext, nil
}

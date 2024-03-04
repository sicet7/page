package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/binary"
	"fmt"
	"io"
	mathRand "math/rand"
	"syscall/js"
)

func getSeededRandomString(seedString string, length int) (string, error) {
	h := sha256.New()
	_, err := io.WriteString(h, seedString)
	if err != nil {
		return "", err
	}
	seed := binary.BigEndian.Uint64(h.Sum(nil))
	myRand := mathRand.New(mathRand.NewSource(int64(seed)))
	output := ""
	var buffer []byte
	for len(output) < length {
		buffer = make([]byte, 32)
		_, err = myRand.Read(buffer)
		if err != nil {
			return "", err
		}
		output = output + base64.URLEncoding.EncodeToString(buffer)
	}
	return output[:length], nil
}

func encrypt(data string, password string) (string, error) {
	keyString, err := getSeededRandomString(password, 32)
	if err != nil {
		return "", err
	}
	key := []byte(keyString)
	plaintext := []byte(data)

	block, err1 := aes.NewCipher(key)
	if err1 != nil {
		return "", err1
	}

	nonce := make([]byte, 12)
	if _, err2 := io.ReadFull(rand.Reader, nonce); err2 != nil {
		return "", err2
	}

	aesgcm, err3 := cipher.NewGCM(block)
	if err3 != nil {
		return "", err3
	}

	ciphertext := aesgcm.Seal(nil, nonce, plaintext, nil)
	return base64.URLEncoding.EncodeToString(append(nonce, ciphertext...)), nil
}

func decrypt(data string, password string) (string, error) {
	bytes, err := base64.URLEncoding.DecodeString(data)
	if err != nil {
		return "", err
	}
	nonce := bytes[:12]
	ciphertext := bytes[12:]

	keyString, err1 := getSeededRandomString(password, 32)
	if err1 != nil {
		return "", err1
	}
	key := []byte(keyString)

	block, err2 := aes.NewCipher(key)
	if err2 != nil {
		return "", err2
	}

	aesgcm, err3 := cipher.NewGCM(block)
	if err3 != nil {
		return "", err3
	}

	plaintext, err4 := aesgcm.Open(nil, nonce, ciphertext, nil)
	if err4 != nil {
		return "", err4
	}
	return string(plaintext), nil
}

func jsEncrypt() js.Func {
	return js.FuncOf(func(this js.Value, args1 []js.Value) any {
		return js.Global().Get("Promise").New(js.FuncOf(func(this js.Value, args2 []js.Value) interface{} {
			resolve := args2[0]
			reject := args2[1]
			if len(args1) != 2 {
				reject.Invoke("Invalid no of arguments passed")
			}
			data := args1[0].String()
			password := args1[1].String()
			go func() {
				cipherText, err := encrypt(data, password)
				if err != nil {
					reject.Invoke(fmt.Sprintf("unable to encrypt %s", err))
					return
				}
				resolve.Invoke(cipherText)
			}()
			return nil
		}))
	})
}

func jsDecrypt() js.Func {
	return js.FuncOf(func(this js.Value, args1 []js.Value) any {
		return js.Global().Get("Promise").New(js.FuncOf(func(this js.Value, args2 []js.Value) interface{} {
			resolve := args2[0]
			reject := args2[1]
			if len(args1) != 2 {
				reject.Invoke("Invalid no of arguments passed")
			}
			data := args1[0].String()
			password := args1[1].String()
			go func() {
				cipherText, err := decrypt(data, password)
				if err != nil {
					reject.Invoke(fmt.Sprintf("unable to decrypt %s", err))
					return
				}
				resolve.Invoke(cipherText)
			}()
			return nil
		}))
	})
}

func main() {
	js.Global()
	js.Global().Set("GoGCMEncrypt", jsEncrypt())
	fmt.Println("GoGCMEncrypt loaded.")
	js.Global().Set("GoGCMDecrypt", jsDecrypt())
	fmt.Println("GoGCMDecrypt loaded.")
	<-make(chan struct{})
}

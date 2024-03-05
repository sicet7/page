package main

import (
	"fmt"
	gcmEncryption "github.com/sicet7/go-modules/encryption/gcm"
	"github.com/sicet7/go-modules/rand"
	"syscall/js"
)

func encrypt(data string, password string) (string, error) {
	keyString, err := rand.GetSeededRandomString(password, 32)
	if err != nil {
		return "", err
	}
	key := []byte(keyString)

	return gcmEncryption.EncryptString([]byte(data), key)
}

func decrypt(data string, password string) (string, error) {
	keyString, err1 := rand.GetSeededRandomString(password, 32)
	if err1 != nil {
		return "", err1
	}
	key := []byte(keyString)

	bytes, err2 := gcmEncryption.DecryptString(data, key)
	if err2 != nil {
		return "", err2
	}
	return string(bytes), nil
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

package main

import (
	"fmt"
	"github.com/sicet7/go-modules/hashing/bcrypt"
	"syscall/js"
)

func jsBcryptCreate() js.Func {
	return js.FuncOf(func(this js.Value, args1 []js.Value) any {
		return js.Global().Get("Promise").New(js.FuncOf(func(this js.Value, args2 []js.Value) interface{} {
			resolve := args2[0]
			reject := args2[1]
			if len(args1) != 2 {
				reject.Invoke("Invalid no of arguments passed")
			}
			password := args1[0].String()
			cost := args1[1].Int()
			go func() {
				defer func() {
					if r := recover(); r != nil {
						reject.Invoke(fmt.Sprintf("unable to create hash %s", r))
					}
				}()
				hash, err := bcrypt.FromPassword(password, cost)
				if err != nil {
					reject.Invoke(fmt.Sprintf("unable to create hash %s", err))
					return
				}
				resolve.Invoke(hash.String())
			}()
			return nil
		}))
	})
}

func jsBcryptVerify() js.Func {
	return js.FuncOf(func(this js.Value, args1 []js.Value) any {
		return js.Global().Get("Promise").New(js.FuncOf(func(this js.Value, args2 []js.Value) interface{} {
			resolve := args2[0]
			reject := args2[1]
			if len(args1) != 2 {
				reject.Invoke("Invalid no of arguments passed")
			}
			hashString := args1[0].String()
			password := args1[1].String()
			go func() {
				defer func() {
					if r := recover(); r != nil {
						reject.Invoke(fmt.Sprintf("unable to decrypt %s", r))
					}
				}()
				hash, err := bcrypt.FromHash(hashString)
				if err != nil {
					reject.Invoke(fmt.Sprintf("unable to decrypt %s", err))
					return
				}
				resolve.Invoke(hash.VerifyPassword(password))
			}()
			return nil
		}))
	})
}

func main() {
	js.Global().Set("GoBcryptHash", jsBcryptCreate())
	fmt.Println("GoBcryptHash loaded.")
	js.Global().Set("GoBcryptHashVerify", jsBcryptVerify())
	fmt.Println("GoBcryptHashVerify loaded.")
	<-make(chan struct{})
}

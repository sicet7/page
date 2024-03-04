#!/bin/sh

rm -f "wasm_exec.js";
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .

#Compile Encryption wasm module.
GOOS=js GOARCH=wasm go build -C "$(pwd)/src/wasm/encryption" -o "$(pwd)/src/assets/wasm/encryption.wasm"

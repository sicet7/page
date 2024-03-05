#!/bin/bash

rm -f "wasm_exec.js";
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .

IFS=$'\n' read -r -d '' -a WASM_ARRAY < <( find ./src/modules -type d -name "wasm" )

for value in "${WASM_ARRAY[@]}"
do
    if [[ "$value" =~ ^\./src/modules/([^/]+)/wasm$ ]]; then
        if [ -f "$value/main.go" ]; then
            # The matched part is stored in BASH_REMATCH[1]
            MATCHED_PART="${BASH_REMATCH[1]}"
            GOOS=js GOARCH=wasm go build -C "$value" -o "$(pwd)/src/assets/wasm/$MATCHED_PART.wasm"
        fi
    fi
done

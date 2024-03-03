#!/bin/sh

set -e

cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .

npm ci
npm run build -- --configuration production

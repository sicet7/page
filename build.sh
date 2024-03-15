#!/bin/sh

set -e

bash ./build-wasm.sh

npm ci
npm run build -- --configuration production

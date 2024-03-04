#!/bin/sh

set -e

sh ./build-wasm.sh

npm ci
npm run build -- --configuration production

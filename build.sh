#!/bin/sh

set -e

npm ci
npm run build -- --configuration production

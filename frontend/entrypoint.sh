#!/bin/sh

: "${API_URL:=http://localhost:3000}"

echo "Injecting API_URL: $API_URL into JS bundles..."

find /usr/share/nginx/html -name "*.js" -exec sed -i "s|PLACEHOLDER_URL|$API_URL|g" {} +

echo "Injection complete. Starting Nginx..."
exec "$@"
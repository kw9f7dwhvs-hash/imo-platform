#!/bin/bash
cd "$(dirname "$0")"
echo "=== Building... ==="
npm run build 2>&1 | tail -3
echo "=== Starting server ==="
exec npx next start -p ${PORT:-3000} -H 0.0.0.0

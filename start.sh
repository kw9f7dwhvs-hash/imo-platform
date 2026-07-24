#!/bin/bash
echo "=== STARTUP ==="
echo "PORT=$PORT"
echo "DATABASE_URL=$DATABASE_URL"
echo "NODE_ENV=$NODE_ENV"
echo "PWD=$(pwd)"
echo "LS=$(ls -la .next/BUILD_ID 2>/dev/null && cat .next/BUILD_ID || echo 'no BUILD_ID')"

# Run DB setup
DATABASE_URL=file:/data/app.db npx prisma db push --accept-data-loss 2>/dev/null
DATABASE_URL=file:/data/app.db node prisma/seed.js 2>/dev/null

echo "=== STARTING SERVER ==="
exec npx next start -p ${PORT:-3000} -H 0.0.0.0

#!/bin/bash
# First-time setup: run DB migration and seed (ignore errors if already done)
DATABASE_URL=file:/data/app.db npx prisma db push --accept-data-loss 2>/dev/null || true
DATABASE_URL=file:/data/app.db node prisma/seed.js 2>/dev/null || true

# Start the Next.js server
exec npx next start -p ${PORT:-3000} -H 0.0.0.0

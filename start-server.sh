#!/bin/bash
cd "$(dirname "$0")"
kill $(lsof -ti:3000) 2>/dev/null
nohup npx next start -p 3000 > server.log 2>&1 &
echo "Server started on http://localhost:3000"
echo "Logs: server.log"

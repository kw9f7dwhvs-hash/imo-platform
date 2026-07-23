#!/bin/bash
echo "Checking cloudflared..."
if ! command -v cloudflared &> /dev/null; then
  echo "Installing cloudflared..."
  brew install cloudflare/cloudflare/cloudflared 2>/dev/null || curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz | tar xz -C /usr/local/bin
fi
echo "Starting tunnel to http://localhost:3000..."
echo "You will get a https://xxxx.trycloudflare.com URL"
cloudflared tunnel --url http://localhost:3000

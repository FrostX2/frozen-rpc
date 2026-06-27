#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$DIR"

if ! command -v node &>/dev/null; then
  echo "Installing Node.js..."
  sudo zypper install -y nodejs npm
fi

[ ! -d node_modules ] && npm install
echo "Starting Frozen RPC..."
exec npx electron .

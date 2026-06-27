#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$DIR"

if ! command -v node &>/dev/null; then
  echo "Node.js not found. Install it from https://nodejs.org"
  echo "Or use your distro's package manager."
  read -rp "Press Enter to open the download page... " _
  xdg-open https://nodejs.org 2>/dev/null || open https://nodejs.org
  exit 1
fi

[ ! -d node_modules ] && npm install
echo "Starting Frozen RPC..."
exec npx electron .

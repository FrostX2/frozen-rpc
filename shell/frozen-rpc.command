#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"
exec bash shell/frozen-rpc.sh

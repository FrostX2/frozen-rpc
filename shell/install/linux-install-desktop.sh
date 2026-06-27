#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "$0")/../.." && pwd)"

# Install .desktop file and icon to system locations
mkdir -p ~/.local/share/applications ~/.local/share/icons/hicolor/1000x1000/apps

cp "$DIR/shell/frozen-rpc.desktop" ~/.local/share/applications/
cp "$DIR/assets/icon.png" ~/.local/share/icons/hicolor/1000x1000/apps/frozen-rpc.png

# Update desktop database if available
if command -v update-desktop-database &>/dev/null; then
  update-desktop-database ~/.local/share/applications 2>/dev/null || true
fi

echo "Shortcut installed! Find 'Frozen RPC' in your app launcher."
echo "To add to dock/taskbar: search for Frozen RPC and pin it."

#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "=== Building Frozen RPC Flatpak ==="
echo ""

# Check dependencies
for cmd in flatpak flatpak-builder; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: $cmd not found. Install it with your package manager."
    echo "  Debian/Ubuntu: sudo apt install flatpak flatpak-builder"
    echo "  Fedora:        sudo dnf install flatpak flatpak-builder"
    echo "  Arch:          sudo pacman -S flatpak flatpak-builder"
    exit 1
  fi
done

# Add Flathub if not present
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo 2>/dev/null || true

# Install the Electron BaseApp SDK
flatpak install -y flathub org.electronjs.Electron2.BaseApp//24.08 2>/dev/null || true
flatpak install -y flathub org.freedesktop.Sdk//24.08 2>/dev/null || true

cd "$DIR/flatpak"

# Build
flatpak-builder --force-clean --ccache --user build-dir com.frozenrpc.app.yml

# Export to repo
flatpak build-export repo build-dir

# Install locally
flatpak --user install -y --bundle repo 2>/dev/null || flatpak --user install -y repo com.frozenrpc.app

# Bundle into a single-file Flatpak
flatpak build-bundle repo "frozen-rpc.flatpak" com.frozenrpc.app

echo ""
# Copy flatpak bundle to shared installer directory
cp "frozen-rpc.flatpak" "$DIR/installer/" 2>/dev/null || mkdir -p "$DIR/installer" && cp "frozen-rpc.flatpak" "$DIR/installer/"

echo "=== Done! ==="
echo "Flatpak installed locally and bundled to: $DIR/installer/frozen-rpc.flatpak"
echo ""
echo "Install from file on another machine:"
echo "  flatpak --user install frozen-rpc.flatpak"
echo "Run:"
echo "  flatpak run com.frozenrpc.app"

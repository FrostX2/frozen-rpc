#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "╔══════════════════════════════════════════╗"
echo "║   Frozen RPC - Build All Installers     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

OS="$(uname -s)"

case "$OS" in
  Linux*)
    echo "[1/3] Building Linux installers (AppImage, deb, rpm, pacman)..."
    cd "$DIR" && npx electron-builder --linux

    echo ""
    echo "[2/3] Building Flatpak..."
    if command -v flatpak-builder &>/dev/null; then
      bash "$DIR/shell/install/build-flatpak.sh"
    else
      echo "  → SKIP: flatpak-builder not installed"
    fi

    echo ""
    echo "[3/3] Copying launcher scripts..."
    mkdir -p "$DIR/installer/launcher"
    cp "$DIR/shell/frozen-rpc.sh" "$DIR/installer/launcher/"
    cp "$DIR/shell/frozen-rpc.desktop" "$DIR/installer/launcher/"
    cp -r "$DIR/shell/distro" "$DIR/installer/launcher/"
    echo "  → installer/launcher/"
    ;;

  Darwin*)
    echo "[1/1] Building macOS installers (DMG + PKG)..."
    cd "$DIR" && npx electron-builder --mac
    ;;

  MINGW*|MSYS*|CYGWIN*)
    echo "[1/1] Building Windows installer (NSIS)..."
    cd "$DIR" && npx electron-builder --win
    ;;

  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac

echo ""
echo "=== All installers built successfully ==="
echo "Output: $DIR/installer/"

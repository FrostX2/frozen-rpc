#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "$0")/../.." && pwd)"

APP="$DIR/shell/Frozen RPC.app"
ICONSET="$DIR/shell/Frozen RPC.app/icon.iconset"
ICON_PNG="$DIR/assets/icon.png"

# Generate .icns from PNG if iconutil is available
if command -v iconutil &>/dev/null && [ ! -f "$APP/Contents/Resources/icon.icns" ]; then
  mkdir -p "$ICONSET"
  for size in 16 32 64 128 256 512 1024; do
    sips -z $size $size "$ICON_PNG" --out "$ICONSET/icon_${size}x${size}.png" &>/dev/null || true
    if [ "$size" -lt 512 ]; then
      sips -z $((size*2)) $((size*2)) "$ICON_PNG" --out "$ICONSET/icon_${size}x${size}@2x.png" &>/dev/null || true
    fi
  done
  iconutil -c icns "$ICONSET" -o "$APP/Contents/Resources/icon.icns" 2>/dev/null && rm -rf "$ICONSET"
fi

# Copy .app to Applications
cp -r "$APP" ~/Applications/ 2>/dev/null || cp -r "$APP" /Applications/

echo "Frozen RPC.app installed to your Applications folder!"
echo "You can also find it in shell/Frozen RPC.app"

# Frozen RPC

Cross-platform desktop app for Discord Rich Presence injection with OAuth2, auto-reconnect, and preset management.

## Features

- **Local mode** — sets presence via running Discord client (IPC)
- **Inject mode** — sets presence via Discord Gateway using OAuth2 (no local client needed)
- **All RPC fields** — text, images, timestamps, party, secrets, buttons, instance
- **OAuth2 login** — authorize with Discord to get a token
- **Auto-reconnect** — exponential backoff on disconnect
- **Presets** — save/load/config export/import
- **SQLite DB** (`rpc.db`) — stores accounts, presets, and config

## Setup

Create a Discord application at https://discord.com/developers/applications and add a redirect URI of `http://localhost:53173/callback`.

Run the launcher for your OS:

```bash
./shell/frozen-rpc.sh      # Linux / macOS
shell\frozen-rpc.bat       # Windows (double-click)
```

The launcher auto-detects your distro/OS and runs the right script from `shell/distro/`.

## Usage

```bash
npm start
```

1. **Settings tab** — enter your Client ID/Secret
2. **Accounts tab** → click **Login with Discord**
3. **RPC tab** → fill in your presence, choose mode, click **Connect**
4. Minimize to tray — presence keeps running

### Local Mode

Uses Discord's local IPC. Discord must be running. Enter your Client ID and connect.

### Inject Mode (OAuth2)

Uses Discord Gateway with an OAuth2 token. No local client needed. Authorize an account, select it, and connect.

## Shortcuts / Desktop Integration

| OS | File | How to install |
|----|------|---------------|
| Linux | `shell/frozen-rpc.desktop` | Run `bash shell/install/linux-install-desktop.sh` |
| macOS | `shell/Frozen RPC.app` | Run `bash shell/install/macos-install-app.sh` |
| Windows | `shell/frozen-rpc.bat` | Double-click `shell/install/windows-shortcut.vbs` |

## Build Installers

```bash
npm run dist:win         # Windows NSIS (.exe)
npm run dist:linux       # Linux: AppImage + .deb + .rpm + .pacman
npm run dist:mac         # macOS DMG + PKG
npm run dist:flatpak     # Linux Flatpak (.flatpak) — runs shell/install/build-flatpak.sh
npm run dist:all         # All for current OS (via shell/build-installers.sh)
```

| Format | OS | Output (in `../installer/`) |
|--------|----|------------------------------|
| **NSIS** | Windows | `Frozen-RPC-Setup-*.exe` — installs to `%APPDATA%`, Start Menu + Desktop shortcuts |
| **AppImage** | Linux | `Frozen RPC-*.AppImage` — portable, double-click to run |
| **DEB** | Linux (Debian/Ubuntu) | `frozen-rpc_*.deb` — `sudo dpkg -i` |
| **RPM** | Linux (Fedora/RHEL) | `frozen-rpc-*.rpm` — `sudo rpm -i` |
| **pacman** | Linux (Arch) | `frozen-rpc-*.pkg.tar.zst` — `sudo pacman -U` |
| **Flatpak** | Linux (any) | `frozen-rpc.flatpak` (in `installer/`) — `flatpak --user install` |
| **DMG** | macOS | `Frozen RPC-*.dmg` — drag to Applications |
| **PKG** | macOS | `Frozen RPC-*.pkg` — double-click installer |

## Data Storage

| File | Contents |
|------|----------|
| `rpc.db` | SQLite — accounts, presets, config |
| `config/config.json` | App credentials (Client ID/Secret) |

Export/import all data from the Accounts tab.

## Requirements

- Node.js 18+
- Discord desktop client (for local mode only)


<p align="center">
  <img src="assets/icon.png" alt="Frozen RPC" width="120">
</p>

<h1 align="center">❄️ Frozen RPC</h1>

<p align="center">
  <b>Cross-platform Discord Rich Presence Injector</b><br>
  <i>Local IPC • OAuth2 Gateway • Auto-Reconnect • Presets</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square">
  <img src="https://img.shields.io/github/v/release/FrostX2/frosty-rpc?style=flat-square&color=blueviolet&label=version">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square">
  <img src="https://img.shields.io/badge/electron-42.x-47848F?style=flat-square&logo=electron">
  <img src="https://img.shields.io/badge/discord-rpc-5865F2?style=flat-square&logo=discord">
</p>

---

## 📥 Get Frozen RPC

<table>
<tr>
<td width="50%" align="center">

### ⬇️ Download Release

Grab the latest package for your OS:

[**View Releases →**](https://github.com/FrostX2/frosty-rpc/releases)

| OS | Format |
|----|--------|
| 🪟 Windows | `.exe` installer |
| 🐧 Linux | `.AppImage` / `.deb` / `.rpm` / `.pacman` / `.flatpak` |
| 🍎 macOS | `.dmg` / `.pkg` |

</td>
<td width="50%" align="center">

### 🔧 Build from Source

```bash
git clone https://github.com/FrostX2/frosty-rpc.git
cd frosty-rpc
npm install
npm run dist:all    # builds for your OS
```

Installers land in `../installer/`

[**Build Script →**](shell/build-installers.sh)

</td>
</tr>
</table>

---

## ✨ Features

<table>
<tr>
<td width="50%">

**🎮 Two Connection Modes**
- **Local** — IPC via running Discord client
- **Inject** — Gateway + OAuth2, no client needed

**📋 Full RPC Support**
- Text, images, timestamps
- Party, secrets, buttons
- Instance flag

</td>
<td width="50%">

**🔐 OAuth2 Login**
- Authorize with Discord
- Token refresh & persistence
- Manage multiple accounts

**🔄 Auto-Reconnect**
- Exponential backoff
- Tray status indicator
- Seamless reconnect

</td>
</tr>
<tr>
<td width="50%">

**💾 Preset Manager**
- Save/load presets
- Full data export/import
- Quick switching

</td>
<td width="50%">

**📦 All Formats**
- Windows NSIS installer
- Linux: AppImage, DEB, RPM, Pacman, Flatpak
- macOS: DMG, PKG

</td>
</tr>
</table>

---

## 🚀 Quick Start

```bash
# From source
npm start
```

Or use the universal launcher:
```bash
./shell/frozen-rpc.sh      # Linux / macOS
shell\frozen-rpc.bat       # Windows
```

> Launcher auto-detects your distro and handles dependencies.

---

## 📖 Usage Guide

1. **Settings** → enter your Discord Client ID & Secret
2. **Accounts** → **Login with Discord** → authorize
3. **RPC** → fill in presence → choose mode → **Connect**
4. Minimize to tray — presence keeps running

### Mode Comparison

| Local Mode | Inject Mode |
|------------|-------------|
| Requires Discord client | No local client needed |
| IPC transport | Gateway WebSocket |
| Just Client ID | OAuth2 token required |

---

## 📦 Build Your Own

| Command | Produces |
|---------|----------|
| `npm run dist:win` | NSIS installer (`.exe`) |
| `npm run dist:linux` | AppImage + `.deb` + `.rpm` + `.pacman` |
| `npm run dist:mac` | DMG + PKG |
| `npm run dist:flatpak` | Flatpak bundle (`.flatpak`) |
| `npm run dist:all` | Everything for current OS |

### Install Format Reference

| Format | OS | Install Command |
|--------|----|-----------------|
| 🪟 **NSIS** | Windows | Double-click `.exe` |
| 🐧 **AppImage** | Linux | `chmod +x && ./Frozen RPC-*.AppImage` |
| 🐧 **DEB** | Debian/Ubuntu | `sudo dpkg -i frozen-rpc_*.deb` |
| 🐧 **RPM** | Fedora/RHEL | `sudo rpm -i frozen-rpc-*.rpm` |
| 🐧 **Pacman** | Arch | `sudo pacman -U frozen-rpc-*.pkg.tar.zst` |
| 🐧 **Flatpak** | Any Linux | `flatpak --user install frozen-rpc.flatpak` |
| 🍎 **DMG** | macOS | Drag to Applications |
| 🍎 **PKG** | macOS | Double-click installer |

---

> **Want a specific format?** Run `npm run dist:linux -- --linux AppImage` for just AppImage, or check the [build script](shell/build-installers.sh).

---

## 🖥️ Desktop Integration

| OS | File | Install Command |
|----|------|----------------|
| 🐧 Linux | `shell/frozen-rpc.desktop` | `bash shell/install/linux-install-desktop.sh` |
| 🍎 macOS | `shell/Frozen RPC.app` | `bash shell/install/macos-install-app.sh` |
| 🪟 Windows | `shell/frozen-rpc.bat` | Double-click `shell/install/windows-shortcut.vbs` |

---

## 🗄️ Data Storage

| File | What's Inside |
|------|---------------|
| `rpc.db` | SQLite — accounts, presets, all config |
| `config/config.json` | Discord app credentials |

> Export/import everything from the **Accounts** tab.

---

## 🛠️ Requirements

- **Node.js** 18+
- **Discord desktop client** — only needed for Local mode

---

## 📁 Project Structure

```
frosty-rpc/
├── src/              Core application (main process, modules)
├── renderer/         Frontend (HTML, JS, CSS)
├── shell/            Launchers, distro scripts, install helpers
├── assets/           Icons and static assets
├── flatpak/          Flatpak manifest
├── config/           App credentials
└── package.json      Dependencies & build config
```

---

<p align="center">
  <sub>Built with ❤️ using Electron + discord-rpc + better-sqlite3</sub><br>
  <sub>MIT License · © NotFrost</sub><br>
  <sub><a href="https://github.com/FrostX2/frosty-rpc/releases">Releases</a> · <a href="https://github.com/FrostX2/frosty-rpc">GitHub</a></sub>
</p>

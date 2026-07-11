## v1.0.0-beta-1

Initial beta release.

### What's inside
- Local IPC mode & Gateway + OAuth2 injection
- Full RPC fields (text, images, timestamps, party, secrets, buttons)
- OAuth2 login with token persistence
- Preset manager with export/import
- Auto-reconnect with exponential backoff
- Auto-update checker in Settings
- System tray integration
- Cross-platform: Windows (.exe), Linux (AppImage/deb/rpm/pkg.tar.zst)

### Installers
- Windows: `Frozen-RPC-Setup-1.0.0-beta-1.exe`
- Linux: `Frozen RPC-1.0.0-beta-1.AppImage`, `frozen-rpc_1.0.0-beta-1_amd64.deb`, `frozen-rpc-1.0.0-beta-1.x86_64.rpm`, `frozen-rpc-1.0.0-beta-1.pkg.tar.zst`
- MacOS: Build your own

---

## v1.0.0-beta-2

### What's new
- **Presets → Profiles**: Renamed throughout — DB table, IPC, UI (tab label: "Profiles")
- **Custom CSS appearance**: Add your own CSS in Settings → Custom Appearance to override the theme. Apply saves and prompts "Reload now" or "Reload later"
- **OAuth config stored in DB**: clientId/clientSecret moved from `config.json` to `rpc.db` config table
- **Packed app fix**: Writable paths now use `app.getPath('userData')` so the app works correctly when packaged (AppImage/deb/rpm)
- **Token refresh for Gateway**: Expired OAuth tokens are auto-refreshed on reconnect
- **Standardized artifact naming**: `Frozen-RPC-version.ext` across all platforms
- **AUR release**: Package available at `aur.archlinux.org/packages/frozen-rpc` — install via `yay -S frozen-rpc`

### Installers
- Windows: `Frozen-RPC-Setup-1.0.0-beta-2.exe` / `.msi`
- Linux: `Frozen-RPC-1.0.0-beta-2.AppImage` / `.deb` / `.rpm` / `.pacman`
- AUR: `yay -S frozen-rpc`
- macOS: Build your own

---

## v1.0.0-beta-3

### What's new
- **Shared activity builder**: Deduplicated RPC activity construction into a single `buildActivity()` utility
- **DB caching**: In-memory cache with debounced writes — no full-file read/write on every operation
- **Gateway auto-reconnect**: Exponential backoff reconnection for Gateway WebSocket (2s → 30s)
- **Secrets encryption**: OAuth tokens, client secrets, and bot tokens encrypted at rest via Electron `safeStorage`
- **Content Security Policy**: CSP header set on the renderer to prevent XSS
- **Auth server port fallback**: If port 53173 is in use, falls back to OS-assigned port
- **Window resizable**: Now resizable with 420×600 minimum size
- **Input validation**: Client ID snowflake regex check, party size clamping, button cap
- **Log polling optimization**: Polls only when Settings tab is active
- **CI/CD pipeline**: GitHub Actions workflow for build + release on tag
- **AUR `pkgrel=3`**: Uses `npm ci`, fixed desktop icon path, smaller install size

### Installers
- Windows: `Frozen-RPC-Setup-1.0.0-beta-3.exe` / `.msi`
- Linux: `Frozen-RPC-1.0.0-beta-3.AppImage` / `.deb` / `.rpm` / `.pacman`
- AUR: `yay -S frozen-rpc`
- macOS: Build your own
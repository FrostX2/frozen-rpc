const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("rpcAPI", {
  // Config
  getAppConfig: () => ipcRenderer.invoke("get-app-config"),
  saveAppConfig: (cfg) => ipcRenderer.invoke("save-app-config", cfg),

  // Accounts
  getAccounts: () => ipcRenderer.invoke("get-accounts"),
  deleteAccount: (id) => ipcRenderer.invoke("delete-account", id),

  // OAuth
  startOAuth: (opts) => ipcRenderer.invoke("start-oauth", opts),

  // RPC
  startLocalRPC: (clientId, config) => ipcRenderer.invoke("start-local-rpc", clientId, config),
  startGatewayRPC: (token, config, useBotToken) => ipcRenderer.invoke("start-gateway-rpc", token, config, useBotToken),
  stopRPC: () => ipcRenderer.invoke("stop-rpc"),
  updateActivity: (config) => ipcRenderer.invoke("update-activity", config),
  isConnected: () => ipcRenderer.invoke("is-connected"),
  getMode: () => ipcRenderer.invoke("get-mode"),

  // Profiles
  getProfiles: () => ipcRenderer.invoke("get-profiles"),
  saveProfile: (name, config) => ipcRenderer.invoke("save-profile", name, config),
  deleteProfile: (id) => ipcRenderer.invoke("delete-profile", id),

  // Export/Import
  exportData: () => ipcRenderer.invoke("export-data"),
  importData: () => ipcRenderer.invoke("import-data"),

  // Logs
  getLog: () => ipcRenderer.invoke("get-log"),
  clearLog: () => ipcRenderer.invoke("clear-log"),
  openLogFolder: () => ipcRenderer.invoke("open-log-folder"),

  // Custom CSS
  getCustomCSS: () => ipcRenderer.invoke("get-custom-css"),
  saveCustomCSS: (css) => ipcRenderer.invoke("save-custom-css", css),
  reloadWindow: () => ipcRenderer.invoke("reload-window"),
  showMessageBox: (opts) => ipcRenderer.invoke("show-message-box", opts),

  // Auto-Update
  checkForUpdate: () => ipcRenderer.invoke("check-for-update"),
  restartApp: () => ipcRenderer.invoke("restart-app"),

  // Events
  onStatusChange: (callback) => {
    ipcRenderer.on("rpc-status", (_event, status) => callback(status));
  },
});

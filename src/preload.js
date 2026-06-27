import { contextBridge, ipcRenderer } from "electron";

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
  startGatewayRPC: (token, config) => ipcRenderer.invoke("start-gateway-rpc", token, config),
  stopRPC: () => ipcRenderer.invoke("stop-rpc"),
  updateActivity: (config) => ipcRenderer.invoke("update-activity", config),
  isConnected: () => ipcRenderer.invoke("is-connected"),
  getMode: () => ipcRenderer.invoke("get-mode"),

  // Presets
  getPresets: () => ipcRenderer.invoke("get-presets"),
  savePreset: (name, config) => ipcRenderer.invoke("save-preset", name, config),
  deletePreset: (id) => ipcRenderer.invoke("delete-preset", id),

  // Export/Import
  exportData: () => ipcRenderer.invoke("export-data"),
  importData: () => ipcRenderer.invoke("import-data"),

  // Logs
  getLog: () => ipcRenderer.invoke("get-log"),
  clearLog: () => ipcRenderer.invoke("clear-log"),
  openLogFolder: () => ipcRenderer.invoke("open-log-folder"),

  // Auto-Update
  checkForUpdate: () => ipcRenderer.invoke("check-for-update"),

  // Events
  onStatusChange: (callback) => {
    ipcRenderer.on("rpc-status", (_event, status) => callback(status));
  },
});

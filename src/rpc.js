import { Client } from "discord-rpc";
import {
  connectGateway,
  disconnectGateway,
  updateGatewayActivity,
  isGatewayConnected,
} from "./gateway.js";
import { logInfo, logWarn, logError } from "./logger.js";

let localRpc = null;
let mode = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
let clientId = null;
let currentConfig = null;
let onStatusChange = null;

const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 2000;

function buildActivity(config) {
  const activity = {};
  if (config.details) activity.details = config.details;
  if (config.state) activity.state = config.state;
  if (config.startTimestamp || config.endTimestamp) {
    activity.timestamps = {};
    if (config.startTimestamp) activity.timestamps.start = config.startTimestamp;
    if (config.endTimestamp) activity.timestamps.end = config.endTimestamp;
  }
  if (config.largeImageKey || config.largeImageText || config.smallImageKey || config.smallImageText) {
    activity.assets = {};
    if (config.largeImageKey) activity.assets.large_image = config.largeImageKey;
    if (config.largeImageText) activity.assets.large_text = config.largeImageText;
    if (config.smallImageKey) activity.assets.small_image = config.smallImageKey;
    if (config.smallImageText) activity.assets.small_text = config.smallImageText;
  }
  if (config.partyId || config.partySize || config.partyMax) {
    activity.party = {};
    if (config.partyId) activity.party.id = config.partyId;
    if (config.partySize !== undefined || config.partyMax !== undefined) {
      activity.party.size = [config.partySize || 0, config.partyMax || 0];
    }
  }
  if (config.matchSecret || config.joinSecret || config.spectateSecret) {
    activity.secrets = {};
    if (config.matchSecret) activity.secrets.match = config.matchSecret;
    if (config.joinSecret) activity.secrets.join = config.joinSecret;
    if (config.spectateSecret) activity.secrets.spectate = config.spectateSecret;
  }
  if (config.buttons?.length) activity.buttons = config.buttons;
  if (config.instance !== undefined) activity.instance = config.instance;
  return activity;
}

function createLocalClient() {
  localRpc = new Client({ transport: "ipc" });

  localRpc.on("ready", () => {
    logInfo("Local RPC client ready");
    reconnectAttempts = 0;
    if (currentConfig) {
      localRpc.setActivity(buildActivity(currentConfig)).catch((err) => logError("setActivity", err));
    }
    if (onStatusChange) onStatusChange({ connected: true, message: "Connected (local)" });
  });

  localRpc.on("disconnected", () => {
    logWarn("Local RPC disconnected");
    localRpc = null;
    if (onStatusChange) onStatusChange({ connected: false, message: "Disconnected from Discord" });
    scheduleReconnect();
  });

  return localRpc;
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  if (!clientId) return;

  reconnectAttempts++;
  const delay = Math.min(
    INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1),
    MAX_RECONNECT_DELAY
  );

  logInfo(`Reconnect scheduled in ${Math.round(delay / 1000)}s (attempt ${reconnectAttempts})`);

  if (onStatusChange) {
    onStatusChange({ connected: false, message: `Reconnecting in ${Math.round(delay / 1000)}s...` });
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delay);
}

function cancelReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  reconnectAttempts = 0;
}

function connect() {
  cancelReconnect();

  if (mode === "gateway") {
    if (onStatusChange) onStatusChange({ connected: false, message: "Connecting via Gateway..." });
    connectGateway(clientId, currentConfig, (status) => {
      if (status.connected) reconnectAttempts = 0;
      if (onStatusChange) onStatusChange(status);
    });
    return true;
  }

  createLocalClient();
  localRpc.login({ clientId }).catch((err) => logError("local login", err));
  return true;
}

export function startLocalRPC(id, config, statusCallback) {
  logInfo(`startLocalRPC called with clientId: ${id}`);
  stopRPC();
  mode = "local";
  clientId = id;
  currentConfig = config;
  onStatusChange = statusCallback || null;
  cancelReconnect();
  return connect();
}

export function startGatewayRPC(token, config, statusCallback) {
  logInfo("startGatewayRPC called");
  stopRPC();
  mode = "gateway";
  clientId = token;
  currentConfig = config;
  onStatusChange = statusCallback || null;
  cancelReconnect();
  return connect();
}

export function stopRPC() {
  logInfo("Stopping RPC...");
  cancelReconnect();
  if (mode === "gateway") {
    disconnectGateway();
  } else if (localRpc) {
    localRpc.destroy();
    localRpc = null;
  }
  mode = null;
  clientId = null;
  currentConfig = null;
  onStatusChange = null;
}

export function updateActivity(config) {
  currentConfig = config;
  if (mode === "gateway") {
    updateGatewayActivity(config);
    return Promise.resolve();
  }
  if (!localRpc) return Promise.reject(new Error("RPC not connected"));
  return localRpc.setActivity(buildActivity(config));
}

export function isConnected() {
  if (mode === "gateway") return isGatewayConnected();
  return localRpc !== null;
}

export function getMode() {
  return mode;
}

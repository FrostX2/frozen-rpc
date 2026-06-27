import WebSocket from "ws";
import { logInfo, logWarn, logError } from "./logger.js";

const GATEWAY = "wss://gateway.discord.gg/?v=10&encoding=json";

let ws = null;
let heartbeatInterval = null;
let sequence = null;
let sessionId = null;
let onStatusChange = null;
let currentActivity = null;

function buildActivityPayload(config) {
  const activity = { name: "Custom RPC", type: 0 };
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

function send(data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function sendPresence() {
  if (!currentActivity) return;
  send({
    op: 3,
    d: {
      since: 0,
      activities: [currentActivity],
      status: "online",
      afk: false,
    },
  });
}

function startHeartbeat(interval) {
  stopHeartbeat();
  logInfo(`Gateway heartbeat every ${interval}ms`);
  heartbeatInterval = setInterval(() => {
    send({ op: 1, d: sequence });
  }, interval);
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

export function connectGateway(token, config, statusCallback) {
  if (ws) disconnectGateway();
  logInfo("Connecting to Discord Gateway...");

  onStatusChange = statusCallback;
  currentActivity = buildActivityPayload(config);

  ws = new WebSocket(GATEWAY);

  ws.on("open", () => {
    logInfo("Gateway WebSocket opened");
    if (onStatusChange) onStatusChange({ connected: false, message: "Connecting to Gateway..." });
  });

  ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());

    switch (msg.op) {
      case 10: {
        logInfo("Gateway: received Hello (OP 10), sending Identify...");
        startHeartbeat(msg.d.heartbeat_interval);
        send({
          op: 2,
          d: {
            token,
            properties: {
              os: process.platform,
              browser: "custom-discord-rpc",
              device: "custom-discord-rpc",
            },
            presence: {
              activities: currentActivity ? [currentActivity] : [],
              status: "online",
              afk: false,
              since: 0,
            },
          },
        });
        break;
      }
      case 0: {
        sequence = msg.s;
        if (msg.t === "READY") {
          sessionId = msg.d.session_id;
          logInfo(`Gateway ready: ${msg.d.user.username} (session: ${sessionId})`);
          if (onStatusChange) onStatusChange({ connected: true, message: `Connected as ${msg.d.user.username}` });
        }
        break;
      }
      case 7: {
        logWarn("Gateway: Reconnect requested (OP 7)");
        if (onStatusChange) onStatusChange({ connected: false, message: "Reconnecting..." });
        break;
      }
      case 9: {
        logError("Gateway", new Error("Invalid session (OP 9)"));
        if (onStatusChange) onStatusChange({ connected: false, message: "Invalid session" });
        break;
      }
      default: {
        if (msg.op !== 1 && msg.op !== 11) {
          logInfo(`Gateway: OP ${msg.op}${msg.t ? ` / ${msg.t}` : ""}`);
        }
      }
    }
  });

  ws.on("close", (code, reason) => {
    stopHeartbeat();
    ws = null;
    logWarn(`Gateway closed: code=${code} reason=${reason || "none"}`);
    if (onStatusChange) onStatusChange({ connected: false, message: "Disconnected from Gateway" });
  });

  ws.on("error", (err) => {
    logError("Gateway WebSocket", err);
    if (onStatusChange) onStatusChange({ connected: false, message: err.message });
  });
}

export function updateGatewayActivity(config) {
  currentActivity = buildActivityPayload(config);
  sendPresence();
  logInfo("Gateway activity updated");
}

export function disconnectGateway() {
  logInfo("Disconnecting from Gateway...");
  stopHeartbeat();
  if (ws) {
    ws.close(1000, "User requested");
    ws = null;
  }
  sessionId = null;
  sequence = null;
  currentActivity = null;
  onStatusChange = null;
}

export function isGatewayConnected() {
  return ws !== null && ws.readyState === WebSocket.OPEN;
}

import WebSocket from "ws";
import { logInfo, logWarn, logError } from "./logger.js";
import { buildActivity } from "./activity.js";

const GATEWAY = "wss://gateway.discord.gg/?v=10&encoding=json";
const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 2000;

let ws = null;
let heartbeatInterval = null;
let sequence = null;
let sessionId = null;
let onStatusChange = null;
let currentActivity = null;

let reconnectTimer = null;
let reconnectAttempts = 0;
let connectionConfig = null;
let intentionalClose = false;

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

function scheduleReconnect() {
  if (intentionalClose || !connectionConfig) return;
  if (reconnectTimer) return;

  reconnectAttempts++;
  const delay = Math.min(
    INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1),
    MAX_RECONNECT_DELAY
  );

  logInfo(`Gateway reconnect scheduled in ${Math.round(delay / 1000)}s (attempt ${reconnectAttempts})`);

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
  if (!connectionConfig) return;

  const { token } = connectionConfig;

  logInfo("Connecting to Discord Gateway...");
  if (onStatusChange) onStatusChange({ connected: false, message: "Connecting to Gateway..." });

  ws = new WebSocket(GATEWAY);

  ws.on("open", () => {
    logInfo("Gateway WebSocket opened");
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
              browser: "frozen-rpc",
              device: "frozen-rpc",
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
          reconnectAttempts = 0;
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
        if (onStatusChange) onStatusChange({ connected: false, message: "Invalid session, reconnecting..." });
        scheduleReconnect();
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
    scheduleReconnect();
  });

  ws.on("error", (err) => {
    logError("Gateway WebSocket", err);
    if (onStatusChange) onStatusChange({ connected: false, message: err.message });
  });
}

export function connectGateway(token, config, statusCallback) {
  if (ws) disconnectGateway();
  intentionalClose = false;

  onStatusChange = statusCallback;
  currentActivity = { name: "Custom RPC", type: 0, ...buildActivity(config) };
  connectionConfig = { token };

  connect();
}

export function updateGatewayActivity(config) {
  currentActivity = { name: "Custom RPC", type: 0, ...buildActivity(config) };
  sendPresence();
  logInfo("Gateway activity updated");
}

export function disconnectGateway() {
  logInfo("Disconnecting from Gateway...");
  intentionalClose = true;
  cancelReconnect();
  stopHeartbeat();
  if (ws) {
    ws.close(1000, "User requested");
    ws = null;
  }
  sessionId = null;
  sequence = null;
  currentActivity = null;
  onStatusChange = null;
  connectionConfig = null;
  reconnectAttempts = 0;
}

export function isGatewayConnected() {
  return ws !== null && ws.readyState === WebSocket.OPEN;
}

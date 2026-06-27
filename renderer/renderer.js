document.addEventListener("DOMContentLoaded", async () => {
  const $ = (id) => document.getElementById(id);

  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");

  let connected = false;
  let rpcMode = "local";

  // ── Tab switching ──

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      tabContents.forEach((tc) => tc.classList.remove("active"));
      $(`tab-${tab.dataset.tab}`).classList.add("active");
    });
  });

  // ── Mode switching ──

  document.querySelectorAll('input[name="mode"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      rpcMode = radio.value;
      $("localFields").style.display = radio.value === "local" ? "" : "none";
      $("gatewayFields").style.display = radio.value === "gateway" ? "" : "none";
    });
  });

  // ── RPC form ──

  function readForm() {
    const startVal = $("startTimestamp").value;
    const endVal = $("endTimestamp").value;

    let startTimestamp = undefined;
    let endTimestamp = undefined;

    if ($("showTime").checked && !startVal) {
      startTimestamp = Date.now();
    } else if (startVal) {
      startTimestamp = new Date(startVal).getTime();
    }
    if (endVal) endTimestamp = new Date(endVal).getTime();

    const buttons = [];
    document.querySelectorAll(".button-row").forEach((row) => {
      const label = row.querySelector(".btn-label").value.trim();
      const url = row.querySelector(".btn-url").value.trim();
      if (label && url) buttons.push({ label, url });
    });

    return {
      details: $("details").value.trim(),
      state: $("state").value.trim(),
      largeImageKey: $("largeImageKey").value.trim(),
      largeImageText: $("largeImageText").value.trim(),
      smallImageKey: $("smallImageKey").value.trim(),
      smallImageText: $("smallImageText").value.trim(),
      startTimestamp,
      endTimestamp,
      partyId: $("partyId").value.trim(),
      partySize: $("partySize").value !== "" ? parseInt($("partySize").value, 10) : undefined,
      partyMax: $("partyMax").value !== "" ? parseInt($("partyMax").value, 10) : undefined,
      joinSecret: $("joinSecret").value.trim(),
      spectateSecret: $("spectateSecret").value.trim(),
      matchSecret: $("matchSecret").value.trim(),
      instance: $("instance").checked,
      showTime: $("showTime").checked,
      buttons,
    };
  }

  function fillFormFromConfig(cfg) {
    if (!cfg) return;
    $("details").value = cfg.details || "";
    $("state").value = cfg.state || "";
    $("largeImageKey").value = cfg.largeImageKey || "";
    $("largeImageText").value = cfg.largeImageText || "";
    $("smallImageKey").value = cfg.smallImageKey || "";
    $("smallImageText").value = cfg.smallImageText || "";
    $("partyId").value = cfg.partyId || "";
    $("partySize").value = cfg.partySize ?? "";
    $("partyMax").value = cfg.partyMax ?? "";
    $("joinSecret").value = cfg.joinSecret || "";
    $("spectateSecret").value = cfg.spectateSecret || "";
    $("matchSecret").value = cfg.matchSecret || "";
    $("showTime").checked = cfg.showTime !== false;
    $("instance").checked = !!cfg.instance;

    if (cfg.startTimestamp) $("startTimestamp").value = toDatetimeLocal(new Date(cfg.startTimestamp));
    if (cfg.endTimestamp) $("endTimestamp").value = toDatetimeLocal(new Date(cfg.endTimestamp));

    if (cfg.buttons) {
      document.querySelectorAll(".button-row").forEach((row, i) => {
        const btn = cfg.buttons[i];
        if (btn) {
          row.querySelector(".btn-label").value = btn.label || "";
          row.querySelector(".btn-url").value = btn.url || "";
        }
      });
    }
  }

  function toDatetimeLocal(date) {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
  }

  function setStatus(conn, msg) {
    connected = conn;
    $("statusDot").className = "status-dot " + (conn ? "connected" : "disconnected");
    $("statusText").textContent = msg || (conn ? "Connected" : "Disconnected");
    const mode = conn ? (rpcMode === "gateway" ? "via Gateway" : "via IPC") : "";
    $("modeLabel").textContent = mode;
    $("connectBtn").disabled = conn;
    $("disconnectBtn").disabled = !conn;
    $("updateBtn").disabled = !conn;
    $("connectBtn").textContent = conn ? "Connected" : "Connect";
  }

  window.rpcAPI.onStatusChange((status) => {
    setStatus(status.connected, status.message);
  });

  // ── Connect / Disconnect / Update ──

  $("connectBtn").addEventListener("click", async () => {
    if (rpcMode === "local") {
      const clientId = $("clientId").value.trim();
      if (!clientId) { $("statusText").textContent = "Enter a Client ID"; return; }
      $("connectBtn").textContent = "Connecting...";
      $("connectBtn").disabled = true;
      const result = await window.rpcAPI.startLocalRPC(clientId, readForm());
      if (!result.success) {
        setStatus(false, "Error: " + (result.error || "Failed"));
        $("connectBtn").textContent = "Connect";
        $("connectBtn").disabled = false;
      }
    } else {
      const select = $("accountSelect");
      const accountId = select.value;
      if (!accountId) { $("statusText").textContent = "Select an account first"; return; }
      const accounts = await window.rpcAPI.getAccounts();
      const account = accounts.find((a) => a.id === accountId);
      if (!account) { $("statusText").textContent = "Account not found"; return; }
      $("connectBtn").textContent = "Connecting...";
      $("connectBtn").disabled = true;
      const result = await window.rpcAPI.startGatewayRPC(account.access_token, readForm());
      if (!result.success) {
        setStatus(false, "Error: " + (result.error || "Failed"));
        $("connectBtn").textContent = "Connect";
        $("connectBtn").disabled = false;
      }
    }
  });

  $("updateBtn").addEventListener("click", async () => {
    const result = await window.rpcAPI.updateActivity(readForm());
    if (result.success) {
      $("statusText").textContent = "Presence updated!";
      setTimeout(() => { if (connected) setStatus(true, "Connected"); }, 2000);
    } else {
      $("statusText").textContent = "Update failed";
    }
  });

  $("disconnectBtn").addEventListener("click", async () => {
    await window.rpcAPI.stopRPC();
    setStatus(false, "Disconnected");
  });

  // ── Auth tab ──

  async function loadAuthConfig() {
    const cfg = await window.rpcAPI.getAppConfig();
    if (cfg) {
      $("authClientId").value = cfg.clientId || "";
      $("authClientSecret").value = cfg.clientSecret || "";
      $("authRedirectUri").value = cfg.redirectUri || "http://localhost:53173/callback";
    }
    $("loginBtn").disabled = !$("authClientId").value.trim() || !$("authClientSecret").value.trim();
  }

  function checkLoginReady() {
    $("loginBtn").disabled = !$("authClientId").value.trim() || !$("authClientSecret").value.trim();
  }

  $("authClientId").addEventListener("input", checkLoginReady);
  $("authClientSecret").addEventListener("input", checkLoginReady);

  $("saveCredentialsBtn").addEventListener("click", async () => {
    await window.rpcAPI.saveAppConfig({
      clientId: $("authClientId").value.trim(),
      clientSecret: $("authClientSecret").value.trim(),
      redirectUri: $("authRedirectUri").value.trim(),
    });
    $("statusText").textContent = "Credentials saved!";
    setTimeout(() => { if (!connected) $("statusText").textContent = "Disconnected"; }, 2000);
  });

  $("loginBtn").addEventListener("click", async () => {
    $("loginBtn").textContent = "Authorizing...";
    $("loginBtn").disabled = true;
    const result = await window.rpcAPI.startOAuth({
      clientId: $("authClientId").value.trim(),
      clientSecret: $("authClientSecret").value.trim(),
      redirectUri: $("authRedirectUri").value.trim(),
    });
    $("loginBtn").textContent = "Login with Discord";
    checkLoginReady();
    if (result.success) {
      $("statusText").textContent = `Logged in as ${result.user.username}!`;
      renderAccounts();
    } else {
      $("statusText").textContent = "Auth failed: " + (result.error || "Unknown error");
    }
  });

  async function renderAccounts() {
    const accounts = await window.rpcAPI.getAccounts();
    const container = $("accountList");
    const select = $("accountSelect");
    select.innerHTML = "";

    if (!accounts.length) {
      container.innerHTML = '<p class="muted">No accounts authorized yet.</p>';
      select.innerHTML = '<option value="">No accounts</option>';
      return;
    }

    let html = "";
    select.innerHTML = '<option value="">Select an account...</option>';
    for (const acc of accounts) {
      const avatar = acc.avatar ? acc.avatar : "";
      html += `<div class="account-item">
        <img class="avatar" src="${avatar}" alt="" onerror="this.style.display='none'">
        <span>${acc.username}</span>
        <button class="btn-small danger" data-id="${acc.id}">Remove</button>
      </div>`;
      const opt = document.createElement("option");
      opt.value = acc.id;
      opt.textContent = acc.username;
      select.appendChild(opt);
    }
    container.innerHTML = html;

    container.querySelectorAll(".btn-small.danger").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await window.rpcAPI.deleteAccount(btn.dataset.id);
        renderAccounts();
      });
    });
  }

  // ── Export / Import ──

  $("exportBtn").addEventListener("click", async () => {
    const result = await window.rpcAPI.exportData();
    if (result.success) {
      $("statusText").textContent = `Exported to ${result.path}`;
      setTimeout(() => { if (!connected) $("statusText").textContent = "Disconnected"; }, 3000);
    }
  });

  $("importBtn").addEventListener("click", async () => {
    const result = await window.rpcAPI.importData();
    if (result.success) {
      $("statusText").textContent = "Data imported successfully!";
      renderAccounts();
      renderPresets();
    }
  });

  // ── Presets tab ──

  $("savePresetBtn").addEventListener("click", async () => {
    const name = $("presetName").value.trim();
    if (!name) { $("statusText").textContent = "Enter a preset name"; return; }
    await window.rpcAPI.savePreset(name, readForm());
    $("presetName").value = "";
    $("statusText").textContent = "Preset saved!";
    setTimeout(() => { if (!connected) $("statusText").textContent = "Disconnected"; }, 2000);
    renderPresets();
  });

  async function renderPresets() {
    const presets = await window.rpcAPI.getPresets();
    const container = $("presetList");
    if (!presets.length) {
      container.innerHTML = '<p class="muted">No presets saved yet.</p>';
      return;
    }

    container.innerHTML = presets.map((p) => {
      const cfg = JSON.parse(p.config);
      return `<div class="preset-item">
        <div class="preset-info">
          <strong>${p.name}</strong>
          <span class="preset-preview">${cfg.details || ""}${cfg.details && cfg.state ? " — " : ""}${cfg.state || ""}</span>
        </div>
        <div class="preset-actions">
          <button class="btn-small" data-load="${p.id}">Load</button>
          <button class="btn-small danger" data-del="${p.id}">Delete</button>
        </div>
      </div>`;
    }).join("");

    container.querySelectorAll("[data-load]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.load;
        const presets = await window.rpcAPI.getPresets();
        const p = presets.find((x) => x.id === id);
        if (p) {
          fillFormFromConfig(JSON.parse(p.config));
          $("statusText").textContent = `Loaded "${p.name}"`;
          document.querySelector('[data-tab="rpc"]').click();
          setTimeout(() => { if (!connected) $("statusText").textContent = "Disconnected"; }, 2000);
        }
      });
    });

    container.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await window.rpcAPI.deletePreset(parseInt(btn.dataset.del, 10));
        renderPresets();
      });
    });
  }

  // ── Settings tab ──

  async function loadSettings() {
    const cfg = await window.rpcAPI.getAppConfig();
    if (cfg) $("settingsClientId").value = cfg.clientId || "";
  }

  $("settingsClientId").addEventListener("change", async () => {
    const cfg = await window.rpcAPI.getAppConfig();
    cfg.clientId = $("settingsClientId").value.trim();
    await window.rpcAPI.saveAppConfig(cfg);
  });

  async function loadLog() {
    $("logViewer").value = await window.rpcAPI.getLog();
    $("logViewer").scrollTop = $("logViewer").scrollHeight;
  }

  $("openLogBtn").addEventListener("click", () => window.rpcAPI.openLogFolder());
  $("refreshLogBtn").addEventListener("click", loadLog);
  $("clearLogBtn").addEventListener("click", async () => {
    await window.rpcAPI.clearLog();
    loadLog();
  });

  // Auto-refresh log every 3s when on Settings tab
  setInterval(async () => {
    const settingsTab = document.getElementById("tab-settings");
    if (settingsTab && settingsTab.classList.contains("active")) {
      loadLog();
    }
  }, 3000);

  // ── Init ──

  const appConfig = await window.rpcAPI.getAppConfig();
  if (appConfig) {
    $("clientId").value = appConfig.clientId || "";
    $("authClientId").value = appConfig.clientId || "";
    $("authClientSecret").value = appConfig.clientSecret || "";
    $("authRedirectUri").value = appConfig.redirectUri || "http://localhost:53173/callback";
    $("settingsClientId").value = appConfig.clientId || "";
  }
  checkLoginReady();
  await renderAccounts();
  await renderPresets();
});

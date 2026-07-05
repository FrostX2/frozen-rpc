import { join } from "path";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "fs";
import { app } from "electron";
import { logInfo, logError, logWarn } from "./logger.js";

const DATA_FILE = "app-data.json";
const PROFILES_DIR = "profiles";
const WRITE_DEBOUNCE_MS = 500;

let cache = null;
let writeTimer = null;

function getDataPath() {
  return join(app.getPath("userData"), DATA_FILE);
}

function getProfilesDir() {
  const dir = join(app.getPath("userData"), PROFILES_DIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function loadCache() {
  if (cache) return cache;
  try {
    const path = getDataPath();
    if (!existsSync(path)) {
      cache = { config: {}, accounts: [] };
      return cache;
    }
    cache = JSON.parse(readFileSync(path, "utf-8"));
    if (!cache.config) cache.config = {};
    if (!cache.accounts) cache.accounts = [];
    return cache;
  } catch (err) {
    logError("readData", err);
    cache = { config: {}, accounts: [] };
    return cache;
  }
}

function scheduleWrite() {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    writeTimer = null;
    if (!cache) return;
    try {
      writeFileSync(getDataPath(), JSON.stringify(cache, null, 2));
    } catch (err) {
      logError("writeData", err);
    }
  }, WRITE_DEBOUNCE_MS);
}

function flushWrite() {
  if (writeTimer) {
    clearTimeout(writeTimer);
    writeTimer = null;
  }
  if (!cache) return;
  writeFileSync(getDataPath(), JSON.stringify(cache, null, 2));
}

function sanitizeFilename(name) {
  return name.replace(/[/\\?%*:|"<>]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").trim() || "unnamed";
}

export function initDB() {
  loadCache();
  getProfilesDir();
  logInfo("Storage initialized at " + app.getPath("userData"));
}

export function flushDB() {
  flushWrite();
}

export function getConfig(key) {
  return loadCache().config[key] ?? null;
}

export function setConfig(key, value) {
  loadCache().config[key] = value;
  scheduleWrite();
}

export function getAccounts() {
  return [...loadCache().accounts].sort((a, b) => a.username.localeCompare(b.username));
}

export function getAccount(id) {
  return loadCache().accounts.find((a) => a.id === id) || null;
}

export function getAccountByToken(token) {
  return loadCache().accounts.find((a) => a.access_token === token) || null;
}

export function saveAccount(account) {
  const data = loadCache();
  const idx = data.accounts.findIndex((a) => a.id === account.id);
  if (idx >= 0) {
    data.accounts[idx] = account;
  } else {
    data.accounts.push(account);
  }
  scheduleWrite();
  logInfo(`Account saved: ${account.username} (${account.id})`);
}

export function deleteAccount(id) {
  const data = loadCache();
  data.accounts = data.accounts.filter((a) => a.id !== id);
  scheduleWrite();
}

export function getProfiles() {
  const dir = getProfilesDir();
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  return files
    .map((f) => {
      try {
        const content = JSON.parse(readFileSync(join(dir, f), "utf-8"));
        return {
          name: content.name,
          config: JSON.stringify(content.config),
          created_at: content.created_at,
        };
      } catch (err) {
        logWarn(`Failed to read profile ${f}: ${err.message}`);
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function saveProfile(name, config) {
  const dir = getProfilesDir();
  const filename = sanitizeFilename(name) + ".json";
  const profile = { name, config, created_at: Date.now() };
  writeFileSync(join(dir, filename), JSON.stringify(profile, null, 2));
  logInfo(`Profile saved: "${name}"`);
  return name;
}

export function deleteProfile(name) {
  const dir = getProfilesDir();
  const filename = sanitizeFilename(name) + ".json";
  const filePath = join(dir, filename);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
    logInfo(`Profile deleted: "${name}"`);
  }
}

export function exportAllData() {
  const data = loadCache();
  return {
    config: Object.entries(data.config).map(([key, value]) => ({ key, value })),
    accounts: data.accounts,
    profiles: getProfiles(),
  };
}

export function importAllData(data) {
  if (data.config) {
    for (const row of data.config) {
      setConfig(row.key, row.value);
    }
  }
  if (data.accounts) {
    for (const acc of data.accounts) {
      saveAccount(acc);
    }
  }
  if (data.profiles) {
    for (const p of data.profiles) {
      const cfg = typeof p.config === "string" ? JSON.parse(p.config) : p.config;
      saveProfile(p.name, cfg);
    }
  }
  logInfo("Data imported successfully");
}

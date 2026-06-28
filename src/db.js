import Database from "better-sqlite3";
import { join } from "path";
import { existsSync, unlinkSync } from "fs";
import { app } from "electron";
import { logInfo, logError, logWarn } from "./logger.js";

let db;
let dbPath;

function getDBPath() {
  if (!dbPath) dbPath = join(app.getPath("userData"), "rpc.db");
  return dbPath;
}

function migrateOldDB() {
  try {
    const oldPath = join(app.getAppPath(), "rpc.db");
    if (!existsSync(oldPath)) return;

    const hasAccounts = db.prepare("SELECT COUNT(*) as c FROM accounts").get().c > 0;
    if (hasAccounts) return;

    logInfo(`Migrating data from old database: ${oldPath}`);
    const oldDB = new Database(oldPath);

    const oldConfig = oldDB.prepare("SELECT * FROM config").all();
    for (const row of oldConfig) {
      db.prepare("INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)").run(row.key, row.value);
    }

    const oldAccounts = oldDB.prepare("SELECT * FROM accounts").all();
    for (const acc of oldAccounts) {
      db.prepare(`
        INSERT OR IGNORE INTO accounts (id, username, avatar, access_token, refresh_token, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(acc.id, acc.username, acc.avatar, acc.access_token, acc.refresh_token, acc.expires_at);
    }

    const oldProfiles = oldDB.prepare("SELECT * FROM presets").all();
    for (const p of oldProfiles) {
      db.prepare(`
        INSERT OR IGNORE INTO profiles (id, name, config, created_at)
        VALUES (?, ?, ?, ?)
      `).run(p.id, p.name, p.config, p.created_at);
    }

    oldDB.close();
    unlinkSync(oldPath);
    logInfo("Old database migrated and removed");
  } catch (err) {
    logWarn(`Old database migration skipped: ${err.message}`);
  }
}

export function initDB() {
  try {
    db = new Database(getDBPath());
    db.pragma("journal_mode = WAL");

    db.exec(`
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
      );
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        avatar TEXT,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        config TEXT NOT NULL,
        created_at INTEGER DEFAULT (unixepoch())
      );
    `);

    migrateOldDB();

    logInfo(`Database initialized: ${dbPath}`);
  } catch (err) {
    logError("Database init", err);
    throw err;
  }
  return db;
}

export function getDB() {
  if (!db) initDB();
  return db;
}

export function getConfig(key) {
  const row = getDB().prepare("SELECT value FROM config WHERE key = ?").get(key);
  return row ? row.value : null;
}

export function setConfig(key, value) {
  getDB().prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)").run(key, value);
}

export function getAccounts() {
  return getDB().prepare("SELECT * FROM accounts ORDER BY username").all();
}

export function getAccount(id) {
  return getDB().prepare("SELECT * FROM accounts WHERE id = ?").get(id);
}

export function getAccountByToken(token) {
  return getDB().prepare("SELECT * FROM accounts WHERE access_token = ?").get(token);
}

export function saveAccount(account) {
  getDB().prepare(`
    INSERT OR REPLACE INTO accounts (id, username, avatar, access_token, refresh_token, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(account.id, account.username, account.avatar || null, account.access_token, account.refresh_token || null, account.expires_at || null);
  logInfo(`Account saved: ${account.username} (${account.id})`);
}

export function deleteAccount(id) {
  getDB().prepare("DELETE FROM accounts WHERE id = ?").run(id);
}

export function getProfiles() {
  return getDB().prepare("SELECT * FROM profiles ORDER BY name").all();
}

export function getProfile(id) {
  return getDB().prepare("SELECT * FROM profiles WHERE id = ?").get(id);
}

export function saveProfile(name, config) {
  const existing = getDB().prepare("SELECT id FROM profiles WHERE name = ?").get(name);
  if (existing) {
    getDB().prepare("UPDATE profiles SET config = ?, created_at = unixepoch() WHERE id = ?").run(JSON.stringify(config), existing.id);
    logInfo(`Profile updated: "${name}"`);
    return existing.id;
  }
  const result = getDB().prepare("INSERT INTO profiles (name, config) VALUES (?, ?)").run(name, JSON.stringify(config));
  logInfo(`Profile created: "${name}"`);
  return result.lastInsertRowid;
}

export function deleteProfile(id) {
  getDB().prepare("DELETE FROM profiles WHERE id = ?").run(id);
}

export function exportAllData() {
  return {
    config: getDB().prepare("SELECT * FROM config").all(),
    accounts: getAccounts(),
    profiles: getProfiles(),
  };
}

export function importAllData(data) {
  const database = getDB();
  const tx = database.transaction(() => {
    if (data.config) {
      for (const row of data.config) {
        database.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)").run(row.key, row.value);
      }
    }
    if (data.accounts) {
      for (const acc of data.accounts) {
        database.prepare(`
          INSERT OR REPLACE INTO accounts (id, username, avatar, access_token, refresh_token, expires_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(acc.id, acc.username, acc.avatar, acc.access_token, acc.refresh_token, acc.expires_at);
      }
    }
    if (data.profiles) {
      for (const p of data.profiles) {
        database.prepare(`
          INSERT OR REPLACE INTO profiles (id, name, config, created_at)
          VALUES (?, ?, ?, ?)
        `).run(p.id, p.name, p.config, p.created_at);
      }
    }
  });
  tx();
  logInfo("Data imported successfully");
}

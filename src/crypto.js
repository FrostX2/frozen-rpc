import { safeStorage } from "electron";

const PREFIX = "enc:";

export function isEncryptionAvailable() {
  return safeStorage.isEncryptionAvailable();
}

export function encrypt(plaintext) {
  if (!plaintext || !isEncryptionAvailable()) return plaintext;
  try {
    const buf = safeStorage.encryptString(plaintext);
    return PREFIX + buf.toString("base64");
  } catch {
    return plaintext;
  }
}

export function decrypt(value) {
  if (!value || typeof value !== "string" || !value.startsWith(PREFIX)) return value;
  try {
    const base64 = value.slice(PREFIX.length);
    const buf = Buffer.from(base64, "base64");
    return safeStorage.decryptString(buf);
  } catch {
    return value;
  }
}

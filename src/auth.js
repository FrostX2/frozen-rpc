import { logInfo, logError } from "./logger.js";

const TOKEN_URL = "https://discord.com/api/oauth2/token";

export function buildAuthURL(clientId, redirectUri) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify rpc rpc.activities.write",
  });
  return `https://discord.com/api/oauth2/authorize?${params}`;
}

export async function exchangeCode(code, clientId, clientSecret, redirectUri) {
  logInfo("Exchanging auth code for token...");

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  logInfo("Token exchange successful");
  return data;
}

export async function refreshToken(tokenData, clientId, clientSecret) {
  if (!tokenData.refresh_token) {
    throw new Error("No refresh token available");
  }

  logInfo("Refreshing token...");

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: tokenData.refresh_token,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  logInfo("Token refreshed");
  return data;
}

export async function fetchDiscordUser(accessToken) {
  logInfo("Fetching Discord user info...");

  const res = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch user: ${res.status} ${text}`);
  }

  const user = await res.json();
  logInfo(`User fetched: ${user.username} (${user.id})`);
  return user;
}

export function buildActivity(config) {
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
  if (config.partyId || config.partySize !== undefined || config.partyMax !== undefined) {
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

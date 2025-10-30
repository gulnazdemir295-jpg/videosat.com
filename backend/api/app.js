require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const {
  IVSClient,
  CreateChannelCommand,
  CreateStreamKeyCommand,
  ListChannelsCommand,
  ListStreamKeysCommand,
  GetChannelCommand,
  DeleteChannelCommand,
  DeleteStreamKeyCommand,
  StopStreamCommand
} = require('@aws-sdk/client-ivs');
const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');

// In-memory stores (POC). Replace with DB in production.
const users = new Map(); // key: email, value: { email, hasTime }
const ivsAssignments = new Map(); // key: email, value: { endpoint, playbackUrl, streamKey (never returned directly) }

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
let CURRENT_REGION = process.env.IVS_REGION || process.env.AWS_REGION || 'eu-central-1';
let CURRENT_CREDS = null; // { accessKeyId, secretAccessKey }
let ivsClient = new IVSClient({ region: CURRENT_REGION });
let stsClient = new STSClient({ region: CURRENT_REGION });

// Seed: sample user with payment time
users.set('hammaddeci.videosat.com', { email: 'hammaddeci.videosat.com', hasTime: true });

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

function requireAdmin(req, res, next) {
  const token = req.header('x-admin-token') || '';
  if (!ADMIN_TOKEN || token === ADMIN_TOKEN) return next();
  return res.status(401).json({ error: 'unauthorized' });
}

// Payment status
app.get('/api/payments/status', (req, res) => {
  const email = req.query.userEmail || '';
  const u = users.get(email);
  res.json({ hasTime: !!(u && u.hasTime) });
});

// Admin: assign IVS config to a user (manual enter from AWS IVS)
app.post('/api/admin/ivs/assign', (req, res) => {
  const { userEmail, endpoint, playbackUrl, streamKey } = req.body || {};
  if (!userEmail || !endpoint || !playbackUrl || !streamKey) {
    return res.status(400).json({ error: 'userEmail, endpoint, playbackUrl, streamKey required' });
  }
  ivsAssignments.set(userEmail, { endpoint, playbackUrl, streamKey });
  if (!users.has(userEmail)) users.set(userEmail, { email: userEmail, hasTime: true });
  res.json({ ok: true });
});

// --- Streamers and payments (POC) ---
// streamerEmail -> { email, minutesPurchased: number, minutesUsed: number }
const streamers = new Map();
// simple payments log
const payments = [];

// Admin: set AWS credentials dynamically (POC - in-memory)
app.post('/api/admin/aws/creds', requireAdmin, (req, res) => {
  const { accessKeyId, secretAccessKey, region } = req.body || {};
  if (!accessKeyId || !secretAccessKey) return res.status(400).json({ error: 'accessKeyId and secretAccessKey required' });
  CURRENT_CREDS = { accessKeyId, secretAccessKey };
  if (region) CURRENT_REGION = region;
  ivsClient = new IVSClient({ region: CURRENT_REGION, credentials: CURRENT_CREDS });
  stsClient = new STSClient({ region: CURRENT_REGION, credentials: CURRENT_CREDS });
  return res.json({ ok: true, region: CURRENT_REGION });
});

// Admin: verify AWS connectivity (STS + simple IVS call)
app.get('/api/admin/aws/verify', requireAdmin, async (req, res) => {
  try {
    const sts = await stsClient.send(new GetCallerIdentityCommand({}));
    let ivsOk = true;
    try {
      await ivsClient.send(new ListChannelsCommand({ maxResults: 1 }));
    } catch (e) {
      ivsOk = false;
    }
    return res.json({ ok: true, account: sts.Account, userId: sts.UserId, arn: sts.Arn, region: CURRENT_REGION, ivsOk });
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'verify_failed', detail: String(err && err.message || err) });
  }
});

// Admin: add/update streamer minutes
app.post('/api/admin/streamers/add', requireAdmin, (req, res) => {
  const { email, minutes } = req.body || {};
  if (!email || !Number.isFinite(minutes)) return res.status(400).json({ error: 'email and minutes required' });
  const s = streamers.get(email) || { email, minutesPurchased: 0, minutesUsed: 0 };
  s.minutesPurchased += Math.max(0, Math.floor(minutes));
  streamers.set(email, s);
  payments.push({ id: Date.now(), email, minutes: Math.floor(minutes), at: new Date().toISOString() });
  return res.json({ ok: true, streamer: s });
});

// Admin: list streamers
app.get('/api/admin/streamers', requireAdmin, (req, res) => {
  return res.json({ streamers: Array.from(streamers.values()) });
});

// Admin: list payments
app.get('/api/admin/payments', requireAdmin, (req, res) => {
  return res.json({ payments });
});

// Get streamer status
app.get('/api/streamers/:email/status', (req, res) => {
  const s = streamers.get(req.params.email) || { email: req.params.email, minutesPurchased: 0, minutesUsed: 0 };
  const minutesRemaining = Math.max(0, s.minutesPurchased - s.minutesUsed);
  return res.json({ email: s.email, minutesRemaining, minutesPurchased: s.minutesPurchased, minutesUsed: s.minutesUsed });
});

// Track active broadcast timers to auto-stop
// broadcastId -> timeoutId
const autoStopTimers = new Map();

// --- AWS IVS: per-broadcast lifecycle ---
// In-memory map: broadcastId -> { channelArn, streamKeyArn, ingestEndpoint, playbackUrl, streamKey }
const broadcasts = new Map();

// Create IVS channel + stream key for a broadcast
app.post('/api/admin/ivs/channel', requireAdmin, async (req, res) => {
  try {
    const {
      broadcastId,
      name,
      type = 'BASIC', // BASIC | STANDARD | ADVANCED_SD | ADVANCED_HD
      latencyMode = 'LOW', // NORMAL | LOW
      authorized = false
    } = req.body || {};
    if (!broadcastId) return res.status(400).json({ error: 'broadcastId required' });

    const channelName = name || `basvideo-${broadcastId}-${Date.now()}`;
    const createResp = await ivsClient.send(new CreateChannelCommand({
      name: channelName,
      type,
      latencyMode,
      authorized
    }));

    const channel = createResp.channel;
    const channelArn = channel.arn;
    const ingestEndpoint = channel.ingestEndpoint; // rtmps://{endpoint}:443/app/
    const playbackUrl = channel.playbackUrl;

    const keyResp = await ivsClient.send(new CreateStreamKeyCommand({ channelArn }));
    const streamKeyArn = keyResp.streamKey.arn;
    const streamKey = keyResp.streamKey.value;

    broadcasts.set(broadcastId, { channelArn, streamKeyArn, ingestEndpoint, playbackUrl, streamKey });

    return res.json({
      ok: true,
      broadcastId,
      channelArn,
      streamKeyArn,
      ingest: `rtmps://${ingestEndpoint}:443/app/`,
      playbackUrl,
      streamKey
    });
  } catch (err) {
    return res.status(500).json({ error: 'create_failed', detail: String(err && err.message || err) });
  }
});

// List IVS channels (admin)
app.get('/api/admin/ivs/channels', requireAdmin, async (req, res) => {
  try {
    const resp = await ivsClient.send(new ListChannelsCommand({}));
    return res.json({ channels: resp.channels || [] });
  } catch (err) {
    return res.status(500).json({ error: 'list_failed', detail: String(err && err.message || err) });
  }
});

// Helper: parse playback URL to extract region, accountId, channelId
app.post('/api/admin/ivs/parse-playback', requireAdmin, (req, res) => {
  const { playbackUrl } = req.body || {};
  if (!playbackUrl) return res.status(400).json({ error: 'playbackUrl required' });
  const re = /\/api\/video\/v1\/([a-z0-9-]+)\.([0-9]+)\.channel\.([^.]+)\.m3u8$/;
  const m = String(playbackUrl).match(re);
  if (!m) return res.status(400).json({ error: 'invalid_playback_url' });
  const region = m[1];
  const accountId = m[2];
  const channelId = m[3];
  return res.json({ region, accountId, channelId });
});

// Get channel by Channel ID (lists channels and filters client-side)
app.get('/api/admin/ivs/channel-by-id/:channelId', requireAdmin, async (req, res) => {
  try {
    const { channelId } = req.params;
    // There is no direct GetChannel by channelId, so list and filter
    const resp = await ivsClient.send(new ListChannelsCommand({}));
    const found = (resp.channels || []).find(ch => ch.channelId === channelId);
    if (!found) return res.status(404).json({ error: 'not_found' });
    return res.json({ channel: found });
  } catch (err) {
    return res.status(500).json({ error: 'lookup_failed', detail: String(err && err.message || err) });
  }
});

// List stream keys for a channel ARN
app.get('/api/admin/ivs/stream-keys', requireAdmin, async (req, res) => {
  try {
    const { channelArn } = req.query;
    if (!channelArn) return res.status(400).json({ error: 'channelArn required' });
    const keys = await ivsClient.send(new ListStreamKeysCommand({ channelArn }));
    return res.json({ streamKeys: keys.streamKeys || [] });
  } catch (err) {
    return res.status(500).json({ error: 'keys_failed', detail: String(err && err.message || err) });
  }
});

// Delete IVS channel and associated keys (admin)
app.delete('/api/admin/ivs/channel', requireAdmin, async (req, res) => {
  try {
    const { channelArn, broadcastId } = req.body || {};
    let arn = channelArn;
    if (!arn && broadcastId && broadcasts.has(broadcastId)) {
      arn = broadcasts.get(broadcastId).channelArn;
    }
    if (!arn) return res.status(400).json({ error: 'channelArn or broadcastId required' });

    // Stop stream if running (best-effort)
    try { await ivsClient.send(new StopStreamCommand({ channelArn: arn })); } catch (_) {}

    // Delete stream keys first
    try {
      const keys = await ivsClient.send(new ListStreamKeysCommand({ channelArn: arn }));
      for (const k of (keys.streamKeys || [])) {
        await ivsClient.send(new DeleteStreamKeyCommand({ arn: k.arn }));
      }
    } catch (_) {}

    await ivsClient.send(new DeleteChannelCommand({ arn }));

    if (broadcastId) broadcasts.delete(broadcastId);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'delete_failed', detail: String(err && err.message || err) });
  }
});

// Publisher: get per-broadcast config (no stream key)
app.get('/api/ivs/broadcast/:broadcastId/config', async (req, res) => {
  const { broadcastId } = req.params;
  const b = broadcasts.get(broadcastId);
  if (!b) return res.status(404).json({ error: 'not_found' });
  return res.json({ ingest: `rtmps://${b.ingestEndpoint}:443/app/`, playbackUrl: b.playbackUrl });
});

// Admin: create and assign broadcast to a streamer, optional minutesToUse for this session
app.post('/api/admin/broadcasts/create', requireAdmin, async (req, res) => {
  try {
    const { streamerEmail, broadcastId, name, minutesToUse = 0 } = req.body || {};
    if (!streamerEmail || !broadcastId) return res.status(400).json({ error: 'streamerEmail and broadcastId required' });
    // create channel + key via existing endpoint logic
    const channelName = name || `basvideo-${broadcastId}-${Date.now()}`;
    const createResp = await ivsClient.send(new CreateChannelCommand({ name: channelName, type: 'BASIC', latencyMode: 'LOW', authorized: false }));
    const channel = createResp.channel;
    const channelArn = channel.arn;
    const ingestEndpoint = channel.ingestEndpoint;
    const playbackUrl = channel.playbackUrl;
    const keyResp = await ivsClient.send(new CreateStreamKeyCommand({ channelArn }));
    const streamKeyArn = keyResp.streamKey.arn;
    const streamKey = keyResp.streamKey.value;
    broadcasts.set(broadcastId, { channelArn, streamKeyArn, ingestEndpoint, playbackUrl, streamKey, streamerEmail });
    // ensure streamer exists
    if (!streamers.has(streamerEmail)) streamers.set(streamerEmail, { email: streamerEmail, minutesPurchased: 0, minutesUsed: 0 });
    return res.json({ ok: true, broadcastId, ingest: `rtmps://${ingestEndpoint}:443/app/`, playbackUrl, streamKey, channelArn, streamKeyArn });
  } catch (err) {
    return res.status(500).json({ error: 'create_assign_failed', detail: String(err && err.message || err) });
  }
});

// Publisher: claim stream key for a broadcast (POC: returns raw key) and start auto-stop timer if streamer has limited minutes
app.post('/api/ivs/broadcast/:broadcastId/claim-key', async (req, res) => {
  const { broadcastId } = req.params;
  const { streamerEmail } = req.body || {};
  const b = broadcasts.get(broadcastId);
  if (!b) return res.status(404).json({ error: 'not_found' });
  const email = streamerEmail || b.streamerEmail;
  // schedule auto stop based on remaining minutes (best-effort)
  if (email && streamers.has(email)) {
    const s = streamers.get(email);
    const remaining = Math.max(0, s.minutesPurchased - s.minutesUsed);
    if (remaining > 0) {
      if (autoStopTimers.has(broadcastId)) {
        clearTimeout(autoStopTimers.get(broadcastId));
      }
      const ms = remaining * 60 * 1000;
      const timeoutId = setTimeout(async () => {
        try {
          await ivsClient.send(new StopStreamCommand({ channelArn: b.channelArn }));
        } catch (_) {}
        autoStopTimers.delete(broadcastId);
      }, ms);
      autoStopTimers.set(broadcastId, timeoutId);
    }
  }
  return res.json({ streamKey: b.streamKey, ttlSec: 60 });
});

// Publisher: get IVS config without streamKey (safety)
app.get('/api/livestream/config', (req, res) => {
  const email = req.query.userEmail || '';
  const cfg = ivsAssignments.get(email);
  if (!cfg) return res.status(404).json({ error: 'IVS not assigned yet' });
  res.json({ endpoint: cfg.endpoint, playbackUrl: cfg.playbackUrl });
});

// Publisher: claim short-lived key (mock) right before start
app.post('/api/livestream/claim-key', (req, res) => {
  const { userEmail } = req.body || {};
  const cfg = ivsAssignments.get(userEmail || '');
  if (!cfg) return res.status(404).json({ error: 'IVS not assigned' });
  // In production: issue short-lived token or return key via signed mechanism.
  // Here we simply return the stored key for POC.
  res.json({ streamKey: cfg.streamKey, ttlSec: 60 });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`IVS backend API running on http://localhost:${PORT}`));



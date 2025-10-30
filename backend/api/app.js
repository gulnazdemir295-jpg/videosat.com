const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// In-memory stores (POC). Replace with DB in production.
const users = new Map(); // key: email, value: { email, hasTime }
const ivsAssignments = new Map(); // key: email, value: { endpoint, playbackUrl, streamKey (never returned directly) }

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Seed: sample user with payment time
users.set('hammaddeci.videosat.com', { email: 'hammaddeci.videosat.com', hasTime: true });

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

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

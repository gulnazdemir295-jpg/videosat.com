/**
 * API v1 Routes
 * Tüm v1 endpoint'leri buradan yönetilir
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('../auth-routes');
const pushRoutes = require('../push-routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/push', pushRoutes);

// Health check
router.get('/health', async (req, res) => {
  res.json({
    version: 'v1',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;


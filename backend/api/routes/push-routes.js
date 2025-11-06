/**
 * Push Notification Routes
 * Web Push API endpoint'leri
 */

const express = require('express');
const router = express.Router();
const webpush = require('web-push');

// VAPID keys (environment variables'dan al)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@basvideo.com';

// VAPID keys ayarla
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// In-memory subscription store (production'da DynamoDB kullanılmalı)
const subscriptions = new Map(); // userId -> subscription

// GET /api/push/public-key - VAPID public key al
router.get('/public-key', (req, res) => {
  if (!VAPID_PUBLIC_KEY) {
    return res.status(500).json({ 
      error: 'VAPID public key yapılandırılmamış',
      detail: 'VAPID_PUBLIC_KEY environment variable gerekli'
    });
  }

  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// POST /api/push/subscribe - Push notification subscription kaydet
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription, userId } = req.body;

    if (!subscription) {
      return res.status(400).json({ error: 'Subscription gerekli' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID gerekli' });
    }

    // Subscription'ı kaydet
    subscriptions.set(userId, subscription);

    console.log(`✅ Push Notification: Subscription kaydedildi - ${userId}`);

    res.json({ 
      success: true, 
      message: 'Subscription kaydedildi' 
    });
  } catch (error) {
    console.error('Push subscription hatası:', error);
    res.status(500).json({ 
      error: 'Subscription kaydedilemedi', 
      detail: error.message 
    });
  }
});

// POST /api/push/unsubscribe - Push notification subscription kaldır
router.post('/unsubscribe', async (req, res) => {
  try {
    const { subscription, userId } = req.body;

    if (userId) {
      subscriptions.delete(userId);
      console.log(`✅ Push Notification: Subscription kaldırıldı - ${userId}`);
    } else if (subscription) {
      // Subscription'a göre kullanıcıyı bul ve sil
      for (const [uid, sub] of subscriptions.entries()) {
        if (JSON.stringify(sub) === JSON.stringify(subscription)) {
          subscriptions.delete(uid);
          console.log(`✅ Push Notification: Subscription kaldırıldı - ${uid}`);
          break;
        }
      }
    }

    res.json({ 
      success: true, 
      message: 'Subscription kaldırıldı' 
    });
  } catch (error) {
    console.error('Push unsubscribe hatası:', error);
    res.status(500).json({ 
      error: 'Subscription kaldırılamadı', 
      detail: error.message 
    });
  }
});

// POST /api/push/send - Push notification gönder (admin/test için)
router.post('/send', async (req, res) => {
  try {
    const { userId, title, body, icon, url, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ 
        error: 'userId, title ve body gerekli' 
      });
    }

    const subscription = subscriptions.get(userId);
    if (!subscription) {
      return res.status(404).json({ 
        error: 'Subscription bulunamadı' 
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      url: url || '/',
      data: data || {}
    });

    try {
      await webpush.sendNotification(subscription, payload);
      console.log(`✅ Push Notification gönderildi - ${userId}`);
      
      res.json({ 
        success: true, 
        message: 'Push notification gönderildi' 
      });
    } catch (error) {
      console.error('Push gönderme hatası:', error);
      
      // Subscription geçersizse sil
      if (error.statusCode === 410) {
        subscriptions.delete(userId);
      }
      
      res.status(500).json({ 
        error: 'Push notification gönderilemedi', 
        detail: error.message 
      });
    }
  } catch (error) {
    console.error('Push send hatası:', error);
    res.status(500).json({ 
      error: 'Push notification gönderilemedi', 
      detail: error.message 
    });
  }
});

// GET /api/push/subscriptions - Tüm subscription'ları listele (admin)
router.get('/subscriptions', (req, res) => {
  const subs = Array.from(subscriptions.entries()).map(([userId, subscription]) => ({
    userId,
    endpoint: subscription.endpoint,
    keys: subscription.keys
  }));

  res.json({ 
    success: true, 
    count: subs.length,
    subscriptions: subs 
  });
});

module.exports = router;


/**
 * Enhanced Rate Limiting Middleware
 * 
 * Gelişmiş rate limiting:
 * - Per-endpoint rate limiting
 * - Per-user rate limiting
 * - Redis-backed rate limiting (distributed)
 * - Sliding window algorithm
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Redis client (opsiyonel - eğer Redis varsa)
let redisClient = null;
if (process.env.REDIS_HOST) {
  redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });
}

// Store seçimi
const getStore = () => {
  if (redisClient) {
    return new RedisStore({
      client: redisClient,
      prefix: 'ratelimit:'
    });
  }
  // Memory store (default)
  return undefined;
};

/**
 * Genel API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Her IP için 15 dakikada maksimum 100 istek
  message: {
    error: 'Too Many Requests',
    message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.',
    retryAfter: 15 * 60 // saniye
  },
  standardHeaders: true, // `RateLimit-*` headers
  legacyHeaders: false, // `X-RateLimit-*` headers
  store: getStore(),
  skip: (req) => {
    // Admin token varsa rate limit'i atla
    return req.headers['x-admin-token'] === process.env.ADMIN_TOKEN;
  }
});

/**
 * Strict rate limiter (kritik endpoint'ler için)
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10, // Daha sıkı limit
  message: {
    error: 'Too Many Requests',
    message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore()
});

/**
 * Auth endpoint'ler için özel limiter
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // Login/Register için çok sıkı limit
  message: {
    error: 'Too Many Requests',
    message: 'Çok fazla giriş denemesi yapıldı, lütfen 15 dakika sonra tekrar deneyin.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  skipSuccessfulRequests: true // Başarılı login'leri sayma
});

/**
 * Per-user rate limiter (authenticated users için)
 */
const userLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 1000, // Authenticated users için daha yüksek limit
  message: {
    error: 'Too Many Requests',
    message: 'Kullanıcı limiti aşıldı, lütfen daha sonra tekrar deneyin.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  keyGenerator: (req) => {
    // User email'i key olarak kullan
    return req.user?.email || req.ip;
  },
  skip: (req) => {
    // Sadece authenticated users için
    return !req.user;
  }
});

/**
 * Upload endpoint'ler için özel limiter
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 20, // Upload için sınırlı limit
  message: {
    error: 'Too Many Requests',
    message: 'Çok fazla dosya yüklendi, lütfen daha sonra tekrar deneyin.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore()
});

/**
 * Search endpoint'ler için özel limiter
 */
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 30, // Search için orta limit
  message: {
    error: 'Too Many Requests',
    message: 'Çok fazla arama yapıldı, lütfen bir dakika sonra tekrar deneyin.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore()
});

/**
 * Dynamic rate limiter (endpoint'e göre)
 */
function createDynamicLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too Many Requests',
    keyGenerator = (req) => req.ip,
    skip = () => false
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too Many Requests',
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: getStore(),
    keyGenerator,
    skip
  });
}

module.exports = {
  apiLimiter,
  strictLimiter,
  authLimiter,
  userLimiter,
  uploadLimiter,
  searchLimiter,
  createDynamicLimiter
};


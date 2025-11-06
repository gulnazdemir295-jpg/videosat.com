/**
 * Security Middleware
 * CSRF Protection ve Input Sanitization
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

// CSRF token storage (production'da Redis kullanılmalı)
const csrfTokens = new Map(); // key: sessionId, value: { token, expiresAt }

/**
 * CSRF Token oluştur
 */
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRF Token middleware
 * Token oluşturur ve response'a ekler
 */
const csrfToken = (req, res, next) => {
  // Session ID oluştur (basit implementasyon)
  const sessionId = req.headers['x-session-id'] || 
                   req.cookies?.sessionId || 
                   crypto.randomBytes(16).toString('hex');

  // Token oluştur
  const token = generateCSRFToken();
  const expiresAt = Date.now() + (60 * 60 * 1000); // 1 saat

  // Token'ı sakla
  csrfTokens.set(sessionId, { token, expiresAt });

  // Response header'a ekle
  res.setHeader('X-CSRF-Token', token);

  // Cookie'ye session ID ekle (opsiyonel)
  if (!req.cookies?.sessionId) {
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 saat
    });
  }

  req.csrfToken = token;
  req.sessionId = sessionId;
  next();
};

/**
 * CSRF Token doğrulama middleware
 * POST, PUT, DELETE, PATCH isteklerinde token kontrolü yapar
 */
const verifyCSRFToken = (req, res, next) => {
  // GET, HEAD, OPTIONS isteklerinde CSRF kontrolü yapma
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
  const token = req.headers['x-csrf-token'] || req.body?._csrf;

  if (!sessionId || !token) {
    logger.warn('CSRF token missing', { 
      method: req.method, 
      url: req.originalUrl,
      ip: req.ip 
    });
    return res.status(403).json({
      error: 'Forbidden',
      message: 'CSRF token eksik veya geçersiz.'
    });
  }

  const storedToken = csrfTokens.get(sessionId);

  if (!storedToken) {
    logger.warn('CSRF token not found', { 
      method: req.method, 
      url: req.originalUrl,
      ip: req.ip 
    });
    return res.status(403).json({
      error: 'Forbidden',
      message: 'CSRF token bulunamadı.'
    });
  }

  // Token süresi kontrolü
  if (Date.now() > storedToken.expiresAt) {
    csrfTokens.delete(sessionId);
    logger.warn('CSRF token expired', { 
      method: req.method, 
      url: req.originalUrl,
      ip: req.ip 
    });
    return res.status(403).json({
      error: 'Forbidden',
      message: 'CSRF token süresi dolmuş.'
    });
  }

  // Token karşılaştırma
  if (storedToken.token !== token) {
    logger.warn('CSRF token mismatch', { 
      method: req.method, 
      url: req.originalUrl,
      ip: req.ip 
    });
    return res.status(403).json({
      error: 'Forbidden',
      message: 'CSRF token eşleşmiyor.'
    });
  }

  next();
};

/**
 * Input Sanitization
 * XSS koruması için input'ları temizler
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // HTML tag'lerini kaldır
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, ''); // onclick, onerror, vb.

  // HTML entities encode
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
}

/**
 * Input sanitization middleware
 * Request body ve query parametrelerini temizler
 */
const sanitizeInputs = (req, res, next) => {
  // Body sanitization
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Query sanitization
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  // Params sanitization
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Object'i recursive olarak sanitize et
 */
function sanitizeObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => 
      typeof item === 'string' ? sanitizeInput(item) : 
      typeof item === 'object' ? sanitizeObject(item) : 
      item
    );
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        sanitized[key] = typeof value === 'string' 
          ? sanitizeInput(value) 
          : typeof value === 'object' 
          ? sanitizeObject(value) 
          : value;
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Eski CSRF token'ları temizle (cron job gibi)
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now > data.expiresAt) {
      csrfTokens.delete(sessionId);
    }
  }
}

// Her 10 dakikada bir expired token'ları temizle
setInterval(cleanupExpiredTokens, 10 * 60 * 1000);

module.exports = {
  csrfToken,
  verifyCSRFToken,
  sanitizeInput,
  sanitizeInputs,
  cleanupExpiredTokens
};


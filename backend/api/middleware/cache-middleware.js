/**
 * Cache Middleware
 * 
 * API response'larını cache'ler
 * Redis-backed caching
 */

const { cache } = require('../services/redis-service');

/**
 * Cache middleware
 * 
 * @param {number} ttl - Time to live (saniye)
 * @param {function} keyGenerator - Custom cache key generator
 */
function cacheMiddleware(ttl = 3600, keyGenerator = null) {
  return async (req, res, next) => {
    // Sadece GET request'ler için cache
    if (req.method !== 'GET') {
      return next();
    }

    // Cache key oluştur
    let cacheKey;
    if (keyGenerator) {
      cacheKey = keyGenerator(req);
    } else {
      // Default: URL + query string
      const queryString = Object.keys(req.query).length > 0
        ? `:${JSON.stringify(req.query)}`
        : '';
      cacheKey = `cache:${req.originalUrl}${queryString}`;
    }

    try {
      // Cache'den kontrol et
      const cached = await cache.get(cacheKey);
      if (cached) {
        // Cache hit - response header'ı ekle
        res.set('X-Cache', 'HIT');
        return res.json(cached);
      }

      // Cache miss - original response'ı intercept et
      const originalJson = res.json;
      res.json = function(data) {
        // Cache'e kaydet (async - blocking olmadan)
        cache.set(cacheKey, data, ttl).catch(err => {
          console.error('Cache set error:', err);
        });
        // Cache miss header'ı ekle
        res.set('X-Cache', 'MISS');
        // Original response'ı gönder
        originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Hata durumunda cache'i atla
      next();
    }
  };
}

/**
 * Cache invalidation middleware
 * 
 * Belirli pattern'e göre cache'i temizler
 */
function invalidateCache(pattern) {
  return async (req, res, next) => {
    try {
      await cache.delPattern(pattern);
      next();
    } catch (error) {
      console.error('Cache invalidation error:', error);
      next();
    }
  };
}

/**
 * Conditional cache middleware
 * 
 * Belirli koşullara göre cache'ler
 */
function conditionalCacheMiddleware(condition, ttl = 3600) {
  return async (req, res, next) => {
    // Koşul kontrolü
    if (!condition(req)) {
      return next();
    }

    // Normal cache middleware'i uygula
    return cacheMiddleware(ttl)(req, res, next);
  };
}

module.exports = {
  cacheMiddleware,
  invalidateCache,
  conditionalCacheMiddleware
};


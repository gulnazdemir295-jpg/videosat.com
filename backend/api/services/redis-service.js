/**
 * Redis Service
 * 
 * Redis caching layer için service
 * ElastiCache veya standalone Redis ile çalışır
 */

const Redis = require('ioredis');

// Redis client
let redisClient = null;

// Redis bağlantısını başlat
function initRedis() {
  if (process.env.REDIS_HOST) {
    try {
      redisClient = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        enableOfflineQueue: false
      });

      redisClient.on('connect', () => {
        console.log('✅ Redis connected');
      });

      redisClient.on('ready', () => {
        console.log('✅ Redis ready');
      });

      redisClient.on('error', (err) => {
        console.error('❌ Redis error:', err.message);
      });

      redisClient.on('close', () => {
        console.log('⚠️  Redis connection closed');
      });

      redisClient.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      return redisClient;
    } catch (error) {
      console.error('❌ Redis initialization error:', error);
      return null;
    }
  }
  return null;
}

// Redis bağlantısını başlat (eğer config varsa)
if (process.env.REDIS_HOST) {
  initRedis();
}

/**
 * Cache helper functions
 */
const cache = {
  /**
   * Cache'den değer al
   */
  async get(key) {
    if (!redisClient) {
      return null;
    }

    try {
      const value = await redisClient.get(key);
      if (value) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  /**
   * Cache'e değer kaydet
   */
  async set(key, value, ttl = 3600) {
    if (!redisClient) {
      return false;
    }

    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttl > 0) {
        await redisClient.setex(key, ttl, stringValue);
      } else {
        await redisClient.set(key, stringValue);
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  },

  /**
   * Cache'den değer sil
   */
  async del(key) {
    if (!redisClient) {
      return false;
    }

    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  },

  /**
   * Cache'de key var mı kontrol et
   */
  async exists(key) {
    if (!redisClient) {
      return false;
    }

    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  },

  /**
   * Pattern'e göre key'leri bul
   */
  async keys(pattern) {
    if (!redisClient) {
      return [];
    }

    try {
      return await redisClient.keys(pattern);
    } catch (error) {
      console.error('Redis keys error:', error);
      return [];
    }
  },

  /**
   * Pattern'e göre key'leri sil
   */
  async delPattern(pattern) {
    if (!redisClient) {
      return 0;
    }

    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        return await redisClient.del(...keys);
      }
      return 0;
    } catch (error) {
      console.error('Redis delPattern error:', error);
      return 0;
    }
  },

  /**
   * TTL (Time To Live) ayarla
   */
  async expire(key, ttl) {
    if (!redisClient) {
      return false;
    }

    try {
      await redisClient.expire(key, ttl);
      return true;
    } catch (error) {
      console.error('Redis expire error:', error);
      return false;
    }
  },

  /**
   * Cache'i temizle (tüm key'leri sil)
   */
  async flush() {
    if (!redisClient) {
      return false;
    }

    try {
      await redisClient.flushdb();
      return true;
    } catch (error) {
      console.error('Redis flush error:', error);
      return false;
    }
  }
};

/**
 * Redis bağlantısını kapat
 */
function closeRedis() {
  if (redisClient) {
    redisClient.quit();
    redisClient = null;
  }
}

module.exports = {
  redisClient: () => redisClient,
  cache,
  initRedis,
  closeRedis
};


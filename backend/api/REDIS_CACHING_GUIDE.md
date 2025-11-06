# 🔴 Redis/ElastiCache Caching Layer Rehberi

## 📋 Genel Bakış

Redis caching layer, uygulama performansını artırmak ve database yükünü azaltmak için kullanılır.

---

## 🎯 Caching Stratejisi

### 1. **Cache-Aside (Lazy Loading)**
- Uygulama cache'i kontrol eder
- Cache miss durumunda database'den alır ve cache'e yazar
- En yaygın kullanılan pattern

### 2. **Write-Through**
- Veri yazılırken hem database hem cache'e yazılır
- Consistency garantisi

### 3. **Write-Back (Write-Behind)**
- Veri önce cache'e yazılır
- Belirli aralıklarla database'e yazılır
- Yüksek performans, risk var

---

## 🚀 ElastiCache Redis Kurulumu

### 1. ElastiCache Subnet Group Oluştur

```bash
# Subnet group oluştur
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name videosat-redis-subnet-group \
  --cache-subnet-group-description "VideoSat Redis Subnet Group" \
  --subnet-ids subnet-xxx subnet-yyy
```

### 2. Security Group Oluştur

```bash
# Redis security group
aws ec2 create-security-group \
  --group-name videosat-redis-sg \
  --description "VideoSat Redis Security Group" \
  --vpc-id vpc-xxx

# Backend'den Redis'e erişim
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxx \
  --protocol tcp \
  --port 6379 \
  --source-group sg-backend
```

### 3. ElastiCache Cluster Oluştur

```bash
# Redis cluster oluştur
aws elasticache create-cache-cluster \
  --cache-cluster-id videosat-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --cache-subnet-group-name videosat-redis-subnet-group \
  --security-group-ids sg-xxx \
  --engine-version 7.0 \
  --port 6379
```

### 4. Redis Cluster (High Availability)

```bash
# Redis cluster (replication) oluştur
aws elasticache create-replication-group \
  --replication-group-id videosat-redis-cluster \
  --description "VideoSat Redis Cluster" \
  --cache-node-type cache.t3.small \
  --engine redis \
  --num-cache-clusters 2 \
  --cache-subnet-group-name videosat-redis-subnet-group \
  --security-group-ids sg-xxx \
  --engine-version 7.0 \
  --port 6379 \
  --automatic-failover-enabled \
  --multi-az-enabled
```

---

## 💻 Backend Integration

### 1. Redis Client Kurulumu

```bash
cd backend/api
npm install redis ioredis
```

### 2. Redis Service Oluştur

```javascript
// services/redis-service.js
const Redis = require('ioredis');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

// Cache helper functions
const cache = {
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    try {
      await redisClient.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  },

  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  },

  async exists(key) {
    try {
      return await redisClient.exists(key);
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }
};

module.exports = { redisClient, cache };
```

### 3. Cache Middleware

```javascript
// middleware/cache-middleware.js
const { cache } = require('../services/redis-service');

function cacheMiddleware(ttl = 3600) {
  return async (req, res, next) => {
    // Sadece GET request'ler için cache
    if (req.method !== 'GET') {
      return next();
    }

    // Cache key oluştur
    const cacheKey = `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;

    try {
      // Cache'den kontrol et
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Cache miss - original response'ı intercept et
      const originalJson = res.json;
      res.json = function(data) {
        // Cache'e kaydet
        cache.set(cacheKey, data, ttl);
        // Original response'ı gönder
        originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

module.exports = { cacheMiddleware };
```

### 4. API Route'larda Kullanım

```javascript
// app.js
const { cacheMiddleware } = require('./middleware/cache-middleware');

// Public API'ler için cache
app.get('/api/public/rooms', cacheMiddleware(300), async (req, res) => {
  // Route handler
});

// User data cache
app.get('/api/users/:email', cacheMiddleware(600), async (req, res) => {
  // Route handler
});
```

---

## 📊 Cache Patterns

### 1. User Data Caching

```javascript
// services/user-service.js
const { cache } = require('./redis-service');
const userService = require('./user-service');

async function getUserWithCache(email) {
  const cacheKey = `user:${email}`;
  
  // Cache'den kontrol et
  let user = await cache.get(cacheKey);
  if (user) {
    return user;
  }
  
  // Database'den al
  user = await userService.getUser(email);
  
  // Cache'e kaydet (5 dakika)
  if (user) {
    await cache.set(cacheKey, user, 300);
  }
  
  return user;
}
```

### 2. Session Caching

```javascript
// Session cache
async function getSession(sessionId) {
  const cacheKey = `session:${sessionId}`;
  return await cache.get(cacheKey);
}

async function setSession(sessionId, data, ttl = 3600) {
  const cacheKey = `session:${sessionId}`;
  return await cache.set(cacheKey, data, ttl);
}
```

### 3. Rate Limiting Cache

```javascript
// Rate limiting için cache
async function checkRateLimit(ip, limit = 100, window = 60) {
  const cacheKey = `ratelimit:${ip}`;
  const count = await cache.get(cacheKey) || 0;
  
  if (count >= limit) {
    return false; // Rate limit exceeded
  }
  
  await cache.set(cacheKey, count + 1, window);
  return true;
}
```

---

## 🔧 Cache Invalidation

### 1. Manual Invalidation

```javascript
// Cache'i temizle
async function invalidateCache(pattern) {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(...keys);
  }
}

// Kullanım
await invalidateCache('user:*');
await invalidateCache('room:*');
```

### 2. Event-Based Invalidation

```javascript
// User update olduğunda cache'i temizle
app.put('/api/users/:email', async (req, res) => {
  // User'ı güncelle
  await userService.updateUser(req.params.email, req.body);
  
  // Cache'i temizle
  await cache.del(`user:${req.params.email}`);
  
  res.json({ success: true });
});
```

---

## 📈 Monitoring

### CloudWatch Metrics
- **CPUUtilization**: Redis CPU kullanımı
- **NetworkBytesIn/Out**: Network trafiği
- **CacheHits**: Cache hit sayısı
- **CacheMisses**: Cache miss sayısı
- **Evictions**: Eviction sayısı

### Cache Hit Rate
```javascript
// Cache hit rate hesapla
const hitRate = cacheHits / (cacheHits + cacheMisses) * 100;
// Target: > 80%
```

---

## 💰 Maliyet

### ElastiCache Redis
- **cache.t3.micro**: ~$15/ay
- **cache.t3.small**: ~$30/ay
- **cache.t3.medium**: ~$60/ay
- **Data Transfer**: Outbound data transfer maliyeti

**Tahmini Aylık Maliyet**: $30-100 (kullanıma göre)

---

## 🧪 Test Senaryoları

### 1. Cache Hit Test
```bash
# İlk request (cache miss)
curl https://api.basvideo.com/api/users/test@example.com

# İkinci request (cache hit - daha hızlı)
curl https://api.basvideo.com/api/users/test@example.com
```

### 2. Cache Invalidation Test
```bash
# User'ı güncelle
curl -X PUT https://api.basvideo.com/api/users/test@example.com

# Cache'in temizlendiğini ve yeni data'nın geldiğini kontrol et
curl https://api.basvideo.com/api/users/test@example.com
```

---

## 📝 Best Practices

1. **TTL Strategy**: Cache TTL'lerini akıllıca ayarla
2. **Cache Keys**: Anlamlı ve tutarlı cache key'ler kullan
3. **Cache Warming**: Uygulama başlarken önemli data'yı cache'le
4. **Cache Invalidation**: Data değiştiğinde cache'i temizle
5. **Monitoring**: Cache hit rate'i düzenli takip et
6. **Fallback**: Redis down olduğunda database'e fallback yap

---

## 🔗 Kaynaklar

- [AWS ElastiCache Documentation](https://docs.aws.amazon.com/elasticache/)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)

---

**Son Güncelleme**: 2024-11-06


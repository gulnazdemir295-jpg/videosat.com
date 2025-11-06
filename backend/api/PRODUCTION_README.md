# 🚀 Production Deployment Guide

## 📋 Genel Bakış

Bu dokümanda VideoSat backend'inin production ortamına deploy edilmesi için gerekli tüm adımlar yer almaktadır.

---

## 🎯 Hızlı Başlangıç

### 1. Environment Variables

```bash
# .env.production.example dosyasını kopyala
cp .env.production.example .env.production

# Değerleri doldur (ASLA commit etme!)
nano .env.production
```

### 2. Dependencies

```bash
npm install --production
```

### 3. Database Setup

```bash
# DynamoDB tablolarını oluştur
npm run migrate

# Seed data (opsiyonel)
npm run seed
```

### 4. Start Application

```bash
# PM2 ile
pm2 start app.js --name videosat-backend

# Veya systemd ile
sudo systemctl start videosat-backend
```

---

## 📚 Detaylı Kurulum

### 1. Pre-Deployment Checklist

`PRODUCTION_DEPLOYMENT_CHECKLIST.md` dosyasını takip edin.

### 2. Infrastructure Setup

#### Auto Scaling
- `AUTO_SCALING_GUIDE.md` dosyasını takip edin
- EC2 veya ECS auto scaling yapılandırın

#### Load Balancer
- `LOAD_BALANCER_GUIDE.md` dosyasını takip edin
- ALB kurulumunu yapın

#### Redis/ElastiCache
- `REDIS_CACHING_GUIDE.md` dosyasını takip edin
- ElastiCache Redis cluster oluşturun

### 3. Security Setup

#### SSL/TLS
- `SSL_TLS_CERTIFICATE_GUIDE.md` dosyasını takip edin
- AWS Certificate Manager'da sertifika oluşturun

#### WAF
- `WAF_SETUP_GUIDE.md` dosyasını takip edin
- AWS WAF web ACL oluşturun

### 4. Monitoring Setup

#### CloudWatch Alarms
```bash
cd scripts
./cloudwatch-alarms.sh
```

#### Monitoring Dashboard
```bash
cd scripts
./setup-monitoring-dashboard.sh
```

### 5. Backup & Storage

#### DynamoDB PITR
```bash
cd scripts
./setup-dynamodb-pitr.sh
```

#### S3 Lifecycle
```bash
cd scripts
./setup-s3-lifecycle.sh
```

#### Backup Script
```bash
# Manuel backup
node scripts/backup-dynamodb.js --all

# Cron job (günlük)
0 2 * * * cd /path/to/app && node scripts/backup-dynamodb.js --all
```

### 6. Cost Monitoring

```bash
cd scripts
export BUDGET_AMOUNT=100
export ALERT_EMAIL=admin@basvideo.com
./setup-cost-monitoring.sh
```

---

## 🔧 Configuration

### Environment Variables

Tüm environment variables `PRODUCTION_DEPLOYMENT_CHECKLIST.md` dosyasında listelenmiştir.

**Kritik Variables:**
- `NODE_ENV=production`
- `JWT_SECRET` (en az 32 karakter)
- `JWT_REFRESH_SECRET` (en az 32 karakter)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`

**Opsiyonel Variables:**
- `REDIS_HOST` (Redis caching için)
- `REDIS_PORT`
- `REDIS_PASSWORD`
- `SENDGRID_API_KEY` (Email için)
- `VAPID_PUBLIC_KEY` (Push notifications için)
- `VAPID_PRIVATE_KEY`

### Rate Limiting

Enhanced rate limiting otomatik olarak aktif olur (Redis varsa).

**Rate Limits:**
- Genel API: 100 req/15min
- Auth endpoints: 5 req/15min
- Search endpoints: 30 req/1min
- Upload endpoints: 20 req/1hour
- Authenticated users: 1000 req/1hour

### Caching

Redis caching layer kullanılabilir:

```javascript
const { cacheMiddleware } = require('./middleware/cache-middleware');

// Cache ile endpoint
app.get('/api/public/rooms', cacheMiddleware(300), async (req, res) => {
  // Route handler
});
```

---

## 📊 Monitoring

### Health Check

```bash
curl https://api.basvideo.com/api/health
```

### Metrics

```bash
curl https://api.basvideo.com/api/metrics
```

### CloudWatch Dashboard

AWS Console'dan CloudWatch Dashboard'u görüntüleyin:
- API Overview
- Error Rates
- DynamoDB Metrics
- EC2 Metrics

---

## 🔄 Updates & Maintenance

### Application Update

```bash
# 1. Backup al
node scripts/backup-dynamodb.js --all

# 2. Code update
git pull origin main

# 3. Dependencies update
npm install --production

# 4. Restart
pm2 restart videosat-backend

# 5. Health check
curl https://api.basvideo.com/api/health
```

### Database Migration

```bash
npm run migrate
```

### Seed Data

```bash
npm run seed
```

---

## 🚨 Troubleshooting

### Application Not Starting

1. Environment variables kontrol et
2. Log'ları kontrol et: `pm2 logs videosat-backend`
3. Port'un kullanılabilir olduğunu kontrol et

### High Error Rate

1. CloudWatch alarms kontrol et
2. Error logs kontrol et
3. Database connection kontrol et
4. Redis connection kontrol et (eğer kullanılıyorsa)

### Performance Issues

1. `PERFORMANCE_OPTIMIZATION_CHECKLIST.md` dosyasını kontrol et
2. CloudWatch metrics kontrol et
3. Database query performance kontrol et
4. Cache hit rate kontrol et

---

## 📞 Support

### Emergency Contacts

- **DevOps Team**: devops@basvideo.com
- **Backend Team**: backend@basvideo.com
- **On-Call Engineer**: [Phone Number]

### Documentation

- `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- `DISASTER_RECOVERY_PLAN.md` - Disaster recovery plan
- `WAF_SETUP_GUIDE.md` - WAF kurulum
- `AUTO_SCALING_GUIDE.md` - Auto scaling
- `LOAD_BALANCER_GUIDE.md` - Load balancer
- `REDIS_CACHING_GUIDE.md` - Redis caching
- `SSL_TLS_CERTIFICATE_GUIDE.md` - SSL/TLS
- `LOG_AGGREGATION_GUIDE.md` - Log aggregation
- `PERFORMANCE_OPTIMIZATION_CHECKLIST.md` - Performance

---

## 🔗 Useful Links

- [AWS Console](https://console.aws.amazon.com/)
- [CloudWatch Dashboard](https://console.aws.amazon.com/cloudwatch/)
- [DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
- [ElastiCache Console](https://console.aws.amazon.com/elasticache/)

---

**Son Güncelleme**: 2024-11-06


# 🚀 Production Quick Start Guide

## ⚡ 5 Dakikada Production'a Hazır

### 1. Environment Variables (2 dakika)

```bash
cd backend/api
cp .env.production.example .env.production
nano .env.production
```

**Minimum Gerekli Variables:**
```env
NODE_ENV=production
JWT_SECRET=your-32-char-secret-minimum
JWT_REFRESH_SECRET=your-32-char-secret-minimum
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AGORA_APP_ID=your-agora-id
AGORA_APP_CERTIFICATE=your-agora-cert
```

### 2. Dependencies (1 dakika)

```bash
npm install --production
```

### 3. Database Setup (1 dakika)

```bash
# Tabloları oluştur
npm run migrate

# İlk backup al
node scripts/backup-dynamodb.js --all
```

### 4. Start Application (1 dakika)

```bash
# PM2 ile
pm2 start app.js --name videosat-backend

# Health check
curl http://localhost:3000/api/health
```

---

## 📋 Sonraki Adımlar (Opsiyonel)

### Monitoring Setup
```bash
./scripts/cloudwatch-alarms.sh
./scripts/setup-monitoring-dashboard.sh
```

### Backup Automation
```bash
# Cron job ekle
crontab -e
# 0 2 * * * cd /path/to/app && node scripts/backup-dynamodb.js --all
```

### Redis Caching (Opsiyonel)
```bash
# ElastiCache Redis cluster oluştur
# REDIS_HOST environment variable'ı ekle
```

---

## ✅ Checklist

- [ ] Environment variables set edildi
- [ ] Dependencies yüklendi
- [ ] Database tabloları oluşturuldu
- [ ] Application başlatıldı
- [ ] Health check başarılı
- [ ] Monitoring kuruldu (opsiyonel)
- [ ] Backup automation kuruldu (opsiyonel)

---

## 🔗 Detaylı Dokümantasyon

- **Production README**: `backend/api/PRODUCTION_README.md`
- **Deployment Checklist**: `backend/api/PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- **Disaster Recovery**: `backend/api/DISASTER_RECOVERY_PLAN.md`
- **Tüm Rehberler**: `backend/api/PRODUCTION_INDEX.md`

---

**Hazır! 🎉**


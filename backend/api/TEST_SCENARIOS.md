# 🧪 Production Test Senaryoları

## 📋 Genel Bakış

Bu dokümanda production ortamında test edilmesi gereken senaryolar yer almaktadır.

---

## ✅ Pre-Deployment Tests

### 1. Environment Validation
```bash
# Environment variables kontrolü
node -e "require('./middleware/env-validator').validateEnvironment()"

# Beklenen çıktı: ✅ Environment değişkenleri doğrulandı
```

### 2. Database Connection
```bash
# DynamoDB bağlantı testi
node -e "
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const client = new DynamoDBClient({ region: 'us-east-1' });
console.log('✅ DynamoDB client oluşturuldu');
"
```

### 3. Health Check
```bash
# Health check endpoint testi
curl http://localhost:3000/api/health

# Beklenen response:
# {
#   "status": "healthy",
#   "timestamp": "2024-11-06T...",
#   "uptime": 123.45
# }
```

---

## 🔒 Security Tests

### 1. Rate Limiting Test
```bash
# Rate limiting test (100+ request)
for i in {1..110}; do
  curl http://localhost:3000/api/health
done

# Beklenen: 429 Too Many Requests (100'den sonra)
```

### 2. Authentication Test
```bash
# Unauthorized access test
curl http://localhost:3000/api/users

# Beklenen: 401 Unauthorized

# Authorized access test
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/users

# Beklenen: 200 OK (veya 403 Forbidden)
```

### 3. Input Validation Test
```bash
# SQL injection test
curl "http://localhost:3000/api/search?q=1' OR '1'='1"

# XSS test
curl "http://localhost:3000/api/search?q=<script>alert('xss')</script>"

# Beklenen: Input sanitized, güvenli response
```

### 4. CORS Test
```bash
# CORS preflight test
curl -X OPTIONS http://localhost:3000/api/health \
  -H "Origin: https://basvideo.com" \
  -H "Access-Control-Request-Method: GET"

# Beklenen: CORS headers present
```

---

## 📊 Performance Tests

### 1. Response Time Test
```bash
# Response time test
time curl http://localhost:3000/api/health

# Beklenen: < 500ms
```

### 2. Load Test
```bash
# Apache Bench load test
ab -n 1000 -c 10 http://localhost:3000/api/health

# Beklenen:
# - Requests per second: > 100
# - Time per request: < 100ms
# - Failed requests: 0
```

### 3. Cache Test
```bash
# Cache hit test
curl http://localhost:3000/api/public/rooms
# İlk request: X-Cache: MISS

curl http://localhost:3000/api/public/rooms
# İkinci request: X-Cache: HIT
```

---

## 🔄 Functionality Tests

### 1. User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'

# Beklenen: 201 Created veya 200 OK
```

### 2. User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'

# Beklenen: 200 OK, token döner
```

### 3. Password Reset
```bash
# Forgot password
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Beklenen: 200 OK, email gönderilir
```

### 4. Live Stream
```bash
# Start stream
curl -X POST http://localhost:3000/api/rooms/main-room/channels/test-channel/start \
  -H "Authorization: Bearer <token>"

# Beklenen: 200 OK, stream başlar
```

---

## 📈 Monitoring Tests

### 1. CloudWatch Alarms
```bash
# Alarm durumunu kontrol et
aws cloudwatch describe-alarms \
  --alarm-names VideoSat-API-Health-Check-Failed \
  --region us-east-1

# Beklenen: Alarm mevcut ve aktif
```

### 2. Metrics Endpoint
```bash
# Metrics endpoint testi
curl http://localhost:3000/api/metrics \
  -H "Authorization: Bearer <token>"

# Beklenen: Metrics data döner
```

### 3. Error Logging
```bash
# Error oluştur (test için)
curl http://localhost:3000/api/nonexistent

# CloudWatch Logs'ta error göründüğünü kontrol et
aws logs tail /aws/ec2/videosat-backend --follow
```

---

## 🔄 Backup & Recovery Tests

### 1. Backup Test
```bash
# Backup script testi
node scripts/backup-dynamodb.js --all

# Beklenen: Backup dosyaları oluşturulur
ls -lh backups/
```

### 2. Backup Restore Test
```bash
# Backup'tan restore testi (test environment'da)
# NOT: Production'da dikkatli kullan!

# Backup dosyasını kontrol et
cat backups/users-2024-11-06.json

# Restore script'i çalıştır (eğer varsa)
```

### 3. PITR Test
```bash
# PITR durumunu kontrol et
aws dynamodb describe-continuous-backups \
  --table-name basvideo-users \
  --region us-east-1

# Beklenen: PointInTimeRecoveryStatus: ENABLED
```

---

## 🌐 Infrastructure Tests

### 1. Auto Scaling Test
```bash
# Auto scaling group durumunu kontrol et
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names videosat-backend-asg \
  --region us-east-1

# Beklenen: Auto scaling group mevcut ve aktif
```

### 2. Load Balancer Test
```bash
# ALB health check testi
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn> \
  --region us-east-1

# Beklenen: Healthy targets
```

### 3. Redis Connection Test
```bash
# Redis connection testi
node -e "
const { redisClient } = require('./services/redis-service');
if (redisClient) {
  redisClient.ping().then(() => {
    console.log('✅ Redis connected');
  });
} else {
  console.log('⚠️  Redis not configured');
}
"
```

---

## 📝 Test Checklist

### Pre-Deployment
- [ ] Environment validation
- [ ] Database connection
- [ ] Health check

### Security
- [ ] Rate limiting
- [ ] Authentication
- [ ] Input validation
- [ ] CORS

### Performance
- [ ] Response time
- [ ] Load test
- [ ] Cache

### Functionality
- [ ] User registration
- [ ] User login
- [ ] Password reset
- [ ] Live stream

### Monitoring
- [ ] CloudWatch alarms
- [ ] Metrics endpoint
- [ ] Error logging

### Backup & Recovery
- [ ] Backup script
- [ ] PITR status

### Infrastructure
- [ ] Auto scaling
- [ ] Load balancer
- [ ] Redis connection

---

## 🚨 Test Senaryoları (Production'da)

### 1. Failover Test
```bash
# Bir instance'ı durdur
aws ec2 stop-instances --instance-ids i-xxx

# Load balancer'ın trafiği diğer instance'lara yönlendirdiğini kontrol et
```

### 2. Scale-Out Test
```bash
# CPU kullanımını yapay olarak artır
# Auto scaling'in devreye girdiğini kontrol et
```

### 3. Disaster Recovery Test
```bash
# DR plan'daki senaryoları test et
# Backup restore test
# Failover test
```

---

## 📊 Test Sonuçları

### Success Criteria
- ✅ Tüm testler geçti
- ✅ Response time < 500ms
- ✅ Error rate < 1%
- ✅ Cache hit rate > 80%
- ✅ Uptime > 99.9%

---

**Son Güncelleme**: 2024-11-06


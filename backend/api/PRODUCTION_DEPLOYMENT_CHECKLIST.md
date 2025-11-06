# 📋 Production Deployment Checklist

## 🚀 Pre-Deployment (Deployment Öncesi)

### Environment Configuration
- [ ] Production `.env` dosyası hazırlandı
- [ ] Tüm environment variables set edildi
- [ ] AWS credentials yapılandırıldı (IAM Role tercih edilir)
- [ ] JWT secrets güçlü ve en az 32 karakter
- [ ] Agora credentials yapılandırıldı
- [ ] SendGrid API key yapılandırıldı
- [ ] VAPID keys oluşturuldu
- [ ] Environment validation test edildi

### Security
- [ ] Security headers yapılandırıldı (Helmet)
- [ ] CORS policy production URL'leri için ayarlandı
- [ ] Rate limiting aktif
- [ ] Input sanitization aktif
- [ ] CSRF protection aktif (gerekli endpoint'lerde)
- [ ] Admin token güçlü ve güvenli
- [ ] JWT secrets rotate edildi (eğer eski varsa)

### Database
- [ ] DynamoDB tabloları oluşturuldu
- [ ] DynamoDB backup stratejisi yapılandırıldı
- [ ] DynamoDB PITR aktif edildi (opsiyonel)
- [ ] DynamoDB auto scaling yapılandırıldı
- [ ] Database migration script'leri test edildi
- [ ] Seed data script'leri hazır (gerekirse)

### Monitoring & Alerting
- [ ] CloudWatch alarms kuruldu
- [ ] SNS topic oluşturuldu ve email subscription yapıldı
- [ ] Error alerting yapılandırıldı (Slack/Email)
- [ ] Log aggregation yapılandırıldı (CloudWatch Logs)
- [ ] Monitoring dashboard'ları hazır
- [ ] Uptime monitoring kuruldu (opsiyonel)

### Code Quality
- [ ] Tüm testler geçti (`npm test`)
- [ ] Linter hataları düzeltildi (`npm run lint`)
- [ ] Code formatting kontrol edildi (`npm run format:check`)
- [ ] Security vulnerabilities kontrol edildi (`npm audit`)
- [ ] Dependencies güncel

### Documentation
- [ ] API dokümantasyonu güncel (Swagger)
- [ ] Deployment runbook hazır
- [ ] Rollback procedure dokümante edildi
- [ ] Incident response plan hazır

---

## 🚀 Deployment (Deployment Sırası)

### Backend Deployment
- [ ] Backend server hazır (EC2/ECS/Lambda)
- [ ] Node.js version uyumlu (v18+)
- [ ] PM2 veya process manager kurulu (production için)
- [ ] Environment variables set edildi
- [ ] Dependencies yüklendi (`npm install --production`)
- [ ] Application başlatıldı
- [ ] Health check endpoint çalışıyor (`/api/health`)
- [ ] Database bağlantısı test edildi

### Frontend Deployment
- [ ] Frontend build alındı (gerekirse)
- [ ] S3 bucket'a deploy edildi
- [ ] CloudFront invalidation yapıldı
- [ ] CORS yapılandırması kontrol edildi
- [ ] Static files erişilebilir

### Domain & SSL
- [ ] Domain DNS kayıtları doğru
- [ ] SSL sertifikası aktif ve geçerli
- [ ] HTTPS zorunlu
- [ ] HTTP → HTTPS redirect çalışıyor

---

## ✅ Post-Deployment (Deployment Sonrası)

### Functional Testing
- [ ] Health check endpoint test edildi
- [ ] User registration test edildi
- [ ] User login test edildi
- [ ] Password reset test edildi
- [ ] Email verification test edildi
- [ ] Live stream başlatma test edildi
- [ ] API endpoints test edildi
- [ ] Error handling test edildi

### Performance Testing
- [ ] Response time kabul edilebilir (< 2s)
- [ ] API rate limiting çalışıyor
- [ ] Database query performance kabul edilebilir
- [ ] CDN cache çalışıyor
- [ ] Static assets optimize edildi

### Security Testing
- [ ] Security headers kontrol edildi
- [ ] CORS policy test edildi
- [ ] XSS protection test edildi
- [ ] SQL injection protection test edildi (DynamoDB için geçerli değil)
- [ ] Rate limiting test edildi
- [ ] Authentication/Authorization test edildi

### Monitoring Verification
- [ ] CloudWatch alarms aktif
- [ ] Error alerting test edildi
- [ ] Log aggregation çalışıyor
- [ ] Metrics toplanıyor
- [ ] Dashboard'lar çalışıyor

### Backup Verification
- [ ] Backup script test edildi
- [ ] Backup cron job kuruldu (gerekirse)
- [ ] Backup restore test edildi
- [ ] Backup retention policy kontrol edildi

---

## 🔄 Rollback Procedure

Eğer deployment başarısız olursa:

1. **Backend Rollback**
   ```bash
   # Eski versiyona geri dön
   git checkout <previous-commit>
   npm install --production
   pm2 restart videosat-backend
   ```

2. **Frontend Rollback**
   ```bash
   # S3'ten önceki versiyonu geri yükle
   aws s3 sync s3://bucket-name/previous-version/ s3://bucket-name/ --delete
   aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
   ```

3. **Database Rollback**
   ```bash
   # Backup'tan restore et (gerekirse)
   node scripts/restore-dynamodb.js --backup <backup-file>
   ```

---

## 📊 Monitoring Checklist (İlk 24 Saat)

### İlk Saat
- [ ] Error rate normal mi? (< %1)
- [ ] Response time kabul edilebilir mi? (< 2s)
- [ ] CPU/Memory kullanımı normal mi?
- [ ] Database connection pool sağlıklı mı?
- [ ] API endpoint'ler çalışıyor mu?

### İlk 6 Saat
- [ ] Kullanıcı kayıtları başarılı mı?
- [ ] Email gönderimi çalışıyor mu?
- [ ] Live stream başlatma çalışıyor mu?
- [ ] Token yenileme çalışıyor mu?
- [ ] Alert'ler gereksiz yere tetikleniyor mu?

### İlk 24 Saat
- [ ] Tüm metrikler normal mi?
- [ ] Kullanıcı şikayetleri var mı?
- [ ] Performance sorunları var mı?
- [ ] Security incident var mı?
- [ ] Backup'lar başarılı mı?

---

## 🆘 Emergency Contacts

- **DevOps Team**: devops@basvideo.com
- **Backend Team**: backend@basvideo.com
- **On-Call Engineer**: [Phone Number]
- **AWS Support**: [Support Plan]

---

## 📝 Deployment Notes

**Deployment Tarihi**: _______________
**Deployment Yapan**: _______________
**Version**: _______________
**Commit Hash**: _______________
**Notlar**: _______________

---

**Son Güncelleme**: 2024-11-06


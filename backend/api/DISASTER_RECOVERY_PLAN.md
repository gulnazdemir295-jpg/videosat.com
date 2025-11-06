# 🚨 Disaster Recovery Plan

## 📋 Genel Bakış

Bu dokümanda VideoSat platformu için disaster recovery (felaket kurtarma) planı yer almaktadır.

---

## 🎯 Recovery Objectives

### RTO (Recovery Time Objective)
- **Kritik Sistemler**: 1 saat
- **Önemli Sistemler**: 4 saat
- **Normal Sistemler**: 24 saat

### RPO (Recovery Point Objective)
- **Kritik Veriler**: 15 dakika (DynamoDB PITR)
- **Önemli Veriler**: 1 saat
- **Normal Veriler**: 24 saat

---

## 🔴 Senaryo 1: Database Corruption/Loss

### Senaryo
DynamoDB tabloları bozuldu veya veri kaybı yaşandı.

### Kurtarma Adımları

1. **Durum Tespiti**
   ```bash
   # Tabloları kontrol et
   aws dynamodb describe-table --table-name basvideo-users --region us-east-1
   ```

2. **Backup'tan Restore**
   ```bash
   # En son backup'ı bul
   ls -lt backups/ | head -5
   
   # Backup'tan restore et
   node scripts/restore-dynamodb.js --backup backups/users-2024-11-06.json
   ```

3. **Point-in-Time Recovery (PITR)**
   ```bash
   # PITR ile restore (eğer aktifse)
   aws dynamodb restore-table-from-backup \
     --target-table-name basvideo-users-restored \
     --backup-arn <backup-arn> \
     --region us-east-1
   ```

4. **Veri Doğrulama**
   - Kullanıcı sayısı kontrol edilir
   - Örnek kayıtlar kontrol edilir
   - İlişkili veriler kontrol edilir

5. **Sistem Testi**
   - User login test edilir
   - API endpoint'ler test edilir
   - Live stream test edilir

**Tahmini Süre**: 2-4 saat

---

## 🔴 Senaryo 2: Application Server Failure

### Senaryo
Backend server çöktü veya erişilemez durumda.

### Kurtarma Adımları

1. **Durum Tespiti**
   ```bash
   # Server durumunu kontrol et
   curl https://api.basvideo.com/api/health
   ```

2. **Server Restart**
   ```bash
   # PM2 ile restart
   pm2 restart videosat-backend
   
   # Veya systemd
   sudo systemctl restart videosat-backend
   ```

3. **Alternatif Server'a Failover**
   - Load balancer health check'i kontrol et
   - Unhealthy instance'ı devre dışı bırak
   - Healthy instance'a trafik yönlendir

4. **Yeni Server Provision**
   ```bash
   # EC2 instance oluştur
   aws ec2 run-instances \
     --image-id ami-xxx \
     --instance-type t3.medium \
     --security-group-ids sg-xxx \
     --user-data file://user-data.sh
   ```

5. **Application Deploy**
   ```bash
   git clone https://github.com/your-repo/videosat.git
   cd videosat/backend/api
   npm install --production
   cp .env.production .env
   pm2 start app.js --name videosat-backend
   ```

**Tahmini Süre**: 1-2 saat

---

## 🔴 Senaryo 3: AWS Region Outage

### Senaryo
AWS region tamamen erişilemez durumda.

### Kurtarma Adımları

1. **Multi-Region Deployment**
   - Backup region'da application deploy et
   - DynamoDB Global Tables kullan (eğer varsa)
   - Route 53 health check ile failover yap

2. **DNS Failover**
   ```bash
   # Route 53 health check
   aws route53 change-resource-record-sets \
     --hosted-zone-id Z123456789 \
     --change-batch file://failover.json
   ```

3. **Database Replication**
   - Backup region'da DynamoDB tabloları oluştur
   - Backup'tan restore et
   - Cross-region replication aktif et

**Tahmini Süre**: 4-8 saat

---

## 🔴 Senaryo 4: Security Breach

### Senaryo
Güvenlik ihlali tespit edildi.

### Kurtarma Adımları

1. **İhlal Tespiti**
   - Log'ları analiz et
   - Etkilenen sistemleri belirle
   - Kapsamı değerlendir

2. **Acil Önlemler**
   - Etkilenen sistemleri izole et
   - API key'leri rotate et
   - JWT secret'ları değiştir
   - Admin token'ları değiştir
   - AWS credentials rotate et

3. **Veri Temizliği**
   - Etkilenen kullanıcı hesaplarını tespit et
   - Şifreleri reset et
   - Token'ları invalidate et

4. **Sistem Güvenliği**
   - Security patch'leri uygula
   - WAF kurallarını güncelle
   - Rate limiting'i artır
   - IP whitelist/blacklist güncelle

5. **Raporlama**
   - İhlal raporu hazırla
   - Kullanıcıları bilgilendir (gerekirse)
   - Yasal otoritelere bildir (gerekirse)

**Tahmini Süre**: 2-6 saat

---

## 🔴 Senaryo 5: Data Loss (Partial)

### Senaryo
Belirli bir zaman aralığındaki veriler kayboldu.

### Kurtarma Adımları

1. **Kayıp Veri Tespiti**
   - Hangi tablolar etkilendi?
   - Hangi zaman aralığı?
   - Kaç kayıt etkilendi?

2. **Backup'tan Restore**
   ```bash
   # İlgili backup'ı bul
   node scripts/find-backup.js --table users --date 2024-11-06
   
   # Partial restore
   node scripts/restore-dynamodb.js \
     --backup backups/users-2024-11-06.json \
     --partial \
     --date-range "2024-11-06T00:00:00Z,2024-11-06T23:59:59Z"
   ```

3. **Veri Doğrulama**
   - Restore edilen veriler kontrol edilir
   - İlişkili veriler kontrol edilir
   - Veri bütünlüğü kontrol edilir

**Tahmini Süre**: 1-3 saat

---

## 📊 Backup Stratejisi

### DynamoDB Backup
- **Sıklık**: Günlük (gece 02:00)
- **Retention**: 30 gün
- **Format**: JSON
- **Location**: S3 bucket (`s3://videosat-backups/`)

### Application Backup
- **Sıklık**: Haftalık
- **İçerik**: Environment variables, config files
- **Location**: AWS Secrets Manager

### Database Backup Script
```bash
# Manuel backup
node scripts/backup-dynamodb.js --all

# Cron job (günlük)
0 2 * * * cd /path/to/app && node scripts/backup-dynamodb.js --all
```

---

## 🔄 Failover Procedures

### Automatic Failover
- **Health Check**: `/api/health` endpoint
- **Interval**: 30 saniye
- **Failure Threshold**: 3 başarısız check
- **Recovery Threshold**: 2 başarılı check

### Manual Failover
1. Primary server'ı devre dışı bırak
2. Secondary server'ı aktif et
3. DNS'i güncelle
4. Health check'leri doğrula

---

## 📞 Emergency Contacts

### Internal Team
- **DevOps Lead**: [Name] - [Phone] - [Email]
- **Backend Lead**: [Name] - [Phone] - [Email]
- **On-Call Engineer**: [Name] - [Phone] - [Email]

### External Services
- **AWS Support**: [Support Plan] - [Phone]
- **Agora Support**: [Email]
- **SendGrid Support**: [Email]

---

## 📝 Incident Log Template

```
Incident ID: INC-YYYY-MM-DD-XXX
Date: YYYY-MM-DD HH:MM
Severity: Critical/High/Medium/Low
Type: Database/Application/Security/Network
Description: [Açıklama]
Affected Systems: [Sistemler]
Impact: [Etki]
Resolution: [Çözüm]
Duration: [Süre]
RTO: [Hedef]
RPO: [Hedef]
```

---

## 🧪 DR Testing

### Test Sıklığı
- **Full DR Test**: Yılda 2 kez
- **Partial DR Test**: Her 3 ayda bir
- **Backup Restore Test**: Ayda bir

### Test Senaryoları
1. Database restore test
2. Application failover test
3. Multi-region failover test
4. Backup integrity test

---

**Son Güncelleme**: 2024-11-06
**Son Test Tarihi**: _______________
**Sonraki Test Tarihi**: _______________


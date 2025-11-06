# 🚀 EC2 DEPLOY ADIMLARI - GÜVENLİK GÜNCELLEMELERİ

**Tarih:** 6 Kasım 2025  
**Durum:** Manuel deploy gerekli (SSH bağlantı sorunu)

---

## 📋 DEPLOY ADIMLARI

### 1. Dosyaları EC2'ye Kopyala

**Mac Terminal'den:**

```bash
# 1. Package.json kopyala
scp -i ~/Downloads/basvideo-backend-key.pem \
  backend/api/package.json \
  ubuntu@107.23.178.153:/home/ubuntu/api/

# 2. App.js kopyala
scp -i ~/Downloads/basvideo-backend-key.pem \
  backend/api/app.js \
  ubuntu@107.23.178.153:/home/ubuntu/api/

# 3. Test dosyalarını kopyala
scp -i ~/Downloads/basvideo-backend-key.pem \
  -r backend/api/tests \
  ubuntu@107.23.178.153:/home/ubuntu/api/
```

---

### 2. EC2'de NPM Install

**EC2'ye SSH ile bağlan:**

```bash
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
```

**EC2'de komutları çalıştır:**

```bash
cd /home/ubuntu/api

# Yeni paketleri yükle
npm install

# Yüklü paketleri kontrol et
npm list --depth=0 | grep -E "helmet|express-rate-limit|express-validator"
```

**Beklenen çıktı:**
```
helmet@7.1.0
express-rate-limit@7.1.5
express-validator@7.0.1
```

---

### 3. Backend'i Restart Et

**PM2 ile restart:**

```bash
# Backend'i durdur
pm2 stop basvideo-backend

# Backend'i başlat (yeni kod ile)
pm2 start basvideo-backend

# VEYA direkt restart
pm2 restart basvideo-backend

# Log'ları kontrol et
pm2 logs basvideo-backend --lines 50
```

**Beklenen log çıktısı:**
```
✅ Helmet aktif
✅ Rate limiting aktif
✅ Input validation aktif
📁 Static files serving from: /home/ubuntu
🔑 Agora Service: ✅ Aktif
```

---

### 4. Test Et

**EC2'de test çalıştır:**

```bash
cd /home/ubuntu/api

# API testleri
npm test

# Güvenlik testleri
npm run test:security
```

**VEYA local'den test et:**

```bash
# Production URL ile test
TEST_BASE_URL=https://api.basvideo.com node backend/api/tests/api-test.js
TEST_BASE_URL=https://api.basvideo.com node backend/api/tests/security-test.js
```

---

### 5. Health Check

**Tarayıcıdan veya curl ile:**

```bash
# Health check
curl -I https://api.basvideo.com/api/health

# Beklenen headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

---

## ⚠️ SORUN GİDERME

### SSH Bağlantı Sorunu

**Sorun:** `Connection reset by peer`

**Çözümler:**

1. **Birkaç saniye bekleyip tekrar dene:**
   ```bash
   sleep 5
   ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
   ```

2. **EC2 Instance durumunu kontrol et:**
   - AWS Console → EC2 → Instances
   - Instance durumu: `running` olmalı
   - Status checks: `2/2 checks passed` olmalı

3. **Security Group kontrolü:**
   - Port 22 (SSH) açık olmalı
   - IP adresinizden erişim izni olmalı

### NPM Install Hataları

**Sorun:** `npm install` başarısız

**Çözümler:**

1. **Node.js versiyonunu kontrol et:**
   ```bash
   node --version  # v18+ olmalı
   npm --version
   ```

2. **Cache temizle:**
   ```bash
   npm cache clean --force
   npm install
   ```

3. **Manuel paket yükle:**
   ```bash
   npm install helmet express-rate-limit express-validator
   ```

### Backend Başlamıyor

**Sorun:** PM2 restart sonrası backend çalışmıyor

**Çözümler:**

1. **Log'ları kontrol et:**
   ```bash
   pm2 logs basvideo-backend --lines 100
   ```

2. **Syntax hatası kontrolü:**
   ```bash
   cd /home/ubuntu/api
   node -c app.js
   ```

3. **Manuel başlat:**
   ```bash
   cd /home/ubuntu/api
   node app.js
   ```

---

## ✅ DEPLOY KONTROL LİSTESİ

- [ ] Package.json EC2'ye kopyalandı
- [ ] App.js EC2'ye kopyalandı
- [ ] Test dosyaları EC2'ye kopyalandı
- [ ] `npm install` başarılı
- [ ] Yeni paketler yüklendi (helmet, express-rate-limit, express-validator)
- [ ] Backend restart edildi
- [ ] Log'larda hata yok
- [ ] Health check başarılı
- [ ] Security headers görünüyor
- [ ] Test'ler başarılı

---

## 📊 DEPLOY SONRASI KONTROL

### 1. Rate Limiting Test

```bash
# 101 istek gönder (limit: 100)
for i in {1..101}; do
  curl -s https://api.basvideo.com/api/health > /dev/null
done

# Son istek 429 (Too Many Requests) dönmeli
curl -I https://api.basvideo.com/api/health
```

### 2. Input Validation Test

```bash
# Geçersiz email ile test
curl -X POST https://api.basvideo.com/api/rooms/main-room/join \
  -H "Content-Type: application/json" \
  -d '{"streamerEmail":"invalid-email"}'

# Beklenen: 400 Bad Request
```

### 3. Security Headers Test

```bash
curl -I https://api.basvideo.com/api/health | grep -i "x-"
```

**Beklenen headers:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

## 🎯 SONUÇ

Deploy tamamlandıktan sonra:

1. ✅ Backend güvenli hale geldi
2. ✅ Rate limiting aktif
3. ✅ Input validation aktif
4. ✅ Security headers aktif
5. ✅ Test dosyaları hazır

**Son Güncelleme:** 6 Kasım 2025  
**Durum:** Manuel deploy gerekli


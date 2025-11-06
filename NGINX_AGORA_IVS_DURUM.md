# 🔍 NGINX KURULUMU - AGORA/IVS DURUMU AÇIKLAMASI

**Tarih:** 5 Ocak 2025  
**Endişe:** Proje Agora'ya göre ayarlı, Nginx kurulumu sorun çıkarır mı?

---

## ✅ ÖNEMLİ: NGINX STREAMING PROVIDER'DAN BAĞIMSIZDIR!

### Nginx Ne Yapar?
- **Reverse Proxy**: Backend'i arka planda çalıştırır
- **HTTPS/SSL**: SSL sertifikası ekler
- **Domain Yönlendirme**: IP yerine domain kullanır
- **Port Yönlendirme**: 80/443 → 4000

### Nginx Ne Yapmaz?
- ❌ Streaming provider'ı değiştirmez
- ❌ Backend kodunu değiştirmez
- ❌ Agora/IVS ayarlarını etkilemez
- ❌ Frontend kodunu değiştirmez

**SONUÇ:** Nginx sadece bir **traffic manager**, streaming provider'dan tamamen bağımsız!

---

## 📊 MEVCUT DURUM

### Backend Durumu:
```javascript
// backend/api/app.js
const STREAM_PROVIDER = process.env.STREAM_PROVIDER || 'AGORA'; // Default: AGORA ✅

// Agora service yükleniyor
if (STREAM_PROVIDER === 'AGORA') {
    agoraService = require('./services/agora-service');
    console.log('✅ Agora.io service yüklendi');
}
```

**Durum:** ✅ **Agora aktif, IVS pasif**

---

## 🎯 NGINX KURULUMU SONRASI

### Senaryo 1: Agora Kullanıyorsun (Şu anki durum)

**Önce:**
```
Frontend → http://107.23.178.153:4000/api → Backend (Agora kullanıyor)
```

**Nginx Kurulumu Sonrası:**
```
Frontend → https://api.basvideo.com/api → Nginx → Backend (Agora kullanıyor) ✅
```

**Değişen:** Sadece URL (IP → Domain) ve HTTPS  
**Değişmeyen:** Backend kodu, Agora ayarları, streaming provider

---

### Senaryo 2: IVS'e Geçmek İstersen (İleride)

**Nginx Kurulumu Sonrası:**
```
Frontend → https://api.basvideo.com/api → Nginx → Backend (IVS kullanıyor) ✅
```

**Sadece `.env` dosyasında değişiklik:**
```env
# Agora'dan IVS'e geçiş
STREAM_PROVIDER=AWS_IVS  # Agora yerine
```

**Nginx config'i değişmez!** Backend hangi provider kullanırsa kullansın, Nginx sadece proxy yapar.

---

## 🔧 NGINX CONFIG ÖRNEĞİ

Nginx config'i **provider'dan bağımsız**:

```nginx
server {
    listen 443 ssl http2;
    server_name api.basvideo.com;

    # SSL sertifikası
    ssl_certificate /etc/letsencrypt/live/api.basvideo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.basvideo.com/privkey.pem;

    # Backend'e yönlendir (Agora veya IVS fark etmez!)
    location / {
        proxy_pass http://localhost:4000;  # Backend portu
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Önemli:** Nginx sadece `localhost:4000`'e yönlendirir. Backend içinde Agora mı IVS mi kullanıldığı Nginx'i ilgilendirmez!

---

## ✅ NE YAPMALIYIZ?

### 1. Nginx Kurulumu Yap (Güvenli)

**Neden:**
- ✅ HTTPS/SSL ekler (ücretsiz)
- ✅ Domain kullanımı (profesyonel)
- ✅ Agora/IVS'i etkilemez
- ✅ Backend kodunu değiştirmez

**Süre:** 30-60 dakika  
**Risk:** Yok (streaming provider'dan bağımsız)

---

### 2. Backend `.env` Dosyasını Kontrol Et

**EC2'de kontrol et:**
```bash
ssh -i ~/.ssh/basvideo-backend-key.pem ubuntu@107.23.178.153
cd /home/ubuntu/api
cat .env | grep STREAM_PROVIDER
```

**Beklenen:**
```env
STREAM_PROVIDER=AGORA  # ✅ Agora aktif
AGORA_APP_ID=...
AGORA_APP_CERTIFICATE=...
```

---

### 3. Frontend URL'lerini Güncelle (Nginx Sonrası)

**Nginx kurulumu sonrası:**
```javascript
// Eski
const API_BASE_URL = 'http://107.23.178.153:4000';

// Yeni (Nginx ile)
const API_BASE_URL = 'https://api.basvideo.com';
```

**Agora/IVS değişikliği yok!** Sadece URL değişiyor.

---

## 🔄 IVS'E GERİ DÖNMEK İSTERSEN (İleride)

### Adım 1: `.env` Dosyasını Güncelle

```bash
# EC2'de
cd /home/ubuntu/api
nano .env
```

**Değiştir:**
```env
# Eski
STREAM_PROVIDER=AGORA

# Yeni
STREAM_PROVIDER=AWS_IVS
```

### Adım 2: Backend'i Yeniden Başlat

```bash
pm2 restart basvideo-backend
```

### Adım 3: Nginx Config Değişmez!

Nginx config'i aynı kalır, sadece backend provider değişir.

---

## 📋 ÖZET

### Nginx Kurulumu:
- ✅ **Agora'yı etkilemez**
- ✅ **IVS'i etkilemez**
- ✅ **Backend kodunu değiştirmez**
- ✅ **Sadece URL ve HTTPS ekler**

### Mevcut Durum:
- ✅ **Agora aktif** (default)
- ✅ **IVS kodları hala var** (fallback için)
- ✅ **Nginx kurulumu güvenli**

### Öneri:
**✅ Nginx kurulumunu yap!** Streaming provider'dan bağımsız, sadece HTTPS ve domain ekler.

---

## 🎯 SONUÇ

**Endişen yersiz!** Nginx kurulumu:
- ✅ Agora ayarlarını korur
- ✅ IVS ayarlarını korur
- ✅ Backend kodunu değiştirmez
- ✅ Sadece HTTPS ve domain ekler

**Nginx = Traffic Manager (Provider'dan bağımsız)**

---

**Son Güncelleme:** 5 Ocak 2025  
**Durum:** ✅ Nginx kurulumu güvenli ve önerilir


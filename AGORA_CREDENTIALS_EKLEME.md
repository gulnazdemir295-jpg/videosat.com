# 🔧 Agora Credentials Ekleme Rehberi

**Tarih:** 6 Kasım 2025  
**Sorun:** Backend'de Agora credentials eksik  
**Durum:** ⚠️ Agora App ID ve Certificate eklenmeli

---

## ❌ SORUN

Backend'den 500 hatası alınıyor:
```json
{
  "error": "agora_service_required",
  "detail": "Agora.io service gerekli. STREAM_PROVIDER=AGORA ve AGORA_APP_ID, AGORA_APP_CERTIFICATE environment variable'larını kontrol edin."
}
```

---

## ✅ ÇÖZÜM

### 1. Agora.io Hesabından Credentials Alın

1. **Agora.io Console'a gidin:** https://console.agora.io/
2. **Proje seçin** veya **yeni proje oluşturun**
3. **App ID'yi kopyalayın** (32 karakter)
4. **App Certificate'ı kopyalayın** (32 karakter)

### 2. EC2'de .env Dosyasını Güncelleyin

**EC2 Terminal'inde:**

```bash
# .env dosyasını düzenle
nano /home/ubuntu/api/.env
```

**Şu satırları ekleyin/güncelleyin:**

```env
# Agora.io Configuration
STREAM_PROVIDER=AGORA
AGORA_APP_ID=YOUR_AGORA_APP_ID_HERE
AGORA_APP_CERTIFICATE=YOUR_AGORA_APP_CERTIFICATE_HERE

# Backend Port (güncellendi: 3000)
PORT=3000
```

**Örnek:**
```env
STREAM_PROVIDER=AGORA
AGORA_APP_ID=12345678901234567890123456789012
AGORA_APP_CERTIFICATE=abcdef1234567890abcdef1234567890
PORT=3000
```

### 3. Backend'i Yeniden Başlatın

```bash
pm2 restart basvideo-backend
```

### 4. Test Edin

```bash
# Backend health check
curl https://api.basvideo.com/api/health

# Canlı yayın test
# https://basvideo.com/live-stream.html
```

---

## 📋 ADIM ADIM

### EC2 Terminal'inde:

```bash
# 1. .env dosyasını düzenle
nano /home/ubuntu/api/.env

# 2. Şu satırları ekle/güncelle:
STREAM_PROVIDER=AGORA
AGORA_APP_ID=YOUR_AGORA_APP_ID_HERE
AGORA_APP_CERTIFICATE=YOUR_AGORA_APP_CERTIFICATE_HERE
PORT=3000

# 3. Kaydet: Ctrl+X → Y → Enter

# 4. Backend'i yeniden başlat
pm2 restart basvideo-backend

# 5. Log'ları kontrol et
pm2 logs basvideo-backend --lines 20
```

---

## 🔍 KONTROL

### Backend Log'larında Görmeli:
```
✅ Agora service yüklendi
📡 Streaming Provider: AGORA
✅ Backend API çalışıyor: http://localhost:3000
```

### Hata Durumunda:
```
❌ Agora service yüklenemedi
   STREAM_PROVIDER: AGORA
   AGORA_APP_ID: (boş veya yanlış)
```

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Agora App ID:** 32 karakter olmalı
2. **Agora App Certificate:** 32 karakter olmalı
3. **STREAM_PROVIDER:** Mutlaka `AGORA` olmalı
4. **PORT:** 3000 olmalı (Nginx ile uyumlu)

---

## 🚀 HIZLI ÇÖZÜM

EC2 Terminal'inde tek komutla:

```bash
cd /home/ubuntu/api && \
echo "" >> .env && \
echo "# Agora.io Configuration" >> .env && \
echo "STREAM_PROVIDER=AGORA" >> .env && \
echo "AGORA_APP_ID=YOUR_AGORA_APP_ID_HERE" >> .env && \
echo "AGORA_APP_CERTIFICATE=YOUR_AGORA_APP_CERTIFICATE_HERE" >> .env && \
echo "PORT=3000" >> .env && \
nano .env
```

Sonra `YOUR_AGORA_APP_ID_HERE` ve `YOUR_AGORA_APP_CERTIFICATE_HERE` değerlerini gerçek değerlerle değiştirin.

---

**Son Güncelleme:** 6 Kasım 2025, 10:25 UTC


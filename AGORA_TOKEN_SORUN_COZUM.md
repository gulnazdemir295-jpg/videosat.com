# 🔧 Agora Token Sorunu Çözümü

**Tarih:** 6 Kasım 2025  
**Hata:** `AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: invalid vendor key, can not find appid`

---

## ✅ YAPILAN DÜZELTMELER

### 1. Token Formatı Düzeltildi
- Token buffer'daki gereksiz 4 byte kaldırıldı
- Agora resmi token formatına uygun hale getirildi

### 2. Backend Güncellendi
- `agora-service.js` güncellendi
- Backend yeniden başlatıldı

---

## 🔍 KONTROL EDİLMESİ GEREKENLER

### 1. App ID ve Certificate Aynı Projeden mi?

**Agora Console'da kontrol edin:**
1. https://console.agora.io/ → Projeler
2. Projenizi seçin
3. **Basic Info** veya **Project Settings** sekmesine gidin
4. **App ID** ve **Primary Certificate** değerlerini kontrol edin

**Şu anki değerler:**
- App ID: `aa3df0d5845042fd9d298901becdb0e2`
- Certificate: `5ac32128193e418bb4bde5d0c367ef67`

**Kontrol:**
- Bu iki değer aynı projeden mi?
- Certificate "Primary Certificate" mı yoksa "Secondary Certificate" mı?

---

### 2. Certificate Doğru mu?

**Agora Console'da:**
- **Primary Certificate** kullanılıyor mu?
- Eğer "Swap Certificates" tuşuna basıldıysa, şimdi **Secondary Certificate** birincil olmuş olabilir

**Çözüm:**
- Agora Console'dan **Primary Certificate** değerini tekrar kopyalayın
- `.env` dosyasını güncelleyin
- Backend'i yeniden başlatın

---

### 3. Token Formatı

**Token formatı düzeltildi:**
- Version 2 formatı kullanılıyor
- Message: appId + channelName + uid + expire + salt + role
- Signature: HMAC SHA256

---

## 🚀 TEST ADIMLARI

### 1. Agora Console Kontrolü
```bash
# Agora Console'a gidin
https://console.agora.io/
→ Projeler → Projenizi seçin
→ Basic Info sekmesi
→ App ID ve Primary Certificate'ı kontrol edin
```

### 2. .env Dosyasını Güncelleyin
```bash
# EC2 Terminal'de
nano /home/ubuntu/api/.env

# Şu satırları güncelleyin:
AGORA_APP_ID=AGORA_CONSOLE_DAN_ALINAN_APP_ID
AGORA_APP_CERTIFICATE=AGORA_CONSOLE_DAN_ALINAN_PRIMARY_CERTIFICATE
```

### 3. Backend'i Yeniden Başlatın
```bash
pm2 restart basvideo-backend
```

### 4. Test Edin
```bash
# Backend test
curl -X POST http://localhost:3000/api/rooms/test-room/join \
  -H "Content-Type: application/json" \
  -d '{"streamerEmail":"test@test.com","streamerName":"Test"}'
```

### 5. Frontend Test
- https://basvideo.com/live-stream.html
- "Yayını Başlat" butonuna tıklayın
- Console'da hata olmamalı

---

## ⚠️ ÖNEMLİ NOTLAR

1. **App ID ve Certificate aynı projeden olmalı**
2. **Primary Certificate kullanılmalı** (Secondary değil)
3. **Certificate'da boşluk olmamalı**
4. **App ID 32 karakter olmalı**
5. **Certificate 32 karakter olmalı**

---

## 🔄 ALTERNATİF ÇÖZÜM

Eğer sorun devam ederse:

1. **Yeni bir Agora projesi oluşturun**
2. **Yeni App ID ve Certificate alın**
3. **.env dosyasını güncelleyin**
4. **Backend'i yeniden başlatın**

---

**Son Güncelleme:** 6 Kasım 2025, 10:55 UTC


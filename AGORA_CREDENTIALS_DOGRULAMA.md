# ✅ Agora Credentials Doğrulama Rehberi

**Tarih:** 6 Kasım 2025  
**Hata:** `invalid vendor key, can not find appid`

---

## 🔍 SORUN TESPİTİ

Bu hata genellikle şu nedenlerden kaynaklanır:
1. ❌ App ID ve Certificate **farklı projelerden**
2. ❌ Certificate **yanlış** (Secondary yerine Primary kullanılmalı)
3. ❌ App ID **yanlış kopyalanmış**
4. ❌ Token formatı yanlış (✅ düzeltildi)

---

## ✅ YAPILAN DÜZELTMELER

1. ✅ Token formatı düzeltildi (gereksiz 4 byte kaldırıldı)
2. ✅ Frontend'e token null fallback eklendi
3. ✅ Certificate hex formatı doğrulandı (32 karakter, hex)

---

## 📋 AGORA CONSOLE KONTROLÜ

### Adım 1: Agora Console'a Gidin
**URL:** https://console.agora.io/

### Adım 2: Projenizi Seçin
- **Projects** → Projenizi seçin
- Proje adı: `basvideo-live-streaming` (veya oluşturduğunuz proje)

### Adım 3: Basic Info Sekmesine Gidin
- Proje detay sayfasında **"Basic Info"** veya **"Project Settings"** sekmesi
- Veya sol menüden **"Config"** sekmesi

### Adım 4: App ID ve Certificate Kontrolü

**Şu anki değerler (EC2'de):**
```
App ID: aa3df0d5845042fd9d298901becdb0e2
Certificate: 5ac32128193e418bb4bde5d0c367ef67
```

**Kontrol edin:**
1. ✅ Agora Console'daki **App ID** = `aa3df0d5845042fd9d298901becdb0e2` mi?
2. ✅ Agora Console'daki **Primary Certificate** = `5ac32128193e418bb4bde5d0c367ef67` mi?
3. ✅ İkisi de **aynı projeden** mi?

---

## 🔧 EĞER FARKLIYSA

### 1. Doğru Değerleri Kopyalayın
- Agora Console'dan **App ID**'yi kopyalayın
- Agora Console'dan **Primary Certificate**'ı kopyalayın (Secondary değil!)

### 2. EC2'de .env Dosyasını Güncelleyin
```bash
# EC2 Terminal'de
nano /home/ubuntu/api/.env
```

**Şu satırları güncelleyin:**
```env
AGORA_APP_ID=AGORA_CONSOLE_DAN_ALINAN_APP_ID
AGORA_APP_CERTIFICATE=AGORA_CONSOLE_DAN_ALINAN_PRIMARY_CERTIFICATE
```

**Kaydet:** `Ctrl+X` → `Y` → `Enter`

### 3. Backend'i Yeniden Başlatın
```bash
pm2 restart basvideo-backend
```

---

## 🧪 TEST

### Backend Test
```bash
curl -X POST http://localhost:3000/api/rooms/test-room/join \
  -H "Content-Type: application/json" \
  -d '{"streamerEmail":"test@test.com","streamerName":"Test"}'
```

**Beklenen sonuç:**
```json
{
  "ok": true,
  "appId": "aa3df0d5845042fd9d298901becdb0e2",
  "publisherToken": "...",
  "webrtc": {
    "appId": "aa3df0d5845042fd9d298901becdb0e2",
    "token": "..."
  }
}
```

### Frontend Test
1. https://basvideo.com/live-stream.html
2. "Yayını Başlat" butonuna tıklayın
3. Console'da hata olmamalı

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Primary Certificate kullanın** (Secondary değil!)
2. **App ID ve Certificate aynı projeden olmalı**
3. **Certificate'da boşluk olmamalı**
4. **App ID 32 karakter olmalı**
5. **Certificate 32 karakter hex olmalı**

---

## 🔄 ALTERNATİF: YENİ PROJE OLUŞTURUN

Eğer sorun devam ederse:

1. **Agora Console'da yeni proje oluşturun**
2. **Yeni App ID ve Primary Certificate alın**
3. **EC2'de .env dosyasını güncelleyin**
4. **Backend'i yeniden başlatın**

---

**Son Güncelleme:** 6 Kasım 2025, 11:00 UTC


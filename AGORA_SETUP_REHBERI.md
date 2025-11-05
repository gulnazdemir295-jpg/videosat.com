# Agora.io Setup Rehberi

## 📋 Gerekli Environment Variables

Backend'de `.env` dosyasına şunları ekleyin:

```env
# Agora.io Configuration
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_app_certificate_here

# Stream Provider (default: AGORA)
STREAM_PROVIDER=AGORA

# Backend Port
PORT=3000
```

## 🔑 Agora.io Credentials Nasıl Alınır?

1. **Agora.io hesabı oluşturun**: https://console.agora.io/
2. **Proje oluşturun**: Console → Projects → Create Project
3. **App ID'yi kopyalayın**: Project Settings'den
4. **App Certificate'ı oluşturun**: Project Settings → App Certificate → Generate
5. **Credentials'ları .env dosyasına ekleyin**

## ⚠️ ÖNEMLİ

- `.env` dosyası `.gitignore`'da olmalı
- Asla GitHub'a push etmeyin
- Production'da environment variables kullanın

## 🚀 Backend Başlatma

```bash
cd backend/api
npm install
# .env dosyasını oluşturun ve credentials'ları ekleyin
npm start
```

Backend `http://localhost:3000` adresinde çalışacak.

## ✅ Kontrol

Backend başladığında şu mesajı görmelisiniz:
```
✅ Agora.io service yüklendi
✅ Backend API running on http://localhost:3000
```

---

**Son Güncelleme**: 2025-01-05


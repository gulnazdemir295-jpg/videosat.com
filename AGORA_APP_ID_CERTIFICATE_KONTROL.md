# Agora App ID ve Certificate Kontrolü 🔍

## ⚠️ Sorun: "invalid vendor key, can not find appid"

Bu hata genellikle şu durumlardan kaynaklanır:
1. **App ID ve Certificate farklı projelerden** (en yaygın)
2. App ID yanlış kopyalanmış
3. Certificate yanlış kopyalanmış
4. Token formatı yanlış

## ✅ Kontrol Adımları

### 1. Agora Console'da Kontrol Edin

1. Agora Console → Projeler → `basvideo-canlı-yayın` projesine gidin
2. **"Temel Ayarlar" (Basic Settings)** veya **"Basic Info"** sekmesine gidin
3. **"Uygulama Kimliği" (App ID)** değerini kopyalayın
4. **"Birincil Sertifika" (Primary Certificate)** değerini kopyalayın

### 2. .env Dosyasındaki Değerlerle Karşılaştırın

Terminal'de:
```bash
cd /Users/gulnazdemir/Desktop/DENEME/backend/api
cat .env | grep AGORA
```

**Kontrol edin:**
- `.env` dosyasındaki `AGORA_APP_ID` = Agora Console'daki **App ID** ile aynı mı?
- `.env` dosyasındaki `AGORA_APP_CERTIFICATE` = Agora Console'daki **Primary Certificate** ile aynı mı?

### 3. Eğer Farklıysa

1. Agora Console'dan **doğru App ID** ve **doğru Primary Certificate**'ı kopyalayın
2. `.env` dosyasını düzenleyin:
   ```bash
   nano .env
   ```
3. Her iki değeri de güncelleyin
4. Backend'i yeniden başlatın

---

## 🔄 Swap (Takas) Tuşuna Basıldıysa

Eğer "Takas Sertifikaları" (Swap Certificates) tuşuna bastıysanız:
- Birincil ve İkincil sertifikalar yer değiştirmiş olabilir
- Şimdi **"Birincil Sertifika"** aslında eski **"İkincil Sertifika"** olabilir
- **"İkincil Sertifika"** aslında eski **"Birincil Sertifika"** olabilir

**Çözüm:**
- Tekrar "Takas Sertifikaları" tuşuna basın (geri almak için)
- Veya "İkincil Sertifika"yı kullanın (şimdi birincil olmuş olabilir)

---

## 📋 Önemli Notlar

- **App ID**: 32 karakter (hex)
- **Certificate**: 32 karakter (hex)
- **Her ikisi de aynı projeden olmalı!**
- Boşluk olmamalı
- Küçük/büyük harf önemli değil (hex)

---

## 🎯 Şimdi Yapmanız Gerekenler

1. Agora Console'da **App ID** ve **Primary Certificate**'ı kopyalayın
2. `.env` dosyasındaki değerlerle karşılaştırın
3. Eğer farklıysa, `.env` dosyasını güncelleyin
4. Backend'i yeniden başlatın


# Agora "invalid vendor key" Hatası - Çözüm 🔧

## ✅ Kontrol Edilenler
- ✅ App ID doğru (32 karakter)
- ✅ Certificate formatı doğru (32 karakter)
- ✅ Token oluşturma başarılı
- ✅ Backend doğru çalışıyor

## ⚠️ Olası Sorun: Certificate Yanlış Projeden

"invalid vendor key, can not find appid" hatası genellikle:
- **App ID ve Certificate farklı projelerden** olduğunda oluşur
- Certificate yanlış kopyalanmışsa
- Certificate'ın App ID ile eşleşmediğinde

## 🔍 Son Kontrol

### Agora Console'da Doğrulayın:

1. **Agora Console** → **Projeler** → `basvideo-canlı-yayın` projesine gidin
2. **"Temel Ayarlar"** veya **"Basic Info"** sekmesine gidin
3. **"Uygulama Kimliği" (App ID)** değerini kopyalayın
4. **"Birincil Sertifika" (Primary Certificate)** değerini kopyalayın

### Terminal'de Karşılaştırın:

```bash
cd /Users/gulnazdemir/Desktop/DENEME/backend/api
cat .env | grep AGORA
```

**Kontrol edin:**
- `.env` dosyasındaki `AGORA_APP_ID` = Agora Console'daki **App ID** ile **TAM OLARAK** aynı mı? (karakter karakter)
- `.env` dosyasındaki `AGORA_APP_CERTIFICATE` = Agora Console'daki **Primary Certificate** ile **TAM OLARAK** aynı mı? (karakter karakter)

### Eğer Farklıysa:

1. Agora Console'dan **App ID** ve **Primary Certificate**'ı **tekrar kopyalayın**
2. `.env` dosyasını düzenleyin:
   ```bash
   nano .env
   ```
3. **Her iki değeri de** silin ve **yeniden yapıştırın**
4. Backend'i yeniden başlatın:
   ```bash
   cd /Users/gulnazdemir/Desktop/DENEME
   pkill -f "node.*app.js"
   ./start-backend.sh
   ```

## 🔄 Alternatif Çözüm: Token Olmadan Test

Eğer sorun devam ederse, geçici olarak token olmadan test edebilirsiniz:

1. Agora Console'da projenizin ayarlarına gidin
2. **"App Certificate"** ayarını **devre dışı bırakın** (eğer mümkünse)
3. Frontend'de token olmadan join deneyin

**Not**: Bu sadece test için. Production'da mutlaka token kullanılmalı.

## 📋 Diğer Kontroller

- Backend'in çalıştığından emin olun: `curl http://localhost:3000/api/health`
- Agora SDK versiyonu: `4.20.0` (doğru)
- Token formatı: Base64 (doğru)

---

**En önemli kontrol**: App ID ve Certificate'ın **aynı projeden** ve **tam olarak eşleştiğinden** emin olun!


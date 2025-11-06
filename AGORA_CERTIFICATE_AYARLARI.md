# Agora "invalid vendor key" Hatası - App Certificate Ayarları 🔧

## ⚠️ Sorun Devam Ediyor

"invalid vendor key, can not find appid" hatası hala görünüyor. Bu genellikle:

1. **App Certificate Agora Console'da aktif değil**
2. **Certificate yanlış projeden**
3. **Agora Console'da bir ayar eksik**

## ✅ Agora Console'da Kontrol Edilmesi Gerekenler

### 1. App Certificate Aktif mi?

1. Agora Console → Projeler → `basvideo-canlı-yayın` projesine gidin
2. **"Temel Ayarlar" (Basic Settings)** veya **"Basic Info"** sekmesine gidin
3. **"Güvenlik" (Security)** bölümünü bulun
4. **"App Certificate"** veya **"Primary Certificate"** bölümünde:
   - **"Enable"** veya **"Aktif"** butonu var mı?
   - **Varsa aktif edin!**
   - Eğer zaten aktifse, **"Generate"** veya **"Yeniden Oluştur"** butonuna tıklayın

### 2. Certificate Formatı

- Certificate **32 karakter** (hex format) olmalı
- Örnek: `5ac32128193e418bb4bde5d0c367ef67`
- Boşluk olmamalı
- Küçük/büyük harf önemli değil (hex)

### 3. App ID ve Certificate Eşleşmesi

- **App ID** ve **Certificate** aynı projeden olmalı
- Agora Console'da projenizin detay sayfasında:
  - **App ID**: `aa3df0d5845042fd9d298901becdb0e2`
  - **Primary Certificate**: (Console'dan kopyalayın)

## 🔄 Alternatif Çözüm: Certificate Olmadan Test (Geçici)

Eğer sorun devam ederse, geçici olarak certificate olmadan test edebilirsiniz:

### Backend'de Token Olmadan Test:

1. Agora Console'da projenizin ayarlarına gidin
2. **"App Certificate"** ayarını **devre dışı bırakın** (eğer mümkünse)
3. Frontend'de token olmadan join deneyin

**Not**: Bu sadece test için. Production'da mutlaka token kullanılmalı.

### Frontend'de Token Olmadan Test:

`live-stream.js` dosyasında `agoraClient.join()` çağrısında token'ı `null` yapabilirsiniz (geçici olarak):

```javascript
const joinedUid = await agoraClient.join(
    channelData.appId,
    channelData.channelName,
    null, // Token olmadan test (GEÇİCİ)
    uid || null
);
```

## 📋 Kontrol Listesi

- [ ] Agora Console'da App Certificate aktif mi?
- [ ] App ID ve Certificate aynı projeden mi?
- [ ] Certificate doğru kopyalanmış mı? (32 karakter, boşluk yok)
- [ ] Backend `.env` dosyasında değerler doğru mu?
- [ ] Backend yeniden başlatıldı mı?

---

**En önemli kontrol**: Agora Console'da **"App Certificate"** ayarının **aktif** olduğundan emin olun!


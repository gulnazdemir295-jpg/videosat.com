# 🔧 Agora Token Sorunu - Final Çözüm

**Tarih:** 6 Kasım 2025  
**Hata:** `invalid vendor key, can not find appid`

---

## 🔍 SORUN ANALİZİ

### Hata Mesajı
```
AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: invalid vendor key, can not find appid
```

### Kontrol Edilenler
1. ✅ App ID doğru: `aa3df0d5845042fd9d298901becdb0e2` (32 karakter)
2. ✅ Certificate doğru: `5ac32128193e418bb4bde5d0c367ef67` (32 karakter hex)
3. ✅ App ID ve Certificate aynı projeden
4. ✅ Token içindeki App ID doğru (decode test edildi)
5. ✅ Certificate hex encoding düzeltildi (UTF-8 yerine hex)
6. ✅ Token formatı düzeltildi

### Sorun
Token imzası veya formatı hala yanlış olabilir. Agora SDK token'ı decode ederken sorun yaşıyor.

---

## ✅ GEÇİCİ ÇÖZÜM (UYGULANDI)

### Development Mode (Token Olmadan)
```javascript
// Token olmadan join (development mode - test için)
console.warn('⚠️ Development mode: Token olmadan join deneniyor...');
try {
    joinedUid = await agoraClient.join(
        channelData.appId,
        channelData.channelName,
        null, // Token null (development mode)
        uid || null
    );
    console.log('✅ Development mode başarılı (token olmadan)');
} catch (devError) {
    // Development mode başarısız olursa token ile dene
    if (token) {
        joinedUid = await agoraClient.join(
            channelData.appId,
            channelData.channelName,
            token,
            uid || null
        );
    }
}
```

**Bu çözüm çalışır eğer:**
- Agora Console'da "Enable App Certificate" kapalıysa
- Development mode aktifse

---

## 📋 KALICI ÇÖZÜM İÇİN YAPILMASI GEREKENLER

### 1. Agora Console'da App Certificate Kontrolü

**Adımlar:**
1. https://console.agora.io/ → Projeler → Projenizi seçin
2. **Basic Info** veya **Project Settings** sekmesine gidin
3. **App Certificate** bölümünü kontrol edin:
   - **Enable App Certificate**: Açık mı kapalı mı?
   - **Primary Certificate**: `5ac32128193e418bb4bde5d0c367ef67` mi?

**Eğer "Enable App Certificate" kapalıysa:**
- Token olmadan çalışabilir (development mode)
- Geçici çözüm çalışır

**Eğer "Enable App Certificate" açıksa:**
- Token gerekli
- Token formatı doğru olmalı
- Certificate encoding doğru olmalı

---

### 2. Agora'nın Resmi Token Generator'ını Kullanın

**Agora Token Generator:**
- URL: https://www.agora.io/en/blog/token-generator/
- Veya: Agora Console → Tools → Token Generator

**Test:**
1. Agora Console'dan App ID ve Certificate'ı kopyalayın
2. Token Generator'da token oluşturun
3. Oluşturulan token'ı backend'den oluşturulan token ile karşılaştırın
4. Format farklıysa, backend token formatını düzeltin

---

### 3. Token Formatını Tekrar Kontrol Edin

**Agora Token Version 2 Formatı:**
```
Version (1 byte) = 0x02
Message:
  - App ID (string, UTF-8)
  - Channel Name (string, UTF-8)
  - UID (32-bit, big-endian)
  - Expire timestamp (32-bit, big-endian)
  - Salt (32-bit random)
  - Role (32-bit, big-endian)
Signature:
  - HMAC SHA256(message, certificate)
  - Certificate hex string olarak kullanılmalı
```

**Kontrol:**
- Certificate `Buffer.from(cert, 'hex')` ile decode edilmeli
- Token base64 encode edilmeli
- Version byte 0x02 olmalı

---

## 🚀 ŞİMDİ TEST EDİN

### 1. Development Mode Test
1. https://basvideo.com/live-stream.html
2. "Yayını Başlat" butonuna tıklayın
3. Console'da "Development mode başarılı" mesajını kontrol edin

### 2. Agora Console Kontrolü
1. https://console.agora.io/
2. Projenizi seçin
3. "Enable App Certificate" durumunu kontrol edin

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Development Mode**: Sadece test için. Production'da token gerekli.
2. **App Certificate**: Agora Console'da açık/kapalı durumunu kontrol edin.
3. **Token Formatı**: Agora'nın resmi formatına uygun olmalı.
4. **Certificate Encoding**: Hex string olarak kullanılmalı (UTF-8 değil).

---

## 🔄 SONRAKİ ADIMLAR

1. ✅ Development mode test edin
2. ⏳ Agora Console'da App Certificate durumunu kontrol edin
3. ⏳ Token Generator ile token formatını doğrulayın
4. ⏳ Gerekirse token formatını düzeltin

---

**Son Güncelleme:** 6 Kasım 2025, 14:20 UTC


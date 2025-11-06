# 🐛 AgoraRTC Yayın Konsol Hataları - Detaylı Liste

## 📋 Genel Bakış

Bu dokümanda AgoraRTC yayın sistemiyle ilgili **tüm olası konsol hataları** kategorize edilmiş ve çözümleri listelenmiştir.

---

## 🔴 1. SDK Yükleme Hataları

### 1.1. Agora SDK Yüklenemedi
```javascript
❌ Agora SDK yüklenemedi!
TypeError: Cannot read property 'createClient' of undefined
```

**Sebep**: 
- Agora SDK script'i yüklenmemiş
- Script yolu yanlış
- Network hatası
- Script yüklenmeden kod çalıştırılmış

**Çözüm**:
```html
<!-- Agora SDK script'ini ekle -->
<script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.20.0.js"></script>
```

**Mevcut Çözüm**: ✅ `live-stream.js`'de SDK yüklenene kadar bekleme mekanizması var

---

### 1.2. Agora SDK Versiyon Uyumsuzluğu
```javascript
Warning: Agora SDK version mismatch
```

**Sebep**: 
- SDK versiyonu eski
- API değişiklikleri

**Çözüm**:
- En son SDK versiyonunu kullan
- API değişikliklerini kontrol et

---

## 🔴 2. Token Hataları

### 2.1. Dynamic Key Expired
```javascript
AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: flag: 4096, 
message: AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: dynamic key expired
```

**Sebep**: 
- Token süresi dolmuş (1 saat)
- Token renewal başarısız
- Token expire event'i çalışmamış

**Çözüm**:
- ✅ `token-privilege-will-expire` event listener aktif
- ✅ `token-privilege-did-expire` event listener aktif
- ✅ `renewAgoraToken()` fonksiyonu var
- ✅ Backend'de token renewal endpoint var

**Kod**:
```javascript
// live-stream.js - Zaten implement edilmiş
agoraClient.on('token-privilege-will-expire', async () => {
    await renewAgoraToken();
});
```

---

### 2.2. Invalid Token
```javascript
AgoraRTCError INVALID_TOKEN: Invalid token
Error code: 4097
```

**Sebep**:
- Token formatı geçersiz
- Token signature hatası
- App ID/Certificate uyuşmazlığı
- Token generation hatası

**Çözüm**:
- Token generation kodunu kontrol et
- App ID ve Certificate doğru mu kontrol et
- Token formatını doğrula

**Kontrol**:
```javascript
// backend/api/services/agora-service.js
// Token generation'ı kontrol et
```

---

### 2.3. Token Expired
```javascript
AgoraRTCError TOKEN_EXPIRED: Token expired
Error code: 4098
```

**Sebep**:
- Token süresi dolmuş
- Token renewal başarısız

**Çözüm**:
- ✅ Token renewal mekanizması aktif
- Token expire öncesi yenileme yap

---

### 2.4. Token Generation Failed
```javascript
Error: Agora App ID ve App Certificate gerekli
```

**Sebep**:
- Environment variables eksik
- AGORA_APP_ID veya AGORA_APP_CERTIFICATE set edilmemiş

**Çözüm**:
```env
AGORA_APP_ID=your-32-character-app-id
AGORA_APP_CERTIFICATE=your-certificate-hex-string
```

---

## 🔴 3. Network Hataları

### 3.1. CAN_NOT_GET_GATEWAY_SERVER
```javascript
AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: flag: 4096
Error code: 4096
```

**Sebep**:
- Network bağlantısı yok
- Firewall/proxy engellemesi
- Agora gateway server'a erişilemiyor
- DNS çözümleme hatası

**Çözüm**:
- Network bağlantısını kontrol et
- Firewall/proxy ayarlarını kontrol et
- Agora gateway server'larına erişim izni ver
- DNS ayarlarını kontrol et

**Kontrol**:
```bash
# Agora gateway server'lara ping at
ping gateway.agora.io
```

---

### 3.2. NETWORK_ERROR
```javascript
AgoraRTCError NETWORK_ERROR: Network error
```

**Sebep**:
- Network bağlantısı kesildi
- Internet bağlantısı yavaş
- Timeout hatası

**Çözüm**:
- ✅ Network quality monitoring aktif
- ✅ Reconnection mekanizması var
- Internet bağlantısını kontrol et

---

### 3.3. CONNECTION_LOST
```javascript
AgoraRTCError CONNECTION_LOST: Connection lost
```

**Sebep**:
- Network bağlantısı kesildi
- Timeout hatası
- Server bağlantısı kopmuş

**Çözüm**:
- ✅ Connection state monitoring aktif
- ✅ Automatic reconnection var
- Network bağlantısını kontrol et

---

### 3.4. Network Timeout
```javascript
Error: Network timeout
```

**Sebep**:
- Yavaş network
- Gateway server yanıt vermiyor
- Firewall timeout

**Çözüm**:
- Network bağlantısını kontrol et
- Timeout süresini artır
- Retry mekanizması ekle

---

## 🔴 4. App ID Hataları

### 4.1. Invalid App ID
```javascript
AgoraRTCError INVALID_APP_ID: Invalid App ID
Error code: 4099
```

**Sebep**:
- App ID yanlış veya geçersiz
- App ID 32 karakter değil
- Environment variable eksik

**Çözüm**:
```env
AGORA_APP_ID=your-32-character-app-id
```

**Kontrol**:
```javascript
// live-stream.js - Zaten kontrol var
if (!channelData.appId || channelData.appId.length !== 32) {
    throw new Error(`Geçersiz App ID: ${channelData.appId}`);
}
```

---

### 4.2. App ID Mismatch
```javascript
Error: App ID mismatch between token and client
```

**Sebep**:
- Token'daki App ID ile client'taki App ID uyuşmuyor
- Token farklı bir App ID ile oluşturulmuş

**Çözüm**:
- Token generation'da App ID'yi kontrol et
- Client'ta kullanılan App ID'yi kontrol et
- Aynı App ID'yi kullandığından emin ol

---

### 4.3. App ID Not Set
```javascript
Error: Agora App ID gerekli
```

**Sebep**:
- Environment variable set edilmemiş
- Backend'de App ID yok

**Çözüm**:
```env
AGORA_APP_ID=your-32-character-app-id
```

---

## 🔴 5. Channel Hataları

### 5.1. Invalid Channel Name
```javascript
AgoraRTCError INVALID_CHANNEL_NAME: Invalid channel name
Error code: 4100
```

**Sebep**:
- Channel name geçersiz karakter içeriyor
- Channel name çok uzun (max 64 karakter)
- Channel name boş
- Channel name özel karakter içeriyor

**Çözüm**:
- Channel name validation ekle
- Channel name'i sanitize et
- Max length kontrolü yap

**Mevcut Çözüm**:
```javascript
// backend/api/app.js - Zaten sanitize ediliyor
const safeStreamerEmail = streamerEmail.replace(/[^a-zA-Z0-9-_]/g, '_');
const channelName = `${roomId}-${channelId}`;
```

---

### 5.2. Channel Not Found
```javascript
AgoraRTCError CHANNEL_NOT_FOUND: Channel not found
Error code: 4101
```

**Sebep**:
- Channel silinmiş
- Channel ID yanlış
- Channel backend'de yok

**Çözüm**:
- Channel ID'yi kontrol et
- Backend'de channel existence kontrolü yap
- Channel oluşturulduğundan emin ol

---

### 5.3. Channel Already Exists
```javascript
Error: Channel already exists
```

**Sebep**:
- Aynı channel name ile birden fazla channel oluşturulmaya çalışılıyor

**Çözüm**:
- Unique channel name kullan
- Timestamp veya random ID ekle

**Mevcut Çözüm**: ✅ Channel ID'ye timestamp ekleniyor

---

## 🔴 6. Media Device Hataları

### 6.1. Camera Access Denied
```javascript
NotAllowedError: Permission denied
DOMException: The request is not allowed by the user agent or the platform
```

**Sebep**:
- Kullanıcı kamera iznini reddetti
- Tarayıcı ayarlarından izin verilmemiş
- Site için izin verilmemiş

**Çözüm**:
- ✅ Error handling var
- ✅ User-friendly error message var
- Kullanıcıya izin vermesi için talimat ver

**Mevcut Çözüm**:
```javascript
// live-stream.js - Zaten implement edilmiş
if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    errorMessage = 'Kamera erişimi reddedildi. Lütfen tarayıcı ayarlarından kamera ve mikrofon izinlerini verin.';
}
```

---

### 6.2. Camera Not Found
```javascript
NotFoundError: No camera found
DOMException: Requested device not found
```

**Sebep**:
- Kamera bağlı değil
- Kamera driver sorunu
- Kamera sistem tarafından tanınmıyor

**Çözüm**:
- ✅ Error handling var
- Kullanıcıya kamera bağlaması için talimat ver

**Mevcut Çözüm**:
```javascript
// live-stream.js - Zaten implement edilmiş
if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    errorMessage = 'Kamera bulunamadı. Lütfen bir kamera bağlı olduğundan emin olun.';
}
```

---

### 6.3. Camera In Use
```javascript
NotReadableError: Camera in use
DOMException: Could not start video source
```

**Sebep**:
- Başka bir uygulama kamerayı kullanıyor
- Kamera lock'lu
- Kamera driver sorunu

**Çözüm**:
- ✅ Error handling var
- Kullanıcıya diğer uygulamaları kapatması için talimat ver

**Mevcut Çözüm**:
```javascript
// live-stream.js - Zaten implement edilmiş
if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    errorMessage = 'Kamera kullanımda. Lütfen başka bir uygulama kamerayı kullanıyorsa kapatın.';
}
```

---

### 6.4. Microphone Access Denied
```javascript
NotAllowedError: Microphone permission denied
```

**Sebep**:
- Kullanıcı mikrofon iznini reddetti
- Tarayıcı ayarlarından izin verilmemiş

**Çözüm**:
- ✅ Error handling var (camera ile aynı)
- Kullanıcıya mikrofon izni vermesi için talimat ver

---

## 🔴 7. Publish/Subscribe Hataları

### 7.1. Publish Failed
```javascript
AgoraRTCError PUBLISH_FAILED: Publish failed
Error code: 4102
```

**Sebep**:
- Network hatası
- Token yetkisi yok (publisher role)
- Track hazır değil
- Client role 'host' değil

**Çözüm**:
- Network bağlantısını kontrol et
- Token'ın publisher role ile oluşturulduğundan emin ol
- Track'in hazır olduğundan emin ol
- Client role'ü 'host' yap

**Mevcut Çözüm**:
```javascript
// live-stream.js - Zaten implement edilmiş
await agoraClient.setClientRole('host');
```

---

### 7.2. Subscribe Failed
```javascript
AgoraRTCError SUBSCRIBE_FAILED: Subscribe failed
Error code: 4103
```

**Sebep**:
- Network hatası
- Remote user yayınlamıyor
- Track hazır değil
- Token yetkisi yok (subscriber role)

**Çözüm**:
- Network bağlantısını kontrol et
- Remote user'ın yayınladığından emin ol
- Token'ın subscriber role ile oluşturulduğundan emin ol

---

### 7.3. Track Not Ready
```javascript
Error: Track not ready for publishing
```

**Sebep**:
- Video/audio track hazır değil
- Track oluşturulmamış
- Track dispose edilmiş

**Çözüm**:
- Track'in hazır olduğundan emin ol
- Track oluşturulduktan sonra publish et
- Track dispose edilmeden publish et

---

## 🔴 8. Codec Hataları

### 8.1. Unsupported Codec
```javascript
AgoraRTCError UNSUPPORTED_CODEC: Unsupported codec
Error code: 4104
```

**Sebep**:
- Tarayıcı codec'i desteklemiyor
- Codec yanlış seçilmiş
- VP8/VP9/H264 desteği yok

**Çözüm**:
- Codec'i kontrol et (vp8, vp9, h264)
- Tarayıcı codec desteğini kontrol et
- Desteklenen codec kullan

**Mevcut Çözüm**:
```javascript
// live-stream.js - VP8 kullanılıyor
agoraClient = AgoraRTC.createClient({ 
    mode: 'live', 
    codec: 'vp8'  // VP8 geniş tarayıcı desteği var
});
```

---

### 8.2. Codec Mismatch
```javascript
Error: Codec mismatch between client and server
```

**Sebep**:
- Client ve server farklı codec kullanıyor
- Codec uyumsuzluğu

**Çözüm**:
- Aynı codec'i kullan
- Codec seçimini kontrol et

---

## 🔴 9. Client Role Hataları

### 9.1. Client Role Not Set
```javascript
Error: Client role not set
```

**Sebep**:
- Client role set edilmemiş
- 'host' role'ü set edilmemiş

**Çözüm**:
- ✅ Client role 'host' olarak set ediliyor
```javascript
// live-stream.js - Zaten implement edilmiş
await agoraClient.setClientRole('host');
```

---

### 9.2. Invalid Client Role
```javascript
Error: Invalid client role
```

**Sebep**:
- Geçersiz role değeri
- Role 'host' veya 'audience' değil

**Çözüm**:
- Role'ü 'host' veya 'audience' yap

---

## 🔴 10. Join Hataları

### 10.1. Join Failed
```javascript
Error: Join channel failed
```

**Sebep**:
- Network hatası
- Invalid token
- Invalid channel name
- App ID hatası

**Çözüm**:
- Tüm parametreleri kontrol et
- Network bağlantısını kontrol et
- Token'ı kontrol et

---

### 10.2. Already Joined
```javascript
Error: Already joined channel
```

**Sebep**:
- Zaten channel'a katılmış
- Önceki join işlemi tamamlanmamış

**Çözüm**:
- Önce leave et, sonra join et
- Join öncesi leave kontrolü yap

**Mevcut Çözüm**:
```javascript
// live-stream.js - Zaten implement edilmiş
if (agoraClient) {
    await agoraClient.leave();
    agoraClient.removeAllListeners();
    agoraClient = null;
}
```

---

## 🟡 11. Uyarılar (Non-Critical)

### 11.1. Token Expire Warning
```javascript
⚠️ Token süresi dolmak üzere, yenileniyor...
```

**Sebep**: 
- Token süresi dolmak üzere (5 dakika kala)

**Durum**: Normal, token otomatik yenilenecek
**Çözüm**: Gerekli değil, otomatik handle ediliyor

---

### 11.2. Network Quality Warning
```javascript
⚠️ Ağ kalitesi düşük: Poor. Yayın kalitesi düşürülebilir.
```

**Sebep**:
- Network quality kötü

**Durum**: Uyarı, yayın devam eder
**Çözüm**: 
- ✅ Otomatik quality adaptation aktif
- Network bağlantısını iyileştir

---

### 11.3. Reconnection Warning
```javascript
🔄 Yeniden bağlanılıyor... (1/5)
```

**Sebep**:
- Bağlantı kesildi
- Reconnection denemesi yapılıyor

**Durum**: Normal, otomatik reconnect çalışıyor
**Çözüm**: Gerekli değil, otomatik handle ediliyor

---

### 11.4. Low FPS Warning
```javascript
Warning: Low FPS detected
```

**Sebep**:
- Video FPS düşük
- CPU yüksek
- Network yavaş

**Çözüm**:
- ✅ Stream health monitoring aktif
- FPS'i izle
- Quality'yi düşür

---

## 📊 Hata Kodları Referans Tablosu

| Kod | İsim | Kategori | Çözüm Durumu |
|-----|------|----------|--------------|
| 4096 | CAN_NOT_GET_GATEWAY_SERVER | Network | ✅ Monitoring aktif |
| 4097 | INVALID_TOKEN | Token | ✅ Validation var |
| 4098 | TOKEN_EXPIRED | Token | ✅ Renewal aktif |
| 4099 | INVALID_APP_ID | App ID | ✅ Validation var |
| 4100 | INVALID_CHANNEL_NAME | Channel | ✅ Sanitization var |
| 4101 | CHANNEL_NOT_FOUND | Channel | ⚠️ Kontrol gerekli |
| 4102 | PUBLISH_FAILED | Publish | ✅ Error handling var |
| 4103 | SUBSCRIBE_FAILED | Subscribe | ✅ Error handling var |
| 4104 | UNSUPPORTED_CODEC | Codec | ✅ VP8 kullanılıyor |

---

## 🔍 Debug ve Troubleshooting

### 1. Console Log Kontrolü

```javascript
// Tüm Agora hatalarını filtrele
console.error('Agora Error:', error);
console.warn('Agora Warning:', warning);
```

### 2. Agora SDK Debug Mode

```javascript
// Debug mode aktif et
AgoraRTC.setLogLevel(0); // 0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=NONE
```

### 3. Network Tab Kontrolü

- Agora gateway server istekleri
- Token renewal istekleri
- WebRTC connection istekleri

### 4. Error Event Listener

```javascript
// Exception event'i dinle
agoraClient.on('exception', (evt) => {
    console.error('Agora Exception:', evt);
    // Error code ve mesajı logla
});
```

---

## ✅ Çözüm Durumu Özeti

### Çözülen Hatalar ✅
- ✅ Token renewal (otomatik)
- ✅ Network quality monitoring
- ✅ Reconnection mekanizması
- ✅ Error handling ve user feedback
- ✅ Media device error handling
- ✅ App ID validation
- ✅ Channel name sanitization
- ✅ Client role setting

### İyileştirme Gerekli ⚠️
- ⚠️ Channel existence kontrolü
- ⚠️ Error logging to backend
- ⚠️ Error analytics
- ⚠️ Advanced retry logic

---

## 📝 Önerilen İyileştirmeler

### 1. **Error Handler Module**
- ✅ `agora-error-handler.js` oluşturuldu
- Error categorization
- User-friendly messages
- Error statistics

### 2. **Error Logging**
- Backend'e error logging
- Error analytics
- Error pattern analysis

### 3. **Error Recovery**
- Advanced retry logic
- Exponential backoff
- Error recovery strategies

---

## 🔗 Kaynaklar

- [Agora Error Codes](https://docs.agora.io/en/video-calling/API%20Reference/web_ng/interfaces/agorartcerror.html)
- [Agora Troubleshooting](https://docs.agora.io/en/video-calling/troubleshooting/web_ng)
- [Agora Web SDK API](https://docs.agora.io/en/video-calling/API%20Reference/web_ng)

---

**Son Güncelleme**: 2024-11-06
**Toplam Hata Kategorisi**: 11 kategori
**Kritik Hata**: 10 kategori
**Uyarı**: 4 kategori
**Çözülen**: 8/10 kritik hata


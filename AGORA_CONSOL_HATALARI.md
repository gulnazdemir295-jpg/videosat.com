# 🐛 AgoraRTC Yayın Konsol Hataları ve Çözümleri

## 📋 Genel Bakış

Bu dokümanda AgoraRTC yayın sistemiyle ilgili olası konsol hataları, hata kodları, hata mesajları ve çözümleri listelenmiştir.

---

## 🔴 Kritik Hatalar

### 1. **Agora SDK Yüklenemedi**
```
❌ Agora SDK yüklenemedi!
```

**Sebep**: 
- Agora SDK script'i yüklenmemiş
- Script yolu yanlış
- Network hatası

**Çözüm**:
- Agora SDK script'ini HTML'e ekle:
  ```html
  <script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.20.0.js"></script>
  ```
- Script yüklenene kadar bekle (zaten implement edilmiş)

---

### 2. **Token Hataları**

#### 2.1. Dynamic Key Expired
```
AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: flag: 4096, message: AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: dynamic key expired
```

**Sebep**: 
- Token süresi dolmuş
- Token renewal başarısız

**Çözüm**:
- ✅ Token renewal mekanizması zaten var
- Token expire event listener'ları aktif
- Backend'de token renewal endpoint var

#### 2.2. Invalid Token
```
AgoraRTCError INVALID_TOKEN: Invalid token
```

**Sebep**:
- Geçersiz token formatı
- Token signature hatası
- App ID/Certificate uyuşmazlığı

**Çözüm**:
- Token generation'ı kontrol et
- App ID ve Certificate doğru mu kontrol et
- Token formatını doğrula

#### 2.3. Token Expired
```
AgoraRTCError TOKEN_EXPIRED: Token expired
```

**Sebep**:
- Token süresi dolmuş
- Token renewal başarısız

**Çözüm**:
- ✅ Token renewal mekanizması aktif
- `token-privilege-will-expire` event'i dinleniyor

---

### 3. **Network Hataları**

#### 3.1. CAN_NOT_GET_GATEWAY_SERVER
```
AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: flag: 4096
```

**Sebep**:
- Network bağlantısı yok
- Firewall/proxy engellemesi
- Agora gateway server'a erişilemiyor

**Çözüm**:
- Network bağlantısını kontrol et
- Firewall/proxy ayarlarını kontrol et
- Agora gateway server'larına erişim izni ver

#### 3.2. NETWORK_ERROR
```
AgoraRTCError NETWORK_ERROR: Network error
```

**Sebep**:
- Network bağlantısı kesildi
- Internet bağlantısı yavaş
- DNS çözümleme hatası

**Çözüm**:
- ✅ Network quality monitoring aktif
- ✅ Reconnection mekanizması var
- Internet bağlantısını kontrol et

#### 3.3. CONNECTION_LOST
```
AgoraRTCError CONNECTION_LOST: Connection lost
```

**Sebep**:
- Network bağlantısı kesildi
- Timeout hatası

**Çözüm**:
- ✅ Connection state monitoring aktif
- ✅ Automatic reconnection var

---

### 4. **App ID Hataları**

#### 4.1. Invalid App ID
```
AgoraRTCError INVALID_APP_ID: Invalid App ID
```

**Sebep**:
- App ID yanlış veya geçersiz
- App ID 32 karakter değil
- Environment variable eksik

**Çözüm**:
- App ID'yi kontrol et (32 karakter olmalı)
- Environment variable'ı kontrol et:
  ```env
  AGORA_APP_ID=your-32-character-app-id
  ```
- Backend'de App ID validation var

#### 4.2. App ID Mismatch
```
AgoraRTCError APP_ID_MISMATCH: App ID mismatch
```

**Sebep**:
- Token'daki App ID ile client'taki App ID uyuşmuyor

**Çözüm**:
- Token generation'da App ID'yi kontrol et
- Client'ta kullanılan App ID'yi kontrol et

---

### 5. **Channel Hataları**

#### 5.1. Invalid Channel Name
```
AgoraRTCError INVALID_CHANNEL_NAME: Invalid channel name
```

**Sebep**:
- Channel name geçersiz karakter içeriyor
- Channel name çok uzun
- Channel name boş

**Çözüm**:
- Channel name validation ekle
- Channel name'i sanitize et
- Max length kontrolü yap

#### 5.2. Channel Not Found
```
AgoraRTCError CHANNEL_NOT_FOUND: Channel not found
```

**Sebep**:
- Channel silinmiş
- Channel ID yanlış

**Çözüm**:
- Channel ID'yi kontrol et
- Backend'de channel existence kontrolü yap

---

### 6. **Media Device Hataları**

#### 6.1. Camera Access Denied
```
NotAllowedError: Permission denied
```

**Sebep**:
- Kullanıcı kamera iznini reddetti
- Tarayıcı ayarlarından izin verilmemiş

**Çözüm**:
- ✅ Error handling var
- ✅ User-friendly error message var
- Kullanıcıya izin vermesi için talimat ver

#### 6.2. Camera Not Found
```
NotFoundError: No camera found
```

**Sebep**:
- Kamera bağlı değil
- Kamera driver sorunu

**Çözüm**:
- ✅ Error handling var
- Kullanıcıya kamera bağlaması için talimat ver

#### 6.3. Camera In Use
```
NotReadableError: Camera in use
```

**Sebep**:
- Başka bir uygulama kamerayı kullanıyor
- Kamera lock'lu

**Çözüm**:
- ✅ Error handling var
- Kullanıcıya diğer uygulamaları kapatması için talimat ver

---

### 7. **Publish/Subscribe Hataları**

#### 7.1. Publish Failed
```
AgoraRTCError PUBLISH_FAILED: Publish failed
```

**Sebep**:
- Network hatası
- Token yetkisi yok
- Track hazır değil

**Çözüm**:
- Network bağlantısını kontrol et
- Token'ı kontrol et
- Track'in hazır olduğundan emin ol

#### 7.2. Subscribe Failed
```
AgoraRTCError SUBSCRIBE_FAILED: Subscribe failed
```

**Sebep**:
- Network hatası
- Remote user yayınlamıyor
- Track hazır değil

**Çözüm**:
- Network bağlantısını kontrol et
- Remote user'ın yayınladığından emin ol

---

### 8. **Codec Hataları**

#### 8.1. Unsupported Codec
```
AgoraRTCError UNSUPPORTED_CODEC: Unsupported codec
```

**Sebep**:
- Tarayıcı codec'i desteklemiyor
- Codec yanlış seçilmiş

**Çözüm**:
- Codec'i kontrol et (vp8, vp9, h264)
- Tarayıcı codec desteğini kontrol et

---

## 🟡 Uyarılar ve Bilgilendirmeler

### 1. **Token Expire Warning**
```
⚠️ Token süresi dolmak üzere, yenileniyor...
```

**Sebep**: 
- Token süresi dolmak üzere (5 dakika kala)

**Durum**: Normal, token otomatik yenilenecek
**Çözüm**: Gerekli değil, otomatik handle ediliyor

---

### 2. **Network Quality Warning**
```
⚠️ Ağ kalitesi düşük: Poor. Yayın kalitesi düşürülebilir.
```

**Sebep**:
- Network quality kötü

**Durum**: Uyarı, yayın devam eder
**Çözüm**: 
- ✅ Otomatik quality adaptation aktif
- Network bağlantısını iyileştir

---

### 3. **Reconnection Warning**
```
🔄 Yeniden bağlanılıyor... (1/5)
```

**Sebep**:
- Bağlantı kesildi
- Reconnection denemesi yapılıyor

**Durum**: Normal, otomatik reconnect çalışıyor
**Çözüm**: Gerekli değil, otomatik handle ediliyor

---

## 📊 Hata Kodları Referansı

### Agora Error Codes

| Kod | Açıklama | Çözüm |
|-----|----------|-------|
| 4096 | CAN_NOT_GET_GATEWAY_SERVER | Network/Firewall kontrolü |
| 4097 | INVALID_TOKEN | Token generation kontrolü |
| 4098 | TOKEN_EXPIRED | Token renewal aktif |
| 4099 | INVALID_APP_ID | App ID kontrolü |
| 4100 | INVALID_CHANNEL_NAME | Channel name validation |
| 4101 | CHANNEL_NOT_FOUND | Channel existence kontrolü |
| 4102 | PUBLISH_FAILED | Network/Token kontrolü |
| 4103 | SUBSCRIBE_FAILED | Network/Remote user kontrolü |
| 4104 | UNSUPPORTED_CODEC | Codec seçimi kontrolü |

---

## 🔍 Hata Tespit ve Debug

### 1. Console Log Kontrolü

```javascript
// Hata log'larını filtrele
console.error('Agora Error:', error);
console.warn('Agora Warning:', warning);
```

### 2. Network Tab Kontrolü

- Agora gateway server istekleri
- Token renewal istekleri
- WebRTC connection istekleri

### 3. Agora SDK Debug Mode

```javascript
// Debug mode aktif et
AgoraRTC.setLogLevel(0); // 0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=NONE
```

### 4. Error Event Listener

```javascript
// Exception event'i dinle
agoraClient.on('exception', (evt) => {
    console.error('Agora Exception:', evt);
    // Error code ve mesajı logla
});
```

---

## ✅ Çözüm Checklist

### Token Hataları
- [ ] Token generation doğru mu?
- [ ] App ID ve Certificate doğru mu?
- [ ] Token renewal aktif mi?
- [ ] Token expire event listener'ları var mı?

### Network Hataları
- [ ] Network quality monitoring aktif mi?
- [ ] Reconnection mekanizması var mı?
- [ ] Firewall/proxy ayarları doğru mu?
- [ ] Agora gateway server'lara erişim var mı?

### Media Device Hataları
- [ ] Camera/microphone permission handling var mı?
- [ ] Error messages user-friendly mi?
- [ ] Fallback mekanizması var mı?

### Channel Hataları
- [ ] Channel name validation var mı?
- [ ] Channel existence kontrolü var mı?
- [ ] Channel cleanup doğru mu?

---

## 📝 Önerilen İyileştirmeler

### 1. **Hata Logging**
- Backend'e error logging ekle
- Error analytics topla
- Error pattern analizi yap

### 2. **Hata Recovery**
- Otomatik retry mekanizması
- Exponential backoff
- Max retry limit

### 3. **User Feedback**
- Hata durumunda kullanıcıya bilgi ver
- Çözüm önerileri sun
- Support contact bilgisi

### 4. **Monitoring**
- Real-time error tracking
- Error rate monitoring
- Alert system

---

## 🔗 Kaynaklar

- [Agora Error Codes](https://docs.agora.io/en/video-calling/API%20Reference/web_ng/interfaces/agorartcerror.html)
- [Agora Troubleshooting](https://docs.agora.io/en/video-calling/troubleshooting/web_ng)
- [Agora Web SDK API](https://docs.agora.io/en/video-calling/API%20Reference/web_ng)

---

**Son Güncelleme**: 2024-11-06
**Toplam Hata Kategorisi**: 8 kritik kategori
**Çözülen**: Token renewal, Network monitoring, Error handling


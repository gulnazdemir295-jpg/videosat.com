# 🐛 AgoraRTC Yayın Sistemi - Master Hata Dokümanı

## 📋 Genel Bakış

Bu dokümanda AgoraRTC yayın sistemiyle ilgili **tüm hata kategorileri** bir araya getirilmiştir.

---

## 📚 İçindekiler

1. [Yayın Başlatma Hataları](#1-yayın-başlatma-hataları)
2. [Yayın Sırasında Hatalar](#2-yayın-sırasında-hatalar)
3. [Yayın Durdurma Hataları](#3-yayın-durdurma-hataları)
4. [Agora Konsol Hataları](#4-agora-konsol-hataları)
5. [Error Handler Kullanımı](#5-error-handler-kullanımı)
6. [Hata Çözüm Rehberi](#6-hata-çözüm-rehberi)

---

## 1. Yayın Başlatma Hataları

### 1.1. Pre-Start Kontrolleri
- ✅ Kamera erişimi yok
- ✅ Video track bulunamadı
- ✅ Yayın zaten aktif

### 1.2. Backend İletişimi
- ⚠️ Backend connection failed
- ⚠️ Backend timeout
- ✅ Backend response invalid
- ✅ Backend provider hatası
- ⚠️ Backend CORS error
- ⚠️ Backend channel failed

### 1.3. Agora SDK
- ✅ Agora SDK yüklenmedi
- ⚠️ Agora client oluşturulamadı
- ⚠️ Agora join failed
- ✅ Client role set failed

### 1.4. Media Tracks
- ⚠️ Video track oluşturulamadı
- ⚠️ Audio track oluşturulamadı
- ⚠️ Publish failed

### 1.5. Kamera Erişimi
- ✅ WebRTC desteklenmiyor
- ✅ HTTPS gerekli
- ✅ Kamera izni reddedildi
- ✅ Kamera bulunamadı
- ✅ Kamera kullanımda

### 1.6. Token & App ID
- ✅ Token yok (warning)
- ⚠️ Token geçersiz
- ✅ App ID geçersiz

**Toplam**: 28 hata senaryosu  
**Doküman**: `YAYIN_BASLATMA_HATALARI.md`  
**Error Handler**: `yayin-baslatma-error-handler.js`

---

## 2. Yayın Sırasında Hatalar

### 2.1. Token Hataları
- ✅ Token expired (Otomatik yenileme aktif)
- ⚠️ Token renewal failed
- ⚠️ Token invalid

### 2.2. Network Hataları
- ✅ Network quality düşük (Monitoring aktif)
- ✅ Connection lost (Reconnection aktif)
- ⚠️ Network timeout
- ⚠️ Packet loss

### 2.3. Stream Quality Hataları
- ✅ Low FPS (Monitoring aktif)
- ✅ Low bitrate (Monitoring aktif)
- ✅ Resolution drop (Adaptation aktif)
- ⚠️ Stream quality degradation

### 2.4. Media Device Hataları
- ⚠️ Camera disconnected
- ⚠️ Microphone disconnected
- ⚠️ Device permission revoked
- ⚠️ Device in use by another app

### 2.5. Agora Client Hataları
- ✅ Client exception (Error handler aktif)
- ⚠️ Client reconnection failed
- ⚠️ Client state error
- ⚠️ Stream fallback

**Toplam**: ~15 hata senaryosu  
**Doküman**: `AGORA_CONSOL_HATALARI.md`  
**Error Handler**: `agora-error-handler.js`

---

## 3. Yayın Durdurma Hataları

### 3.1. Stream Stop Hataları
- ⚠️ Stream already stopped
- ⚠️ Stop request failed
- ⚠️ Cleanup failed

### 3.2. Track Cleanup Hataları
- ⚠️ Video track stop failed
- ⚠️ Audio track stop failed
- ⚠️ Track dispose failed

### 3.3. Agora Client Cleanup
- ⚠️ Client leave failed
- ⚠️ Client cleanup failed
- ⚠️ Listener removal failed

### 3.4. Backend Cleanup
- ⚠️ Backend disconnect failed
- ⚠️ Channel cleanup failed
- ⚠️ Resource release failed

**Toplam**: ~12 hata senaryosu  
**Doküman**: Henüz oluşturulmadı  
**Error Handler**: Gerekli değil (non-critical)

---

## 4. Agora Konsol Hataları

### 4.1. SDK Hataları
- ✅ SDK yüklenemedi
- ⚠️ SDK versiyon uyumsuzluğu

### 4.2. Token Hataları
- ✅ Dynamic key expired (Renewal aktif)
- ✅ Invalid token
- ✅ Token expired (Renewal aktif)

### 4.3. Network Hataları
- ✅ CAN_NOT_GET_GATEWAY_SERVER (Monitoring aktif)
- ✅ NETWORK_ERROR (Monitoring aktif)
- ✅ CONNECTION_LOST (Reconnection aktif)

### 4.4. App ID Hataları
- ✅ Invalid App ID (Validation var)
- ⚠️ App ID mismatch
- ✅ App ID not set

### 4.5. Channel Hataları
- ✅ Invalid channel name (Sanitization var)
- ⚠️ Channel not found
- ⚠️ Channel already exists

### 4.6. Media Device Hataları
- ✅ Camera access denied (Error handling var)
- ✅ Camera not found (Error handling var)
- ✅ Camera in use (Error handling var)

### 4.7. Publish/Subscribe Hataları
- ⚠️ Publish failed
- ⚠️ Subscribe failed
- ⚠️ Track not ready

### 4.8. Codec Hataları
- ✅ Unsupported codec (VP8 kullanılıyor)
- ⚠️ Codec mismatch

### 4.9. Client Role Hataları
- ✅ Client role not set (Çözüldü)
- ⚠️ Invalid client role

### 4.10. Join Hataları
- ⚠️ Join failed
- ✅ Already joined (Çözüldü)

**Toplam**: 30+ hata kodu  
**Doküman**: `AGORA_CONSOL_HATALARI.md`, `AGORA_CONSOL_HATALARI_DETAYLI.md`  
**Error Handler**: `agora-error-handler.js`

---

## 5. Error Handler Kullanımı

### 5.1. Agora Error Handler

**Dosya**: `agora-error-handler.js`

**Kullanım**:
```javascript
if (window.agoraErrorHandler) {
    const result = window.agoraErrorHandler.handleError(error, {
        type: 'exception',
        source: 'agora-client'
    });
    console.log('User message:', result.userMessage);
}
```

**Özellikler**:
- ✅ Error categorization (10 kategori)
- ✅ User-friendly messages (Türkçe)
- ✅ Error statistics
- ✅ Error logging
- ✅ Retry logic

### 5.2. Stream Start Error Handler

**Dosya**: `yayin-baslatma-error-handler.js`

**Kullanım**:
```javascript
if (window.handleStreamStartError) {
    const result = window.handleStreamStartError(error, 'backend-request', {
        context: 'additional-info'
    });
    console.log('User message:', result.userMessage);
    console.log('Solution:', result.solution);
    console.log('Should retry:', result.shouldRetry);
}
```

**Özellikler**:
- ✅ Step-based error categorization (12 adım)
- ✅ User-friendly messages (Türkçe)
- ✅ Solution suggestions
- ✅ Retry logic
- ✅ Error statistics per step

---

## 6. Hata Çözüm Rehberi

### 6.1. Hızlı Çözüm Adımları

#### Adım 1: Hata Kategorisini Belirle
- Console'da hata mesajını oku
- Hata kodunu not et
- Hata kategorisini belirle (Token, Network, Media, vb.)

#### Adım 2: Dokümana Bak
- İlgili dokümanı aç (`YAYIN_BASLATMA_HATALARI.md`, `AGORA_CONSOL_HATALARI.md`)
- Hata kodunu veya mesajını ara
- Çözüm adımlarını oku

#### Adım 3: Çözümü Uygula
- Çözüm adımlarını takip et
- Gerekirse environment variable'ları kontrol et
- Backend log'larını kontrol et

#### Adım 4: Test Et
- Hatayı tekrar test et
- Çözümün çalıştığını doğrula
- Gerekirse destek ile iletişime geç

### 6.2. Yaygın Hatalar ve Çözümleri

#### Hata: "Token expired"
**Çözüm**: ✅ Otomatik token renewal aktif. Manuel müdahale gerekmiyor.

#### Hata: "Network quality düşük"
**Çözüm**: ✅ Otomatik quality adaptation aktif. Network bağlantısını iyileştirin.

#### Hata: "Kamera erişimi reddedildi"
**Çözüm**: Tarayıcı ayarlarından site için kamera ve mikrofon izni verin.

#### Hata: "Backend yanıt vermedi"
**Çözüm**: Backend server durumunu kontrol edin. Network bağlantısını kontrol edin.

#### Hata: "Agora SDK yüklenemedi"
**Çözüm**: Sayfayı yenileyin (F5). Script yükleme sırasını kontrol edin.

### 6.3. Debug İpuçları

#### Console Log Kontrolü
```javascript
// Tüm Agora hatalarını filtrele
console.error('Agora Error:', error);
console.warn('Agora Warning:', warning);
```

#### Agora SDK Debug Mode
```javascript
// Debug mode aktif et
AgoraRTC.setLogLevel(0); // 0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=NONE
```

#### Network Tab Kontrolü
- Agora gateway server istekleri
- Token renewal istekleri
- WebRTC connection istekleri

#### Error Statistics
```javascript
// Agora error statistics
const agoraStats = window.agoraErrorHandler.getErrorStatistics();

// Stream start error statistics
const streamStats = window.streamStartErrorHandler.getErrorStatistics();
```

---

## 7. Hata Kategorileri Özeti

| Kategori | Toplam Hata | Çözülen | İyileştirme Gerekli |
|----------|-------------|---------|---------------------|
| Yayın Başlatma | 28 | 15 | 13 |
| Yayın Sırasında | 15 | 10 | 5 |
| Yayın Durdurma | 12 | 0 | 12 |
| Agora Konsol | 30+ | 20+ | 10+ |
| **TOPLAM** | **85+** | **45+** | **40+** |

---

## 8. Error Handler Entegrasyonu

### 8.1. Script Yükleme Sırası

```html
<!-- index.html -->
<script>
    await window.scriptLoader.loadScripts([
        'agora-error-handler.js',                    // 1. Agora error handler
        'yayin-baslatma-error-handler.js',          // 2. Stream start error handler
        'live-stream-enhancements.js',              // 3. Agora enhancements
        'live-stream.js'                            // 4. Main stream handler
    ]);
</script>
```

### 8.2. Otomatik Kullanım

Error handler'lar otomatik olarak kullanılır:
- `live-stream.js` - Stream start hatalarında
- `live-stream-enhancements.js` - Agora exception'larında
- Tüm error handler'lar fallback mekanizması ile çalışır

---

## 9. Dokümantasyon Dosyaları

### 9.1. Yayın Başlatma
- `YAYIN_BASLATMA_HATALARI.md` - 28 hata senaryosu
- `YAYIN_BASLATMA_HATALARI_TAMAMLANDI.md` - Özet rapor
- `yayin-baslatma-error-handler.js` - Error handler

### 9.2. Agora Konsol
- `AGORA_CONSOL_HATALARI.md` - Genel hata listesi
- `AGORA_CONSOL_HATALARI_DETAYLI.md` - Detaylı hata listesi
- `agora-error-handler.js` - Error handler

### 9.3. Agora Enhancements
- `AGORA_ENHANCEMENTS_README.md` - Enhancements dokümanı
- `AGORA_ISLER_TAMAMLANDI.md` - Özet rapor
- `live-stream-enhancements.js` - Enhancements implementation

---

## 10. Test Senaryoları

### 10.1. Yayın Başlatma Testleri
- [ ] Kamera erişimi testi
- [ ] Backend connection testi
- [ ] Agora join testi
- [ ] Track publish testi
- [ ] Error handling testi

### 10.2. Yayın Sırasında Testler
- [ ] Token renewal testi
- [ ] Network quality monitoring testi
- [ ] Reconnection testi
- [ ] Stream quality adaptation testi
- [ ] Error handling testi

### 10.3. Yayın Durdurma Testleri
- [ ] Stream stop testi
- [ ] Track cleanup testi
- [ ] Client cleanup testi
- [ ] Backend cleanup testi

---

## 11. İyileştirme Önerileri

### 11.1. Yayın Durdurma Hataları
- ⚠️ Yayın durdurma hataları için error handler oluştur
- ⚠️ Cleanup hatalarını handle et
- ⚠️ Resource release hatalarını logla

### 11.2. Retry Mechanisms
- ⚠️ Backend connection retry
- ⚠️ Agora join retry
- ⚠️ Publish retry
- ⚠️ Exponential backoff

### 11.3. Error Analytics
- ⚠️ Error pattern analysis
- ⚠️ Error rate monitoring
- ⚠️ User impact analysis
- ⚠️ Error alerting

### 11.4. User Feedback
- ⚠️ Better error messages
- ⚠️ Action suggestions
- ⚠️ Help links
- ⚠️ Support contact

---

## 12. Sonuç

### 12.1. Tamamlanan İşler
- ✅ Yayın başlatma hataları listelendi (28 senaryo)
- ✅ Agora konsol hataları listelendi (30+ hata kodu)
- ✅ Error handler'lar oluşturuldu (2 handler)
- ✅ Error handler'lar entegre edildi
- ✅ User-friendly error messages eklendi
- ✅ Solution suggestions eklendi

### 12.2. Devam Eden İşler
- ⚠️ Yayın durdurma hataları (henüz listelenmedi)
- ⚠️ Yayın sırasında hatalar (kısmen listelendi)
- ⚠️ Retry mechanisms (kısmen implement edildi)
- ⚠️ Error analytics (henüz implement edilmedi)

### 12.3. Gelecek İşler
- 📋 Yayın durdurma hataları listesi
- 📋 Retry mechanisms iyileştirmeleri
- 📋 Error analytics implementation
- 📋 User feedback iyileştirmeleri

---

## 📊 İstatistikler

- **Toplam Hata Senaryosu**: 85+
- **Çözülen Hatalar**: 45+
- **İyileştirme Gerekli**: 40+
- **Error Handler**: 2
- **Dokümantasyon Dosyası**: 8+
- **Toplam Kod Satırı**: 2500+

---

**Son Güncelleme**: 2024-11-06  
**Durum**: ✅ Master Doküman Tamamlandı  
**Versiyon**: 1.0.0


# ⚡ Hızlı Başvuru Kılavuzu - AgoraRTC Hataları

## 📋 Genel Bakış

Bu kılavuz, AgoraRTC yayın sistemiyle ilgili hataları **hızlıca çözmek** için hazırlanmıştır.

---

## 🚨 Hızlı Hata Çözümü

### 1️⃣ Hata Mesajını Oku
```
Console'da hata mesajını bulun
Hata kodunu not edin
Hata kategorisini belirleyin
```

### 2️⃣ Hata Kategorisini Bul
- **Yayın Başlatma**: `YAYIN_BASLATMA_HATALARI.md`
- **Agora Konsol**: `AGORA_CONSOL_HATALARI_DETAYLI.md`
- **Yayın Durdurma**: `YAYIN_DURDURMA_HATALARI_DETAYLI.md`
- **Tüm Hatalar**: `AGORA_HATALAR_MASTER_DOKUMAN.md`

### 3️⃣ Çözümü Uygula
```
İlgili dokümandan çözümü oku
Çözüm adımlarını takip et
Test et
```

---

## 🔍 Hata Kodlarına Göre Çözüm

### Token Hataları

#### `CAN_NOT_GET_GATEWAY_SERVER: dynamic key expired`
- **Sebep**: Token süresi dolmuş
- **Çözüm**: ✅ Otomatik token renewal aktif
- **Manuel**: Sayfayı yenileyin (F5)

#### `INVALID_TOKEN`
- **Sebep**: Geçersiz token
- **Çözüm**: Sayfayı yenileyin (F5)
- **Backend**: Token generation'ı kontrol edin

#### `TOKEN_EXPIRED`
- **Sebep**: Token süresi dolmuş
- **Çözüm**: ✅ Otomatik token renewal aktif
- **Manuel**: Sayfayı yenileyin (F5)

---

### Network Hataları

#### `NETWORK_ERROR`
- **Sebep**: Network bağlantısı hatası
- **Çözüm**: İnternet bağlantınızı kontrol edin
- **Monitoring**: ✅ Network quality monitoring aktif

#### `CONNECTION_LOST`
- **Sebep**: Bağlantı kesildi
- **Çözüm**: ✅ Otomatik reconnection aktif
- **Manuel**: Birkaç saniye bekleyin

#### `CAN_NOT_GET_GATEWAY_SERVER`
- **Sebep**: Agora gateway server'a erişilemiyor
- **Çözüm**: Firewall/proxy ayarlarını kontrol edin
- **Network**: Network bağlantısını kontrol edin

---

### App ID Hataları

#### `INVALID_APP_ID`
- **Sebep**: Geçersiz App ID
- **Çözüm**: Backend'de `AGORA_APP_ID` kontrol edin
- **Format**: App ID 32 karakter olmalı

#### `APP_ID_MISMATCH`
- **Sebep**: Token ve client App ID uyuşmuyor
- **Çözüm**: Aynı App ID'yi kullandığınızdan emin olun

---

### Channel Hataları

#### `INVALID_CHANNEL_NAME`
- **Sebep**: Geçersiz channel name
- **Çözüm**: ✅ Backend'de sanitization var
- **Format**: Alphanumeric, dash, underscore

#### `CHANNEL_NOT_FOUND`
- **Sebep**: Channel bulunamadı
- **Çözüm**: Channel ID'yi kontrol edin
- **Backend**: Channel existence kontrolü yapın

---

### Media Device Hataları

#### `NotAllowedError: Permission denied`
- **Sebep**: Kamera/mikrofon izni reddedildi
- **Çözüm**: Tarayıcı ayarlarından izin verin
- **Message**: ✅ User-friendly error message var

#### `NotFoundError: No camera found`
- **Sebep**: Kamera bulunamadı
- **Çözüm**: Kamera bağlı olduğundan emin olun
- **Message**: ✅ User-friendly error message var

#### `NotReadableError: Camera in use`
- **Sebep**: Kamera kullanımda
- **Çözüm**: Diğer uygulamaları kapatın
- **Message**: ✅ User-friendly error message var

---

### Publish/Subscribe Hataları

#### `PUBLISH_FAILED`
- **Sebep**: Yayın başlatılamadı
- **Çözüm**: Network bağlantısını kontrol edin
- **Token**: Token'ı kontrol edin

#### `SUBSCRIBE_FAILED`
- **Sebep**: Yayına bağlanılamadı
- **Çözüm**: Remote user'ın yayınladığından emin olun
- **Network**: Network bağlantısını kontrol edin

---

## 🛠️ Yaygın Hatalar ve Çözümleri

### Yayın Başlatılamıyor

#### 1. Kamera Erişimi Yok
```
Çözüm: "Kamera Erişimi İste" butonuna tıklayın
```

#### 2. Backend Yanıt Vermiyor
```
Çözüm: Backend server durumunu kontrol edin
Network: İnternet bağlantınızı kontrol edin
```

#### 3. Agora SDK Yüklenmedi
```
Çözüm: Sayfayı yenileyin (F5)
Script: Script yükleme sırasını kontrol edin
```

#### 4. Token Geçersiz
```
Çözüm: Sayfayı yenileyin (F5)
Backend: Token generation'ı kontrol edin
```

---

### Yayın Sırasında Hatalar

#### 1. Token Expired
```
Çözüm: ✅ Otomatik token renewal aktif
Manuel: Sayfayı yenileyin (F5)
```

#### 2. Network Quality Düşük
```
Çözüm: ✅ Otomatik quality adaptation aktif
Network: İnternet bağlantınızı iyileştirin
```

#### 3. Connection Lost
```
Çözüm: ✅ Otomatik reconnection aktif
Manuel: Birkaç saniye bekleyin
```

---

### Yayın Durdurulamıyor

#### 1. Stream Already Stopped
```
Çözüm: Yayın zaten durdurulmuş
Durum: Normal, hata değil
```

#### 2. Cleanup Failed
```
Çözüm: ⚠️ Non-critical hata, yayın durduruldu
Durum: Warning, yayın durduruldu
```

---

## 📞 Destek ve Yardım

### Debug İpuçları

#### Console Log Kontrolü
```javascript
// F12 ile console'u açın
// Hata mesajlarını filtreleyin
console.error('Agora Error:', error);
```

#### Agora SDK Debug Mode
```javascript
// Debug mode aktif edin
AgoraRTC.setLogLevel(0); // 0=DEBUG
```

#### Network Tab Kontrolü
```
1. F12 > Network tab
2. Agora gateway isteklerini kontrol edin
3. Token renewal isteklerini kontrol edin
```

---

### Error Handler Kullanımı

#### Error Statistics
```javascript
// Agora error statistics
const agoraStats = window.agoraErrorHandler?.getErrorStatistics();

// Stream start error statistics
const streamStats = window.streamStartErrorHandler?.getErrorStatistics();
```

#### Error Logging
```javascript
// Error'lar otomatik olarak loglanıyor
// Backend'e error log gönderiliyor (opsiyonel)
```

---

## 🎯 Hızlı Çözüm Checklist

### Yayın Başlatma
- [ ] Kamera erişimi var mı?
- [ ] Backend server çalışıyor mu?
- [ ] Agora SDK yüklendi mi?
- [ ] Token geçerli mi?
- [ ] Network bağlantısı var mı?

### Yayın Sırasında
- [ ] Token renewal aktif mi?
- [ ] Network quality monitoring aktif mi?
- [ ] Reconnection aktif mi?
- [ ] Stream quality adaptation aktif mi?

### Yayın Durdurma
- [ ] Stream durduruldu mu?
- [ ] Tracks temizlendi mi?
- [ ] Client cleanup yapıldı mı?
- [ ] Backend disconnect yapıldı mı?

---

## 📚 İlgili Dokümanlar

### Master Doküman
- `AGORA_HATALAR_MASTER_DOKUMAN.md` - Tüm hatalar

### Detaylı Dokümanlar
- `YAYIN_BASLATMA_HATALARI.md` - Yayın başlatma hataları
- `AGORA_CONSOL_HATALARI_DETAYLI.md` - Agora konsol hataları
- `YAYIN_DURDURMA_HATALARI_DETAYLI.md` - Yayın durdurma hataları

### İndeks
- `HATA_DOKUMANLARI_INDEX.md` - Tüm dokümanların indeksi

---

## 🔗 Hızlı Linkler

### Error Handler'lar
- `agora-error-handler.js` - Agora error handler
- `yayin-baslatma-error-handler.js` - Stream start error handler

### Implementation
- `live-stream.js` - Main stream handler
- `live-stream-enhancements.js` - Enhancements

---

**Son Güncelleme**: 2024-11-06  
**Versiyon**: 1.0.0


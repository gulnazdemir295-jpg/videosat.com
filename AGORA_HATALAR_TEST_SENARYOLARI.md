# 🧪 AgoraRTC Hata Test Senaryoları

## 📋 Genel Bakış

Bu dokümanda AgoraRTC yayın sistemi için **test senaryoları** listelenmiştir.

---

## 🎯 Test Kategorileri

### 1. Yayın Başlatma Testleri
### 2. Yayın Sırasında Testler
### 3. Yayın Durdurma Testleri
### 4. Error Handler Testleri

---

## 1. Yayın Başlatma Testleri

### Test 1.1: Kamera Erişimi Yok
**Amaç**: Kamera erişimi olmadan yayın başlatma denemesi

**Adımlar**:
1. Kamera erişimi isteme
2. Yayın başlatma butonuna tıkla
3. Hata mesajını kontrol et

**Beklenen Sonuç**:
- ✅ User-friendly error message gösterilmeli
- ✅ "Kamera erişimi iste" önerisi olmalı
- ✅ Error handler çalışmalı

**Test Kodu**:
```javascript
// Kamera erişimi yok
localStream = null;
await startStream();
// Beklenen: Error message ve solution suggestion
```

---

### Test 1.2: Backend Connection Failed
**Amaç**: Backend server down durumunda yayın başlatma

**Adımlar**:
1. Backend server'ı durdur
2. Yayın başlatma butonuna tıkla
3. Hata mesajını kontrol et

**Beklenen Sonuç**:
- ✅ User-friendly error message gösterilmeli
- ✅ "Backend sunucusuna bağlanılamıyor" mesajı
- ✅ Solution suggestion olmalı
- ✅ Retry önerisi olmalı

**Test Kodu**:
```javascript
// Backend server down
// startStream() çağrısı
// Beklenen: Backend connection error handling
```

---

### Test 1.3: Invalid Token
**Amaç**: Geçersiz token ile yayın başlatma

**Adımlar**:
1. Geçersiz token oluştur
2. Yayın başlatma butonuna tıkla
3. Hata mesajını kontrol et

**Beklenen Sonuç**:
- ✅ "Geçersiz güvenlik anahtarı" mesajı
- ✅ "Sayfayı yenileyin" önerisi
- ✅ Error handler çalışmalı

---

### Test 1.4: Agora SDK Yüklenmedi
**Amaç**: Agora SDK yüklenmeden yayın başlatma

**Adımlar**:
1. Agora SDK script'ini yükleme
2. Yayın başlatma butonuna tıkla
3. Hata mesajını kontrol et

**Beklenen Sonuç**:
- ✅ "Agora SDK yüklenemedi" mesajı
- ✅ "Sayfayı yenileyin" önerisi
- ✅ Error handler çalışmalı

---

### Test 1.5: Camera Permission Denied
**Amaç**: Kamera izni reddedildiğinde yayın başlatma

**Adımlar**:
1. Kamera iznini reddet
2. Yayın başlatma butonuna tıkla
3. Hata mesajını kontrol et

**Beklenen Sonuç**:
- ✅ "Kamera erişimi reddedildi" mesajı
- ✅ "Tarayıcı ayarlarından izin verin" önerisi
- ✅ User-friendly error message

---

## 2. Yayın Sırasında Testler

### Test 2.1: Token Expired
**Amaç**: Token süresi dolduğunda otomatik yenileme

**Adımlar**:
1. Yayını başlat
2. Token'ı expire et (1 saat sonra)
3. Token renewal'ı kontrol et

**Beklenen Sonuç**:
- ✅ Otomatik token renewal çalışmalı
- ✅ "Token yenileniyor" mesajı
- ✅ Yayın kesintisiz devam etmeli

**Test Kodu**:
```javascript
// Token expire event'i dinle
agoraClient.on('token-privilege-will-expire', async () => {
    await renewAgoraToken();
    // Beklenen: Token başarıyla yenilendi
});
```

---

### Test 2.2: Network Quality Düşük
**Amaç**: Network quality düşük olduğunda quality adaptation

**Adımlar**:
1. Yayını başlat
2. Network quality'yi düşür (throttling)
3. Quality adaptation'ı kontrol et

**Beklenen Sonuç**:
- ✅ Network quality monitoring çalışmalı
- ✅ Otomatik quality adaptation çalışmalı
- ✅ "Ağ kalitesi düşük" uyarısı

---

### Test 2.3: Connection Lost
**Amaç**: Bağlantı kesildiğinde otomatik reconnection

**Adımlar**:
1. Yayını başlat
2. Network bağlantısını kes
3. Reconnection'ı kontrol et

**Beklenen Sonuç**:
- ✅ Otomatik reconnection çalışmalı
- ✅ "Yeniden bağlanılıyor" mesajı
- ✅ Max retry limit kontrolü

---

### Test 2.4: Stream Quality Degradation
**Aim**: Stream quality düştüğünde monitoring

**Adımlar**:
1. Yayını başlat
2. Stream quality'yi düşür
3. Monitoring'i kontrol et

**Beklenen Sonuç**:
- ✅ Stream health monitoring çalışmalı
- ✅ FPS, bitrate, resolution tracking
- ✅ Quality degradation uyarısı

---

## 3. Yayın Durdurma Testleri

### Test 3.1: Normal Stop
**Amaç**: Normal yayın durdurma

**Adımlar**:
1. Yayını başlat
2. Yayını durdur
3. Cleanup'ı kontrol et

**Beklenen Sonuç**:
- ✅ Tracks temizlenmeli
- ✅ Client leave edilmeli
- ✅ Backend disconnect yapılmalı
- ✅ UI temizlenmeli

---

### Test 3.2: Stop While Streaming
**Amaç**: Yayın sırasında durdurma

**Adımlar**:
1. Yayını başlat
2. Yayın aktifken durdur
3. Cleanup'ı kontrol et

**Beklenen Sonuç**:
- ✅ Tüm cleanup işlemleri başarılı olmalı
- ✅ Hata olmamalı
- ✅ State doğru güncellenmeli

---

### Test 3.3: Double Stop
**Amaç**: Yayın zaten durdurulmuşken tekrar durdurma

**Adımlar**:
1. Yayını başlat
2. Yayını durdur
3. Tekrar durdur butonuna tıkla

**Beklenen Sonuç**:
- ✅ "Yayın zaten durdurulmuş" uyarısı
- ✅ Hata olmamalı
- ✅ State kontrolü çalışmalı

---

## 4. Error Handler Testleri

### Test 4.1: Agora Error Handler
**Amaç**: Agora error handler'ın çalışması

**Adımlar**:
1. Agora error oluştur
2. Error handler'ı çağır
3. Sonuçları kontrol et

**Beklenen Sonuç**:
- ✅ Error categorize edilmeli
- ✅ User-friendly message dönmeli
- ✅ Error statistics güncellenmeli

**Test Kodu**:
```javascript
const error = new Error('AgoraRTCError: INVALID_TOKEN');
const result = window.agoraErrorHandler.handleError(error, {
    type: 'exception',
    source: 'agora-client'
});
// Beklenen: result.userMessage, result.category
```

---

### Test 4.2: Stream Start Error Handler
**Amaç**: Stream start error handler'ın çalışması

**Adımlar**:
1. Stream start error oluştur
2. Error handler'ı çağır
3. Sonuçları kontrol et

**Beklenen Sonuç**:
- ✅ Step-based categorization çalışmalı
- ✅ User-friendly message dönmeli
- ✅ Solution suggestion olmalı
- ✅ Retry logic çalışmalı

**Test Kodu**:
```javascript
const error = new Error('Backend yanıt vermedi');
const result = window.handleStreamStartError(error, 'backend-request');
// Beklenen: result.userMessage, result.solution, result.shouldRetry
```

---

### Test 4.3: Error Statistics
**Amaç**: Error statistics'in toplanması

**Adımlar**:
1. Birkaç error oluştur
2. Error statistics'i al
3. Sonuçları kontrol et

**Beklenen Sonuç**:
- ✅ Error counts doğru olmalı
- ✅ Error history tutulmalı
- ✅ Error rate hesaplanmalı

**Test Kodu**:
```javascript
// Birkaç error oluştur
window.agoraErrorHandler.handleError(error1);
window.agoraErrorHandler.handleError(error2);

// Statistics al
const stats = window.agoraErrorHandler.getErrorStatistics();
// Beklenen: stats.totalErrors, stats.errorCounts
```

---

## 📊 Test Checklist

### Yayın Başlatma
- [ ] Kamera erişimi yok
- [ ] Backend connection failed
- [ ] Invalid token
- [ ] Agora SDK yüklenmedi
- [ ] Camera permission denied
- [ ] Video track bulunamadı
- [ ] App ID geçersiz
- [ ] Channel oluşturulamadı

### Yayın Sırasında
- [ ] Token expired (renewal)
- [ ] Network quality düşük
- [ ] Connection lost (reconnection)
- [ ] Stream quality degradation
- [ ] Camera disconnected
- [ ] Microphone disconnected

### Yayın Durdurma
- [ ] Normal stop
- [ ] Stop while streaming
- [ ] Double stop
- [ ] Track cleanup
- [ ] Client cleanup
- [ ] Backend cleanup

### Error Handler
- [ ] Agora error handler
- [ ] Stream start error handler
- [ ] Error statistics
- [ ] Error logging
- [ ] Retry logic

---

## 🛠️ Test Araçları

### 1. Browser DevTools
- Console log kontrolü
- Network tab
- Application tab

### 2. Agora SDK Debug Mode
```javascript
AgoraRTC.setLogLevel(0); // DEBUG
```

### 3. Error Handler Debug
```javascript
// Error statistics
const stats = window.agoraErrorHandler?.getErrorStatistics();
console.log('Error stats:', stats);
```

---

## 📝 Test Notları

- Tüm testler production-like environment'da yapılmalı
- Error handler'lar fallback mekanizması ile çalışır
- Test sırasında console log'ları kontrol edin
- Network throttling kullanarak network hatalarını test edin

---

**Son Güncelleme**: 2024-11-06  
**Durum**: ✅ Test Senaryoları Hazır  
**Versiyon**: 1.0.0


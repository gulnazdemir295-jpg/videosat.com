# 📖 AgoraRTC Hataları - Kullanım Rehberi

## 📋 Genel Bakış

Bu rehber, AgoraRTC hata dokümantasyonunu ve error handler sistemini nasıl kullanacağınızı açıklar.

---

## 🎯 Kullanım Senaryoları

### Senaryo 1: Hata Araştırması

**Problem**: Yayın başlatılırken bir hata alıyorsunuz.

**Çözüm Adımları**:
1. Console'da hata mesajını okuyun
2. **[HIZLI_BASVURU_KILAVUZU.md](./HIZLI_BASVURU_KILAVUZU.md)** dosyasını açın
3. Hata kodunu veya mesajını bulun
4. Çözüm adımlarını uygulayın

**Örnek**:
```
Hata: "Token expired"
→ HIZLI_BASVURU_KILAVUZU.md → "Token Expired" bölümü
→ Çözüm: Otomatik token renewal aktif (Manuel müdahale gerekmez)
```

---

### Senaryo 2: Detaylı Hata Araştırması

**Problem**: Belirli bir hata kategorisi hakkında detaylı bilgi istiyorsunuz.

**Çözüm Adımları**:
1. **[AGORA_HATALAR_MASTER_DOKUMAN.md](./AGORA_HATALAR_MASTER_DOKUMAN.md)** dosyasını açın
2. İlgili hata kategorisini bulun
3. Detaylı dokümana gidin
4. Çözüm adımlarını okuyun

**Örnek**:
```
Kategori: "Yayın Başlatma Hataları"
→ YAYIN_BASLATMA_HATALARI.md
→ 28 hata senaryosu ve çözümleri
```

---

### Senaryo 3: Error Handler Kullanımı

**Problem**: Kodunuzda error handling eklemek istiyorsunuz.

**Çözüm Adımları**:
1. Error handler'ın yüklendiğinden emin olun
2. Error handler fonksiyonunu çağırın
3. Sonucu kullanın

**Örnek Kod**:
```javascript
// Agora Error Handler
try {
    // Agora işlemi
} catch (error) {
    if (window.agoraErrorHandler) {
        const result = window.agoraErrorHandler.handleError(error, {
            type: 'exception',
            source: 'agora-client'
        });
        // User-friendly message göster
        alert(result.userMessage);
    }
}

// Stream Start Error Handler
try {
    await startStream();
} catch (error) {
    if (window.handleStreamStartError) {
        const result = window.handleStreamStartError(error, 'backend-request', {
            context: 'stream-start'
        });
        // User-friendly message ve solution göster
        alert(result.userMessage + '\n\n' + result.solution);
    }
}
```

---

### Senaryo 4: Test Yapma

**Problem**: Error handling'in düzgün çalıştığını test etmek istiyorsunuz.

**Çözüm Adımları**:
1. **[AGORA_HATALAR_TEST_SENARYOLARI.md](./AGORA_HATALAR_TEST_SENARYOLARI.md)** dosyasını açın
2. İlgili test senaryosunu bulun
3. Test adımlarını takip edin
4. Beklenen sonuçları kontrol edin

**Örnek**:
```
Test: "Token Expired"
→ Test adımlarını takip et
→ Otomatik token renewal'ı kontrol et
→ Beklenen sonuç: Token başarıyla yenilendi
```

---

## 📚 Doküman Kullanımı

### Hangi Dokümana Bakmalıyım?

#### Hızlı Çözüm İstiyorum
👉 **[HIZLI_BASVURU_KILAVUZU.md](./HIZLI_BASVURU_KILAVUZU.md)**

#### Tüm Hataları Görmek İstiyorum
👉 **[AGORA_HATALAR_MASTER_DOKUMAN.md](./AGORA_HATALAR_MASTER_DOKUMAN.md)**

#### Spesifik Bir Hata Kategorisi
- Yayın Başlatma: **[YAYIN_BASLATMA_HATALARI.md](./YAYIN_BASLATMA_HATALARI.md)**
- Agora Konsol: **[AGORA_CONSOL_HATALARI_DETAYLI.md](./AGORA_CONSOL_HATALARI_DETAYLI.md)**
- Yayın Durdurma: **[YAYIN_DURDURMA_HATALARI_DETAYLI.md](./YAYIN_DURDURMA_HATALARI_DETAYLI.md)**

#### Error Handler Kullanımı
- Agora: `agora-error-handler.js`
- Stream Start: `yayin-baslatma-error-handler.js`

#### Test Senaryoları
👉 **[AGORA_HATALAR_TEST_SENARYOLARI.md](./AGORA_HATALAR_TEST_SENARYOLARI.md)**

#### Proje Özeti
👉 **[AGORA_HATALAR_PROJE_OZETI.md](./AGORA_HATALAR_PROJE_OZETI.md)**

---

## 🔧 Error Handler API

### Agora Error Handler

#### `handleError(error, context)`
Error'ı handle eder ve user-friendly message döner.

**Parametreler**:
- `error`: Error objesi
- `context`: Ek bilgiler (type, source, vb.)

**Dönüş Değeri**:
```javascript
{
    errorInfo: { code, message, name },
    category: 'TOKEN_ERROR',
    userMessage: 'Güvenlik anahtarı geçersiz...',
    shouldRetry: false,
    retryAction: null
}
```

**Örnek**:
```javascript
const result = window.agoraErrorHandler.handleError(error, {
    type: 'exception',
    source: 'agora-client'
});
console.log(result.userMessage);
```

#### `getErrorStatistics()`
Error statistics'i döner.

**Dönüş Değeri**:
```javascript
{
    totalErrors: 10,
    errorCounts: { 'TOKEN_ERROR': 5, 'NETWORK_ERROR': 3 },
    recentErrors: [...],
    errorRate: { last5Minutes: 2, perMinute: 0.4 }
}
```

**Örnek**:
```javascript
const stats = window.agoraErrorHandler.getErrorStatistics();
console.log('Total errors:', stats.totalErrors);
```

---

### Stream Start Error Handler

#### `handleStreamStartError(error, step, context)`
Stream start error'ını handle eder.

**Parametreler**:
- `error`: Error objesi
- `step`: Hatanın oluştuğu adım ('pre-check', 'backend-request', vb.)
- `context`: Ek bilgiler

**Dönüş Değeri**:
```javascript
{
    step: 'backend-request',
    errorInfo: { code, message },
    category: 'BACKEND_TIMEOUT',
    userMessage: 'Backend sunucusuna bağlanılamıyor...',
    solution: 'İnternet bağlantınızı kontrol edin...',
    shouldRetry: true,
    retryAction: 'retryBackendRequest'
}
```

**Örnek**:
```javascript
const result = window.handleStreamStartError(error, 'backend-request', {
    channelId: 'channel-123'
});
console.log(result.userMessage, result.solution);
```

---

## 🎯 Best Practices

### 1. Error Handling
- ✅ Her zaman error handler kullanın
- ✅ User-friendly messages gösterin
- ✅ Solution suggestions ekleyin
- ✅ Error'ları loglayın

### 2. Debug
- ✅ Console log'ları kontrol edin
- ✅ Agora SDK debug mode kullanın
- ✅ Network tab'ı kontrol edin
- ✅ Error statistics'i toplayın

### 3. Testing
- ✅ Test senaryolarını kullanın
- ✅ Test checklist'i takip edin
- ✅ Production-like environment'da test edin
- ✅ Error scenarios'ları test edin

---

## 📊 Error Categories

### Agora Error Handler Categories
1. TOKEN_ERROR
2. TOKEN_EXPIRED
3. NETWORK_ERROR
4. CONNECTION_ERROR
5. APP_ID_ERROR
6. CHANNEL_ERROR
7. PUBLISH_ERROR
8. SUBSCRIBE_ERROR
9. CODEC_ERROR
10. PERMISSION_ERROR
11. DEVICE_ERROR
12. UNKNOWN

### Stream Start Error Handler Steps
1. pre-check
2. camera-access
3. backend-request
4. agora-init
5. agora-join
6. track-creation
7. publish

---

## 🔍 Debug İpuçları

### Console Log Kontrolü
```javascript
// F12 ile console'u açın
// Hata mesajlarını filtreleyin
console.error('Agora Error:', error);
```

### Agora SDK Debug Mode
```javascript
// Debug mode aktif edin
AgoraRTC.setLogLevel(0); // 0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=NONE
```

### Network Tab Kontrolü
```
1. F12 > Network tab
2. Agora gateway isteklerini kontrol edin
3. Token renewal isteklerini kontrol edin
```

### Error Statistics
```javascript
// Error statistics al
const stats = window.agoraErrorHandler?.getErrorStatistics();
console.log('Error stats:', stats);
```

---

## 📝 Örnekler

### Örnek 1: Basit Error Handling
```javascript
try {
    await startStream();
} catch (error) {
    if (window.handleStreamStartError) {
        const result = window.handleStreamStartError(error, 'unknown');
        alert(result.userMessage);
    }
}
```

### Örnek 2: Error Statistics
```javascript
// Error statistics'i al ve göster
const stats = window.agoraErrorHandler?.getErrorStatistics();
if (stats) {
    console.log('Total errors:', stats.totalErrors);
    console.log('Error counts:', stats.errorCounts);
}
```

### Örnek 3: Retry Logic
```javascript
const result = window.handleStreamStartError(error, 'backend-request');
if (result.shouldRetry) {
    // Retry logic
    setTimeout(() => {
        retryBackendRequest();
    }, 1000);
}
```

---

## 🚀 Hızlı Başlangıç

1. **Dokümanları İndir**: Tüm dokümanları projenize ekleyin
2. **Error Handler'ları Yükle**: `index.html`'e error handler script'lerini ekleyin
3. **Test Et**: Test senaryolarını çalıştırın
4. **Kullan**: Error handler'ları kodunuzda kullanın

---

**Son Güncelleme**: 2024-11-06  
**Versiyon**: 1.0.0


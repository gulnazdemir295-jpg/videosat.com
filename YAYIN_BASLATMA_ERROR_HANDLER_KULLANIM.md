# 📖 Yayın Başlatma Error Handler - Kullanım Kılavuzu

## 📋 Genel Bakış

Yayın başlatma sırasında oluşan hataları step-based olarak handle eden error handler sistemi.

---

## 🚀 Kurulum

### 1. Script Dosyalarını Yükleyin

`index.html` içinde script loader'a aşağıdaki script'leri ekleyin (sıralama önemli):

```html
<script>
    await window.scriptLoader.loadScripts([
        // ... diğer script'ler ...
        'agora-error-handler.js',              // Önce Agora error handler
        'yayin-baslatma-error-handler.js',     // Sonra Stream start error handler
        'live-stream-enhancements.js',          // Agora enhancements
        'live-stream.js'                        // Main live stream script
    ]);
</script>
```

**Not**: Script yükleme sırası önemlidir. Error handler'lar önce yüklenmeli.

---

## 🎯 Kullanım

### Otomatik Kullanım (Entegre Edilmiş)

Error handler zaten `live-stream.js` içinde entegre edilmiştir. Yayın başlatma sırasında hatalar otomatik olarak handle edilir.

```javascript
// Otomatik - Kod içinde zaten var
async function startStream() {
    try {
        // ... yayın başlatma adımları ...
    } catch (error) {
        // Error handler otomatik olarak çağrılır
        if (window.handleStreamStartError) {
            const errorResult = window.handleStreamStartError(error, step, context);
            // User-friendly message gösterilir
        }
    }
}
```

---

### Manuel Kullanım

Eğer manuel olarak error handle etmek isterseniz:

```javascript
// Manuel kullanım
try {
    // Bir işlem yap
    await someOperation();
} catch (error) {
    // Error handler'ı manuel çağır
    if (window.handleStreamStartError) {
        const errorResult = window.handleStreamStartError(error, 'step-name', {
            context: 'additional-info'
        });
        
        console.log('User message:', errorResult.userMessage);
        console.log('Solution:', errorResult.solution);
        console.log('Should retry:', errorResult.shouldRetry);
        console.log('Retry action:', errorResult.retryAction);
        
        // Kullanıcıya göster
        alert(errorResult.userMessage + '\n\n' + errorResult.solution);
    }
}
```

---

## 📊 Step'ler

### Mevcut Step'ler

1. **`pre-check`** - Pre-start kontrolleri
   - Kamera erişimi
   - Video track
   - Yayın durumu

2. **`camera-access`** - Kamera erişimi
   - WebRTC kontrolü
   - HTTPS kontrolü
   - Permission hataları

3. **`backend-request`** - Backend isteği
   - Connection hataları
   - Response validation
   - Provider kontrolü

4. **`agora-init`** - Agora initialization
   - SDK yükleme
   - Client oluşturma

5. **`agora-join`** - Agora join
   - Token hataları
   - App ID hataları
   - Channel hataları

6. **`track-creation`** - Track oluşturma
   - Video track
   - Audio track

7. **`publish`** - Publish işlemi
   - Publish hataları

---

## 🔍 Error Categorization

### Pre-Check Errors
- `CAMERA_NOT_ACCESSED` - Kamera erişimi yok
- `VIDEO_TRACK_NOT_FOUND` - Video track bulunamadı
- `STREAM_ALREADY_ACTIVE` - Yayın zaten aktif

### Camera Errors
- `CAMERA_PERMISSION_DENIED` - İzin reddedildi
- `CAMERA_NOT_FOUND` - Kamera bulunamadı
- `CAMERA_IN_USE` - Kamera kullanımda
- `HTTPS_REQUIRED` - HTTPS gerekli
- `WEBRTC_NOT_SUPPORTED` - WebRTC desteklenmiyor

### Backend Errors
- `BACKEND_SERVER_ERROR` - Server hatası
- `BACKEND_NOT_FOUND` - Endpoint bulunamadı
- `BACKEND_UNAVAILABLE` - Server kullanılamıyor
- `BACKEND_TIMEOUT` - Timeout
- `BACKEND_CORS_ERROR` - CORS hatası
- `BACKEND_CHANNEL_FAILED` - Channel oluşturulamadı
- `BACKEND_PROVIDER_ERROR` - Provider hatası

### Agora Errors
- `AGORA_SDK_NOT_LOADED` - SDK yüklenmedi
- `AGORA_CLIENT_CREATION_FAILED` - Client oluşturulamadı
- `AGORA_INVALID_TOKEN` - Geçersiz token
- `AGORA_TOKEN_EXPIRED` - Token süresi doldu
- `AGORA_INVALID_APP_ID` - Geçersiz App ID
- `AGORA_INVALID_CHANNEL_NAME` - Geçersiz channel name
- `AGORA_NETWORK_ERROR` - Network hatası
- `AGORA_JOIN_ERROR` - Join hatası

### Track Errors
- `VIDEO_TRACK_ERROR` - Video track hatası
- `AUDIO_TRACK_ERROR` - Audio track hatası
- `TRACK_ERROR` - Genel track hatası

### Publish Errors
- `AGORA_PUBLISH_FAILED` - Publish başarısız
- `PUBLISH_ERROR` - Genel publish hatası

---

## 💡 User-Friendly Messages

Error handler otomatik olarak Türkçe user-friendly mesajlar döner:

```javascript
// Örnek
{
    userMessage: "Kamera erişimi reddedildi. Tarayıcı ayarlarından kamera ve mikrofon izinlerini verin.",
    solution: "Tarayıcı ayarlarından site için kamera ve mikrofon izni verin.",
    shouldRetry: false
}
```

---

## 🔄 Retry Logic

Error handler hangi hataların retry edilebilir olduğunu belirler:

### Retryable Errors
- `BACKEND_SERVER_ERROR`
- `BACKEND_TIMEOUT`
- `BACKEND_UNAVAILABLE`
- `AGORA_NETWORK_ERROR`
- `AGORA_JOIN_ERROR`
- `AGORA_PUBLISH_FAILED`
- `PUBLISH_ERROR`

### Non-Retryable Errors
- `CAMERA_PERMISSION_DENIED`
- `CAMERA_NOT_FOUND`
- `CAMERA_IN_USE`
- `HTTPS_REQUIRED`
- `WEBRTC_NOT_SUPPORTED`
- `AGORA_SDK_NOT_LOADED`
- `AGORA_INVALID_APP_ID`
- `BACKEND_CORS_ERROR`
- `STREAM_ALREADY_ACTIVE`

---

## 📈 Error Statistics

Error handler error istatistiklerini tutar:

```javascript
// Error statistics al
const stats = window.streamStartErrorHandler.getErrorStatistics();

console.log('Error statistics:', stats);
// {
//     errorSteps: {
//         'backend-request': 5,
//         'agora-join': 2,
//         'publish': 1
//     },
//     totalErrors: 8
// }
```

---

## 🐛 Debug

### Console Logging

Error handler otomatik olarak console'a log yazar:

```javascript
// Console'da göreceğiniz log
🚨 Stream Start Error: {
    timestamp: "2024-11-06T...",
    step: "backend-request",
    category: "BACKEND_TIMEOUT",
    code: "ERROR",
    message: "Backend yanıt vermedi (500): ...",
    context: {...}
}
```

### Error History

Error history'yi temizlemek için:

```javascript
window.streamStartErrorHandler.clearHistory();
```

---

## 📝 Örnek Kullanım Senaryoları

### Senaryo 1: Backend Connection Error

```javascript
try {
    const response = await fetch('/api/rooms/main-room/join', {...});
    if (!response.ok) {
        throw new Error(`Backend yanıt vermedi (${response.status})`);
    }
} catch (error) {
    const errorResult = window.handleStreamStartError(error, 'backend-request');
    // errorResult.userMessage: "Backend sunucusuna bağlanılamıyor. İnternet bağlantınızı kontrol edin."
    // errorResult.shouldRetry: true
}
```

### Senaryo 2: Camera Permission Denied

```javascript
try {
    const stream = await navigator.mediaDevices.getUserMedia({...});
} catch (error) {
    const errorResult = window.handleStreamStartError(error, 'camera-access');
    // errorResult.userMessage: "Kamera erişimi reddedildi. Tarayıcı ayarlarından kamera ve mikrofon izinlerini verin."
    // errorResult.shouldRetry: false
}
```

### Senaryo 3: Agora Join Failed

```javascript
try {
    await agoraClient.join(appId, channelName, token, uid);
} catch (error) {
    const errorResult = window.handleStreamStartError(error, 'agora-join', {
        appId: appId,
        channelName: channelName,
        hasToken: !!token
    });
    // errorResult.userMessage: "Kanal'a katılamadı. Lütfen tekrar deneyin."
    // errorResult.shouldRetry: true
}
```

---

## ✅ Best Practices

1. **Step'i Doğru Belirleyin**
   - Her adım için doğru step'i kullanın
   - Step bilgisi error categorization için önemlidir

2. **Context Bilgisi Ekleyin**
   - Context bilgisi debug için faydalıdır
   - Error statistics için kullanılır

3. **User-Friendly Messages Kullanın**
   - Error handler'ın döndürdüğü userMessage'ı kullanın
   - Solution'ı kullanıcıya gösterin

4. **Retry Logic'i Kontrol Edin**
   - shouldRetry flag'ini kontrol edin
   - Retryable error'lar için retry mekanizması ekleyin

---

## 🔗 İlgili Dosyalar

- `yayin-baslatma-error-handler.js` - Error handler implementation
- `live-stream.js` - Error handler integration
- `YAYIN_BASLATMA_HATALARI.md` - Hata listesi
- `agora-error-handler.js` - Agora-specific error handler

---

**Son Güncelleme**: 2024-11-06
**Versiyon**: 1.0.0


# ⚡ AgoraRTC Hataları - Hızlı Başlangıç

## 🚀 5 Dakikada Başlangıç

### 1. Hata mı Var?
👉 **[HIZLI_BASVURU_KILAVUZU.md](./HIZLI_BASVURU_KILAVUZU.md)** - Hemen çözüm bulun

### 2. Tüm Hataları Görmek İstiyorum
👉 **[AGORA_HATALAR_MASTER_DOKUMAN.md](./AGORA_HATALAR_MASTER_DOKUMAN.md)** - Tüm hatalar

### 3. Error Handler Kullanmak İstiyorum
👉 Aşağıdaki kod örneklerine bakın

---

## 📝 Hızlı Kod Örnekleri

### Error Handler Kullanımı

```javascript
// Agora Error Handler
if (window.agoraErrorHandler) {
    const result = window.agoraErrorHandler.handleError(error, {
        type: 'exception',
        source: 'agora-client'
    });
    console.log('User message:', result.userMessage);
}

// Stream Start Error Handler
if (window.handleStreamStartError) {
    const result = window.handleStreamStartError(error, 'backend-request', {
        context: 'additional-info'
    });
    console.log('User message:', result.userMessage);
    console.log('Solution:', result.solution);
    console.log('Should retry:', result.shouldRetry);
}
```

### Error Statistics

```javascript
// Agora error statistics
const agoraStats = window.agoraErrorHandler?.getErrorStatistics();
console.log('Total errors:', agoraStats.totalErrors);
console.log('Error counts:', agoraStats.errorCounts);

// Stream start error statistics
const streamStats = window.streamStartErrorHandler?.getErrorStatistics();
console.log('Error steps:', streamStats.errorSteps);
```

---

## 🔍 Yaygın Hatalar

### 1. Token Expired
**Çözüm**: ✅ Otomatik token renewal aktif (Manuel müdahale gerekmez)

### 2. Network Error
**Çözüm**: İnternet bağlantınızı kontrol edin

### 3. Camera Permission Denied
**Çözüm**: Tarayıcı ayarlarından kamera izni verin

### 4. Backend Connection Failed
**Çözüm**: Backend server durumunu kontrol edin

---

## 📚 Dokümanlar

- **Ana README**: [AGORA_HATALAR_README.md](./AGORA_HATALAR_README.md)
- **Master Doküman**: [AGORA_HATALAR_MASTER_DOKUMAN.md](./AGORA_HATALAR_MASTER_DOKUMAN.md)
- **Hızlı Başvuru**: [HIZLI_BASVURU_KILAVUZU.md](./HIZLI_BASVURU_KILAVUZU.md)
- **Test Senaryoları**: [AGORA_HATALAR_TEST_SENARYOLARI.md](./AGORA_HATALAR_TEST_SENARYOLARI.md)

---

**Versiyon**: 1.0.0  
**Son Güncelleme**: 2024-11-06


# ⚡ AgoraRTC Hataları - Quick Start Guide

## 🚀 2 Dakikada Başlangıç

### 1. Hata mı Var? Hemen Çöz!
```bash
# Hızlı başvuru kılavuzunu aç
HIZLI_BASVURU_KILAVUZU.md
```

### 2. Error Handler Kullan
```javascript
// Agora Error Handler
if (window.agoraErrorHandler) {
    const result = window.agoraErrorHandler.handleError(error);
    alert(result.userMessage);
}

// Stream Start Error Handler
if (window.handleStreamStartError) {
    const result = window.handleStreamStartError(error, 'step');
    alert(result.userMessage + '\n\n' + result.solution);
}
```

### 3. Test Et
```bash
# Test senaryolarını çalıştır
AGORA_HATALAR_TEST_SENARYOLARI.md
```

---

## 📚 En Önemli Dosyalar

### Hızlı Erişim
1. **[HIZLI_BASVURU_KILAVUZU.md](./HIZLI_BASVURU_KILAVUZU.md)** - Hemen çözüm bul
2. **[AGORA_HATALAR_MASTER_DOKUMAN.md](./AGORA_HATALAR_MASTER_DOKUMAN.md)** - Tüm hatalar
3. **[AGORA_HATALAR_KULLANIM_REHBERI.md](./AGORA_HATALAR_KULLANIM_REHBERI.md)** - Nasıl kullanılır

### Error Handler'lar
- `agora-error-handler.js` - Agora hataları için
- `yayin-baslatma-error-handler.js` - Yayın başlatma hataları için

---

## 🔍 Yaygın Hatalar (Hızlı Çözüm)

### Token Expired
**Çözüm**: ✅ Otomatik token renewal aktif (Manuel müdahale gerekmez)

### Network Error
**Çözüm**: İnternet bağlantınızı kontrol edin

### Camera Permission Denied
**Çözüm**: Tarayıcı ayarlarından kamera izni verin

### Backend Connection Failed
**Çözüm**: Backend server durumunu kontrol edin

---

## 💻 Kod Örnekleri

### Basit Error Handling
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

### Error Statistics
```javascript
const stats = window.agoraErrorHandler?.getErrorStatistics();
console.log('Total errors:', stats?.totalErrors);
```

---

## 📊 İstatistikler

- **90+** hata senaryosu
- **19+** doküman
- **2** error handler
- **15+** test senaryosu

---

**Versiyon**: 1.0.0  
**Son Güncelleme**: 2024-11-06


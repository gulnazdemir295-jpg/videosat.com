# 🔧 NGINX SONRASI LIVE-STREAM.HTML DÜZELTMESİ

**Sayfa:** https://basvideo.com/live-stream.html  
**Sorun:** API URL'i Nginx kurulumundan sonra güncellenmeli  
**Durum:** Küçük bir kod düzeltmesi gerekiyor

---

## 🎯 SORUN

**Mevcut kod (`live-stream.js`):**
```javascript
function getAPIBaseURL() {
    // Production
    if (hostname === 'basvideo.com' || hostname.includes('basvideo.com')) {
        return 'https://basvideo.com/api';  // ❌ YANLIŞ!
    }
}
```

**Nginx kurulumundan sonra backend:** `https://api.basvideo.com`

---

## ✅ ÇÖZÜM

**`live-stream.js` dosyasını güncelle:**

```javascript
function getAPIBaseURL() {
    // Fallback: Hostname'e göre belirle
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Production - Nginx ile
    if (hostname === 'basvideo.com' || hostname.includes('basvideo.com')) {
        return 'https://api.basvideo.com/api';  // ✅ Nginx backend URL'i
    }
    
    // Local development
    const DEFAULT_BACKEND_PORT = window.DEFAULT_BACKEND_PORT || 3000;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `http://localhost:${DEFAULT_BACKEND_PORT}/api`;
    }
    
    // Fallback
    return `${protocol}//${hostname}:${DEFAULT_BACKEND_PORT}/api`;
}
```

---

## 📝 DÜZELTME ADIMLARI

### Adım 1: `live-stream.js` Dosyasını Güncelle

**Dosya:** `/Users/gulnazdemir/Desktop/DENEME/live-stream.js`

**Satır 24-25'i değiştir:**
```javascript
// Eski
return 'https://basvideo.com/api';

// Yeni
return 'https://api.basvideo.com/api';
```

---

### Adım 2: Diğer Dosyaları Kontrol Et

**Aynı düzeltmeyi yapılması gereken dosyalar:**
- `panels/panel-app.js` (varsa backend URL'i)
- Diğer frontend dosyaları (backend URL kullanan)

---

## 🧪 TEST

### Test 1: API URL Kontrolü

**Browser console'da (F12):**
```javascript
// Sayfayı aç: https://basvideo.com/live-stream.html
getAPIBaseURL()
// Beklenen: "https://api.basvideo.com/api"
```

---

### Test 2: Backend Bağlantısı

**Browser console'da:**
```javascript
fetch('https://api.basvideo.com/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend:', data));
```

**Beklenen:** `{"ok":true}`

---

### Test 3: Canlı Yayın Başlatma

1. Sayfayı aç: `https://basvideo.com/live-stream.html`
2. "Kamera Erişimi İste" butonuna tıkla
3. "Yayını Başlat" butonuna tıkla
4. **Çalışmalı!** ✅

---

## 🔍 SAYFADA GÖRÜNEN SORUNLAR

### Web Search Sonuçlarından Görünen:

**Sayfada AWS IVS bilgileri görünüyor:**
```
URL: -  
StreamKey: -  
PlaybackUrl: -
```

**Ama backend Agora kullanıyor!** Bu bilgiler artık geçersiz.

**Çözüm:** Sayfa kodunu kontrol et, IVS bilgilerini gösteren kısmı kaldır veya Agora bilgileriyle değiştir.

---

## 📋 CHECKLIST

### Nginx Kurulumundan Sonra:

- [ ] `live-stream.js` → `getAPIBaseURL()` güncellendi
- [ ] `panels/panel-app.js` → Backend URL güncellendi (varsa)
- [ ] Frontend dosyaları → Backend URL güncellendi
- [ ] Test: API URL doğru (`https://api.basvideo.com/api`)
- [ ] Test: Backend bağlantısı çalışıyor
- [ ] Test: Canlı yayın başlatma çalışıyor
- [ ] Sayfadaki IVS bilgileri kaldırıldı (Agora kullanılıyor)

---

## 🎯 SONUÇ

**Nginx kurulumundan sonra:**
- ✅ Sayfa çalışacak (küçük düzeltme ile)
- ✅ Backend API bağlantısı çalışacak
- ✅ Agora WebRTC çalışacak
- ⚠️ Sadece API URL'i güncellenmeli

**Düzeltme:** 5 dakika (sadece URL değişikliği)

---

**Son Güncelleme:** 5 Ocak 2025  
**Durum:** ✅ Küçük düzeltme ile çalışacak


# 🔍 Browser Console Hataları - Çözüm Rehberi

## ✅ İlk Durum
- `{"ok":true}` → Backend bağlantısı başarılı!
- Sonra kırmızı hata mesajları → Bazı API çağrıları başarısız

---

## 🔴 YAYGIN HATALAR VE ÇÖZÜMLERİ

### 1. CORS Hatası

**Kırmızı Hata Mesajı:**
```
Access to fetch at 'http://107.23.178.153:4000/...' 
from origin 'https://...' has been blocked by CORS policy
```

**Çözüm:**
Backend'de CORS aktif olmalı. Kontrol edelim:

```bash
# EC2'ye bağlan
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153

# Backend kodunu kontrol et
cd /home/ubuntu/api
grep -n "cors" app.js
```

**Beklenen:**
```javascript
app.use(cors()); // Bu satır olmalı
```

**Yoksa ekle:**
```bash
# Backend'i düzenle ve restart et
pm2 restart basvideo-backend
```

---

### 2. Network Hatası

**Kırmızı Hata Mesajı:**
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**Nedenler:**
- Backend çalışmıyor
- Security Group port 4000 kapalı
- Firewall engelliyor

**Çözüm:**
1. Backend çalışıyor mu?
   ```bash
   curl http://107.23.178.153:4000/api/health
   ```

2. PM2 durumu:
   ```bash
   ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
   pm2 status
   ```

---

### 3. 404 Not Found

**Kırmızı Hata Mesajı:**
```
404 Not Found
GET http://107.23.178.153:4000/api/... 404
```

**Neden:**
- Endpoint yanlış yazılmış
- Backend'de route tanımlı değil

**Çözüm:**
- Backend'de endpoint var mı kontrol et
- Frontend'deki URL'lerin doğru olduğundan emin ol

---

### 4. 401 Unauthorized

**Kırmızı Hata Mesajı:**
```
{"error":"unauthorized"}
401 Unauthorized
```

**Neden:**
- Admin endpoint'i için token gerekli
- Token gönderilmemiş veya yanlış

**Açıklama:**
Bu **normal** olabilir! Admin endpoint'leri token gerektirir. Kullanıcı endpoint'leri çalışmalı.

**Kontrol:**
```javascript
// Public endpoint (token gerektirmez) ✅
fetch('http://107.23.178.153:4000/api/health')
  .then(r => r.json())
  .then(d => console.log('Public:', d));

// Admin endpoint (token gerekir) ⚠️
fetch('http://107.23.178.153:4000/api/admin/rooms', {
  headers: { 'x-admin-token': 'test' }
})
  .then(r => r.json())
  .then(d => console.log('Admin:', d));
```

---

## 🔍 HATA ANALİZİ YAPMA

### Console'da Hata Detaylarını Görmek

**1. Kırmızı hata mesajına tıkla**
- Hata detaylarını gösterir
- Stack trace'i gösterir
- Hangi dosyada/satırda olduğunu gösterir

**2. Network Tab'ına Bak**
- F12 → **Network** sekmesi
- Kırmızı olan istekleri kontrol et
- Status koduna bak (404, 500, CORS error)

**3. Hata Mesajını Kopyala**
- Console'daki hata mesajını tam olarak kopyala
- Bana gönder, çözüm önerelim

---

## 🧪 DETAYLI TEST

### Tüm API Endpoint'lerini Test Et

**Console'da çalıştır:**

```javascript
// 1. Health check (her zaman çalışmalı)
fetch('http://107.23.178.153:4000/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Health:', d))
  .catch(e => console.error('❌ Health:', e));

// 2. Payments status (public)
fetch('http://107.23.178.153:4000/api/payments/status?userEmail=test@example.com')
  .then(r => r.json())
  .then(d => console.log('✅ Payments:', d))
  .catch(e => console.error('❌ Payments:', e));

// 3. Admin endpoint (token gerektirir - normalde 401 beklenir)
fetch('http://107.23.178.153:4000/api/admin/rooms')
  .then(r => r.json())
  .then(d => console.log('Admin:', d))
  .catch(e => console.error('Admin error:', e));
```

**Beklenen:**
- ✅ Health: `{ok: true}`
- ✅ Payments: `{hasTime: false}`
- ⚠️ Admin: `{error: "unauthorized"}` (bu normal!)

---

## 📋 HATA RAPORU HAZIRLAMA

**Console'dan şunları topla:**
1. Kırmızı hata mesajının tam metni
2. Network tab'ındaki failed request'ler
3. Hangi endpoint'ler başarısız oldu?

**Örnek rapor:**
```
✅ Health check: Başarılı
❌ /api/livestream/config: CORS error
❌ /api/payments/status: 404 Not Found
```

---

## 🚀 HIZLI ÇÖZÜM

### Eğer CORS Hatası Varsa

```bash
# EC2'ye bağlan
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153

# Backend'i restart et
cd /home/ubuntu/api
pm2 restart basvideo-backend

# Logları kontrol et
pm2 logs basvideo-backend --lines 20
```

---

## 💡 ÖNEMLİ NOTLAR

1. **401 Unauthorized normaldir** - Admin endpoint'leri token gerektirir
2. **CORS hatası varsa** - Backend'de `app.use(cors())` olmalı
3. **Network hatası varsa** - Backend çalışıyor mu kontrol et
4. **404 hatası varsa** - Endpoint doğru mu kontrol et

---

**Kırmızı hata mesajının tam metnini paylaş, çözümü birlikte bulalım! 🔍**





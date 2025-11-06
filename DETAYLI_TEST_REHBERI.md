# 📖 Detaylı Test Rehberi - BasVideo.com Production

**Tarih:** 3 Kasım 2025  
**Backend:** `http://107.23.178.153:4000`  
**Frontend:** S3'te deploy edildi

---

## 🎯 1. FRONTEND → BACKEND BAĞLANTISI TESTİ

### A. Browser Developer Tools Açma

**Adımlar:**
1. Frontend sayfasını aç (S3 URL veya CloudFront)
2. **F12** tuşuna bas VEYA
3. Sağ tık → **"Inspect"** veya **"Öğeyi İncele"**
4. Açılan pencerede **"Console"** sekmesine tıkla

**Ekran Görünümü:**
```
┌─────────────────────────────────────┐
│ Elements | Console | Network | ... │ ← Bu sekmeler
├─────────────────────────────────────┤
│ Console sekmesi                     │
│                                     │
│ > (Buraya komut yazılır)            │
└─────────────────────────────────────┘
```

---

### B. Backend Bağlantısını Test Etme

**Console'da şu komutu yaz ve Enter'a bas:**

```javascript
fetch('http://107.23.178.153:4000/api/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Backend bağlantısı başarılı!');
    console.log('Yanıt:', data);
  })
  .catch(error => {
    console.error('❌ Backend bağlantısı başarısız!');
    console.error('Hata:', error);
  });
```

**Beklenen Sonuç:**
```
✅ Backend bağlantısı başarılı!
Yanıt: {ok: true}
```

**Eğer Hata Alırsan:**
```
❌ Backend bağlantısı başarısız!
Hata: Failed to fetch
```
Bu durumda:
- Backend çalışıyor mu kontrol et
- CORS hatası olabilir
- Network tab'ından hata detaylarına bak

---

### C. Network Tab'ı ile API Çağrılarını İzleme

**Adımlar:**
1. **F12** → **Network** sekmesine git
2. Sayfayı **yenile** (F5 veya Ctrl+R)
3. Network sekmesinde **filter** kutusuna `107.23.178.153` yaz
4. Sayfada bir işlem yap (örn: canlı yayın butonuna tıkla)

**Ne Görülmeli:**
```
┌─────────────────────────────────────────────────────┐
│ Filter: [107.23.178.153              ]              │
├─────────────────────────────────────────────────────┤
│ Name              │ Method │ Status │ Type          │
├─────────────────────────────────────────────────────┤
│ /api/health       │ GET    │ 200    │ fetch         │ ✅
│ /api/payments/... │ GET    │ 200    │ fetch         │ ✅
│ /api/livestream...│ POST   │ 200    │ fetch         │ ✅
└─────────────────────────────────────────────────────┘
```

**Status Kodları:**
- ✅ **200** = Başarılı
- ⚠️ **401** = Yetkisiz (token gerekli)
- ❌ **404** = Bulunamadı
- ❌ **500** = Sunucu hatası
- ❌ **CORS Error** = CORS hatası

---

## 🔍 2. FRONTEND KODUNDA BACKEND URL KONTROLÜ

### Frontend'in Hangi Backend URL'ini Kullandığını Kontrol Et

**Console'da çalıştır:**

```javascript
// API base URL'i kontrol et
console.log('Backend URL:', window.API_BASE_URL || 'Tanımlı değil');

// Eğer live-stream.js yüklendiyse:
if (typeof getAPIBaseURL === 'function') {
  console.log('API Base URL:', getAPIBaseURL());
}
```

**Beklenen:**
```
Backend URL: http://107.23.178.153:4000
```

---

## 🎥 3. CANLI YAYIN ÖZELLİĞİ TESTİ

### Adım Adım Test

**1. Giriş Yap:**
- Frontend'te kayıt ol veya giriş yap
- Bir panele gir (satıcı, hammaddeci, üretici)

**2. Canlı Yayın Butonuna Tıkla:**
- Panel içinde **"Canlı Yayın"** veya **"Yayın Başlat"** butonunu bul
- Butona tıkla

**3. Console'u İzle:**
- **F12** → **Console** açık olsun
- **Network** tab'ına git

**Beklenen API Çağrıları:**
```
1. GET /api/payments/status?userEmail=...
   → Ödeme durumu kontrol edilir
   
2. GET /api/livestream/config?userEmail=...
   → Yayın yapılandırması alınır
   
3. POST /api/livestream/claim-key
   → Stream key talep edilir
```

**Başarılı Durum:**
- Tüm API çağrıları **Status 200**
- Console'da **hata mesajı yok**
- Canlı yayın başlatılabilir

**Hata Durumu:**
- ❌ `hasTime: false` → Ödeme bakiyesi yok
- ❌ `endpoint yok` → Admin tarafından IVS config atanmamış
- ❌ `401 unauthorized` → Token gerekli

---

## 🔧 4. SORUN GİDERME DETAYLARI

### Problem: CORS Hatası

**Hata Mesajı:**
```
Access to fetch at 'http://107.23.178.153:4000/api/...' 
from origin 'https://...' has been blocked by CORS policy
```

**Çözüm:**
1. EC2'ye SSH ile bağlan:
   ```bash
   ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
   ```

2. Backend kodunu kontrol et:
   ```bash
   cd /home/ubuntu/api
   grep -n "cors" app.js
   ```

3. CORS aktif olmalı:
   ```javascript
   app.use(cors()); // Bu satır olmalı
   ```

4. Backend'i yeniden başlat:
   ```bash
   pm2 restart basvideo-backend
   ```

---

### Problem: Network Hatası

**Hata Mesajı:**
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**Çözüm:**
1. Backend çalışıyor mu?
   ```bash
   curl http://107.23.178.153:4000/api/health
   ```

2. Security Group port 4000 açık mı?
   - EC2 Console → Instance → Security Groups
   - Inbound rules → Port 4000 TCP → Source: 0.0.0.0/0

3. PM2 durumu:
   ```bash
   ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
   pm2 status
   ```

---

### Problem: 401 Unauthorized

**Hata Mesajı:**
```
{"error":"unauthorized"}
```

**Açıklama:**
- Admin endpoint'leri için token gerekli
- Bu normal, kullanıcı endpoint'leri çalışmalı

**Test Et:**
```javascript
// Public endpoint (token gerektirmez)
fetch('http://107.23.178.153:4000/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Public:', d));

// Admin endpoint (token gerekir)
fetch('http://107.23.178.153:4000/api/admin/rooms', {
  headers: { 'x-admin-token': 'test' }
})
  .then(r => r.json())
  .then(d => console.log('Admin:', d));
```

---

## 📊 5. DETAYLI KONTROL LİSTESİ

### Backend Kontrolü
- [ ] Health check çalışıyor: `curl http://107.23.178.153:4000/api/health`
- [ ] PM2 online: `pm2 status` → `online`
- [ ] DynamoDB bağlantısı: Log'larda `✅ DynamoDB client initialized`
- [ ] Port 4000 açık: Security Group kontrolü

### Frontend Kontrolü
- [ ] Sayfa açılıyor: S3 URL çalışıyor
- [ ] Console'da hata yok: F12 → Console → Hata kontrolü
- [ ] API base URL doğru: `http://107.23.178.153:4000`
- [ ] Network tab'ında API çağrıları görünüyor

### Bağlantı Kontrolü
- [ ] CORS hatası yok: Network tab → CORS error kontrolü
- [ ] API çağrıları başarılı: Status 200
- [ ] Backend'den yanıt geliyor: Response içeriği kontrol

### Özellik Kontrolü
- [ ] Login/Register çalışıyor
- [ ] Panel sayfaları açılıyor
- [ ] Canlı yayın butonu çalışıyor
- [ ] Payment status kontrol edilebiliyor

---

## 🎯 6. BAŞARILI TEST SONUÇLARI

### Console Çıktısı (Başarılı):
```javascript
✅ Backend bağlantısı başarılı!
Yanıt: {ok: true}

API Base URL: http://107.23.178.153:4000

// Canlı yayın başlatıldığında:
GET /api/payments/status?userEmail=... 200 OK
GET /api/livestream/config?userEmail=... 200 OK
POST /api/livestream/claim-key 200 OK
```

### Network Tab (Başarılı):
```
✅ /api/health          GET  200  fetch
✅ /api/payments/...   GET  200  fetch
✅ /api/livestream/... POST 200  fetch
```

---

## 💡 7. YARDIMCI KOMUTLAR

### Browser Console'da Kullanışlı Komutlar:

```javascript
// Backend health check
fetch('http://107.23.178.153:4000/api/health').then(r => r.json()).then(console.log);

// Payment status test
fetch('http://107.23.178.153:4000/api/payments/status?userEmail=test@example.com')
  .then(r => r.json())
  .then(console.log);

// API base URL'i göster
console.log('Backend URL:', typeof getAPIBaseURL !== 'undefined' ? getAPIBaseURL() : 'Tanımlı değil');

// Network isteklerini filtrele
// Network tab'ında filter kutusuna: 107.23.178.153
```

---

## 📝 8. LOG KONTROLÜ

### Backend Logları İnceleme:

```bash
# EC2'ye bağlan
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153

# PM2 logları
pm2 logs basvideo-backend --lines 50

# Son 20 satır
pm2 logs basvideo-backend --lines 20 --nostream
```

**Beklenen Log Çıktısı:**
```
✅ AWS credentials environment variables'dan yüklendi
✅ DynamoDB client initialized
✅ IVS backend API running on http://localhost:4000
📡 Tüm network interface'lere açık (0.0.0.0:4000)
```

---

## 🎉 ÖZET

1. **F12** → **Console** → Backend test komutunu çalıştır
2. **Network** tab → API çağrılarını izle
3. **Canlı yayın** butonuna tıkla → API çağrılarını kontrol et
4. **Hata** varsa → Hata mesajını oku ve sorun giderme adımlarını takip et

**Her şey çalışıyorsa:**
✅ Frontend → Backend bağlantısı başarılı!  
✅ Production deployment tamamlandı! 🚀

---

**Test edip sonuçları paylaş! Herhangi bir sorun görürsen, hata mesajını gönder!**





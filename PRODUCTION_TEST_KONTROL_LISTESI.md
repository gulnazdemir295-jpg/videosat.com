# ✅ Production Test Kontrol Listesi

**Tarih:** 3 Kasım 2025  
**Durum:** Backend ✅ | Frontend ✅

---

## 🧪 TEST ADIMLARI

### 1. Browser Console Kontrolü

Frontend'i aç ve **F12** (Developer Tools) → **Console** sekmesine git:

**Beklenen:**
- ❌ Hata mesajı olmamalı
- ✅ API çağrıları görünmeli
- ✅ Backend URL: `http://107.23.178.153:4000`

**Kontrol Et:**
```javascript
// Console'da çalıştır:
fetch('http://107.23.178.153:4000/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend bağlantısı:', data))
  .catch(err => console.error('❌ Backend hatası:', err));
```

---

### 2. Network Tab Kontrolü

**F12** → **Network** sekmesi:

**Kontrol Et:**
- ✅ `107.23.178.153:4000` adresine istekler gidiyor mu?
- ✅ API çağrıları başarılı mı? (Status 200)
- ✅ CORS hatası var mı?

**Beklenen API Çağrıları:**
- `/api/health`
- `/api/payments/status`
- `/api/livestream/config` (canlı yayın başlatıldığında)

---

### 3. Frontend Özellikleri Test

#### A. Login/Register
- ✅ Kayıt olabiliyor musun?
- ✅ Giriş yapabiliyor musun?

#### B. Canlı Yayın
1. Panel'e git (satıcı/hammaddeci/üretici paneli)
2. **"Canlı Yayın"** butonuna tıkla
3. **Browser Console**'u aç
4. Backend API çağrılarını kontrol et

**Beklenen API Çağrıları:**
```
POST /api/payments/status?userEmail=...
GET /api/livestream/config?userEmail=...
POST /api/livestream/claim-key
```

#### C. Payment Status
- ✅ Ödeme durumu kontrol edilebiliyor mu?
- ✅ Backend'den doğru yanıt geliyor mu?

---

### 4. Backend API Testleri

Terminal'de test et:

```bash
# Health check
curl http://107.23.178.153:4000/api/health

# Payment status
curl "http://107.23.178.153:4000/api/payments/status?userEmail=test@example.com"
```

---

## ✅ BEKLENEN SONUÇLAR

### Backend Health Check
```json
{"ok":true}
```

### Payment Status
```json
{"hasTime":false}
```

### Frontend Console
- ✅ `API_BASE_URL` değişkeni: `http://107.23.178.153:4000`
- ✅ API çağrıları başarılı (Status 200)
- ❌ CORS hatası yok
- ❌ Network hatası yok

---

## 🐛 SORUN GİDERME

### CORS Hatası Alıyorsan
**Backend'de kontrol et:**
```javascript
// backend/api/app.js
app.use(cors()); // Aktif olmalı ✅
```

**EC2'de test:**
```bash
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
cd /home/ubuntu/api
pm2 logs basvideo-backend --lines 20
```

### API Çağrıları Başarısız Oluyorsa
1. Backend çalışıyor mu?
   ```bash
   curl http://107.23.178.153:4000/api/health
   ```

2. Security Group port 4000 açık mı?
   - EC2 Console → Security Groups → Inbound rules

3. Browser Console'da hata mesajı var mı?
   - F12 → Console → Hata mesajlarını kontrol et

---

## 🎯 SONRAKI ADIMLAR

1. ✅ Backend health check
2. ✅ Frontend açılıyor
3. ⏳ Frontend → Backend bağlantısı test edilmeli
4. ⏳ Canlı yayın özellikleri test edilmeli
5. ⏳ Payment status test edilmeli

---

**Frontend'in backend'e bağlandığını doğrulamak için browser console'u kontrol et!**







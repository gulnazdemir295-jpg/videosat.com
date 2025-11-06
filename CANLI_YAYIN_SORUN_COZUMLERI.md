# 🔥 CANLI YAYIN SORUN ÇÖZÜMLERİ - "Yayını Başlat" Butonu Çalışmıyor

**Tarih:** 5 Ocak 2025  
**Sorun:** "Yayını Başlat" butonuna basınca çalışmıyor 😤

---

## 🎯 HIZLI KONTROL LİSTESİ

### 1️⃣ Backend Çalışıyor mu?

**Kontrol:**
```bash
# Terminal'de
curl http://localhost:3000/api/health
```

**Beklenen:** `{"ok":true}`

**Sorun varsa:**
```bash
cd backend/api
npm start
```

---

### 2️⃣ Agora Credentials Var mı?

**Kontrol:**
```bash
cd backend/api
cat .env | grep AGORA
```

**Beklenen:**
```env
AGORA_APP_ID=1234567890abcdef
AGORA_APP_CERTIFICATE=abc123def456...
STREAM_PROVIDER=AGORA
```

**Sorun varsa:**
- Agora.io hesabı oluştur
- App ID ve Certificate al
- `.env` dosyasına ekle

---

### 3️⃣ Frontend Backend'e Bağlanabiliyor mu?

**Browser Console'da (F12):**
```javascript
testBackendConnection();
```

**Beklenen:** `✅ Backend bağlantısı başarılı`

**Sorun varsa:**
- Backend çalışıyor mu kontrol et
- Port eşleşiyor mu? (Frontend: 3000, Backend: 3000)
- CORS hatası var mı?

---

### 4️⃣ Agora SDK Yüklendi mi?

**Browser Console'da (F12):**
```javascript
typeof AgoraRTC
```

**Beklenen:** `"object"` veya `"function"`

**Sorun varsa:**
- Sayfayı yenile (F5)
- Network tab'da Agora SDK yüklendi mi kontrol et

---

### 5️⃣ Kamera Erişimi Var mı?

**Browser Console'da (F12):**
```javascript
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    console.log('✅ Kamera erişimi başarılı');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('❌ Kamera hatası:', err));
```

**Beklenen:** `✅ Kamera erişimi başarılı`

**Sorun varsa:**
- Tarayıcı izinleri kontrol et
- HTTPS kullan (localhost hariç)
- Kamera/mikrofon başka bir uygulama tarafından kullanılıyor mu?

---

## 🔍 ADIM ADIM SORUN GİDERME

### Adım 1: Backend Log'larını Kontrol Et

**Backend terminal'inde:**
```bash
# Backend çalışırken log'ları gör
# Terminal'de log'lar görünmeli
```

**Aranacak mesajlar:**
- ✅ `✅ Backend API çalışıyor: http://localhost:3000`
- ✅ `✅ Agora.io service yüklendi`
- ✅ `📡 Streaming Provider: AGORA`

**Sorun varsa:**
- `.env` dosyasında Agora credentials kontrol et
- Backend'i yeniden başlat

---

### Adım 2: Browser Console'u Aç

**F12 → Console tab**

**"Yayını Başlat" butonuna bas ve şunları kontrol et:**

1. **Hata mesajı var mı?**
   - `❌ Backend bağlantı hatası`
   - `❌ Agora SDK yüklenemedi`
   - `❌ Kamera erişimi reddedildi`

2. **API çağrısı yapılıyor mu?**
   - Network tab → `POST /api/rooms/.../join`
   - Status 200 olmalı

3. **Agora token alınıyor mu?**
   - Console'da `📡 Agora yayını başlatılıyor...` görünmeli

---

### Adım 3: API Endpoint'lerini Test Et

**Browser Console'da:**
```javascript
// Test 1: Health check
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(data => console.log('Health:', data));

// Test 2: Room join
fetch('http://localhost:3000/api/rooms/test-room/join', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    streamerEmail: 'test@example.com',
    streamerName: 'Test',
    deviceInfo: 'Browser'
  })
})
  .then(r => r.json())
  .then(data => console.log('Room join:', data));
```

**Beklenen:**
```json
{
  "ok": true,
  "channelId": "...",
  "appId": "...",
  "publisherToken": "...",
  "webrtc": { ... }
}
```

---

### Adım 4: Agora SDK Yükleme Kontrolü

**live-stream.html sayfasında:**
```html
<!-- Agora SDK yüklü mü? -->
<script>
  console.log('Agora SDK:', typeof AgoraRTC);
  // Beklenen: "object" veya "function"
</script>
```

**Sorun varsa:**
- `live-stream.html` dosyasında Agora SDK script tag'i var mı?
- Network tab'da SDK yüklendi mi?

---

## 🛠️ ÇÖZÜM SENARYOLARI

### Senaryo 1: Backend Çalışmıyor

**Belirtiler:**
- `❌ Backend bağlantı hatası`
- `fetch failed` hatası

**Çözüm:**
```bash
# Backend'i başlat
cd backend/api
npm start

# Port kontrolü
lsof -i :3000
# Port kullanılıyorsa:
kill -9 <PID>
```

---

### Senaryo 2: Agora Credentials Yok

**Belirtiler:**
- Backend log'unda: `⚠️ Agora service yüklenemedi`
- `❌ Agora App ID gerekli` hatası

**Çözüm:**
1. Agora.io hesabı oluştur
2. App ID ve Certificate al
3. `.env` dosyasına ekle:
   ```env
   AGORA_APP_ID=your_app_id
   AGORA_APP_CERTIFICATE=your_certificate
   STREAM_PROVIDER=AGORA
   ```
4. Backend'i yeniden başlat

---

### Senaryo 3: Agora SDK Yüklenmedi

**Belirtiler:**
- Console'da: `❌ Agora SDK yüklenemedi!`
- `typeof AgoraRTC === 'undefined'`

**Çözüm:**
1. `live-stream.html` dosyasında Agora SDK script tag'i kontrol et:
   ```html
   <script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.20.0.js"></script>
   ```
2. Network tab'da SDK yüklendi mi kontrol et
3. Sayfayı yenile (F5)

---

### Senaryo 4: Kamera Erişimi Reddedildi

**Belirtiler:**
- `❌ Kamera erişimi reddedildi`
- `NotAllowedError` hatası

**Çözüm:**
1. Tarayıcı ayarları → Kamera/Mikrofon izinleri
2. HTTPS kullan (localhost hariç)
3. Tarayıcıyı yeniden başlat
4. Başka bir uygulama kamera kullanıyor mu kontrol et

---

### Senaryo 5: CORS Hatası

**Belirtiler:**
- `CORS policy` hatası
- `Access-Control-Allow-Origin` hatası

**Çözüm:**
1. Backend'de CORS ayarları kontrol et:
   ```javascript
   app.use(cors()); // backend/api/app.js
   ```
2. Frontend'i web server üzerinden çalıştır:
   ```bash
   python3 -m http.server 8000
   ```
   (file:// protokolü CORS sorunlarına neden olur)

---

### Senaryo 6: API Endpoint Yanıt Vermiyor

**Belirtiler:**
- `POST /api/rooms/.../join` 500 hatası
- Backend log'unda hata var

**Çözüm:**
1. Backend log'larını kontrol et
2. `.env` dosyasında Agora credentials kontrol et
3. Backend'i yeniden başlat
4. Network tab'da response'u kontrol et

---

## 🧪 TEST SCRIPT'İ

**Browser Console'da çalıştır:**

```javascript
async function testLiveStream() {
  console.log('🧪 Canlı Yayın Test Başlıyor...\n');
  
  // Test 1: Backend
  console.log('1️⃣ Backend kontrolü...');
  try {
    const health = await fetch('http://localhost:3000/api/health').then(r => r.json());
    console.log('✅ Backend çalışıyor:', health);
  } catch (err) {
    console.error('❌ Backend çalışmıyor:', err.message);
    return;
  }
  
  // Test 2: Agora SDK
  console.log('\n2️⃣ Agora SDK kontrolü...');
  if (typeof AgoraRTC !== 'undefined') {
    console.log('✅ Agora SDK yüklü');
  } else {
    console.error('❌ Agora SDK yüklenmemiş!');
    return;
  }
  
  // Test 3: Kamera
  console.log('\n3️⃣ Kamera erişimi kontrolü...');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    console.log('✅ Kamera erişimi başarılı');
    stream.getTracks().forEach(track => track.stop());
  } catch (err) {
    console.error('❌ Kamera erişimi reddedildi:', err.message);
    return;
  }
  
  // Test 4: Room join
  console.log('\n4️⃣ Room join testi...');
  try {
    const response = await fetch('http://localhost:3000/api/rooms/test-room/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streamerEmail: 'test@example.com',
        streamerName: 'Test',
        deviceInfo: 'Browser'
      })
    });
    const data = await response.json();
    if (data.ok) {
      console.log('✅ Room join başarılı:', data);
    } else {
      console.error('❌ Room join başarısız:', data);
    }
  } catch (err) {
    console.error('❌ Room join hatası:', err.message);
  }
  
  console.log('\n✅ Test tamamlandı!');
}

// Çalıştır
testLiveStream();
```

---

## 📋 CHECKLIST

**"Yayını Başlat" butonu çalışması için:**

- [ ] Backend çalışıyor (`npm start`)
- [ ] Agora credentials `.env` dosyasında var
- [ ] Backend log'unda `✅ Agora.io service yüklendi` görünüyor
- [ ] Frontend backend'e bağlanabiliyor (`testBackendConnection()`)
- [ ] Agora SDK yüklü (`typeof AgoraRTC !== 'undefined'`)
- [ ] Kamera erişimi var (`getUserMedia` çalışıyor)
- [ ] CORS sorunu yok (web server üzerinden çalıştırılıyor)
- [ ] Browser console'da hata yok

---

## 🚀 HIZLI ÇÖZÜM

**En yaygın sorunlar:**

1. **Backend çalışmıyor**
   ```bash
   cd backend/api
   npm start
   ```

2. **Agora credentials yok**
   - Agora.io hesabı oluştur
   - App ID ve Certificate al
   - `.env` dosyasına ekle

3. **Frontend backend'e bağlanamıyor**
   - Backend çalışıyor mu kontrol et
   - Port eşleşiyor mu? (3000)

4. **Agora SDK yüklenmemiş**
   - Sayfayı yenile (F5)
   - Network tab'da SDK kontrol et

---

## 💡 ÖNERİLER

1. **Her zaman browser console'u açık tut** (F12)
2. **Backend log'larını takip et**
3. **Network tab'da API çağrılarını kontrol et**
4. **Test script'ini çalıştır** (yukarıda)

---

**Son Güncelleme:** 5 Ocak 2025  
**Durum:** ✅ Test edilmiş ve çalışıyor


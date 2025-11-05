# Sistem Kurulumu - Manuel Adımlar

## 📋 Genel Bakış

Bu dokümantasyon, sistemin frontend ve backend'inin çalışabilmesi için **manuel olarak yapmanız gereken** tüm adımları içerir.

---

## 🔧 1. Gerekli Yazılımların Kurulumu

### Node.js Kurulumu

**Kontrol**:
```bash
node --version
# Beklenen: v18.x.x veya üzeri
```

**Kurulum** (eğer yoksa):
- [Node.js resmi sitesi](https://nodejs.org/) üzerinden indirin
- v18 veya üzeri sürümü kurun

**Doğrulama**:
```bash
node --version
npm --version
```

---

## 📦 2. Backend Bağımlılıklarının Kurulumu

### Backend Node Modules Kurulumu

**Adım 1**: Backend dizinine gidin
```bash
cd backend/api
```

**Adım 2**: Bağımlılıkları yükleyin
```bash
npm install
```

**Beklenen Çıktı**:
```
added XXX packages, and audited XXX packages in XXs
found 0 vulnerabilities
```

**Adım 3**: Root dizine dönün
```bash
cd ../..
```

---

## 🔑 3. Agora.io Credentials Ayarları

### Agora.io Hesabı Oluşturma

**Adım 1**: Agora.io hesabı oluşturun
- [Agora.io Console](https://console.agora.io/) adresine gidin
- Hesap oluşturun (ücretsiz plan mevcut)

**Adım 2**: Yeni bir proje oluşturun
- Console'da "Projects" sekmesine gidin
- "Create Project" butonuna tıklayın
- Proje adını girin (örn: "basvideo-live-streaming")
- "Submit" butonuna tıklayın

**Adım 3**: App ID ve App Certificate'i alın
- Proje detay sayfasında:
  - **App ID**: Kopyalayın (örn: `1234567890abcdef`)
  - **App Certificate**: "Show" butonuna tıklayıp kopyalayın (örn: `abc123def456...`)

### Environment Variables Ayarlama

**Adım 1**: `.env` dosyası oluşturun
```bash
cd backend/api
cp .env.example .env
```

**Adım 2**: `.env` dosyasını düzenleyin
```bash
# macOS/Linux
nano .env
# veya
code .env  # VS Code kullanıyorsanız
```

**Adım 3**: Agora credentials'ları ekleyin
```env
# Agora.io Configuration (ZORUNLU)
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_app_certificate_here

# Streaming Provider
STREAM_PROVIDER=AGORA

# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Admin Token (Güvenlik için değiştirin)
ADMIN_TOKEN=change_this_to_secure_random_token
```

**Örnek**:
```env
AGORA_APP_ID=1234567890abcdef
AGORA_APP_CERTIFICATE=abc123def456ghi789jkl012mno345pqr678
STREAM_PROVIDER=AGORA
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
ADMIN_TOKEN=my_secure_random_token_12345
```

**⚠️ ÖNEMLİ**: 
- `AGORA_APP_ID` ve `AGORA_APP_CERTIFICATE` zorunludur
- Bu bilgileri asla GitHub'a push etmeyin
- `.env` dosyası `.gitignore`'da olmalı

---

## 🚀 4. Backend Sunucusunu Başlatma

### Yöntem 1: Start Script Kullanarak (Önerilen)

**Adım 1**: Root dizinden script'i çalıştırın
```bash
./start-backend.sh
```

**Script otomatik olarak**:
- Backend dizinine gider
- Node modules kontrolü yapar (yoksa yükler)
- `.env` dosyası kontrolü yapar
- Agora credentials kontrolü yapar
- Port kontrolü yapar
- Backend'i başlatır

### Yöntem 2: Manuel Başlatma

**Adım 1**: Backend dizinine gidin
```bash
cd backend/api
```

**Adım 2**: Backend'i başlatın
```bash
npm start
```

**Beklenen Çıktı**:
```
✅ Backend API çalışıyor: http://localhost:3000
🌐 API Base URL: http://localhost:3000/api
🌐 Yerel network: http://192.168.x.x:3000/api
📡 Tüm network interface'lere açık (0.0.0.0:3000)
💬 Chat, beğeni ve davet sistemi aktif
📡 Streaming Provider: AGORA
🔑 Agora Service: ✅ Aktif
🔧 Port: 3000 (Default: 3000)
```

**Adım 3**: Backend'in çalıştığını doğrulayın
```bash
# Yeni bir terminal açın
curl http://localhost:3000/api/health
```

**Beklenen Yanıt**:
```json
{"ok": true}
```

---

## 🌐 5. Frontend'i Çalıştırma

### Yöntem 1: Local Web Server (Önerilen)

**Neden**: `file://` protokolü CORS sorunlarına neden olabilir.

**Python ile**:
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Node.js ile**:
```bash
# http-server paketi kurun (global)
npm install -g http-server

# Frontend'i başlatın
http-server -p 8000
```

**Tarayıcıda açın**:
```
http://localhost:8000/index.html
```

### Yöntem 2: Doğrudan Dosya Açma

**⚠️ UYARI**: CORS sorunları yaşayabilirsiniz.

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

---

## ✅ 6. Sistem Testi

### Backend Testi

**Health Check**:
```bash
curl http://localhost:3000/api/health
```

**Beklenen Yanıt**:
```json
{"ok": true}
```

### Frontend-Backend Bağlantı Testi

**Adım 1**: Frontend sayfasını açın
```
http://localhost:8000/live-stream.html
```

**Adım 2**: Browser console'u açın (F12)

**Adım 3**: Test fonksiyonunu çalıştırın
```javascript
testBackendConnection();
```

**Beklenen Çıktı**:
```
✅ Backend bağlantısı başarılı
```

### Agora Service Testi

**Backend log'larında kontrol edin**:
```
🔑 Agora Service: ✅ Aktif
```

Eğer `❌ Devre Dışı` görünüyorsa:
- `.env` dosyasında `AGORA_APP_ID` ve `AGORA_APP_CERTIFICATE` kontrol edin
- Backend'i yeniden başlatın

---

## 🔧 7. Opsiyonel Yapılandırmalar

### DynamoDB Kullanımı (Opsiyonel)

Eğer DynamoDB kullanmak istiyorsanız:

**Adım 1**: `.env` dosyasına ekleyin
```env
USE_DYNAMODB=true
DYNAMODB_TABLE_USERS=basvideo-users
DYNAMODB_TABLE_ROOMS=basvideo-rooms
DYNAMODB_TABLE_CHANNELS=basvideo-channels
DYNAMODB_TABLE_PAYMENTS=basvideo-payments
```

**Adım 2**: AWS credentials ekleyin
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

**Not**: DynamoDB kullanmıyorsanız, sistem in-memory storage kullanır (geliştirme için yeterli).

---

## 🐛 8. Sorun Giderme

### Backend Başlamıyor

**Sorun**: Port 3000 zaten kullanılıyor

**Çözüm**:
```bash
# Port'u kullanan process'i bulun
lsof -i :3000

# Process'i sonlandırın
kill -9 <PID>
```

**Alternatif**: Farklı port kullanın
```bash
# .env dosyasında
PORT=3001

# veya environment variable ile
PORT=3001 npm start
```

---

### Agora Service Çalışmıyor

**Sorun**: `🔑 Agora Service: ❌ Devre Dışı`

**Kontrol Listesi**:
1. `.env` dosyasında `AGORA_APP_ID` var mı?
2. `.env` dosyasında `AGORA_APP_CERTIFICATE` var mı?
3. Değerler boş değil mi?
4. Backend'i yeniden başlattınız mı?

**Test**:
```bash
cd backend/api
grep AGORA .env
```

**Beklenen Çıktı**:
```
AGORA_APP_ID=1234567890abcdef
AGORA_APP_CERTIFICATE=abc123def456...
```

---

### Frontend Backend'e Bağlanamıyor

**Sorun**: `Backend bağlantı hatası`

**Kontrol Listesi**:
1. Backend çalışıyor mu?
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Port eşleşiyor mu?
   - Backend: `localhost:3000`
   - Frontend: `localhost:3000/api` bekliyor

3. CORS hatası mı?
   - Browser console'da hata mesajını kontrol edin
   - Backend CORS ayarlarını kontrol edin

4. Network hatası mı?
   - Firewall ayarlarını kontrol edin
   - Antivirus yazılımını kontrol edin

---

## 📝 9. Hızlı Başlangıç Checklist

Her yeni kurulum için:

- [ ] Node.js kurulu (v18+)
- [ ] Backend bağımlılıkları yüklendi (`cd backend/api && npm install`)
- [ ] Agora.io hesabı oluşturuldu
- [ ] Agora App ID ve Certificate alındı
- [ ] `.env` dosyası oluşturuldu (`cp .env.example .env`)
- [ ] `.env` dosyasına Agora credentials eklendi
- [ ] Backend başlatıldı (`npm start` veya `./start-backend.sh`)
- [ ] Backend health check başarılı (`curl http://localhost:3000/api/health`)
- [ ] Frontend web server başlatıldı (`python3 -m http.server 8000`)
- [ ] Frontend sayfası açıldı (`http://localhost:8000/index.html`)
- [ ] Frontend-backend bağlantısı test edildi

---

## 🔄 10. Günlük Kullanım

### Backend Başlatma

```bash
# Yöntem 1: Script ile
./start-backend.sh

# Yöntem 2: Manuel
cd backend/api
npm start
```

### Frontend Başlatma

```bash
# Yöntem 1: Python
python3 -m http.server 8000

# Yöntem 2: Node.js
http-server -p 8000
```

### Backend Durdurma

```bash
# Terminal'de Ctrl+C
# veya
kill -9 $(lsof -ti:3000)
```

---

## 📚 11. Ek Kaynaklar

- **Agora.io Dokümantasyon**: https://docs.agora.io/
- **Agora.io Console**: https://console.agora.io/
- **Node.js Dokümantasyon**: https://nodejs.org/docs/
- **Express.js Dokümantasyon**: https://expressjs.com/

---

## ⚠️ Önemli Notlar

1. **Agora Credentials**: Asla GitHub'a push etmeyin
2. **Port**: Sistem default olarak 3000 port'unu kullanır
3. **CORS**: Production'da CORS ayarları güncellenmelidir
4. **Backend**: Her zaman çalışır durumda olmalıdır
5. **Frontend**: Web server üzerinden çalıştırılmalıdır (CORS için)

---

**Son Güncelleme**: 2025-01-05
**Durum**: ✅ Güncel


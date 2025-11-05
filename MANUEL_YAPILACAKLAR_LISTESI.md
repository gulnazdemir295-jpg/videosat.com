# Manuel Yapılacaklar Listesi

## ✅ Zorunlu Adımlar (Sistem Çalışması İçin)

### 1. ✅ Node.js Kurulumu (ZORUNLU)

**Kontrol**:
```bash
node --version
# v18.x.x veya üzeri olmalı
```

**Yoksa Kur**:
- [nodejs.org](https://nodejs.org/) → v18+ indir ve kur
- Terminal'de `node --version` ile doğrula

**Durum**: ✅ Kontrol edildi - Node.js v22.12.0 kurulu

---

### 2. ✅ Backend Bağımlılıklarını Yükle (ZORUNLU)

**Komut**:
```bash
cd backend/api
npm install
cd ../..
```

**Beklenen**: `added XXX packages` mesajı

**Durum**: ✅ Kontrol edildi - `node_modules` mevcut

---

### 3. 🔑 Agora.io Credentials Al (ZORUNLU - KRİTİK)

**Adımlar**:

1. **Agora.io hesabı oluştur**
   - [console.agora.io](https://console.agora.io/) → Sign Up
   - Ücretsiz plan seçilebilir

2. **Proje oluştur**
   - Console → "Projects" → "Create Project"
   - Proje adı: `basvideo-live-streaming` (veya istediğiniz)
   - "Submit"

3. **App ID ve Certificate al**
   - Proje detay sayfasında:
     - **App ID**: Kopyala (örn: `1234567890abcdef`)
     - **App Certificate**: "Show" → Kopyala (örn: `abc123def456...`)

**⚠️ ÖNEMLİ**: Bu bilgiler olmadan sistem çalışmaz!

**Durum**: ⏳ SİZ YAPACAKSINIZ

---

### 4. 🔑 .env Dosyası Oluştur ve Düzenle (ZORUNLU)

**Adım 1**: `.env` dosyası oluştur
```bash
cd backend/api
cp .env.example .env
```

**Adım 2**: `.env` dosyasını düzenle
```bash
nano .env
# veya
code .env  # VS Code kullanıyorsanız
```

**Adım 3**: Şu satırları ekle/düzenle:
```env
AGORA_APP_ID=buraya_app_id_yapistir
AGORA_APP_CERTIFICATE=buraya_certificate_yapistir
STREAM_PROVIDER=AGORA
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
ADMIN_TOKEN=degistir_bu_tokeni_guvenli_random_bir_seyle
```

**Örnek**:
```env
AGORA_APP_ID=1234567890abcdef
AGORA_APP_CERTIFICATE=abc123def456ghi789jkl012mno345pqr678
STREAM_PROVIDER=AGORA
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
ADMIN_TOKEN=my_secure_token_xyz_12345
```

**Kaydet ve çık** (nano: Ctrl+X, Y, Enter)

**Durum**: ⏳ SİZ YAPACAKSINIZ (`.env` dosyası var ama içeriği kontrol edilmeli)

---

### 5. 🚀 Backend'i Başlat (ZORUNLU)

**Yöntem 1**: Script ile (Önerilen)
```bash
./start-backend.sh
```

**Yöntem 2**: Manuel
```bash
cd backend/api
npm start
```

**Beklenen Çıktı**:
```
✅ Backend API çalışıyor: http://localhost:3000
🌐 API Base URL: http://localhost:3000/api
🔑 Agora Service: ✅ Aktif
```

**⚠️ UYARI**: Eğer `🔑 Agora Service: ❌ Devre Dışı` görünüyorsa:
- `.env` dosyasında `AGORA_APP_ID` ve `AGORA_APP_CERTIFICATE` kontrol edin
- Backend'i yeniden başlatın

**Durum**: ⏳ SİZ YAPACAKSINIZ

---

### 6. 🌐 Frontend'i Çalıştır (ZORUNLU)

**Yöntem 1**: Python Web Server (Önerilen)
```bash
# Yeni terminal açın
cd /Users/gulnazdemir/Desktop/DENEME
python3 -m http.server 8000
```

**Yöntem 2**: Node.js http-server
```bash
# Önce kur (bir kez)
npm install -g http-server

# Sonra çalıştır
http-server -p 8000
```

**Tarayıcıda açın**:
```
http://localhost:8000/index.html
```

**Durum**: ⏳ SİZ YAPACAKSINIZ

---

## ✅ Opsiyonel Adımlar (İsteğe Bağlı)

### 7. ⚙️ DynamoDB Kullanımı (OPSİYONEL)

**Sadece DynamoDB kullanmak istiyorsanız**:

1. AWS hesabı oluştur
2. DynamoDB tabloları oluştur
3. `.env` dosyasına ekle:
```env
USE_DYNAMODB=true
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

**Not**: DynamoDB yoksa sistem in-memory storage kullanır (geliştirme için yeterli)

---

### 8. 🔒 Admin Token Değiştir (ÖNERİLİ)

**Güvenlik için**:
```env
ADMIN_TOKEN=degistir_bu_tokeni_guvenli_random_bir_seyle
```

**Güvenli token oluştur**:
```bash
# Terminal'de
openssl rand -hex 32
```

---

## ✅ Test Adımları

### Backend Testi

```bash
curl http://localhost:3000/api/health
# Beklenen: {"ok": true}
```

### Frontend-Backend Bağlantı Testi

1. Browser console'u açın (F12)
2. Şunu yazın:
```javascript
testBackendConnection();
```
3. Beklenen: `✅ Backend bağlantısı başarılı`

---

## 📋 Hızlı Checklist

Her yeni kurulum için:

- [ ] Node.js kurulu (v18+)
- [ ] Backend bağımlılıkları yüklendi (`cd backend/api && npm install`)
- [ ] Agora.io hesabı oluşturuldu
- [ ] Agora App ID alındı
- [ ] Agora App Certificate alındı
- [ ] `.env` dosyası oluşturuldu (`cp .env.example .env`)
- [ ] `.env` dosyasına Agora credentials eklendi
- [ ] Backend başlatıldı (`./start-backend.sh` veya `cd backend/api && npm start`)
- [ ] Backend health check başarılı (`curl http://localhost:3000/api/health`)
- [ ] Frontend web server başlatıldı (`python3 -m http.server 8000`)
- [ ] Frontend sayfası açıldı (`http://localhost:8000/index.html`)
- [ ] Frontend-backend bağlantısı test edildi

---

## 🎯 Öncelik Sırası

### 🔴 YÜKSEK ÖNCELİK (Sistem Çalışması İçin Zorunlu)

1. **Agora.io Credentials Al** (Kritik!)
2. **.env Dosyası Oluştur ve Düzenle** (Kritik!)
3. **Backend'i Başlat** (Zorunlu)
4. **Frontend'i Çalıştır** (Zorunlu)

### 🟡 ORTA ÖNCELİK (Önerilen)

5. Admin Token Değiştir (Güvenlik)
6. Sistem Testi Yap (Doğrulama)

### 🟢 DÜŞÜK ÖNCELİK (Opsiyonel)

7. DynamoDB Kurulumu (Sadece production için)
8. PM2 Kurulumu (Production deployment için)

---

## 📚 Detaylı Rehberler

- **Detaylı Kurulum**: `MANUEL_KURULUM_ADIMLARI.md`
- **Hızlı Başlangıç**: `KURULUM_HIZLI_BASLANGIC.md`
- **Agora Setup**: `AGORA_SETUP_REHBERI.md`
- **Deployment**: `BASVIDEO_COM_DEPLOYMENT.md`

---

## ⚠️ Önemli Notlar

1. **Agora Credentials**: Asla GitHub'a push etmeyin
2. **.env Dosyası**: `.gitignore`'da olmalı (zaten var)
3. **Backend**: Her zaman çalışır durumda olmalı
4. **Frontend**: Web server üzerinden çalıştırılmalı (CORS için)
5. **Port**: Sistem default olarak 3000 port'unu kullanır

---

**Son Güncelleme**: 2025-01-05
**Durum**: ✅ Güncel


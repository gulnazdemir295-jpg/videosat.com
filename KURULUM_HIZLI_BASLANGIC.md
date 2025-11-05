# 🚀 Hızlı Başlangıç Rehberi

## ⚡ 5 Dakikada Sistem Kurulumu

### Adım 1: Node.js Kontrolü (30 saniye)

```bash
node --version
# v18.x.x veya üzeri olmalı
```

**Yoksa**: [nodejs.org](https://nodejs.org/) üzerinden kurun

---

### Adım 2: Backend Bağımlılıklarını Yükle (1 dakika)

```bash
cd backend/api
npm install
cd ../..
```

---

### Adım 3: Agora.io Credentials Al (2 dakika)

1. [console.agora.io](https://console.agora.io/) → Hesap oluştur
2. "Projects" → "Create Project"
3. Proje oluştur → **App ID** ve **App Certificate** kopyala

---

### Adım 4: .env Dosyası Oluştur (30 saniye)

```bash
cd backend/api
cp .env.example .env
nano .env  # veya code .env
```

**Ekleyin**:
```env
AGORA_APP_ID=buraya_app_id_yapistir
AGORA_APP_CERTIFICATE=buraya_certificate_yapistir
STREAM_PROVIDER=AGORA
PORT=3000
```

**Kaydedin** ve çıkın (Ctrl+X, Y, Enter)

---

### Adım 5: Backend'i Başlat (30 saniye)

```bash
cd ../..
./start-backend.sh
```

**Beklenen Çıktı**:
```
✅ Backend API çalışıyor: http://localhost:3000
🔑 Agora Service: ✅ Aktif
```

**✅ Başarılı!** Backend çalışıyor.

---

### Adım 6: Frontend'i Başlat (30 saniye)

**Yeni terminal açın**:
```bash
cd /Users/gulnazdemir/Desktop/DENEME
python3 -m http.server 8000
```

**Tarayıcıda açın**:
```
http://localhost:8000/index.html
```

---

## ✅ Test

**Backend Testi**:
```bash
curl http://localhost:3000/api/health
# Beklenen: {"ok": true}
```

**Frontend Testi**:
1. Browser console'u açın (F12)
2. Şunu yazın:
```javascript
testBackendConnection();
```
3. Beklenen: `✅ Backend bağlantısı başarılı`

---

## 🎉 Tamamlandı!

Sistem artık çalışıyor! 

**Canlı yayın testi için**:
- `http://localhost:8000/live-stream.html` adresine gidin
- "Kamera Erişimi İste" butonuna tıklayın
- İzin verin ve yayını başlatın

---

## ❌ Sorun mu Var?

**Backend başlamıyor**:
- `.env` dosyasında Agora credentials var mı?
- Port 3000 kullanımda mı? (`lsof -i :3000`)

**Frontend bağlanamıyor**:
- Backend çalışıyor mu? (`curl http://localhost:3000/api/health`)
- Web server çalışıyor mu? (`http://localhost:8000`)

**Detaylı rehber için**: `MANUEL_KURULUM_ADIMLARI.md` dosyasına bakın.


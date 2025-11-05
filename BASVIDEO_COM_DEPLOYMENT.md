# basvideo.com Deployment Rehberi

## 🚀 Production Deployment

### 1. Backend Sunucusu (EC2/Server)

#### Backend Başlatma
```bash
cd backend/api
npm install
# .env dosyasını oluşturun ve Agora credentials ekleyin
npm start
```

#### PM2 ile Production'da Çalıştırma
```bash
# PM2 yükle
npm install -g pm2

# Backend'i PM2 ile başlat
cd backend/api
pm2 start app.js --name videosat-backend

# PM2 log'ları
pm2 logs videosat-backend

# PM2 durum
pm2 status

# Otomatik restart
pm2 startup
pm2 save
```

#### Nginx Reverse Proxy (Opsiyonel)
```nginx
server {
    listen 80;
    server_name api.basvideo.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Frontend Deployment (basvideo.com)

Frontend dosyaları zaten `basvideo.com` domain'inde çalışıyor olmalı.

#### Kontrol
- ✅ `live-stream.html` - Ana canlı yayın sayfası
- ✅ `live-stream.js` - Agora SDK entegrasyonu
- ✅ Agora SDK CDN yüklü mü?
- ✅ Backend API URL doğru mu?

### 3. Backend API URL Ayarları

Frontend'de backend API URL'i otomatik olarak belirleniyor:

```javascript
function getAPIBaseURL() {
    const hostname = window.location.hostname;
    if (hostname === 'basvideo.com' || hostname.includes('basvideo.com')) {
        return 'https://basvideo.com/api'; // Production API
    }
    return 'http://localhost:3000/api'; // Development
}
```

**⚠️ ÖNEMLİ**: Production'da backend API'nin `https://basvideo.com/api` veya `https://api.basvideo.com` adresinde çalışması gerekiyor.

### 4. CORS Ayarları

Backend'de CORS zaten aktif:
```javascript
app.use(cors());
```

### 5. Environment Variables (Production)

Production sunucusunda `.env` dosyası:

```env
# Agora.io
AGORA_APP_ID=your_production_app_id
AGORA_APP_CERTIFICATE=your_production_certificate
STREAM_PROVIDER=AGORA

# Backend
PORT=3000
NODE_ENV=production

# Admin
ADMIN_TOKEN=your_secure_admin_token
```

### 6. SSL/HTTPS

Production'da HTTPS kullanılmalı:
- Frontend: `https://basvideo.com`
- Backend API: `https://basvideo.com/api` veya `https://api.basvideo.com`

### 7. Firewall Ayarları

Backend sunucusunda port açılmalı:
```bash
# Port 3000'i aç (backend API için)
sudo ufw allow 3000/tcp

# Veya sadece localhost'tan erişilebilir yap ve Nginx reverse proxy kullan
```

### 8. Health Check

Backend health check endpoint:
```bash
curl https://basvideo.com/api/health
```

Beklenen yanıt:
```json
{
  "ok": true,
  "message": "Backend API is running"
}
```

## 🔍 Sorun Giderme

### Backend Bağlantı Hatası
1. Backend çalışıyor mu kontrol edin: `curl http://localhost:3000/api/health`
2. Port açık mı kontrol edin: `lsof -i :3000`
3. Firewall kurallarını kontrol edin
4. CORS ayarlarını kontrol edin

### Agora SDK Yüklenmedi
1. Internet bağlantısını kontrol edin
2. CDN URL'ini kontrol edin
3. Browser console'da hata var mı kontrol edin

### Agora Channel Join Failed
1. Backend log'larını kontrol edin
2. Agora credentials doğru mu kontrol edin
3. Token süresi dolmuş olabilir (1 saat)

---

**Son Güncelleme**: 2025-01-05


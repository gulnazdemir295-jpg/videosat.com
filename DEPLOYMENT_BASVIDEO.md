# Basvideo.com Deployment Rehberi

## 🚀 Deployment Adımları

### 1. GitHub Push (Tamamlandı ✅)
- Tüm değişiklikler commit edildi
- Güvenlik: .env dosyaları .gitignore'da
- .env.example dosyası eklendi

### 2. Backend Deployment (EC2 veya VPS)

#### A. Sunucuya Bağlan
```bash
ssh -i your-key.pem ubuntu@basvideo.com
# veya
ssh ubuntu@your-server-ip
```

#### B. Repository'yi Clone/Update Et
```bash
cd /var/www
git clone https://github.com/gulnazdemir295-jpg/videosat.com.git basvideo
# veya mevcut repo'yu update et:
cd basvideo
git pull origin main
```

#### C. Backend Kurulumu
```bash
cd backend/api
npm install --production

# Environment variables ayarla
cp .env.example .env
nano .env  # veya vi .env
```

#### D. .env Dosyası İçeriği
```env
PORT=4000
HOST=0.0.0.0
NODE_ENV=production

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=gerçek_aws_key
AWS_SECRET_ACCESS_KEY=gerçek_aws_secret
IVS_REGION=us-east-1

# DynamoDB Tables
DYNAMODB_TABLE_USERS=basvideo-users
DYNAMODB_TABLE_ROOMS=basvideo-rooms
DYNAMODB_TABLE_CHANNELS=basvideo-channels
DYNAMODB_TABLE_PAYMENTS=basvideo-payments
USE_DYNAMODB=true

# Admin Token (güçlü bir token oluşturun)
ADMIN_TOKEN=çok_güçlü_random_token_buraya

# Stream Provider
STREAM_PROVIDER=AGORA

# Agora.io Configuration
AGORA_APP_ID=gerçek_agora_app_id
AGORA_APP_CERTIFICATE=gerçek_agora_certificate
```

#### E. PM2 ile Backend Başlat
```bash
# PM2 kurulumu (yoksa)
npm install -g pm2

# Backend'i başlat
cd /var/www/basvideo/backend/api
pm2 start app.js --name basvideo-api
pm2 save
pm2 startup  # Systemd entegrasyonu için
```

#### F. Nginx Reverse Proxy (Opsiyonel)
```nginx
# /etc/nginx/sites-available/basvideo-api
server {
    listen 80;
    server_name api.basvideo.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Frontend Deployment

#### A. Static Files (S3 veya Nginx)
```bash
# S3'e deploy (eğer S3 kullanıyorsanız)
aws s3 sync . s3://basvideo-frontend --delete --exclude "backend/*" --exclude "node_modules/*"
```

#### B. Nginx ile Static Files
```nginx
# /etc/nginx/sites-available/basvideo
server {
    listen 80;
    server_name basvideo.com www.basvideo.com;
    root /var/www/basvideo;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL Sertifikası (Let's Encrypt)
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d basvideo.com -d www.basvideo.com
```

### 5. CORS Ayarları
Backend'deki CORS ayarlarını kontrol et:
```javascript
// backend/api/app.js
app.use(cors({
  origin: ['https://basvideo.com', 'https://www.basvideo.com'],
  credentials: true
}));
```

### 6. API Base URL Güncelleme
Frontend'de API base URL'i güncelle:
```javascript
// panels/panel-app.js
const API_BASE_URL = 'https://api.basvideo.com'; // veya https://basvideo.com/api
```

### 7. Test
```bash
# Backend health check
curl https://api.basvideo.com/api/health

# Frontend test
curl https://basvideo.com
```

## 🔒 Güvenlik Kontrol Listesi

- [x] .env dosyaları .gitignore'da
- [x] .env.example dosyası oluşturuldu
- [ ] Production'da güçlü ADMIN_TOKEN
- [ ] AWS credentials güvenli şekilde saklanıyor
- [ ] Agora credentials güvenli şekilde saklanıyor
- [ ] CORS sadece basvideo.com domain'lerine açık
- [ ] SSL sertifikası aktif
- [ ] Firewall kuralları yapılandırıldı

## 📝 Notlar

- Backend port: 4000 (Nginx reverse proxy ile 80/443'e yönlendirilebilir)
- Frontend: Static files (Nginx veya S3)
- Database: DynamoDB (AWS)
- Streaming: Agora.io (veya AWS IVS)

## 🆘 Sorun Giderme

### Backend başlamıyor
```bash
cd /var/www/basvideo/backend/api
pm2 logs basvideo-api
node app.js  # Manuel test
```

### CORS hatası
- Backend'deki CORS origin listesini kontrol et
- Frontend'deki API_BASE_URL'i kontrol et

### Agora bağlantı hatası
- AGORA_APP_ID ve AGORA_APP_CERTIFICATE doğru mu?
- Agora dashboard'da App ID'yi kontrol et


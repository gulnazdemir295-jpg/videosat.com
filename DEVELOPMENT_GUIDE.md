# 🛠️ Development Guide - VideoSat

Bu doküman VideoSat projesi için geliştirici rehberidir.

## 📋 İçindekiler

1. [Kurulum](#kurulum)
2. [Geliştirme Ortamı](#geliştirme-ortamı)
3. [Proje Yapısı](#proje-yapısı)
4. [Backend Geliştirme](#backend-geliştirme)
5. [Frontend Geliştirme](#frontend-geliştirme)
6. [Test](#test)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Kurulum

### Gereksinimler

- Node.js >= 18.x
- npm >= 9.x
- AWS CLI (deployment için)
- Git

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone <repository-url>
cd DENEME
```

2. **Backend dependencies yükleyin**
```bash
cd backend/api
npm install
```

3. **Environment variables ayarlayın**
```bash
cp .env.example .env
# .env dosyasını düzenleyin ve gerçek değerleri girin
```

4. **Backend'i başlatın**
```bash
npm start
# veya development mode için
npm run dev
```

---

## 💻 Geliştirme Ortamı

### Backend

- **Port**: 3000 (default)
- **API Base URL**: `http://localhost:3000/api`
- **Swagger Docs**: `http://localhost:3000/api-docs`

### Frontend

- **Port**: 8080 (local server) veya direkt HTML dosyaları
- **Backend URL**: `http://localhost:3000/api`

### Environment Variables

Backend için gerekli environment değişkenleri:

```bash
# Server
NODE_ENV=development
PORT=3000

# AWS
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1

# DynamoDB
USE_DYNAMODB=true
DYNAMODB_TABLE_USERS=basvideo-users

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

# Agora (Live Streaming)
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_certificate
```

---

## 📁 Proje Yapısı

```
DENEME/
├── backend/
│   └── api/
│       ├── app.js                 # Ana uygulama dosyası
│       ├── middleware/            # Middleware'ler
│       │   ├── auth-middleware.js
│       │   ├── error-handler.js
│       │   ├── env-validator.js
│       │   └── security-middleware.js
│       ├── routes/                 # Route'lar
│       │   ├── auth-routes.js
│       │   └── push-routes.js
│       ├── services/               # Business logic
│       │   ├── user-service.js
│       │   ├── email-service.js
│       │   └── ...
│       ├── utils/                  # Yardımcı fonksiyonlar
│       │   └── logger.js
│       ├── tests/                  # Testler
│       │   ├── unit/
│       │   ├── integration/
│       │   └── helpers/
│       └── logs/                   # Log dosyaları (otomatik)
├── .github/
│   └── workflows/                  # CI/CD pipeline
├── config/                         # Yapılandırma dosyaları
├── services/                       # Frontend servisleri
└── index.html                      # Ana sayfa
```

---

## 🔧 Backend Geliştirme

### Yeni Route Ekleme

1. `backend/api/routes/` klasöründe yeni route dosyası oluşturun
2. `app.js`'de route'u import edin ve kullanın

**Örnek**:
```javascript
// routes/product-routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth-middleware');

router.get('/products', authenticateToken, async (req, res) => {
  // ...
});

module.exports = router;

// app.js
const productRoutes = require('./routes/product-routes');
app.use('/api/products', productRoutes);
```

### Yeni Service Ekleme

1. `backend/api/services/` klasöründe service dosyası oluşturun
2. Business logic'i service'e taşıyın

**Örnek**:
```javascript
// services/product-service.js
async function getProducts(userId) {
  // Business logic
}

module.exports = {
  getProducts
};
```

### Error Handling

```javascript
const { AppError, asyncHandler } = require('./middleware/error-handler');

// Custom error
throw new AppError('Ürün bulunamadı', 404);

// Async handler
app.get('/api/test', asyncHandler(async (req, res) => {
  // Hata otomatik yakalanır
}));
```

### Logging

```javascript
const logger = require('./utils/logger');

logger.info('Application started');
logger.error('Error occurred', error);
logger.logAuth('login', email, true, ip);
logger.logAPI('/api/users', 'GET', 200, 150, userId);
```

---

## 🎨 Frontend Geliştirme

### API İstekleri

```javascript
// API Base URL
function getAPIBaseURL() {
  if (typeof window.getAPIBaseURL === 'function') {
    return window.getAPIBaseURL();
  }
  const hostname = window.location.hostname;
  if (hostname === 'basvideo.com') {
    return 'https://api.basvideo.com/api';
  }
  return 'http://localhost:3000/api';
}

// Örnek API isteği
async function fetchUserData() {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${getAPIBaseURL()}/auth/verify`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}
```

### Authentication

```javascript
// Login
const response = await fetch(`${getAPIBaseURL()}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
if (data.success) {
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
}
```

---

## 🧪 Test

### Test Çalıştırma

```bash
cd backend/api

# Tüm testler
npm test

# Watch mode
npm run test:watch

# Coverage ile
npm run test:coverage

# Sadece unit testler
npm run test:unit

# Sadece integration testler
npm run test:integration
```

### Yeni Test Yazma

```javascript
// tests/integration/my-feature.test.js
const request = require('supertest');
const app = require('../../app');

describe('My Feature', () => {
  it('should do something', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
  });
});
```

---

## 🚀 Deployment

### Development

```bash
cd backend/api
npm start
```

### Production

1. **Environment variables ayarlayın**
2. **Testleri çalıştırın**: `npm test`
3. **Build**: `npm run build` (eğer varsa)
4. **Deploy**: GitHub Actions otomatik deploy eder

### Manual Deployment

```bash
# EC2'ye deploy
ssh user@ec2-host
cd /path/to/app
git pull origin main
cd backend/api
npm ci --production
pm2 restart videosat-backend
```

---

## 🐛 Troubleshooting

### Backend başlamıyor

1. Port kontrolü: `lsof -i :3000`
2. Environment variables kontrolü
3. Dependencies kontrolü: `npm install`

### Test başarısız

1. Test environment variables kontrolü
2. Database bağlantısı kontrolü
3. Test data temizliği

### Logging çalışmıyor

1. `logs/` klasörü permissions kontrolü
2. Winston dependencies kontrolü
3. LOG_LEVEL environment variable kontrolü

---

## 📚 Kaynaklar

- [API Dokümantasyonu](http://localhost:3000/api-docs)
- [Test Dokümantasyonu](backend/api/tests/README.md)
- [CI/CD Dokümantasyonu](.github/workflows/README.md)

---

## 🤝 Katkıda Bulunma

1. Feature branch oluşturun
2. Değişikliklerinizi yapın
3. Testleri çalıştırın
4. Commit ve push yapın
5. Pull Request oluşturun

---

**Son Güncelleme**: 2024


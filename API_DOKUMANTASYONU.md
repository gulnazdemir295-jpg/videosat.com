# 📚 VideoSat API Dokümantasyonu

**Tarih:** 6 Kasım 2025  
**Base URL:** `https://api.basvideo.com/api`  
**Swagger UI:** `https://api.basvideo.com/api-docs`

---

## 🚀 Hızlı Başlangıç

### Swagger UI
API dokümantasyonuna erişmek için:
```
https://api.basvideo.com/api-docs
```

### Health Check
```bash
curl https://api.basvideo.com/api/health
```

---

## 📋 API Endpoint'leri

### Health
- `GET /api/health` - API sağlık kontrolü

### Rooms
- `POST /api/rooms/:roomId/join` - Room'a katıl ve channel oluştur
- `POST /api/rooms/create` - Yeni room oluştur (admin)

### Messages
- `POST /api/messages` - Mesaj gönder
- `GET /api/messages` - Mesajları al
- `PUT /api/messages/:messageId/read` - Mesajı okundu işaretle

### Payments
- `POST /api/payments/process` - Ödeme işle
- `GET /api/payments/:paymentId` - Ödeme durumu
- `GET /api/payments` - Ödeme geçmişi
- `POST /api/payments/:paymentId/refund` - İade işle
- `POST /api/payments/webhook` - Webhook handler

### Push Notifications
- `GET /api/push/public-key` - VAPID public key
- `POST /api/push/subscribe` - Push subscription kaydet
- `POST /api/push/unsubscribe` - Push subscription kaldır
- `POST /api/push/send` - Push notification gönder
- `GET /api/push/subscriptions` - Tüm subscription'ları listele (admin)

### Error Tracking
- `POST /api/errors/track` - Hata kaydet
- `POST /api/errors/batch` - Toplu hata kaydet
- `GET /api/errors` - Hataları listele (admin)
- `GET /api/errors/stats` - Hata istatistikleri (admin)

### Performance
- `POST /api/performance/track` - Performans metrik kaydet
- `POST /api/performance/batch` - Toplu performans metrik kaydet
- `GET /api/performance` - Performans metriklerini listele (admin)
- `GET /api/performance/stats` - Performans istatistikleri (admin)

### Admin
- `GET /api/admin/users/stats` - Kullanıcı istatistikleri
- `GET /api/admin/users` - Kullanıcı listesi
- `GET /api/admin/payments/stats` - Ödeme istatistikleri
- `GET /api/admin/streams/stats` - Yayın istatistikleri
- `GET /api/admin/export` - Veri dışa aktarma

### File Upload
- `POST /api/upload` - Dosya yükle
- `POST /api/upload/multiple` - Çoklu dosya yükle
- `GET /api/uploads/:folder/:filename` - Dosya görüntüle
- `DELETE /api/uploads/:folder/:filename` - Dosya sil (admin)

### Search
- `GET /api/search` - Global arama
- `GET /api/search/advanced` - Gelişmiş arama
- `GET /api/search/suggestions` - Arama önerileri

### Streams
- `POST /api/streams/:channelId/chat` - Chat mesajı gönder
- `GET /api/streams/:channelId/chat` - Chat mesajlarını al
- `POST /api/streams/:channelId/like` - Beğeni gönder
- `GET /api/streams/:channelId/likes` - Beğeni sayısını al
- `GET /api/streams` - Aktif stream'leri listele

---

## 🔐 Authentication

### Admin Endpoints
Admin endpoint'leri için `x-admin-token` header'ı gerekli:
```bash
curl -H "x-admin-token: YOUR_ADMIN_TOKEN" \
  https://api.basvideo.com/api/admin/users
```

### User Endpoints
Kullanıcı endpoint'leri için `x-user-id` header'ı gerekli:
```bash
curl -H "x-user-id: user@example.com" \
  https://api.basvideo.com/api/payments
```

---

## 📝 Request/Response Örnekleri

### Room Join
```bash
POST /api/rooms/main-room/join
Content-Type: application/json

{
  "streamerEmail": "user@example.com",
  "streamerName": "John Doe",
  "deviceInfo": "Chrome on Windows"
}
```

### Payment Process
```bash
POST /api/payments/process
Content-Type: application/json

{
  "orderId": "ORD-123",
  "amount": 100.50,
  "method": "card",
  "customer": {
    "email": "customer@example.com",
    "name": "Jane Doe"
  }
}
```

### Send Message
```bash
POST /api/messages
Content-Type: application/json

{
  "toUserId": "user2@example.com",
  "message": "Hello!",
  "type": "text"
}
```

---

## 🛠️ Development

### Local Development
```bash
# Backend başlat
cd backend/api
npm install
npm start

# API Docs
http://localhost:3000/api-docs
```

### Testing
```bash
# API tests
npm run test

# Security tests
npm run test:security

# All tests
npm run test:all
```

---

## 📦 Dependencies

- `express` - Web framework
- `socket.io` - WebSocket communication
- `multer` - File upload
- `swagger-jsdoc` - Swagger documentation
- `swagger-ui-express` - Swagger UI
- `web-push` - Push notifications
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `express-validator` - Input validation

---

## 🔗 Links

- **Swagger UI:** https://api.basvideo.com/api-docs
- **Health Check:** https://api.basvideo.com/api/health
- **Production:** https://api.basvideo.com
- **Development:** http://localhost:3000

---

**Son Güncelleme:** 6 Kasım 2025


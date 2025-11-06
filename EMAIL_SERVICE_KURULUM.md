# 📧 Email Service Kurulum Rehberi

**Tarih:** 6 Kasım 2025  
**Durum:** ✅ Hazır ve Kullanılabilir

---

## 🎯 Genel Bakış

Email Service, SMTP üzerinden email gönderme işlemlerini yönetir. Nodemailer kullanarak çeşitli email şablonları ve gönderme fonksiyonları sağlar.

---

## 📦 Kurulum

### 1. Paket Yükleme

Backend'de `nodemailer` paketi zaten eklenmiştir:
```bash
cd backend/api
npm install
```

### 2. Environment Variables

`.env` dosyasına SMTP ayarlarını ekleyin:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@basvideo.com
```

### 3. Gmail için App Password

Gmail kullanıyorsanız:
1. Google Account → Security → 2-Step Verification (aktif olmalı)
2. App Passwords → Generate new app password
3. Oluşturulan şifreyi `SMTP_PASS` olarak kullanın

---

## 🚀 Kullanım

### Backend API Endpoints

#### 1. Genel Email Gönderme
```bash
POST /api/email/send
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Test Email",
  "text": "Plain text content",
  "html": "<h1>HTML content</h1>"
}
```

#### 2. Hoş Geldin Email'i
```bash
POST /api/email/welcome
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### 3. Şifre Sıfırlama Email'i
```bash
POST /api/email/password-reset
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "reset-token-123",
  "resetUrl": "https://basvideo.com/reset-password?token=reset-token-123"
}
```

#### 4. Sipariş Onay Email'i
```bash
POST /api/email/order-confirmation
Content-Type: application/json

{
  "email": "user@example.com",
  "orderData": {
    "orderId": "ORD-123",
    "amount": 100.50,
    "currency": "TRY",
    "status": "completed"
  }
}
```

#### 5. Bildirim Email'i
```bash
POST /api/email/notification
Content-Type: application/json

{
  "email": "user@example.com",
  "notification": {
    "title": "Yeni Bildirim",
    "message": "Mesaj içeriği"
  }
}
```

---

## 📧 Email Şablonları

### Hoş Geldin Email'i
- HTML template ile profesyonel görünüm
- Kullanıcı adı ile kişiselleştirilmiş
- VideoSat branding

### Şifre Sıfırlama Email'i
- Güvenli reset token
- 1 saatlik geçerlilik süresi
- Güvenlik uyarıları

### Sipariş Onay Email'i
- Sipariş detayları
- Tutar ve durum bilgisi
- Takip linki

### Bildirim Email'i
- Özelleştirilebilir başlık ve mesaj
- HTML format desteği

---

## 🔧 Özelleştirme

### Email Şablonlarını Değiştirme

`backend/api/services/email-service.js` dosyasındaki şablon fonksiyonlarını düzenleyebilirsiniz:

```javascript
async function sendWelcomeEmail(userEmail, userName) {
  const html = `
    <!-- Özel HTML şablonunuz -->
  `;
  
  return await sendEmail({
    to: userEmail,
    subject: 'Özel Konu',
    html
  });
}
```

### SMTP Ayarları

Farklı SMTP sağlayıcıları için ayarlar:

**Gmail:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

**Outlook:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

---

## ⚠️ Notlar

1. **Güvenlik:** SMTP şifrelerini asla kod içinde saklamayın, sadece environment variables kullanın
2. **Rate Limiting:** Email endpoint'leri rate limiting ile korunmaktadır
3. **Error Handling:** Email gönderme hataları loglanır ve kullanıcıya uygun hata mesajı döner
4. **Production:** Production'da gerçek SMTP credentials kullanın
5. **Testing:** Development'ta test email servisleri (Mailtrap, etc.) kullanabilirsiniz

---

## 🧪 Test

### Email Gönderme Testi

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "This is a test email"
  }'
```

---

## 📊 Email Queue (Gelecek Özellik)

Şu an email'ler senkron olarak gönderilmektedir. Production için email queue sistemi eklenebilir:
- Bull (Redis-based queue)
- AWS SES
- SendGrid API

---

**Son Güncelleme:** 6 Kasım 2025  
**Durum:** ✅ Hazır ve Kullanılabilir


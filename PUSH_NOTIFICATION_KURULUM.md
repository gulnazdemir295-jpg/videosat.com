# 🔔 Push Notification Kurulum Rehberi

**Tarih:** 6 Kasım 2025  
**Durum:** ✅ Frontend ve Backend Hazır

---

## 🎯 Genel Bakış

Push Notification sistemi, kullanıcılara tarayıcı üzerinden push bildirimleri göndermenizi sağlar. Web Push API ve VAPID protokolü kullanılır.

---

## 📦 Kurulum

### 1. Backend Paket Yükleme

```bash
cd backend/api
npm install
```

Bu komut `web-push@^3.6.6` paketini yükler.

### 2. VAPID Keys Oluşturma

VAPID (Voluntary Application Server Identification) keys oluşturun:

```bash
cd backend/api
npx web-push generate-vapid-keys
```

Çıktı örneği:
```
Public Key: BEl62iUYgUivxIkv69yViEuiBIa40HIg...
Private Key: 8vdOrb70YsX2x3J...
```

### 3. Environment Variables Ekleme

`.env` dosyasına VAPID keys'leri ekleyin:

```env
# Push Notification VAPID Keys
VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa40HIg...
VAPID_PRIVATE_KEY=8vdOrb70YsX2x3J...
VAPID_EMAIL=mailto:admin@basvideo.com
```

**Önemli:** 
- `VAPID_EMAIL` formatı `mailto:` ile başlamalı
- Private key'i asla paylaşmayın
- Production'da güvenli bir şekilde saklayın

---

## 🚀 Kullanım

### Frontend

#### Push Notification'ı Etkinleştir

```javascript
// Push notification'ı etkinleştir
const result = await window.pushNotificationService.enable();

if (result.success) {
    console.log('✅ Push Notification etkinleştirildi');
} else {
    console.error('❌ Push Notification etkinleştirilemedi:', result.error);
}
```

#### Push Notification'ı Devre Dışı Bırak

```javascript
// Push notification'ı devre dışı bırak
const result = await window.pushNotificationService.disable();

if (result.success) {
    console.log('✅ Push Notification devre dışı bırakıldı');
}
```

#### Subscription Durumunu Kontrol Et

```javascript
// Subscription durumunu kontrol et
const isSubscribed = window.pushNotificationService.isSubscribed();
console.log('Push Notification:', isSubscribed ? 'Aktif' : 'Pasif');
```

### Backend

#### Push Notification Gönderme

```javascript
// POST /api/push/send
const response = await fetch('https://api.basvideo.com/api/push/send', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        userId: 'user@example.com',
        title: 'Yeni Mesaj',
        body: 'Size yeni bir mesaj geldi',
        icon: '/favicon.ico',
        url: '/messages',
        data: {
            messageId: '123',
            type: 'message'
        }
    })
});
```

#### Subscription'ları Listele

```javascript
// GET /api/push/subscriptions
const response = await fetch('https://api.basvideo.com/api/push/subscriptions');
const data = await response.json();
console.log('Subscription sayısı:', data.count);
```

---

## 📡 API Endpoint'leri

### GET /api/push/public-key
VAPID public key'i alır.

**Response:**
```json
{
  "publicKey": "BEl62iUYgUivxIkv69yViEuiBIa40HIg..."
}
```

### POST /api/push/subscribe
Push notification subscription'ı kaydeder.

**Request:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "userId": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription kaydedildi"
}
```

### POST /api/push/unsubscribe
Push notification subscription'ı kaldırır.

**Request:**
```json
{
  "subscription": { ... },
  "userId": "user@example.com"
}
```

### POST /api/push/send
Push notification gönderir.

**Request:**
```json
{
  "userId": "user@example.com",
  "title": "Bildirim Başlığı",
  "body": "Bildirim içeriği",
  "icon": "/favicon.ico",
  "url": "/",
  "data": {}
}
```

### GET /api/push/subscriptions
Tüm subscription'ları listeler (admin).

**Response:**
```json
{
  "success": true,
  "count": 5,
  "subscriptions": [
    {
      "userId": "user@example.com",
      "endpoint": "https://fcm.googleapis.com/...",
      "keys": { ... }
    }
  ]
}
```

---

## 🔧 Service Worker

Service Worker zaten mevcut (`service-worker.js`) ve push notification desteği içeriyor:

- Push event handler
- Notification click handler
- Notification close handler

---

## 🎨 UI Entegrasyonu

### Push Notification Ayar Butonu

```html
<button id="pushNotificationBtn" class="btn">
    <i class="fas fa-bell"></i>
    <span id="pushNotificationStatus">Push Bildirimleri</span>
</button>

<script>
document.getElementById('pushNotificationBtn').addEventListener('click', async () => {
    const service = window.pushNotificationService;
    
    if (service.isSubscribed()) {
        await service.disable();
        document.getElementById('pushNotificationStatus').textContent = 'Push Bildirimleri Kapalı';
    } else {
        const result = await service.enable();
        if (result.success) {
            document.getElementById('pushNotificationStatus').textContent = 'Push Bildirimleri Açık';
        }
    }
});
</script>
```

---

## 🔒 Güvenlik

### Önemli Notlar

1. **VAPID Private Key:** Asla frontend'de kullanmayın, sadece backend'de saklayın
2. **HTTPS:** Push notification'lar sadece HTTPS üzerinden çalışır
3. **Permission:** Kullanıcı izni gerekli
4. **Subscription:** Her kullanıcı için benzersiz subscription oluşturulur

---

## 🧪 Test

### 1. VAPID Keys Test

```bash
cd backend/api
node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('Public:', keys.publicKey); console.log('Private:', keys.privateKey);"
```

### 2. Subscription Test

```javascript
// Frontend'de
const result = await window.pushNotificationService.enable();
console.log('Subscription:', result.subscription);
```

### 3. Push Gönderme Test

```bash
curl -X POST https://api.basvideo.com/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test@example.com",
    "title": "Test Bildirimi",
    "body": "Bu bir test bildirimidir"
  }'
```

---

## ⚠️ Sorun Giderme

### Push Notification Çalışmıyor

1. **Service Worker Kontrolü:**
   ```javascript
   if ('serviceWorker' in navigator) {
       console.log('✅ Service Worker destekleniyor');
   }
   ```

2. **Permission Kontrolü:**
   ```javascript
   const permission = Notification.permission;
   console.log('Notification permission:', permission);
   ```

3. **Subscription Kontrolü:**
   ```javascript
   const subscription = await window.pushNotificationService.getSubscription();
   console.log('Subscription:', subscription);
   ```

### VAPID Keys Hatası

- VAPID keys'in doğru formatta olduğundan emin olun
- `.env` dosyasında `VAPID_EMAIL` formatı `mailto:` ile başlamalı
- Backend'i restart edin

### Subscription Kaydedilemiyor

- Backend'in çalıştığından emin olun
- CORS ayarlarını kontrol edin
- Network tab'ında request'i kontrol edin

---

## 📊 İstatistikler

### Desteklenen Tarayıcılar

- ✅ Chrome/Edge (Windows, macOS, Android)
- ✅ Firefox (Windows, macOS, Android)
- ✅ Safari (macOS, iOS 16.4+)
- ⚠️ Opera (Windows, macOS, Android)

### Özellikler

- ✅ Web Push API
- ✅ Service Worker
- ✅ VAPID protokolü
- ✅ Notification actions
- ✅ Notification click handling
- ✅ Background sync (hazırlık aşamasında)

---

## 🚀 Production Deployment

### 1. VAPID Keys Oluştur

```bash
npx web-push generate-vapid-keys
```

### 2. Environment Variables Ekle

EC2'de `.env` dosyasına ekleyin:

```env
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=mailto:admin@basvideo.com
```

### 3. Backend'i Restart Et

```bash
pm2 restart basvideo-backend
```

### 4. Test Et

Frontend'de push notification'ı etkinleştirip test edin.

---

## 📝 Notlar

1. **HTTPS Gerekliliği:** Push notification'lar sadece HTTPS üzerinden çalışır
2. **Service Worker:** Service Worker kayıtlı olmalı
3. **Permission:** Kullanıcı izni gerekli
4. **Subscription:** Her kullanıcı için benzersiz

---

**Son Güncelleme:** 6 Kasım 2025  
**Durum:** ✅ Hazır ve Kullanılabilir


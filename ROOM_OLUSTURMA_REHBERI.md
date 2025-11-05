# 🏠 Room Oluşturma Rehberi

## ✅ Durum
- Backend bağlantısı: ✅ Başarılı (`{ok: true}`)
- Test sayfası: ✅ Çalışıyor
- Sorun: Room henüz oluşturulmamış → 404 hatası normal!

---

## 🔧 ROOM OLUŞTURMA

### Yöntem 1: Admin Token ile (Önerilen)

**1. Admin Token'ı Öğren:**
```bash
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
cd /home/ubuntu/api
cat .env | grep ADMIN_TOKEN
```

**2. Room Oluştur:**
```bash
curl -X POST "http://107.23.178.153:4000/api/rooms/create" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: GERÇEK_TOKEN_BURAYA" \
  -d '{
    "roomId": "videosat-showroom-2024",
    "name": "VideoSat Showroom 2024"
  }'
```

**Başarılı yanıt:**
```json
{
  "ok": true,
  "roomId": "videosat-showroom-2024",
  "name": "VideoSat Showroom 2024"
}
```

---

### Yöntem 2: Backend'de Doğrudan Oluştur

**EC2'ye SSH ile bağlan:**
```bash
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
```

**Backend kodunu düzenle (geçici):**
```bash
cd /home/ubuntu/api
# Seed data ekle - app.js'nin sonuna ekle
```

Veya **backend'i restart et** ve room otomatik oluşturulsun.

---

### Yöntem 3: Test İçin Basit Room Oluştur

**Backend'de seed data ekle:**

`backend/api/app.js` dosyasına ekle (app.listen'den önce):

```javascript
// Seed: Test room
if (!rooms.has('videosat-showroom-2024')) {
  rooms.set('videosat-showroom-2024', {
    roomId: 'videosat-showroom-2024',
    name: 'VideoSat Showroom 2024',
    createdAt: new Date().toISOString(),
    channels: new Map()
  });
  console.log('✅ Test room oluşturuldu: videosat-showroom-2024');
}
```

Sonra backend'i restart et:
```bash
pm2 restart basvideo-backend
```

---

## 🧪 TEST

Room oluşturulduktan sonra:

```bash
curl "http://107.23.178.153:4000/api/rooms/videosat-showroom-2024/channels"
```

**Beklenen:**
```json
{
  "ok": true,
  "roomId": "videosat-showroom-2024",
  "roomName": "VideoSat Showroom 2024",
  "channels": [],
  "totalChannels": 0
}
```

---

## ✅ ÇÖZÜM ÖZET

1. **Backend bağlantısı:** ✅ Çalışıyor
2. **404 hatası:** Normal - Room henüz yok
3. **Çözüm:** Room oluştur (yukarıdaki yöntemlerden biri)
4. **Test:** Room oluşturulduktan sonra 404 kaybolur

---

**Hangi yöntemi kullanmak istersin? Admin token'ı biliyor musun?**



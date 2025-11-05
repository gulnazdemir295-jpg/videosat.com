# 🎥 Agora.io Kurulum Rehberi

## 📋 Genel Bakış

Agora.io, AWS IVS'e alternatif olarak kullanabileceğiniz canlı yayın servisidir. Sistem hybrid yapıdadır - AWS IVS veya Agora seçilebilir.

---

## 🚀 Hızlı Başlangıç

### 1. Agora.io Hesabı Oluştur

1. **Agora.io'ya Git**
   - https://www.agora.io/
   - "Sign Up" ile hesap oluştur

2. **Proje Oluştur**
   - Dashboard → "Create Project"
   - Proje adı: "VideoSat Live Streaming"
   - Use Case: "Live Streaming"

3. **App ID ve App Certificate Al**
   - Proje sayfasında **App ID** görünür
   - **App Certificate** için "Generate" butonuna tıkla
   - **App ID** ve **App Certificate**'ı kopyala

---

## 🔧 Backend Kurulumu

### 1. Environment Variables

Backend `.env` dosyasına ekle:

```bash
# Stream Provider Seçimi (AWS_IVS veya AGORA)
STREAM_PROVIDER=AGORA

# Agora.io Credentials
AGORA_APP_ID=your-app-id-here
AGORA_APP_CERTIFICATE=your-app-certificate-here
```

### 2. Backend'i Başlat

```bash
cd backend/api
npm start
```

Backend başlatıldığında şu mesajı görmelisiniz:
```
✅ Agora.io service yüklendi
```

---

## 📡 API Kullanımı

### Room'a Katılma (Agora ile)

```bash
curl -X POST "http://localhost:4000/api/rooms/test-room/join" \
  -H "Content-Type: application/json" \
  -d '{
    "streamerEmail": "test@basvideo.com",
    "streamerName": "Test Yayıncı",
    "deviceInfo": "Test Device"
  }'
```

**Response (Agora):**
```json
{
  "ok": true,
  "provider": "AGORA",
  "roomId": "test-room",
  "channelId": "channel-test-1234567890",
  "channelName": "test-room-channel-test-1234567890",
  "appId": "your-app-id",
  "publisherToken": "token-here",
  "subscriberToken": "token-here",
  "webrtc": {
    "appId": "your-app-id",
    "channelName": "test-room-channel-test-1234567890",
    "token": "token-here",
    "uid": 123456
  },
  "rtmpUrl": "rtmp://live.agora.io:1935/live/...",
  "hlsUrl": "https://live.agora.io/.../playlist.m3u8"
}
```

---

## 🎨 Frontend Entegrasyonu

### 1. Agora SDK Yükle

```html
<!-- HTML'de -->
<script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.20.0.js"></script>
```

veya npm ile:

```bash
npm install agora-rtc-sdk-ng
```

### 2. Frontend Kod Örneği

```javascript
// Agora client oluştur
const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

// Room'a katıl ve token al
async function joinRoom(roomId, streamerEmail) {
  const response = await fetch(`http://localhost:4000/api/rooms/${roomId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      streamerEmail: streamerEmail,
      streamerName: 'Yayıncı',
      deviceInfo: navigator.userAgent
    })
  });
  
  const data = await response.json();
  
  if (data.ok && data.provider === 'AGORA') {
    // Agora channel'a bağlan
    await client.join(
      data.appId,
      data.channelName,
      data.webrtc.token,
      data.webrtc.uid
    );
    
    // Kamera ve mikrofon başlat
    const localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
    
    // Yayını başlat
    await client.publish(localTracks);
    
    // Local video gösterme
    localTracks[1].play("local-video");
    
    console.log('✅ Agora yayını başlatıldı!');
    return data;
  }
}

// İzleyici olarak katıl
async function joinAsViewer(roomId, channelName) {
  // Token al (subscriber token)
  const response = await fetch(`http://localhost:4000/api/rooms/${roomId}/channels`);
  const channels = await response.json();
  
  // Channel bul
  const channel = channels.find(c => c.channelName === channelName);
  
  if (channel && channel.provider === 'AGORA') {
    await client.join(
      channel.appId,
      channel.channelName,
      channel.subscriberToken,
      null // Random UID
    );
    
    // Remote stream'leri dinle
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video") {
        user.videoTrack.play("remote-video");
      }
      if (mediaType === "audio") {
        user.audioTrack.play();
      }
    });
  }
}
```

---

## 🔄 Provider Değiştirme

### AWS IVS'e Geçiş

```bash
# .env dosyasında
STREAM_PROVIDER=AWS_IVS
```

### Agora'ya Geçiş

```bash
# .env dosyasında
STREAM_PROVIDER=AGORA
```

Backend'i yeniden başlatın.

---

## ✅ Test

### Backend Test

```bash
# Health check
curl http://localhost:4000/api/health

# Room oluştur (admin token gerekli)
curl -X POST "http://localhost:4000/api/rooms/create" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your-admin-token" \
  -d '{"roomId": "test-room", "name": "Test Room"}'

# Room'a katıl (Agora ile)
curl -X POST "http://localhost:4000/api/rooms/test-room/join" \
  -H "Content-Type: application/json" \
  -d '{
    "streamerEmail": "test@basvideo.com",
    "streamerName": "Test",
    "deviceInfo": "Test"
  }'
```

---

## 📊 Karşılaştırma

| Özellik | AWS IVS | Agora.io |
|---------|---------|----------|
| **Kurulum** | ⏳ Doğrulama bekleniyor | ✅ Hemen çalışır |
| **WebRTC** | ❌ WebRTC desteği yok | ✅ WebRTC desteği var |
| **Tarayıcı Yayın** | ❌ OBS gerekiyor | ✅ Tarayıcıdan yayın |
| **Ücretsiz Tier** | ❌ Yok | ✅ 10,000 dk/ay |
| **Maliyet** | $0.01/GB | $0.99/1K dk |

---

## ⚠️ Önemli Notlar

### Token Güvenliği
- Token'lar 1 saat geçerli (otomatik yenilenebilir)
- Token'lar backend'de oluşturulur (güvenli)
- Frontend'e token gönderilir

### Channel Yönetimi
- Her yayıncı kendi channel'ını oluşturur
- Channel adı: `{roomId}-{channelId}`
- UID otomatik oluşturulur

### WebRTC Desteği
- Agora tam WebRTC desteği sunar
- Tarayıcıdan direkt yayın yapılabilir
- OBS Studio gerekmez

---

## 🔗 Kaynaklar

- [Agora.io Documentation](https://docs.agora.io/en/live-streaming/overview/product-overview)
- [Agora Web SDK](https://docs.agora.io/en/video-calling/get-started/get-started-sdk)
- [Agora Token Generator](https://www.agora.io/en/blog/token-generator-for-agora/)

---

## 📝 Sonraki Adımlar

1. ✅ Agora hesabı oluştur
2. ✅ App ID ve Certificate al
3. ✅ Backend .env dosyasını güncelle
4. ✅ Backend'i başlat
5. ✅ Frontend entegrasyonu yap
6. ✅ Test et

---

**📅 Oluşturulma Tarihi:** 2025-11-05

**✅ Sistem hazır! Agora.io ile canlı yayın başlatabilirsiniz!**


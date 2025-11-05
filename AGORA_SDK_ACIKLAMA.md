# 🎥 Agora SDK Nedir? Ne İşe Yarar?

## 📚 Genel Bakış

**Agora SDK**, Agora.io'nun tarayıcıda (web) veya mobil uygulamalarda canlı yayın, video görüşme ve sesli görüşme yapmak için kullanılan **JavaScript kütüphanesidir**.

---

## 🎯 Ne İşe Yarar?

### 1. **Canlı Yayın (Live Streaming)** 🎥
- Tarayıcıdan direkt canlı yayın başlatma
- OBS Studio gerekmez
- WebRTC teknolojisi kullanır
- Gerçek zamanlı video/audio akışı

**Kullanım Senaryosu:**
```javascript
// Kameradan video al
const cameraTrack = await AgoraRTC.createCameraVideoTrack();

// Mikrofon sesi al
const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();

// Yayını başlat
await client.publish([cameraTrack, microphoneTrack]);
```

### 2. **Video Görüşme (Video Call)** 📞
- 1-1 veya grup görüşmeleri
- Çoklu katılımcı desteği
- Ekran paylaşımı
- Ses/video açma/kapatma

### 3. **Sesli Görüşme (Audio Call)** 🔊
- Telefon görüşmesi benzeri
- Grup çağrıları
- Düşük bant genişliği kullanımı

### 4. **İzleyici (Subscriber) Modu** 👁️
- Canlı yayınları izleme
- Çoklu yayıncıları aynı anda izleme
- Gerçek zamanlı playback

**Kullanım Senaryosu:**
```javascript
// Yayıncıyı dinle
client.on("user-published", async (user, mediaType) => {
  await client.subscribe(user, mediaType);
  if (mediaType === "video") {
    user.videoTrack.play("video-container");
  }
});
```

---

## 📦 SDK Nasıl Yüklenir?

### Yöntem 1: CDN (En Kolay) ⭐

**HTML Dosyasına Ekleyin:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Canlı Yayın</title>
</head>
<body>
    <!-- Agora SDK'yı CDN'den yükle -->
    <script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.20.0.js"></script>
    
    <script>
        // Artık AgoraRTC kullanılabilir!
        console.log('✅ Agora SDK yüklendi');
    </script>
</body>
</html>
```

**Avantajlar:**
- ✅ Hızlı kurulum (1 satır kod)
- ✅ Güncel versiyon
- ✅ CDN'den yüklenir (hızlı)
- ✅ Ek paket yükleme gerekmez

**Dezavantajlar:**
- ⚠️ İnternet bağlantısı gerekli
- ⚠️ CDN erişimi olmalı

---

### Yöntem 2: NPM (Node.js Projeleri)

**Terminal'de:**
```bash
npm install agora-rtc-sdk-ng
```

**JavaScript'te:**
```javascript
import AgoraRTC from 'agora-rtc-sdk-ng';

// Kullan
const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
```

**Avantajlar:**
- ✅ Package manager ile yönetim
- ✅ Versiyon kontrolü
- ✅ Offline çalışabilir
- ✅ Bundle edilebilir (webpack, vite)

**Dezavantajlar:**
- ⚠️ Build tool gerekiyor
- ⚠️ Daha fazla setup

---

### Yöntem 3: Download (Manuel)

1. **Agora.io'dan İndir**
   - https://www.agora.io/en/download/
   - SDK dosyasını indir
   - Projeye ekle

2. **HTML'de Kullan**
```html
<script src="./libs/agora-rtc-sdk.js"></script>
```

---

## 🔧 SDK'nın Temel Fonksiyonları

### 1. Client Oluşturma
```javascript
const client = AgoraRTC.createClient({ 
    mode: "live",      // "live" veya "rtc"
    codec: "vp8"      // "vp8" veya "h264"
});
```

**Mode:**
- `"live"` - Canlı yayın (1 yayıncı, çok izleyici)
- `"rtc"` - Video görüşme (çoklu katılımcı)

**Codec:**
- `"vp8"` - Daha iyi kalite, daha fazla bant genişliği
- `"h264"` - Daha az bant genişliği, daha hızlı

### 2. Channel'a Katılma
```javascript
await client.join(
    appId,           // Agora App ID
    channelName,     // Channel adı
    token,           // Güvenlik token'ı (backend'den alınır)
    uid              // User ID (null = random)
);
```

### 3. Kamera/Mikrofon Erişimi
```javascript
// Kamera + Mikrofon
const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();

// Sadece Kamera
const videoTrack = await AgoraRTC.createCameraVideoTrack();

// Sadece Mikrofon
const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
```

### 4. Yayın Başlatma (Publisher)
```javascript
// Track'leri yayınla
await client.publish(tracks);

// Sadece video
await client.publish([videoTrack]);

// Sadece ses
await client.publish([audioTrack]);
```

### 5. Video Gösterme
```javascript
// Local video (kendi kameranız)
videoTrack.play("local-video-container");

// Remote video (başkasının kamerası)
user.videoTrack.play("remote-video-container");
```

### 6. İzleyici Olarak Dinleme
```javascript
// Yeni yayıncı geldiğinde
client.on("user-published", async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    
    if (mediaType === "video") {
        user.videoTrack.play("video-container");
    }
    
    if (mediaType === "audio") {
        user.audioTrack.play();
    }
});
```

---

## 🎬 Tam Örnek: Canlı Yayın Başlatma

```html
<!DOCTYPE html>
<html>
<head>
    <title>Canlı Yayın</title>
</head>
<body>
    <div id="localVideo"></div>
    <button onclick="startStream()">Yayını Başlat</button>
    
    <!-- Agora SDK -->
    <script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.20.0.js"></script>
    
    <script>
        let client = null;
        let localTracks = [];
        
        async function startStream() {
            try {
                // 1. Backend'den token al
                const response = await fetch('http://localhost:4000/api/rooms/test-room/join', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        streamerEmail: 'test@basvideo.com',
                        streamerName: 'Test Yayıncı'
                    })
                });
                
                const data = await response.json();
                
                // 2. Agora client oluştur
                client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
                
                // 3. Channel'a katıl
                await client.join(
                    data.appId,
                    data.channelName,
                    data.webrtc.token,
                    data.webrtc.uid
                );
                
                // 4. Kamera ve mikrofon al
                localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
                
                // 5. Yayını başlat
                await client.publish(localTracks);
                
                // 6. Video göster
                localTracks[1].play("localVideo");
                
                console.log('✅ Yayın başlatıldı!');
            } catch (error) {
                console.error('❌ Hata:', error);
            }
        }
    </script>
</body>
</html>
```

---

## 🔍 SDK'nın Avantajları

### 1. **Kolay Kullanım** ✅
- Basit API
- İyi dokümantasyon
- Çok fazla örnek kod

### 2. **Güçlü Özellikler** ✅
- WebRTC desteği
- Düşük gecikme (latency)
- Otomatik kalite ayarlama
- Çoklu codec desteği

### 3. **Güvenlik** ✅
- Token tabanlı güvenlik
- Backend'de token oluşturma
- Frontend'de sadece kullanım

### 4. **Ölçeklenebilirlik** ✅
- Çoklu yayıncı desteği
- Çoklu izleyici desteği
- Global CDN

---

## 📊 SDK vs Diğer Çözümler

| Özellik | Agora SDK | WebRTC (Native) | AWS IVS |
|---------|-----------|----------------|---------|
| **Kurulum** | ✅ Kolay | ⚠️ Karmaşık | ✅ Orta |
| **WebRTC** | ✅ Var | ✅ Var | ❌ Yok |
| **Tarayıcı Yayın** | ✅ Var | ✅ Var | ❌ OBS gerekli |
| **Dokümantasyon** | ✅ İyi | ⚠️ Orta | ✅ İyi |
| **Ücretsiz Tier** | ✅ 10K dk/ay | ✅ Sınırsız | ❌ Yok |

---

## 🎯 Bizim Sistemde Kullanımı

### Backend'de:
- ✅ Token oluşturma (güvenlik)
- ✅ Channel bilgileri döndürme
- ✅ App ID ve Certificate yönetimi

### Frontend'de:
- ✅ SDK yükleme (CDN)
- ✅ Client oluşturma
- ✅ Channel'a katılma
- ✅ Yayın başlatma
- ✅ Video gösterme

---

## 📝 Özet

**Agora SDK:**
- ✅ Tarayıcıda canlı yayın yapmak için JavaScript kütüphanesi
- ✅ CDN'den tek satır kodla yüklenebilir
- ✅ WebRTC teknolojisi kullanır
- ✅ OBS Studio gerekmez
- ✅ Backend'den token alınır, frontend'de kullanılır

**Kullanım:**
1. SDK'yı yükle (CDN veya NPM)
2. Backend'den token al
3. Client oluştur
4. Channel'a katıl
5. Yayını başlat

**Sonuç:** Agora SDK sayesinde tarayıcıdan direkt canlı yayın yapabilirsiniz! 🎉

---

**📅 Oluşturulma:** 2025-11-05


# AWS IVS Entegrasyon Rehberi

## 🎯 AWS IVS Nedir?

Amazon Interactive Video Service (AWS IVS), tam yönetilen bir video streaming hizmetidir.

### Özellikler:
- WebRTC tabanlı canlı yayın
- Ultra-low latency (< 3 saniye)
- Otomatik ölçekleme
- Global CDN desteği
- Mobil uyumlu

### AWS Free Tier:
- **750 saat/ay** ücretsiz canlı video yayını
- **5,000 GB** veri transferi
- İlk 6 ay ücretsiz

---

## 📋 ÖN HAZIRLIK

### 1. AWS Console'a Giriş
```bash
# AWS Console: https://console.aws.amazon.com/
# Region: us-east-1 (önerilen)
```

### 2. IVS Kanalları Oluşturma

1. AWS Console'da **IVS** servisini açın
2. **Channels** → **Create channel**
3. Channel bilgilerini doldurun:
   - Channel name: `videosat-live-1`
   - Record to S3: false (simulated)
4. **Create channel** tıklayın

### 3. Credentials Alma

**Streaming Key:**
```json
{
  "ingestEndpoint": "rtmps://global-live.mux.com:443/app/",
  "streamKey": "live_stream_key_here"
}
```

**Playback URL:**
```json
{
  "hlsUrl": "https://1234567890.us-east-1.playback.live-video.net/api/video/v1/us-east-1.1234567890.channel.AbcDeFgHijKl.stream.m3u8",
  "rtmpUrl": "rtmps://global-live.mux.com:443/app/"
}
```

---

## 🔧 ENTEGRASYON ADIMLARI

### 1. Backend API (Basit Örnek)

**Dosya:** `services/aws-ivs-service.js`

```javascript
// AWS IVS Service (simulated)
class AWSIVSService {
    constructor() {
        // Bu değerler AWS Console'dan alınacak
        this.streamingEndpoint = '';
        this.playbackUrl = '';
        this.streamKey = '';
    }

    // Stream key'i al
    async getStreamKey(channelId) {
        try {
            // Simulated response
            return {
                ingestEndpoint: this.streamingEndpoint,
                streamKey: this.streamKey
            };
        } catch (e) {
            console.error('Error getting stream key:', e);
            throw e;
        }
    }

    // Playback URL'i al
    async getPlaybackUrl(channelId) {
        try {
            return {
                hlsUrl: this.playbackUrl,
                rtmpUrl: this.streamingEndpoint
            };
        } catch (e) {
            console.error('Error getting playback URL:', e);
            throw e;
        }
    }

    // Channel oluştur
    async createChannel(channelName) {
        try {
            return {
                channelId: 'channel_' + Date.now(),
                streamKey: 'stream_key_' + Date.now(),
                playbackUrl: 'https://example.com/playback.m3u8'
            };
        } catch (e) {
            console.error('Error creating channel:', e);
            throw e;
        }
    }
}

// Export
window.awsIVSService = new AWSIVSService();
```

### 2. Live Stream Entegrasyonu

**Dosya:** `live-stream.js` (güncellenecek)

```javascript
// AWS IVS ile canlı yayın
async function startAWSIVSStream() {
    try {
        // AWS IVS servisini başlat
        const streamInfo = await window.awsIVSService.getStreamKey('channel_1');
        
        // MediaStream al (kamera)
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        // Video element'e bağla
        const videoElement = document.getElementById('localVideo');
        if (videoElement) {
            videoElement.srcObject = stream;
        }

        // AWS IVS'e bağla
        // Not: Gerçek entegrasyon MediaLive SDK kullanır

        console.log('AWS IVS stream started');
        return true;
    } catch (e) {
        console.error('Error starting AWS IVS stream:', e);
        return false;
    }
}

// AWS IVS ile izleme
async function playAWSIVSStream(channelId) {
    try {
        const playbackInfo = await window.awsIVSService.getPlaybackUrl(channelId);
        
        // HLS player kullan (Video.js, hls.js, vb.)
        const videoElement = document.getElementById('remoteVideo');
        if (videoElement && playbackInfo.hlsUrl) {
            // HLS.js ile oynat
            const hls = new Hls();
            hls.loadSource(playbackInfo.hlsUrl);
            hls.attachMedia(videoElement);
            
            videoElement.play();
        }

        console.log('AWS IVS playback started');
        return true;
    } catch (e) {
        console.error('Error playing AWS IVS stream:', e);
        return false;
    }
}
```

### 3. HTML Entegrasyonu

**Dosya:** `live-stream.html` (güncellenecek)

```html
<!-- AWS IVS Stream Player -->
<div id="ivsPlayer">
    <video id="remoteVideo" autoplay muted></video>
</div>

<!-- HLS.js Library -->
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>

<!-- AWS IVS Service -->
<script src="services/aws-ivs-service.js"></script>
```

---

## 🎬 KULLANIM ÖRNEĞİ

### Yayıncı (Broadcaster):

```javascript
// 1. AWS IVS channel oluştur
const channel = await window.awsIVSService.createChannel('my-channel');

// 2. Stream key'i al
const streamInfo = await window.awsIVSService.getStreamKey(channel.channelId);

// 3. OBS Studio veya broadcaster SDK ile yayına başla
// RTMPS URL: streamInfo.ingestEndpoint
// Stream Key: streamInfo.streamKey
```

### İzleyici (Viewer):

```javascript
// 1. Playback URL'i al
const playbackInfo = await window.awsIVSService.getPlaybackUrl(channelId);

// 2. HLS player ile izle
playAWSIVSStream(channelId);
```

---

## ⚠️ ÖNEMLİ NOTLAR

### 1. Gerçek Entegrasyon İçin Gerekenler:
- AWS SDK for JavaScript
- MediaLive SDK (broadcasting)
- HLS.js veya Video.js (playback)
- CORS yapılandırması
- SSL sertifikası (HTTPS gerekli)

### 2. Güvenlik:
- Stream key'i backend'de saklayın
- HTTPS kullanın
- Token-based authentication
- Rate limiting

### 3. Maliyet:
- Free Tier: 750 saat/ay
- Sonrası: ~$0.035/saat
- Veri transferi: 5,000 GB ücretsiz

---

## 📱 TEST ADIMLARI

### 1. OBS Studio ile Test:

1. OBS Studio'yu indirin
2. **Settings** → **Stream**
3. Service: **Custom**
4. Server: AWS IVS ingest endpoint
5. Stream Key: AWS IVS stream key
6. **Start Streaming**

### 2. Tarayıcıdan İzle:

```javascript
// Test URL'i
const testUrl = 'AWS_IVS_HLS_URL_BURAYA';
playAWSIVSStream('test-channel');
```

---

## 🔗 FAYDALI LİNKLER

- [AWS IVS Documentation](https://docs.aws.amazon.com/ivs/)
- [AWS IVS Pricing](https://aws.amazon.com/ivs/pricing/)
- [AWS IVS Console](https://console.aws.amazon.com/ivs/)
- [HLS.js Documentation](https://github.com/video-dev/hls.js/)

---

## 💰 MALIYET HESAPLAMA

### Örnek Senaryo:
- Günde 2 saat canlı yayın
- Ay boyunca 60 saat
- Free Tier: 750 saat/ay (yeterli!)

**Maliyet:** $0 (Free Tier içinde)

---

**Hazırlayan:** VideoSat Platform Team  
**Tarih:** 2024  
**Durum:** 📝 Entegrasyon rehberi hazır


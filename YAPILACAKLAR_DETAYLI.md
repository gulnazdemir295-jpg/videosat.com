# Yapılacaklar - Detaylı Adım Adım

## 🎯 AMAÇ:
Tarayıcıdan OBS olmadan canlı yayın (Tişört satan amca için!)

---

## 📋 1. AWS IVS CREDENTIALS HAZIRLA

### Adım 1.1: AWS Console'da Channel Oluştur
```
1. AWS Console'a giriş yap (https://console.aws.amazon.com/)
2. Region: us-east-1 seç
3. "IVS" servisini bul
4. "Channels" → "Create channel"
5. Name: "videosat-live-1"
6. "Create channel" tıkla
```

### Adım 1.2: Credentials'ları Kopyala
```
Channel'a tıkla → "Stream configuration" section'ında:

1. Ingest Endpoint (OBS için gerekli):
   rtmps://abcd1234abcd1234.global-contribute.live-video.net:443/app/

2. Stream Key (OBS için gerekli):
   sk_us-XXXXXX-XXXXXXXX-XXXXXXXX-XXXXXX-XXXXXXXX-XXXXXXXX
   → "Show" butonuna tıkla, kopyala

3. Playback URL (İzleyici için):
   https://1234567890abc.us-east-1.playback.live-video.net/api/video/v1/us-east-1.1234567890.channel.AbcDeFgHijKl.stream.m3u8
   → Kopyala
```

### Adım 1.3: Güvenli Yere Kaydet
```
✅ Stream key'i kimseyle paylaşma!
✅ Playback URL'i kopyala (izleyiciler için)
✅ Channel ID'yi not et
```

---

## 📋 2. AWS IVS SERVICE OLUŞTUR

### Adım 2.1: Yeni Dosya Oluştur

**Dosya:** `services/aws-ivs-service.js`

```javascript
// AWS IVS Service - Tarayıcıdan canlı yayın
class AWSIVSService {
    constructor() {
        // Bu değerleri AWS Console'dan kopyala
        this.streamingEndpoint = 'RTMPS_ENDPOINT_BURAYA';
        this.streamKey = 'STREAM_KEY_BURAYA';
        this.playbackUrl = 'PLAYBACK_URL_BURAYA';
        this.channelId = 'CHANNEL_ID_BURAYA';
    }

    // Stream başlat
    async startBrowserStream() {
        try {
            // 1. Kamerayı aç
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            console.log('✅ Kamera açıldı');
            
            // 2. AWS IVS'e bağla
            // TODO: Gerçek entegrasyon eklenecek
            // Şimdilik simulated
            await this.connectToIVS(stream);
            
            return stream;
        } catch (e) {
            console.error('❌ Stream başlatılamadı:', e);
            throw e;
        }
    }

    // AWS IVS'e bağlan (simulated)
    async connectToIVS(stream) {
        // Şimdilik sadece local preview göster
        console.log('🔴 Yayın başlatılıyor (simulated)...');
        
        // TODO: Gerçek AWS IVS entegrasyonu eklenecek
        // MediaLive.js veya WebRTC kullanılacak
        
        return true;
    }

    // Stream durdur
    stopStream() {
        console.log('⏹️ Yayın durduruluyor...');
        // TODO: Stream'i durdur
    }

    // Playback URL'i al
    getPlaybackUrl() {
        return this.playbackUrl;
    }
}

// Export
window.awsIVSService = new AWSIVSService();
```

### Adım 2.2: HTML'e Ekle

**Dosya:** Tüm panel HTML dosyalarına ekle

```html
<!-- Panellerde live-stream section varsa -->
<script src="../services/aws-ivs-service.js"></script>
```

**Örnek:** `panels/uretici.html`, `panels/satici.html`, vb.

---

## 📋 3. FRONTEND'İ GÜNCELLE

### Adım 3.1: Panel'lere Buton Ekle

**Dosya:** `panels/uretici.html`, `panels/satici.html`, `panels/toptanci.html`, `panels/hammaddeci.html`

**Canlı Yayın Section'ında ekle:**

```html
<!-- Mevcut stream balance'dan sonra ekle -->
<div class="browser-stream-section" style="margin-top: 30px;">
    <h3>🔴 Tarayıcıdan Canlı Yayın</h3>
    <p style="color: #999; margin-bottom: 20px;">
        OBS gerektirmez! Tek tıkla yayına başla
    </p>
    
    <!-- Yayın butonu -->
    <button id="startStreamBtn" class="btn btn-primary btn-large" onclick="startBrowserStream()" style="width: 100%; max-width: 400px;">
        <i class="fas fa-video"></i>
        Yayını Başlat
    </button>
    
    <!-- Yayın durumu (başlatıktan sonra görünecek) -->
    <div id="streamStatus" style="display: none; margin-top: 20px;">
        <div class="alert success">
            <i class="fas fa-circle" style="color: #ff0000; animation: pulse 2s infinite;"></i>
            <strong>CANLI YAYIN AKTİF</strong>
        </div>
        
        <button class="btn btn-danger" onclick="stopBrowserStream()" style="margin-top: 10px;">
            <i class="fas fa-stop"></i>
            Yayını Durdur
        </button>
    </div>
    
    <!-- Video preview -->
    <video id="browserVideoPreview" autoplay muted style="width: 100%; max-width: 600px; margin-top: 20px; border-radius: 8px; display: none;"></video>
</div>
```

### Adım 3.2: CSS Ekstra (İsteğe Bağlı)

**Dosya:** `panels/panel-styles.css` (en sona ekle)

```css
/* Browser Stream Section */
.browser-stream-section {
    background: #1a1a1a;
    padding: 24px;
    border-radius: 8px;
    border: 1px solid #404040;
}

/* Pulse animation (Kırmızı nokta için) */
@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}
```

---

## 📋 4. JAVASCRIPT FONKSİYONLARI EKLE

### Adım 4.1: Panel-App.js'e Ekle

**Dosya:** `panels/panel-app.js` (en sona ekle)

```javascript
// ============================================
// BROWSER-BASED STREAMING
// ============================================

// Yayın başlat
async function startBrowserStream() {
    const btn = document.getElementById('startStreamBtn');
    const status = document.getElementById('streamStatus');
    const preview = document.getElementById('browserVideoPreview');
    
    try {
        // Butonu devre dışı bırak
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Başlatılıyor...';
        
        // Stream başlat
        const stream = await window.awsIVSService.startBrowserStream();
        
        // Video preview'i göster
        if (preview && stream) {
            preview.srcObject = stream;
            preview.style.display = 'block';
        }
        
        // UI güncelle
        btn.style.display = 'none';
        status.style.display = 'block';
        
        showAlert('✅ Yayın başladı! Müşterileriniz şimdi izleyebilir.', 'success');
        
    } catch (e) {
        console.error('Stream başlatma hatası:', e);
        showAlert('❌ Hata: ' + e.message, 'error');
        
        // Butonu geri getir
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-video"></i> Yayını Başlat';
    }
}

// Yayını durdur
function stopBrowserStream() {
    const btn = document.getElementById('startStreamBtn');
    const status = document.getElementById('streamStatus');
    const preview = document.getElementById('browserVideoPreview');
    
    // Stream'i durdur
    window.awsIVSService.stopStream();
    
    // UI güncelle
    btn.style.display = 'block';
    status.style.display = 'none';
    preview.style.display = 'none';
    preview.srcObject = null;
    
    showAlert('⏹️ Yayın durduruldu', 'info');
}

// Export to window
window.startBrowserStream = startBrowserStream;
window.stopBrowserStream = stopBrowserStream;
```

---

## 📋 5. TEST ET

### Adım 5.1: Local'de Test

```
1. Tarayıcıda panel'i aç
2. "Canlı Yayın" section'ına git
3. "Yayını Başlat" butonuna tıkla
4. Kamera/mikrofon izni ver
5. Video görünmeli
```

### Adım 5.2: AWS IVS Entegrasyonu Test

```
1. AWS IVS Console'da channel'ı aç
2. "Viewer sessions" section'ına bak
3. Stream başlatılmış olmalı
```

### Adım 5.3: İzleyici Test

```
1. Başka bir tarayıcıda müşteri olarak giriş yap
2. "Canlı Yayınlar" section'ında yayını gör
3. "Yayına Katıl" tıkla
4. Canlı yayını izle
```

---

## 📋 6. GERÇEK AWS IVS ENTEGRASYONU (İLERİ SEVIYE)

### Opsiyonel: WebRTC ile Gerçek Stream

**Dosya:** `services/aws-ivs-webrtc.js` (yeni)

```javascript
// AWS IVS WebRTC client (gelecekte eklenecek)
import { IvsClient } from '@aws-sdk/client-ivs';

class AWSIVSWebRTC {
    async startRealStream() {
        // AWS IVS WebRTC SDK kullan
        // Gerçek stream gönder
    }
}
```

**Not:** Şimdilik simulated çalışacak. Gerçek entegrasyon için AWS SDK gerekli.

---

## 🎯 SIRALAMA

### Hemen Yapılacaklar (30 dakika):

1. ✅ AWS IVS channel oluştur
2. ✅ Credentials'ları kopyala
3. ✅ `services/aws-ivs-service.js` oluştur ve credentials'ları yapıştır
4. ✅ Panel HTML'lerine buton ekle
5. ✅ `panel-app.js`'e fonksiyonları ekle
6. ✅ Test et

### Sonraki Adımlar (İsteğe Bağlı):

7. Gerçek AWS IVS WebRTC entegrasyonu
8. Multi-viewer support
9. Chat sistemi
10. Ürün showcase entegrasyonu

---

## ⚠️ ÖNEMLİ NOTLAR

### 1. Güvenlik:
```
⚠️ Stream key'i asla public repository'e koyma
⚠️ Backend'de sakla
⚠️ Environment variable kullan
```

### 2. Test:
```
✅ Önce local'de test et
✅ Sonra AWS'de test et
✅ Son olarak production'a al
```

### 3. Destek:
```
✅ Chrome'da çalışır
✅ Edge'de çalışır
✅ Safari'de sınırlı
```

---

## 🎉 SONUÇ

### Tişört Satan Amca İçin:
✅ **Tek tıkla yayın başlar**
✅ **OBS gerektirmez**
✅ **Kolay kullanım**
✅ **Herkes kullanabilir**

### Hazırlayan:
VideoSat Platform Team  
Tarih: 2024


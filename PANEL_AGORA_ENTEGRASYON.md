# 🎥 Panel Sistemi Agora.io Entegrasyonu

## ✅ Evet, Mümkün!

**Sistem panellerden canlı yayın açıp müşterilere izletmek için hazır!**

---

## 📋 Senaryo

### 1. **Satıcı/Üretici Paneli** (Yayıncı)
- ✅ Panel'den "Canlı Yayın" sekmesine git
- ✅ Ürün seç, slogan yaz
- ✅ "Yayını Başlat" butonuna tıkla
- ✅ Agora ile tarayıcıdan direkt yayın başlar
- ✅ Müşteriler izleyebilir

### 2. **Müşteri Paneli** (İzleyici)
- ✅ "Canlı Yayınlar" sekmesine git
- ✅ Takip ettiği satıcıların yayınlarını görür
- ✅ "Yayına Katıl" butonuna tıkla
- ✅ Agora ile gerçek zamanlı izler

---

## 🔧 Mevcut Durum

### ✅ Hazır Olanlar
1. **Panel Yapısı:**
   - `panels/satici.html` - Satıcı paneli
   - `panels/musteri.html` - Müşteri paneli
   - `panels/panel-app.js` - Panel JavaScript fonksiyonları

2. **Canlı Yayın Bölümü:**
   - Panel'de "Canlı Yayın" sekmesi var
   - `handleStreamSetup()` fonksiyonu mevcut
   - Ürün seçimi, slogan, başlık formu var

3. **İzleyici Bölümü:**
   - Müşteri panelinde "Canlı Yayınlar" sekmesi var
   - `loadCustomerLiveStreams()` fonksiyonu mevcut

### ⚠️ Eksik Olanlar
- ❌ Agora SDK entegrasyonu
- ❌ Agora client oluşturma
- ❌ Agora yayın başlatma kodu
- ❌ Agora izleme kodu

---

## 🚀 Entegrasyon Adımları

### Adım 1: Agora SDK'yı Panel Sayfalarına Ekle

**Her panel HTML dosyasına ekle:**
```html
<!-- panels/satici.html, panels/musteri.html, vb. -->
<script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.20.0.js"></script>
```

### Adım 2: Panel App.js'e Agora Fonksiyonları Ekle

**`panels/panel-app.js` dosyasına ekle:**

```javascript
// Agora Client ve Track'ler
let agoraClient = null;
let agoraTracks = [];
let isAgoraStreaming = false;

// Agora ile Yayın Başlat
async function startAgoraStream() {
    try {
        const userEmail = getCurrentUserEmail();
        const roomId = `room-${userEmail}-${Date.now()}`;
        
        // 1. Backend'den Agora bilgilerini al
        const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                streamerEmail: userEmail,
                streamerName: getCurrentUserName(),
                deviceInfo: navigator.userAgent
            })
        });
        
        const data = await response.json();
        
        if (!data.ok || data.provider !== 'AGORA') {
            throw new Error('Agora yayın başlatılamadı');
        }
        
        // 2. Agora client oluştur
        agoraClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
        
        // 3. Channel'a katıl
        await agoraClient.join(
            data.appId,
            data.channelName,
            data.webrtc.token,
            data.webrtc.uid
        );
        
        // 4. Kamera ve mikrofon al
        agoraTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
        
        // 5. Yayını başlat
        await agoraClient.publish(agoraTracks);
        
        // 6. Video göster (panel'de)
        const videoContainer = document.getElementById('localVideo');
        if (videoContainer) {
            agoraTracks[1].play('localVideo');
        }
        
        isAgoraStreaming = true;
        showAlert('✅ Canlı yayın başlatıldı!', 'success');
        
        // 7. Yayın bilgilerini kaydet (müşteriler için)
        saveLivestreamInfo({
            id: data.channelId,
            channelName: data.channelName,
            appId: data.appId,
            subscriberToken: data.subscriberToken,
            title: document.getElementById('streamTitle').value,
            products: getSelectedProducts(),
            status: 'live'
        });
        
    } catch (error) {
        console.error('Agora yayın hatası:', error);
        showAlert('Yayın başlatılamadı: ' + error.message, 'error');
    }
}

// Agora Yayını Durdur
async function stopAgoraStream() {
    if (agoraTracks.length > 0) {
        agoraTracks.forEach(track => {
            track.stop();
            track.close();
        });
        agoraTracks = [];
    }
    
    if (agoraClient) {
        await agoraClient.leave();
        agoraClient = null;
    }
    
    isAgoraStreaming = false;
    showAlert('Yayın durduruldu', 'info');
}

// Müşteri: Agora Yayınını İzle
async function watchAgoraStream(streamId, channelInfo) {
    try {
        // 1. Agora client oluştur (izleyici modu)
        const viewerClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
        
        // 2. Channel'a katıl (subscriber olarak)
        await viewerClient.join(
            channelInfo.appId,
            channelInfo.channelName,
            channelInfo.subscriberToken,
            null // Random UID
        );
        
        // 3. Yayıncı geldiğinde video göster
        viewerClient.on("user-published", async (user, mediaType) => {
            await viewerClient.subscribe(user, mediaType);
            
            if (mediaType === "video") {
                const videoContainer = document.getElementById(`stream-video-${streamId}`);
                if (videoContainer) {
                    user.videoTrack.play(`stream-video-${streamId}`);
                }
            }
            
            if (mediaType === "audio") {
                user.audioTrack.play();
            }
        });
        
        showAlert('Yayın izleniyor!', 'success');
        
    } catch (error) {
        console.error('İzleme hatası:', error);
        showAlert('Yayın izlenemedi: ' + error.message, 'error');
    }
}
```

### Adım 3: Mevcut handleStreamSetup Fonksiyonunu Güncelle

**`panel-app.js` içinde `handleStreamSetup` fonksiyonunu güncelle:**

```javascript
async function handleStreamSetup(e) {
    e.preventDefault();
    
    // Backend'den provider kontrolü
    const provider = await getStreamProvider(); // 'AGORA' veya 'AWS_IVS'
    
    if (provider === 'AGORA') {
        // Agora ile yayın başlat
        await startAgoraStream();
    } else {
        // AWS IVS ile yayın (mevcut kod)
        // ... existing AWS IVS code ...
    }
}
```

### Adım 4: Müşteri İzleme Fonksiyonunu Güncelle

**`loadCustomerLiveStreams` fonksiyonunu güncelle:**

```javascript
function loadCustomerLiveStreams() {
    // Takip edilen satıcıların yayınlarını al
    const streams = getFollowedLiveStreams();
    
    streams.forEach(stream => {
        if (stream.provider === 'AGORA') {
            // Agora yayını göster
            renderAgoraStreamCard(stream);
        } else {
            // AWS IVS yayını göster (mevcut kod)
            renderIVSStreamCard(stream);
        }
    });
}

function renderAgoraStreamCard(stream) {
    return `
        <div class="stream-card">
            <div class="stream-video" id="stream-video-${stream.id}"></div>
            <div class="stream-info">
                <h3>${stream.title}</h3>
                <p>${stream.companyName}</p>
                <button onclick="watchAgoraStream('${stream.id}', ${JSON.stringify(stream.channelInfo)})">
                    Yayına Katıl
                </button>
            </div>
        </div>
    `;
}
```

---

## 📝 Örnek Kullanım Senaryosu

### Senaryo: Satıcı Yayın Açıyor, Müşteri İzliyor

#### 1. Satıcı Paneli (satici.html)
```
1. "Canlı Yayın" sekmesine git
2. Ürün seç: "Ahşap Masa"
3. Slogan yaz: "Özel indirim! %50'ye varan kampanya!"
4. Başlık: "Ahşap Mobilya Kampanyası"
5. "Yayını Başlat" butonuna tıkla
6. ✅ Agora yayın başlar
7. Müşteriler görebilir
```

#### 2. Müşteri Paneli (musteri.html)
```
1. "Canlı Yayınlar" sekmesine git
2. Takip ettiği satıcının yayını görünür
3. "Yayına Katıl" butonuna tıkla
4. ✅ Gerçek zamanlı izler
5. Ürünleri görür, sipariş verebilir
```

---

## ✅ Sonuç

**Evet, tamamen mümkün!**

### Hazır Olanlar:
- ✅ Panel yapısı
- ✅ Canlı yayın formu
- ✅ İzleyici bölümü
- ✅ Backend API (Agora desteği var)

### Eklenecekler:
- ⏳ Agora SDK script tag'i (HTML'lere)
- ⏳ Agora yayın başlatma fonksiyonu
- ⏳ Agora izleme fonksiyonu
- ⏳ Provider kontrolü (Agora veya AWS IVS)

### Süre:
- **Entegrasyon:** ~30 dakika
- **Test:** ~15 dakika
- **Toplam:** ~45 dakika

---

## 🎯 Sonraki Adımlar

1. ✅ Agora SDK'yı panel HTML'lerine ekle
2. ✅ Panel app.js'e Agora fonksiyonlarını ekle
3. ✅ handleStreamSetup'ı güncelle
4. ✅ Müşteri izleme fonksiyonunu güncelle
5. ✅ Test et

**Sistem tamamen çalışır hale gelecek!** 🎉

---

**📅 Tarih:** 2025-11-05


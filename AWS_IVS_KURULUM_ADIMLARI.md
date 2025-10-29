# AWS IVS Kanal Oluşturma - Detaylı Rehber

## 📋 1. AWS Console'a Giriş

### Adım 1.1: AWS Console'u Aç
```
URL: https://console.aws.amazon.com/
Email/Şifre ile giriş yap
```

### Adım 1.2: Region Seç (Önemli!)
```
Üst sağdaki "Region" dropdown'a tıkla
"us-east-1" (N. Virginia) seç
→ AWS IVS bu region'da en uygun
```

---

## 📋 2. IVS Servisini Bul

### Adım 2.1: Servis Arama
```
Üst çubukta "Services" veya "Search" yerine "IVS" yaz
→ "Interactive Video Service" servisini seç
```

### Alternatif Yol:
```
Services → Media Services → Interactive Video Service
```

---

## 📋 3. Channel (Kanal) Oluştur

### Adım 3.1: Channels Sayfasını Aç
```
Sol menüden "Channels" seç
→ Sağ üstte "Create channel" butonuna tıkla
```

### Adım 3.2: Channel Bilgilerini Doldur

#### **Name** (Zorunlu):
```
videosat-live-1
→ Bu isim sadece AWS Console'da görünür
→ Kullanıcılar görmeyecek
```

#### **Type** (Opsiyonel):
```
Standard
→ Default değer
→ Değiştirmeyin
```

#### **Recording Configuration** (Opsiyonel):
```
Record to S3: NO
→ Canlı yayını kaydetmek istemiyorsanız
→ "NO" seçin (simulated)
```

#### **Tags** (Opsiyonel):
```
Boş bırakabilirsiniz
```

### Adım 3.3: Channel Oluştur
```
"Create channel" butonuna tıkla
→ Channel oluşturulacak (1-2 saniye)
```

---

## 📋 4. Credentials'ları Kopyala (EN ÖNEMLİ!)

### Adım 4.1: Channel Detaylarına Git
```
Channels listesinde oluşturduğunuz channel'a tıklayın
→ "Channel details" sayfası açılacak
```

### Adım 4.2: Streaming Key'i Kopyala

**Seçenek 1: Stream Key Kontrol (Mevcut):**
```
"Stream configuration" section'ında
"Incoming RTMPS endpoints" altında:
→ Server endpoint: rtmps://....
→ Stream key: sk_us-XXXXXX-...
→ "Show" butonuna tıkla, stream key'i kopyala
```

**Seçenek 2: Yeni Stream Key Oluştur:**
```
"Stream configuration" → "Stream keys"
→ "Create key" butonuna tıkla
→ Name: "videosat-key-1"
→ "Create key"
→ Stream key'i kopyala (bir daha gösterilmeyecek!)
```

### Adım 4.3: Playback URL'i Kopyala
```
"Stream configuration" section'ında
"Playback URLs" altında:
→ HLS URL: https://...m3u8
→ Bu URL'i kopyala (izleyiciler için)
```

---

## 📋 5. Credentials'ları Güvenli Yere Kaydet

### Örnek Format:

```yaml
AWS_IVS_CHANNEL_1:
  name: videosat-live-1
  channel_id: 1234567890abcdef
  
  # Streaming (Yayıncı için)
  ingest_endpoint: rtmps://abcd1234abcd1234.global-contribute.live-video.net:443/app/
  stream_key: sk_us-XXXXXX-XXXXXXXX-XXXXXXXX-XXXXXX-XXXXXXXX-XXXXXXXX
  
  # Playback (İzleyici için)
  playback_url: https://1234567890abc.us-east-1.playback.live-video.net/api/video/v1/us-east-1.1234567890.channel.AbcDeFgHijKl.stream.m3u8
  hls_url: https://1234567890abc.us-east-1.playback.live-video.net/api/video/v1/us-east-1.1234567890.channel.AbcDeFgHijKl.stream.m3u8
```

---

## ⚠️ ÖNEMLİ NOTLAR

### 1. Stream Key Güvenliği:
```
⚠️ Stream key'i KİMSEYLE paylaşmayın!
⚠️ Stream key'i public repository'e koyma!
⚠️ Stream key'i localStorage'a yazma!
✅ Backend'de saklayın
✅ Environment variable kullanın
```

### 2. Channel Silme:
```
Silinen channel geri getirilemez
Stream key değişir
Playback URL değişir
→ Önce test edin, sonra production kullanın
```

### 3. Channel Yeniden Oluşturma:
```
Channel silinirse:
1. Yeni channel oluştur
2. Yeni stream key al
3. Yeni playback URL al
4. Frontend'i güncelle
```

---

## 🎯 SONRAKI ADIMLAR

### 1. Credentials'ları Hazır Et:
```
✅ Stream key'iniz var mı?
✅ Playback URL'iniz var mı?
✅ Channel ID'niz var mı?
```

### 2. Frontend Entegrasyonu:
```
✅ services/aws-ivs-service.js (credentials ekleyin)
✅ live-stream.js (AWS IVS player ekleyin)
✅ live-stream.html (HLS player ekleyin)
```

### 3. Test:
```
✅ OBS Studio ile yayın başlat
✅ Tarayıcıdan izle
```

---

## 📱 OBS STUDIO İLE TEST

### Adım 1: OBS Studio Ayarları
```
1. OBS Studio'yu açın
2. Settings → Stream
3. Service: Custom
4. Server: [ingest_endpoint'inizi buraya yapıştırın]
5. Stream Key: [stream_key'inizi buraya yapıştırın]
6. OK
7. "Start Streaming" butonuna tıklayın
```

### Adım 2: Tarayıcıdan İzle
```
1. live-stream.html dosyasını açın
2. Playback URL'i yapıştırın
3. "Watch Stream" butonuna tıklayın
```

---

## 🔧 SORUN GİDERME

### Sorun 1: Stream Key Görünmüyor
```
Çözüm:
1. "Show" butonuna tıklayın
2. Stream key bir kez gösterilir
3. Hemen kopyalayın
```

### Sorun 2: Channel Silinmiş
```
Çözüm:
1. Yeni channel oluşturun
2. Yeni stream key alın
3. Frontend'i güncelleyin
```

### Sorun 3: Playback URL Çalışmıyor
```
Çözüm:
1. Stream aktif mi kontrol edin
2. Channel ID'yi kontrol edin
3. Region'u kontrol edin (us-east-1)
```

---

## 💰 MALIYET

### Free Tier:
```
✅ 750 saat/ay ücretsiz canlı yayın
✅ 5,000 GB ücretsiz veri transferi
```

### Sonrası:
```
⚠️ $0.035/saat
⚠️ $0.09/GB (1 TB sonrası)
```

---

**Hazırlayan:** VideoSat Platform Team  
**Tarih:** 2024  
**Durum:** ✅ AWS IVS kurulum adımları hazır


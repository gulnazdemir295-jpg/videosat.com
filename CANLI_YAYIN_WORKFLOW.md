# 🎬 Canlı Yayın İşlem Adımları ve Workflow

## 📋 Genel Bakış

Canlı yayın sistemi, yayın öncesi, yayın sırası ve yayın sonrası olmak üzere üç ana aşamadan oluşur. Her aşama farklı rollere göre farklı işlemler içerir.

---

## 🎯 Roller ve Yetkiler

### 1. Yayıncı (Streamer) - Hammaddeci/Toptancı
- ✅ Canlı yayın başlatabilir
- ✅ Ürün seçebilir ve gösterebilir
- ✅ Katılımcılara davet gönderebilir
- ✅ Yayını durdurabilir/sonlandırabilir
- ✅ Yayın istatistiklerini görebilir

### 2. İzleyici (Viewer) - Üretici/Toptancı/Müşteri
- ✅ Yayını izleyebilir
- ✅ Ürünleri beğenebilir
- ✅ Yayıncıyı takip edebilir
- ✅ Alışveriş yapabilir
- ✅ Yayından ayrılabilir ve tekrar girebilir

---

## 🔄 İşlem Adımları

### 📥 AŞAMA 1: YAYIN ÖNCESİ (Pre-Stream)

#### 1.1. Yayıncı Paneli - Süre Paketi Satın Alma
**Konum:** `panels/hammaddeci.html#live-stream` (veya diğer panel sayfaları)

**Adımlar:**
1. Kullanıcı panelinde "Canlı Yayın" bölümüne gider
2. Bakiye kontrolü yapılır
3. Eğer bakiye yoksa:
   - "Süre Paketi Satın Al" butonu görünür
   - Ödeme modalı açılır
   - Test için "Bu Adımı Atla" butonu seçilebilir
4. Bakiye varsa veya test modu seçilirse → Yayın sayfasına yönlendirilir

**Kod Yeri:**
- `panels/panel-app.js` → `showBuyStreamTimeModal()`
- `panels/panel-app.js` → `skipPurchase()`
- `live-stream.html` → Pre-stream setup bölümü

#### 1.2. Davet Gönderme
**Konum:** `panels/hammaddeci.html` → Üreticiler bölümü

**Adımlar:**
1. Üretici listesinden bir üretici seçilir
2. "Davet Et" butonuna tıklanır
3. Onay modalı görüntülenir
4. "Davet Gönder" butonuna tıklanır
5. Davet localStorage'a kaydedilir
6. (Opsiyonel) Canlı yayın sayfasına yönlendirilir

**Kod Yeri:**
- `panels/panel-app.js` → `inviteToLiveStream(producerId)`
- `panels/panel-app.js` → `sendInviteToProducer(producerId)`

#### 1.3. Davet Alma ve Kabul
**Konum:** `panels/uretici.html` (veya diğer panel sayfaları)

**Adımlar:**
1. Panel yüklendiğinde `checkIncomingInvitations()` çalışır
2. Bekleyen davetler kontrol edilir
3. Eğer davet varsa → Modal görüntülenir
4. Kullanıcı "Kabul Et" veya "Reddet" seçer
5. Kabul edilirse → Canlı yayın sayfasına yönlendirilir

**Kod Yeri:**
- `panels/panel-app.js` → `checkIncomingInvitations()`
- `panels/panel-app.js` → `showInvitationAlert(invitation)`
- `panels/panel-app.js` → `acceptInvitationAlert(invitationId)`
- `panels/panel-app.js` → `declineInvitationAlert(invitationId)`

**Otomatik Kontrol:**
- Her 5 saniyede bir davetler kontrol edilir (`setupInvitationAutoCheck()`)

---

### 🎥 AŞAMA 2: YAYIN SIRASI (During Stream)

#### 2.1. Yayın Başlatma
**Konum:** `live-stream.html`

**Yayıncı için:**
1. Kamera/mikrofon izinleri istenir
2. `localVideo` sağ alt köşede görünür (küçük)
3. `remoteVideo` ana ekranda görünür (büyük)
4. Yayın timer'ı başlar
5. Bakiye düşürülmeye başlar

**İzleyici için:**
1. Yayıncıdan gelen görüntü `remoteVideo`'da gösterilir
2. Kendi görüntüsü `localVideo`'da gösterilir (sağ alt)
3. İnteraksiyon butonları aktif olur

**Kod Yeri:**
- `live-stream.js` → `startStream()`
- `live-stream.js` → `checkInvitationContext()`

#### 2.2. Ürün Seçimi ve Gösterimi
**Yayıncı için:**
- Ürün listesinden ürün seçilir
- Seçilen ürün vurgulanır
- İzleyicilere bildirim gönderilir

**Kod Yeri:**
- `live-stream.js` → `selectProduct(productId)`

#### 2.3. İzleyici İnteraksiyonları

**Beğenme (Like):**
- İzleyici "Beğen" butonuna tıklar
- Beğeni sayısı artar
- Yayıncıya bildirim gönderilir

**Kod Yeri:**
- `live-stream.js` → `toggleLike()`

**Takip Etme (Follow):**
- İzleyici "Takip Et" butonuna tıklar
- Takip durumu güncellenir
- Yayıncıya bildirim gönderilir

**Kod Yeri:**
- `live-stream.js` → `toggleFollow()`

**Alışveriş Yapma:**
- İzleyici "Alışveriş" butonuna tıklar
- Seçilen ürünler siparişe eklenir
- Sipariş sistemi ile entegre edilir

**Kod Yeri:**
- `live-stream.js` → `openShopping()`

#### 2.4. Yayından Ayrılma
**Adımlar:**
1. Kullanıcı yayından ayrılmak ister
2. Onay istenir
3. Kamera/mikrofon kapatılır
4. Viewer listesinden çıkarılır
5. Ana sayfaya veya panele yönlendirilir

**Kod Yeri:**
- `live-stream.js` → `leaveStream()` (henüz tam entegre değil)

#### 2.5. Yayına Tekrar Girme
**Adımlar:**
1. Aktif yayın ID'si kontrol edilir
2. Yayın hala aktifse → Tekrar katılma seçeneği sunulur
3. Yayın sayfasına yönlendirilir

**Kod Yeri:**
- `live-stream.js` → `rejoinStream()`

---

### 📊 AŞAMA 3: YAYIN SONRASI (Post-Stream)

#### 3.1. Yayın Sonlandırma
**Adımlar:**
1. Yayıncı "Yayını Sonlandır" butonuna tıklar
2. Onay istenir
3. Yayın durdurulur
4. Süre hesaplanır
5. Bakiye güncellenir
6. İstatistikler kaydedilir
7. Post-stream özet ekranı gösterilir

**Kod Yeri:**
- `live-stream.js` → `endStream()`
- `live-stream.js` → `showPostStreamSummary(streamData)`

#### 3.2. Yayın Özeti
**Gösterilen Bilgiler:**
- Toplam yayın süresi
- Katılımcı sayısı
- Beğeni sayısı
- Yapılan siparişler

**Kod Yeri:**
- `live-stream.html` → Post-stream summary bölümü
- `live-stream.js` → `showPostStreamSummary(streamData)`

#### 3.3. Sonraki Adımlar
**Seçenekler:**
1. "Yeni Yayın Başlat" → Yayın öncesi ekranına dön
2. "Panele Dön" → Panel sayfasına geri dön

**Kod Yeri:**
- `live-stream.js` → `startNewStream()`
- `live-stream.js` → `goToDashboard()`

---

## 🔧 Teknik Detaylar

### LocalStorage Yapısı

**Davetler:**
```javascript
localStorage.getItem('liveStreamInvitations')
// Array of: { id, from, fromName, to, toName, status, timestamp, ... }
```

**Aktif Yayın:**
```javascript
localStorage.getItem('activeLivestream')
// { id, status, startedAt, isStreamer, selectedProducts }
```

**Yayın Geçmişi:**
```javascript
localStorage.getItem('livestreamHistory')
// Array of stream data
```

**Bakiye:**
```javascript
localStorage.getItem('livestreamBalance')
// Number (minutes)
```

### URL Parametreleri

- `?from=streamer` - Yayıncı modunda açılır
- `?invitation=123` - Davet ile katılım
- `?stream=STREAM-123` - Aktif yayına tekrar katılım

### WebSocket Events

**Gönderilen:**
- `stream_started` - Yayın başladı
- `stream_ended` - Yayın sonlandı
- `viewer_left` - İzleyici ayrıldı
- `like` - Beğeni
- `follow` - Takip
- `product_update` - Ürün güncelleme

**Alınan:**
- `new_viewer` - Yeni izleyici
- `message` - Mesaj
- `product_update` - Ürün güncelleme
- `like` - Beğeni bildirimi
- `follow` - Takip bildirimi

---

## 🎨 UI/UX Özellikleri

### Video Görüntü Düzeni

**Ana Ekran:**
- `#remoteVideo` - Tam ekran (16:9 aspect ratio)
- Arka plan: `#000000` (siyah)

**Küçük Görüntü:**
- `#localVideo` - Sağ alt köşe
- Boyut: 200x150px
- Border: 3px solid #dc2626 (kırmızı)

### Renk Teması
- Arka Plan: `#000000` (siyah)
- Kartlar: `#1a1a1a` (koyu gri)
- Vurgu: `#dc2626` (kırmızı)
- Metin: `#ffffff` (beyaz)

---

## 🐛 Sorun Giderme

### Yayın Açılmıyor
1. Bakiye kontrolü yapın
2. Kamera/mikrofon izinlerini kontrol edin
3. HTTPS bağlantısını kontrol edin
4. WebRTC desteğini kontrol edin

### Davet Gelmiyor
1. localStorage paylaşımını kontrol edin
2. Email eşleşmesini kontrol edin
3. Otomatik kontrol interval'ini kontrol edin (5 saniye)

### Görüntü Görünmüyor
1. Tarayıcı izinlerini kontrol edin
2. WebRTC desteğini kontrol edin
3. Video element'lerini kontrol edin

---

## 📝 Notlar

### Test Modu
- `skipPaymentStep()` fonksiyonu test için 2 saat bakiye ekler
- Gerçek ödeme yapılmadan test edilebilir

### Production İçin Gerekenler
- [ ] WebSocket Signaling Server
- [ ] STUN/TURN Server (gerçek WebRTC için)
- [ ] Gerçek peer-to-peer bağlantı
- [ ] Session management
- [ ] User presence system
- [ ] Database entegrasyonu
- [ ] Ödeme gateway entegrasyonu

---

**Son Güncelleme:** 2024
**Geliştirici:** VideoSat Platform Team


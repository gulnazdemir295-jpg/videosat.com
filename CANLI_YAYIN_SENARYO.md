# 🎬 VideoSat - Canlı Yayın Test Senaryosu

## ✅ Sistem Müsait - Tam Hazır!

### 📋 Test Senaryosu

**Hammaddeci (Mac)** → Üretici ara → Davet gönder → Canlı yayın başlat  
**Üretici (Telefon)** → Davet al → Kabul et → Yayına katıl

---

## 🎯 Adım Adım Test

### 1️⃣ Hammaddeci Mac'te Giriş Yap

```
http://localhost:8000/index.html

Email: hammaddeci@videosat.com
Şifre: test123
```

### 2️⃣ Üretici Ara ve Davet Et

**Hammaddeci Panelinde:**
1. "Üretici Ara" butonuna tıkla
2. Arama kutusuna **"Test"** yaz
3. **"Test Üretici Firması"** görünecek
4. **"Davet Et"** butonuna tıkla
5. Onay modal'ında **"Davet Gönder"** tıkla
6. "Canlı yayına geçmek ister misiniz?" sorusuna **"Evet"** de

### 3️⃣ Üretici Telefon'da Bekle

**Üretici Panelinde oturum açmış durumda bekleyin:**
- Panel açık olsun
- Davet mesajı otomatik görünecek

### 4️⃣ Davet Geldi - Üretici Kabul Et

**Telefon'da:**
1. Onay kutusunda **"Tamam"** tıkla
2. Otomatik canlı yayın sayfasına yönlendirilir
3. **"Yayını Başlat"** tıkla
4. Kamera/Mikrofon iznini ver

### 5️⃣ İki Tarafta da Yayın Başlatıldı

**Mac (Hammaddeci):**
- Kameran açılır ✅
- Mikrofonun aktif ✅
- Süre sayacı başlar ✅
- Ürün seçimi yapılabilir ✅
- "Siz (Yayıncı)" görünüyor ✅

**Telefon (Üretici):**
- Kameran açılır ✅
- Mikrofonun aktif ✅
- Yayına katılırsın ✅
- Ürünleri görebilirsin ✅
- "Katılımcı" olarak görünüyorsun ✅

---

## 🌐 Test Linkleri

### Mac:
- Ana Sayfa: `http://localhost:8000/index.html`
- Canlı Yayın: `http://localhost:8000/live-stream.html`

### Telefon (Aynı WiFi):
- Ana Sayfa: `http://192.168.1.170:8000/index.html`
- Canlı Yayın: `http://192.168.1.170:8000/live-stream.html`

---

## 👥 Test Hesapları

**Hammaddeci:**
```
Email: hammaddeci@videosat.com
Şifre: test123
```

**Üretici:**
```
Email: uretici@videosat.com
Şifre: test123
```

---

## 🔍 Bulunması Gereken Üretici

**Üreticiler Listesinde:**
- **İsim:** Test Üretici Firması
- **E-posta:** uretici@videosat.com
- **Şehir:** İstanbul
- **Sektör:** Metal

---

## ⚙️ Nasıl Çalışıyor?

### Davet Sistemi (LocalStorage):

1. **Davet Gönder:**
   - Hammaddeci üretici seçer
   - "Davet Et" butonuna basar
   - Davet localStorage'a kaydedilir

2. **Davet Al:**
   - Üretici paneli yüklenir
   - `checkIncomingInvitations()` çalışır
   - Bekleyen davetler varsa gösterir

3. **Davet Kabul:**
   - Üretici kabul eder
   - Durum "accepted" olur
   - Canlı yayın sayfasına yönlendirilir

4. **Canlı Yayın:**
   - Her iki tarafta da "Yayını Başlat" tıklanır
   - WebRTC ile kamera/mikrofon açılır
   - Video akışı başlar (simüle)

---

## ✅ Beklenen Sonuçlar

- [x] Üretici arama çalışıyor
- [x] Davet gönderme çalışıyor
- [x] Davet alma çalışıyor
- [x] Davet kabul etme çalışıyor
- [x] Canlı yayın sayfası açılıyor
- [x] Kamera erişimi sağlanıyor
- [x] Mikrofon erişimi sağlanıyor
- [x] Süre sayacı çalışıyor

---

## 🐛 Sorun Giderme

**Problem:** Davet gelmiyor
- Çözüm: Her iki cihazda da localStorage paylaşılıyor mu kontrol et
- Gerçek sistemde WebSocket server gerekir

**Problem:** Kamera açılmıyor
- Çözüm: Tarayıcı ayarlarından izin ver
- HTTPS olması gerekebilir (production'da)

**Problem:** Davet sayfasında görünmüyor
- Çözüm: Panel yeniden yüklenirken davet kontrol edilir

---

## 📝 Notlar

### Şu Anki Sistem (Test):
- ✅ LocalStorage ile davet sistemi
- ✅ LocalStorage ile veri paylaşımı
- ✅ Basit WebRTC simulasyonu
- ⚠️ Gerçek peer-to-peer bağlantı yok

### Production İçin Gerekenler:
- [ ] WebSocket Signaling Server
- [ ] STUN/TURN Server
- [ ] Gerçek WebRTC peer connection
- [ ] Session management
- [ ] User presence system

---

**2024 - Gül Naz Demir - VideoSat Platform**
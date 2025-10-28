# 🎬 VideoSat - Canlı Yayın Test Hesapları

## 👤 Hammaddeci Hesabı (Mac'ten)

**Email:** `hammaddeci@videosat.com`  
**Şifre:** `test123` veya herhangi bir şifre (tüm alanlar dolu olsun)

## 🏭 Üretici Hesabı (Telefon)

**Email:** `uretici@videosat.com`  
**Şifre:** `test123` veya herhangi bir şifre (tüm alanlar dolu olsun)

---

## 📋 Test Adımları

### 1️⃣ Mac'ten Hammaddeci Girişi:
```
- Ana sayfaya git: http://192.168.1.170:8000/index.html
- "Giriş Yap" butonuna tıkla
- Email: hammaddeci@videosat.com
- Şifre: test123
- Giriş yap
```

### 2️⃣ Telefon'dan Üretici Girişi:
```
- Aynı ağda olarak: http://192.168.1.170:8000/index.html
- VEYA farklı cihazdan (test için): 
  - hammadde123@test.com veya uretici123@test.com
```

### 3️⃣ Canlı Yayın Başlatma:

**Mac'te (Hammaddeci):**
1. Panelden "Canlı Yayın Başlat" butonuna tıkla
2. Kamera/mikrofon izinlerini ver
3. "Yayını Başlat" butonuna tıkla

**Telefon'da (Üretici):**
1. Aynı sayfaya git: http://192.168.1.170:8000/live-stream.html
2. Kamera/mikrofon izinlerini ver
3. "Yayını Başlat" butonuna tıkla

### 4️⃣ Test Senaryosu:

**Hammaddeci Olarak:**
- Ürünlerinizi seçin
- Kamera ve mikrofonunuzu başlatın
- Üreticilere canlı sunum yapın

**Üretici Olarak:**
- Hammaddeci yayınına katılın
- Ürünleri inceleyin
- Sipariş verebilirsiniz

---

## 🌐 Alternatif Test Hesapları

### Hammaddeci Hesapları:
```
hammaddeci@videosat.com
test-hammaddeci@test.com
hammadde123@test.com
raw_material@test.com
```

### Üretici Hesapları:
```
uretici@videosat.com
test-uretici@test.com
uretici123@test.com
manufacturer@test.com
```

---

## 📱 Port ve Link Bilgileri

### Yerel Sunucu:
```
Ana Site: http://localhost:8000/index.html
Canlı Yayın: http://localhost:8000/live-stream.html
POS Test: http://localhost:8000/pos-test.html
Workflow: http://localhost:8000/workflow-documentation.html
```

### Yerel Ağ (Diğer Cihazlardan):
```
Ana Site: http://192.168.1.170:8000/index.html
Canlı Yayın: http://192.168.1.170:8000/live-stream.html
POS Test: http://192.168.1.170:8000/pos-test.html
```

---

## ⚠️ Önemli Notlar

1. **Aynı Ağda Olun:** Canlı yayın testi için her iki cihazın da aynı Wi-Fi ağında olması gerekir

2. **Tarayıcı İzinleri:** İlk kullanımda kamera ve mikrofon erişimi için izin vermeniz gerekecek

3. **Sunucu Çalıştır:** Sunucu çalışmıyorsa:
   ```bash
   python3 -m http.server 8000
   ```

4. **HTTPS Gerekli:** Gerçek WebRTC bağlantısı için HTTPS gereklidir. Şu anda LocalStorage kullanılıyor

5. **Test Ürünleri:** 4 adet test ürünü otomatik yüklenir:
   - Tuğla Premium (850 ₺)
   - Çimento 50kg (450 ₺)
   - Kum 1 Ton (650 ₺)
   - Demir 12mm (5.200 ₺)

---

## 🎯 Beklenen Sonuçlar

✅ **Mac'te (Hammaddeci):**
- Kamera ve mikrofon açılır
- Canlı yayın süresi sayacı başlar
- Seçilen ürünler görünür
- Katılımcı listesinde "Siz" görünür

✅ **Telefon'da (Üretici):**
- Kamera ve mikrofon açılır
- Yayına katılabilir
- Ürünleri görebilir
- Katılımcı listesinde görünür

---

## 🐛 Sorun Giderme

**Problem:** Kamera açılmıyor
- **Çözüm:** Tarayıcı ayarlarından kamera izni verin

**Problem:** Farklı cihazdan bağlanamıyorum
- **Çözüm:** Aynı Wi-Fi ağında olduğunuzdan emin olun

**Problem:** Yayın görünmüyor
- **Çözüm:** Her iki cihazda da "Yayını Başlat" butonuna tıklayın

---

## 📞 Geliştirici Notları

- Test ortamı için gerçek WebRTC bağlantısı simüle edilmiştir
- LocalStorage kullanarak veri saklanır
- Gerçek peer-to-peer bağlantı için signaling server gerekir
- HTTPS sertifikası ile production'a alınabilir

---

**2024 - Gül Naz Demir - VideoSat Platform**
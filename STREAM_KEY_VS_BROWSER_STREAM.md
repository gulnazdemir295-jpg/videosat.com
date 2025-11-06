# 📺 Stream Key vs Tarayıcıdan Yayın - Açıklama

## 🎯 İKİ FARKLI YAYIN YÖNTEMİ

Test sayfasında **2 farklı buton** var:

---

## 1️⃣ "Room'a Katıl (OBS/Stream Key için)"

**Ne yapar?**
- Room'a katılır ve **stream key** alır
- Channel oluşturur
- **Stream key** ve **ingest server** bilgilerini gösterir

**Ne için kullanılır?**
- **OBS Studio** ile yayın için
- **Streamlabs** ile yayın için
- **XSplit** ile yayın için
- **Herhangi bir RTMP streaming yazılımı** için

**Nasıl çalışır?**
1. Butona tıkla
2. Stream key al
3. OBS Studio'yu aç
4. Stream key'i OBS'e gir
5. OBS'den yayına başla

---

## 2️⃣ "Tarayıcıdan Yayın Başlat"

**Ne yapar?**
- Browser'dan direkt yayın başlatır
- AWS IVS Broadcast SDK kullanır
- Kamera/mikrofon erişimi ister
- **OBS gerekmez!**

**Ne için kullanılır?**
- Hızlı test için
- OBS kurulumu yoksa
- Mobil cihazlardan yayın için
- WebRTC destekli yayın için

**Nasıl çalışır?**
1. Butona tıkla
2. Kamera/mikrofon izni ver
3. Yayın otomatik başlar
4. Tarayıcıdan direkt yayın yaparsın

---

## 🔍 FARKLAR

| Özellik | Stream Key (OBS) | Tarayıcıdan Yayın |
|---------|------------------|-------------------|
| **Yazılım** | OBS Studio gerekli | Tarayıcı yeterli |
| **Kurulum** | OBS kurulumu gerekli | Kurulum yok |
| **Kontrol** | OBS'den tam kontrol | Tarayıcı kontrolü |
| **Kalite** | Yüksek (ayarlanabilir) | Tarayıcı limitleri |
| **Kullanım** | Profesyonel | Hızlı test |

---

## ✅ HANGİSİNİ SEÇMELİSİN?

### Stream Key (OBS) Seç Eğer:
- ✅ Profesyonel yayın yapacaksan
- ✅ OBS Studio kuruluysa
- ✅ Ses/görüntü efektleri kullanacaksan
- ✅ Çoklu kaynak kullanacaksan

### Tarayıcıdan Yayın Seç Eğer:
- ✅ Hızlı test yapacaksan
- ✅ OBS kurmak istemiyorsan
- ✅ Mobil cihazdan yayın yapacaksan
- ✅ Basit yayın yeterliyse

---

## 🧪 TEST ÖNERİSİ

**İlk test için:**
1. "Room'a Katıl" butonuna tıkla
2. Stream key'i al (Console'da görünecek)
3. Channel oluştu mu kontrol et
4. "Aktif Kanallar" listesinde görünmeli

**Yayın için:**
- OBS varsa → Stream key'i kullan
- OBS yoksa → "Tarayıcıdan Yayın Başlat" butonunu kullan

---

## 💡 NOT

**Her iki yöntem de aynı channel'ı kullanır!**
- Stream key ile başlattığın yayın
- Tarayıcıdan başlattığın yayın
→ Aynı playback URL'den izlenebilir!

---

**Hangi yöntemi kullanmak istersin?** 📺





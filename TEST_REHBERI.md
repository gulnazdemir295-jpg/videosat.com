# 🧪 VideoSat Platform - Test Rehberi

## 📅 Oluşturulma Tarihi: 2024
## 👤 Test Uzmanı: VideoSat Platform Team

---

## 🎯 TEST SENARYOSU: Canlı Yayın ve İzleyici

### Senaryo: Tek Kullanıcı - Yayıncı ve İzleyici Olarak Test

Bu rehber, tek bir kişinin yayıncı ve izleyici olarak platformu test etmesini sağlar.

---

## 📋 ADIM ADIM TEST SÜRECİ

### 1️⃣ YAYINCI OLARAK GİRİŞ

#### Adım 1: Hammaddeci/Üretici/Toptancı/Satıcı Paneline Giriş

1. **index.html** sayfasını açın
2. **Giriş Yap** butonuna tıklayın
3. Test kullanıcılarından birini kullanın:

**Test Kullanıcısı (Hammaddeci):**
- Email: `hammaddeci@test.com`
- Şifre: `test123`

**Test Kullanıcısı (Üretici):**
- Email: `uretici@test.com`
- Şifre: `test123`

**Test Kullanıcısı (Satıcı):**
- Email: `satici@test.com`
- Şifre: `test123`

4. Giriş yaptığınızda ilgili panel açılır.

---

#### Adım 2: Canlı Yayın Başlatma

1. Panelde **"Canlı Yayın"** bölümüne gidin
2. **"Canlı Yayın"** linkine tıklayın
3. Yayını başlatmak için:
   - **"Süre Satın Al"** butonuna tıklayın (veya **"Bu Adımı Atla"**)
   - **"Yayını Başlat"** butonuna tıklayın
4. Kamera erişimini izin verin
5. Yayın başladığında:
   - Sağ üstte **"CANLI"** badge'i görünür
   - Video bölümünde kendi görüntünüz görünür
   - Yayın URL'ini not edin (örnek: `live-stream.html?id=12345`)

---

### 2️⃣ İZLEYİCİ OLARAK GİRİŞ

#### Yöntem 1: Müşteri Paneli Üzerinden İzleme

1. **Yeni bir browser sekmesi veya tarayıcı açın** (veya incognito modda)
2. **index.html** sayfasını açın
3. **Müşteri** olarak giriş yapın:
   - Email: `musteri@test.com`
   - Şifre: `test123`
4. Panelde **"Canlı Yayınlar"** bölümüne gidin
5. Eğer yayın varsa:
   - Aktif yayınlar listelenir
   - **"Yayına Katıl"** butonuna tıklayın
6. Yayın sayfasında:
   - Sağ üstte yayıncının görüntüsü görünür
   - Chat bölümünde mesaj yazabilirsiniz
   - **"Beğen"**, **"Takip Et"** butonları çalışır

---

#### Yöntem 2: Direkt URL ile İzleme

1. **Farklı bir browser/sekme açın**
2. Adres barına yayın URL'ini yazın: `live-stream.html?id=STREAM_ID`
3. Yayın açılır ve izleyici olarak bağlanırsınız

---

#### Yöntem 3: Aynı Tarayıcıda Test (Geçici Çözüm)

**Şu anda:** Yayın başlatan tarayıcıda izleyici modu yeterince çalışmıyor.

**Test için:**
1. **Yayını başlattıktan sonra** aynı sayfada kalın
2. Yayın başarıyla başladıysa **kendi görüntünüzü görürsünüz**
3. Bu yayını başka bir tarayıcı/sekmede test edebilirsiniz

---

## 🔧 ÖZEL TEST KURULUMU

### Test Kullanıcı Oluşturma

Eğer test kullanıcıları yoksa:

1. **index.html** sayfasında **"Kayıt Ol"** butonuna tıklayın
2. Aşağıdaki bilgileri girin:

**Yayıncı Kullanıcısı:**
- Rol: Hammaddeci / Üretici / Toptancı / Satıcı
- Firma Adı: Test Firması
- Email: test@test.com
- Şifre: test123

**İzleyici Kullanıcısı:**
- Rol: Müşteri
- Firma Adı: Test Müşteri
- Email: test2@test.com
- Şifre: test123

---

## 📊 BEKLENTİLER

### Yayıncı Görecek:
- ✅ Kendi kamera görüntüsü
- ✅ "CANLI" badge'i
- ✅ İzleyici sayısı
- ✅ Chat mesajları
- ✅ Ürün listesi
- ✅ Beğeni/Takip sayıları

### İzleyici Görecek:
- ✅ Yayıncının görüntüsü
- ✅ Yayın başlığı
- ✅ Ürün listesi
- ✅ Chat bölümü
- ✅ Beğen/Takip butonları
- ✅ Sepete ekleme butonları

---

## ⚠️ BİLİNEN SORUNLAR VE ÇÖZÜMLER

### Sorun 1: "Aktif yayın bulunamıyor" Mesajı
**Neden:** Müşteri panelinde yayın listelenmiyor  
**Çözüm:** 
1. Yayını başlatan kullanıcının localStorage'da "activeLivestream" olması gerekir
2. Follow sisteminin çalışması gerekir (satıcı-müşteri takip)

**Geçici Çözüm:**
- Direkt URL ile yayına gidin: `live-stream.html?id=test123`

---

### Sorun 2: Aynı Tarayıcıda Hem Yayıncı Hem İzleyici
**Neden:** Browser security - aynı session'da hem kamera kullanımı hem viewer modu çakışıyor  
**Çözüm:** 
- Farklı tarayıcı kullanın (Chrome + Firefox)
- Farklı sekme (veya incognito mod)

---

### Sorun 3: Kamera Erişimi İzin Vermiyor
**Neden:** Browser security policy  
**Çözüm:**
1. Tarayıcı ayarlarından kamera/mikrofon izni verin
2. HTTPS kullanın (http://localhost yerine http://localhost:8000 gibi port kullanın)
3. veya Chrome'da --allow-file-access-from-files flag ile açın

---

## 🎯 TEST CHECKLIST

### Yayıncı Testi
- [ ] Canlı yayın başlatma başarılı
- [ ] Kamera görüntüsü görünüyor
- [ ] CANLI badge'i görünüyor
- [ ] İzleyici sayısı artıyor
- [ ] Chat mesajları alınıyor
- [ ] Beğeni/Takip işlemleri çalışıyor
- [ ] Yayını durdurma başarılı

### İzleyici Testi
- [ ] Yayına katılım başarılı
- [ ] Yayıncının görüntüsü görünüyor
- [ ] Chat mesajı gönderebiliyor
- [ ] Beğen/Takip işlemleri çalışıyor
- [ ] Ürün seçip sepete ekleyebiliyor
- [ ] "Yayından Ayrıl" butonu çalışıyor

---

## 💡 HIZLI TEST İPUÇLARI

### 1. İki Ayrı Tarayıcı
- **Chrome**: Yayıncı olarak giriş
- **Firefox**: İzleyici olarak giriş

### 2. İki Ayrı Sekme + Incognito
- **Normal sekme**: Yayıncı
- **Incognito sekme**: İzleyici

### 3. Setup Script
```bash
# Test kullanıcıları otomatik oluştur
# (Eğer setup-test-users.js varsa)
```

---

## 🔄 HIZLI TEST SÜRECİ

### 5 Dakikada Test

1. **Tarayıcı 1:** Hammaddeci giriş → Canlı yayın başlat
2. **Tarayıcı 2:** Müşteri giriş → Canlı yayına katıl
3. **Kontrol:** İzleyici yayıncıyı görüyor mu?

---

## 📞 YARDIM

### Testte Sorun mu Yaşıyorsunuz?

1. **Console'u kontrol edin** (F12)
2. **Hata mesajlarını not edin**
3. **Screenshots alın**
4. **Test senaryosunu dokümente edin**

---

**Son Güncelleme:** 2024  
**Versiyon:** 1.0  
**Test Uzmanı:** VideoSat Platform Team


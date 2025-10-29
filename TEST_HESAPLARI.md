# 🔐 VideoSat Test Hesapları

## 📋 Test Hesapları - Giriş Bilgileri

### 1️⃣ HAMMADDECİ
```
📧 E-posta: hammaddeci@videosat.com
🔑 Şifre: test123
```

### 2️⃣ ÜRETİCİ
```
📧 E-posta: uretici@videosat.com
🔑 Şifre: test123
```

### 3️⃣ TOPTANCI
```
📧 E-posta: toptanci@videosat.com
🔑 Şifre: test123
```

---

## 🚀 Giriş Adımları

1. Ana sayfaya gidin: `index.html`
2. Sağ üstteki **"Giriş Yap"** butonuna tıklayın
3. E-posta ve şifreyi girin
4. **"Giriş Yap"** butonuna tıklayın
5. Otomatik olarak ilgili panele yönlendirileceksiniz

---

## 📍 Panel Yönlendirmeleri

### Hammaddeci Paneli
- **URL:** `panels/hammaddeci.html`
- **Özellikler:**
  - Üreticilerle iletişim
  - Ürün yönetimi
  - Canlı yayın başlatma
  - Sipariş takibi

### Üretici Paneli
- **URL:** `panels/uretici.html`
- **Özellikler:**
  - Hammadeci ve toptancı iletişimi
  - Ürün yönetimi
  - Sipariş yönetimi
  - Canlı yayın katılımı

### Toptancı Paneli
- **URL:** `panels/toptanci.html`
- **Özellikler:**
  - Üretici ve satıcı iletişimi
  - Ürün yönetimi
  - Sipariş yönetimi
  - POS satışları

---

## ⚠️ Önemli Notlar

1. **İlk Kayıt:** Eğer bu hesaplar ile giriş yapamazsanız, sistem otomatik olarak kayıt işlemi yapacaktır.

2. **Şifre Değiştirme:** Şu anda şifre değiştirme özelliği yok, ancak "Kayıt Ol" ile yeni hesaplar oluşturabilirsiniz.

3. **Test Verileri:** Her hesapta otomatik olarak test verileri yüklenir (ürünler, siparişler vb.).

4. **Tarayıcı Önbelleği:** Bazen localStorage temizlemeniz gerekebilir:
   ```javascript
   // Tarayıcı konsolunda çalıştırın:
   localStorage.clear();
   ```

---

## 🔄 Hesap Oluşturma (Alternatif)

Eğer yukarıdaki hesaplar çalışmazsa, "Kayıt Ol" butonundan yeni hesap oluşturabilirsiniz:

1. Ana sayfada **"Kayıt Ol"** butonuna tıklayın
2. Rolünüzü seçin (Hammaddeci/Üretici/Toptancı)
3. Firma adı, e-posta, telefon ve şifre bilgilerini girin
4. Kayıt olun ve otomatik olarak panele yönlendirileceksiniz

---

## 🎯 Test Senaryosu

### Senaryo 1: Hammaddeci → Üretici → Toptancı
1. **Hammaddeci** olarak giriş yap
2. Ürün ekle/yönet
3. **Üretici** olarak giriş yap (farklı tarayıcı/sekme)
4. Hammadeciden ürün görüntüle/sipariş ver
5. **Toptancı** olarak giriş yap
6. Üreticilerden ürün görüntüle/sipariş ver

### Senaryo 2: Canlı Yayın Testi
1. **Hammaddeci** olarak giriş yap
2. "Canlı Yayın Başlat" butonuna tıkla
3. Ürünleri seç ve yayını başlat
4. **Üretici** olarak (farklı cihaz/sekme) yayına katıl
5. Ürünleri incele ve sipariş ver

---

## 📞 Sorun Giderme

**Problem:** Giriş yapamıyorum
- **Çözüm:** 
  - Şifrenin doğru olduğundan emin olun: `test123`
  - Tarayıcı konsolunu açın (F12) ve hata var mı kontrol edin
  - localStorage'ı temizleyin: `localStorage.clear()`

**Problem:** Panel açılmıyor
- **Çözüm:**
  - URL'i kontrol edin: `panels/[rol].html`
  - Tarayıcı konsolunda hata mesajlarını kontrol edin
  - Sayfayı yenileyin (Ctrl+F5 / Cmd+Shift+R)

**Problem:** Ürünler görünmüyor
- **Çözüm:**
  - Test verileri otomatik yüklenir
  - Eğer görünmüyorsa, sayfayı yenileyin
  - Konsolda hata mesajlarını kontrol edin

---

**Son Güncelleme:** Şimdi  
**Hazırlayan:** AI Assistant


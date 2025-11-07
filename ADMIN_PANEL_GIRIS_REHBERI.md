# 🔐 Admin Panel Giriş Rehberi

## 📋 Genel Bakış

Bu rehber, admin paneline nasıl giriş yapılacağını açıklar.

---

## 🔑 Admin Giriş Bilgileri

### Admin Hesap 1
- **📧 E-posta**: `admin@videosat.com`
- **🔑 Şifre**: `admin123`
- **👤 Rol**: `admin`

### Admin Hesap 2
- **📧 E-posta**: `admin@basvideo.com`
- **🔑 Şifre**: `admin123`
- **👤 Rol**: `admin`

---

## 🚀 Admin Paneline Giriş Adımları

### Yöntem 1: Ana Sayfadan (Önerilen)

#### Adım 1: Ana Sayfayı Açın
`index.html` veya `basvideo.com` ana sayfasını açın

#### Adım 2: Admin Giriş Modal'ını Açın

**Seçenek A: JavaScript ile**
Tarayıcı konsolunda (F12):
```javascript
showAdminLoginModal();
```

**Seçenek B: URL ile**
Ana sayfada, konsolda şunu çalıştırın:
```javascript
// Admin login modal'ını göster
document.getElementById('adminLoginModal').style.display = 'block';
```

**Seçenek C: HTML'den**
Ana sayfada, navigation bar'da admin giriş butonu olabilir. Kontrol edin.

#### Adım 3: Giriş Bilgilerini Girin
- **E-posta**: `admin@videosat.com` veya `admin@basvideo.com`
- **Şifre**: `admin123`

#### Adım 4: Giriş Yap
"Admin Girişi" butonuna tıklayın

#### Adım 5: Admin Dashboard'a Yönlendirilme
Başarılı girişten sonra otomatik olarak admin dashboard'una yönlendirilirsiniz.

---

## 🔍 Admin Giriş Kontrolü

### Kod İçeriği

Admin girişi `app.js` dosyasındaki `handleAdminLogin` fonksiyonu ile kontrol edilir:

```javascript
const adminUsers = [
    { email: 'admin@videosat.com', password: 'admin123', role: 'admin' },
    { email: 'admin@basvideo.com', password: 'admin123', role: 'admin' }
];
```

---

## 🛠️ Admin Giriş Sorun Giderme

### Problem: Admin giriş modal'ı açılmıyor

**Çözüm**:
1. Konsolu kontrol edin (F12)
2. JavaScript hatası var mı kontrol edin
3. Manuel olarak açın:
```javascript
showAdminLoginModal();
```

### Problem: Giriş yapılamıyor

**Çözüm**:
1. E-posta ve şifrenin doğru olduğundan emin olun:
   - E-posta: `admin@videosat.com` veya `admin@basvideo.com`
   - Şifre: `admin123`
2. Konsol hatalarını kontrol edin
3. Sayfayı yenileyin (F5)

### Problem: Admin dashboard'a yönlendirilmiyorum

**Çözüm**:
1. `redirectToDashboard()` fonksiyonunu kontrol edin
2. Konsol hatalarını kontrol edin
3. Manuel olarak yönlendirin:
```javascript
window.location.href = 'panels/admin.html';
```

---

## 📱 Admin Panel Özellikleri

Admin paneline giriş yaptıktan sonra:

- ✅ Kullanıcı yönetimi
- ✅ Sipariş takibi
- ✅ Sipariş onaylama
- ✅ Sistem istatistikleri
- ✅ Hata logları
- ✅ Performans metrikleri
- ✅ Ödeme istatistikleri

---

## 🔒 Güvenlik Notları

1. **Şifre Değiştirme**: Production'da admin şifresini değiştirmeyi unutmayın
2. **HTTPS**: Production'da HTTPS kullanın
3. **Token**: Backend'de admin token kullanımı için `ADMIN_TOKEN` environment variable'ı ayarlayın
4. **Rate Limiting**: Admin endpoint'leri için rate limiting aktif

---

## 🧪 Test

### Admin Giriş Testi

```javascript
// Konsolda test edin
const email = 'admin@videosat.com';
const password = 'admin123';

// Modal'ı aç
showAdminLoginModal();

// Form'u doldur
document.getElementById('adminUsername').value = email;
document.getElementById('adminPassword').value = password;

// Form'u submit et
document.getElementById('adminLoginForm').dispatchEvent(new Event('submit'));
```

---

## 📝 Notlar

- Admin girişi localStorage'da saklanır
- Admin kullanıcısı `currentUser` olarak ayarlanır
- Admin dashboard'una otomatik yönlendirilir
- Admin rolü `role: 'admin'` olarak ayarlanır

---

## 🔗 İlgili Dosyalar

- `app.js` - Admin login fonksiyonu (`handleAdminLogin`)
- `index.html` - Admin login modal HTML
- `services/admin-dashboard-service.js` - Admin dashboard service
- `panels/admin.html` - Admin panel sayfası

---

**Son Güncelleme**: 2024-11-06


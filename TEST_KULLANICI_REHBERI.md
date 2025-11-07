# 📖 Test Kullanıcı Rehberi

## 🎯 Hızlı Başlangıç

### Test Kullanıcı Bilgileri

#### 📦 Satıcı (Seller)
- **📧 E-posta**: `satici@videosat.com`
- **🔑 Şifre**: `test123`
- **🏢 Şirket**: Test Satıcı Firması
- **👤 Rol**: `satici`

#### 🛒 Müşteri (Customer)
- **📧 E-posta**: `musteri@videosat.com`
- **🔑 Şifre**: `test123`
- **🏢 Şirket**: Test Müşteri
- **👤 Rol**: `musteri`

---

## 🚀 Kullanım Yöntemleri

### Yöntem 1: Otomatik Oluşturma (Önerilen)

#### Adım 1: Sayfayı Açın
Ana sayfayı açın (index.html)

#### Adım 2: Konsolu Açın
F12 tuşuna basın ve Console sekmesini açın

#### Adım 3: Komutu Çalıştırın
```javascript
await setupAllTestUsers();
```

Bu komut:
- ✅ Test kullanıcılarını localStorage'a kaydeder
- ✅ Backend'e de kaydetmeyi dener (eğer backend varsa)

---

### Yöntem 2: Sadece localStorage

```javascript
await createTestUsers();
```

---

### Yöntem 3: Backend'e de Kaydet

```javascript
await createTestUsersInBackend();
```

---

## 🔧 Manuel Kullanım

### 1. Giriş Yapma

1. Ana sayfada "Giriş Yap" butonuna tıklayın
2. E-posta ve şifre girin:
   - **Satıcı**: `satici@videosat.com` / `test123`
   - **Müşteri**: `musteri@videosat.com` / `test123`
3. "Giriş Yap" butonuna tıklayın

### 2. Kullanıcıları Listeleme

Konsolda:
```javascript
listAllUsers();
```

### 3. Kullanıcıları Temizleme

Konsolda:
```javascript
clearAllUsers();
```

---

## 📋 Test Senaryoları

### Senaryo 1: Satıcı Olarak Giriş

1. Test kullanıcılarını oluştur: `await setupAllTestUsers()`
2. Giriş yap: `satici@videosat.com` / `test123`
3. Satıcı dashboard'una yönlendirilirsiniz
4. Ürün ekleyebilir, yayın yapabilirsiniz

### Senaryo 2: Müşteri Olarak Giriş

1. Test kullanıcılarını oluştur: `await setupAllTestUsers()`
2. Giriş yap: `musteri@videosat.com` / `test123`
3. Müşteri dashboard'una yönlendirilirsiniz
4. Ürünleri görüntüleyebilir, sipariş verebilirsiniz

### Senaryo 3: Satıcı-Müşteri Etkileşimi

1. İki farklı tarayıcı veya gizli sekme açın
2. Birinde satıcı, diğerinde müşteri olarak giriş yapın
3. Satıcı yayın yapsın, müşteri izlesin
4. Müşteri ürün satın alsın

---

## 🔍 Debug

### Kullanıcıları Kontrol Etme

```javascript
// Tüm kullanıcıları listele
listAllUsers();

// Mevcut kullanıcıyı kontrol et
console.log(localStorage.getItem('currentUser'));

// Kullanıcıları kontrol et
const users = JSON.parse(localStorage.getItem('users') || '[]');
console.log('Toplam kullanıcı:', users.length);
```

### Kullanıcıları Temizleme

```javascript
// Tüm kullanıcıları temizle
clearAllUsers();

// Sadece mevcut kullanıcıyı çıkış yap
localStorage.removeItem('currentUser');
```

---

## ⚠️ Önemli Notlar

1. **Şifre**: Tüm test kullanıcılarının şifresi `test123`
2. **Storage**: Kullanıcılar localStorage'da saklanır
3. **Backend**: Backend varsa, kullanıcılar backend'e de kaydedilir
4. **Production**: Test kullanıcıları production'da kullanılmamalıdır
5. **Hash**: Şifreler SHA-256 ile hash'lenmiştir

---

## 🐛 Sorun Giderme

### Problem: Kullanıcı oluşturulamıyor

**Çözüm**:
1. Konsolu kontrol edin (F12)
2. Hata mesajlarını okuyun
3. `localStorage` temizlenmiş olabilir, tekrar deneyin

### Problem: Giriş yapılamıyor

**Çözüm**:
1. Kullanıcıların oluşturulduğundan emin olun: `listAllUsers()`
2. E-posta ve şifrenin doğru olduğundan emin olun
3. Şifre hash'ini kontrol edin

### Problem: Backend'e kaydedilemiyor

**Çözüm**:
1. Backend server'ın çalıştığından emin olun
2. Backend URL'ini kontrol edin
3. CORS ayarlarını kontrol edin

---

## 📝 Örnek Kod

### Test Kullanıcıları ile Otomatik Test

```javascript
// Test kullanıcılarını oluştur
await setupAllTestUsers();

// Satıcı olarak giriş yap
const sellerResult = await testLogin('satici@videosat.com', 'test123');
console.log('Satıcı girişi:', sellerResult.success);

// Müşteri olarak giriş yap
const customerResult = await testLogin('musteri@videosat.com', 'test123');
console.log('Müşteri girişi:', customerResult.success);
```

---

## 🔗 İlgili Dosyalar

- `TEST_KULLANICI_OLUSTURUCU.js` - Otomatik kullanıcı oluşturucu
- `create-test-user.js` - Test kullanıcı oluşturma
- `setup-test-users.js` - Test kullanıcı kurulumu
- `TEST_KULLANICI_BILGILERI.md` - Test kullanıcı bilgileri

---

**Son Güncelleme**: 2024-11-06


# 👥 Test Kullanıcı Bilgileri

## 🎯 Test Hesapları

### 📦 Satıcı (Seller)
- **📧 E-posta**: `satici@videosat.com`
- **🔑 Şifre**: `test123`
- **🏢 Şirket**: Test Satıcı Firması
- **👤 Rol**: `satici`

### 🛒 Müşteri (Customer)
- **📧 E-posta**: `musteri@videosat.com`
- **🔑 Şifre**: `test123`
- **🏢 Şirket**: Test Müşteri
- **👤 Rol**: `musteri`

---

## 🚀 Kullanım

### 1. Test Kullanıcılarını Oluşturma

Tarayıcı konsolunda şunu çalıştırın:
```javascript
// Tüm test kullanıcılarını oluştur
await createAllTestUsers();

// Veya sadece satıcı ve müşteri
await createTestUser(); // Müşteri oluşturur
```

### 2. Giriş Yapma

#### Satıcı Girişi
1. Ana sayfada "Giriş Yap" butonuna tıklayın
2. E-posta: `satici@videosat.com`
3. Şifre: `test123`
4. Giriş yap butonuna tıklayın

#### Müşteri Girişi
1. Ana sayfada "Giriş Yap" butonuna tıklayın
2. E-posta: `musteri@videosat.com`
3. Şifre: `test123`
4. Giriş yap butonuna tıklayın

---

## 📋 Diğer Test Kullanıcıları

Projede aşağıdaki test kullanıcıları da mevcuttur:

### Hammaddeci
- **E-posta**: `hammaddeci@videosat.com`
- **Şifre**: `test123`

### Üretici
- **E-posta**: `uretici@videosat.com`
- **Şifre**: `test123`

### Toptancı
- **E-posta**: `toptanci@videosat.com`
- **Şifre**: `test123`

---

## ⚠️ Önemli Notlar

1. **Tüm test kullanıcılarının şifresi aynı**: `test123`
2. Kullanıcılar localStorage'da saklanır
3. Test kullanıcıları production'da kullanılmamalıdır
4. Şifreler SHA-256 ile hash'lenmiştir

---

## 🔧 Manuel Oluşturma

Eğer test kullanıcıları yoksa, tarayıcı konsolunda şunu çalıştırın:

```javascript
// Tüm test kullanıcılarını oluştur
await createAllTestUsers();

// Veya setup-test-users.js kullan
await setupTestUsers();
```

---

**Son Güncelleme**: 2024-11-06


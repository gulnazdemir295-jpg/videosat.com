# 🔧 Backend Test Kullanıcı Rehberi

## 📋 Genel Bakış

Backend'de test kullanıcılarını oluşturmak için kullanılan script'ler ve yöntemler.

---

## 🚀 Kullanım

### Yöntem 1: Backend Script (Önerilen)

#### Adım 1: Script'i Çalıştır
```bash
cd backend/api
node scripts/create-test-users.js
```

Bu script:
- ✅ Test kullanıcılarını DynamoDB'ye kaydeder
- ✅ Eğer DynamoDB yoksa in-memory kullanır
- ✅ Mevcut kullanıcıları kontrol eder

---

### Yöntem 2: Frontend'den Backend'e Kaydetme

#### Adım 1: Frontend'de Script'i Çalıştır
Tarayıcı konsolunda (F12):
```javascript
await createTestUsersInBackend();
```

Bu fonksiyon:
- ✅ Frontend'den backend API'ye istek gönderir
- ✅ Test kullanıcılarını backend'e kaydeder
- ✅ Backend çalışıyorsa çalışır

---

## 📋 Test Kullanıcı Bilgileri

### Satıcı (Seller)
- **📧 E-posta**: `satici@videosat.com`
- **🔑 Şifre**: `test123`
- **🏢 Şirket**: Test Satıcı Firması
- **👤 Rol**: `satici`

### Müşteri (Customer)
- **📧 E-posta**: `musteri@videosat.com`
- **🔑 Şifre**: `test123`
- **🏢 Şirket**: Test Müşteri
- **👤 Rol**: `musteri`

---

## 🔧 Backend Script Detayları

### Script: `backend/api/scripts/create-test-users.js`

**Özellikler**:
- ✅ DynamoDB desteği
- ✅ In-memory fallback
- ✅ Mevcut kullanıcı kontrolü
- ✅ Şifre hash'leme (bcrypt)
- ✅ Detaylı log çıktısı

**Kullanım**:
```bash
# Backend dizinine git
cd backend/api

# Script'i çalıştır
node scripts/create-test-users.js
```

---

## 📊 Backend Storage

### DynamoDB (Production)
- **Table**: `basvideo-users` (veya `DYNAMODB_TABLE_USERS`)
- **Key**: `email`
- **Fields**: email, password (hashed), role, companyName, vb.

### In-Memory (Development)
- **Storage**: Map (email -> userData)
- **Fallback**: DynamoDB yoksa otomatik kullanılır

---

## 🔍 Kontrol

### Kullanıcıları Listeleme

#### Backend API
```bash
# Tüm kullanıcıları listele (eğer endpoint varsa)
curl http://localhost:3000/api/users
```

#### DynamoDB
```bash
# AWS CLI ile
aws dynamodb scan --table-name basvideo-users
```

#### In-Memory
Backend console'da:
```javascript
// app.js'de users Map'ini kontrol et
console.log(Array.from(users.values()));
```

---

## ⚠️ Önemli Notlar

1. **Şifre Hash'leme**: Backend'de şifreler bcrypt ile hash'lenir
2. **Storage**: DynamoDB varsa DynamoDB, yoksa in-memory kullanılır
3. **Mevcut Kullanıcı**: Script mevcut kullanıcıları kontrol eder
4. **Production**: Test kullanıcıları production'da kullanılmamalıdır

---

## 🐛 Sorun Giderme

### Problem: Script çalışmıyor

**Çözüm**:
1. Node.js versiyonunu kontrol edin
2. Bağımlılıkları yükleyin: `npm install`
3. Environment variables'ı kontrol edin

### Problem: DynamoDB bağlantı hatası

**Çözüm**:
1. AWS credentials'ları kontrol edin
2. DynamoDB table'ın var olduğundan emin olun
3. In-memory fallback kullanılacaktır

### Problem: Kullanıcı oluşturulamıyor

**Çözüm**:
1. User service'in çalıştığından emin olun
2. Backend log'larını kontrol edin
3. Permissions'ı kontrol edin

---

## 📝 Örnek Kullanım

### Backend Script ile
```bash
cd backend/api
node scripts/create-test-users.js
```

### Frontend'den Backend'e
```javascript
// Tarayıcı konsolunda
await createTestUsersInBackend();
```

### Manuel API ile
```bash
# Register endpoint'i kullan
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "satici@videosat.com",
    "password": "test123",
    "companyName": "Test Satıcı Firması",
    "role": "satici"
  }'
```

---

## 🔗 İlgili Dosyalar

- `backend/api/scripts/create-test-users.js` - Backend test kullanıcı script'i
- `backend/api/services/user-service.js` - User service
- `TEST_KULLANICI_OLUSTURUCU.js` - Frontend test kullanıcı oluşturucu
- `TEST_KULLANICI_REHBERI.md` - Frontend test kullanıcı rehberi

---

**Son Güncelleme**: 2024-11-06


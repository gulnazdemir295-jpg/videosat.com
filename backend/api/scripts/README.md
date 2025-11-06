# Database Scripts

Bu klasör veritabanı yönetimi için script'leri içerir.

## Scripts

### migrate.js
DynamoDB tablolarını oluşturur.

**Kullanım**:
```bash
cd backend/api
npm run migrate
```

**Oluşturulan Tablolar**:
- `basvideo-users` - Kullanıcılar
- `basvideo-rooms` - Odalar
- `basvideo-channels` - Kanallar
- `basvideo-payments` - Ödemeler
- `basvideo-reset-tokens` - Şifre sıfırlama token'ları

**Gereksinimler**:
- AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
- DynamoDB permissions

---

### seed.js
Test ve development için örnek veri oluşturur.

**Kullanım**:
```bash
cd backend/api
npm run seed
```

**Oluşturulan Test Kullanıcıları**:
- `admin@basvideo.com` / `admin123` (admin)
- `hammaddeci@test.com` / `test123` (hammaddeci)
- `uretici@test.com` / `test123` (uretici)
- `toptanci@test.com` / `test123` (toptanci)
- `satici@test.com` / `test123` (satici)
- `musteri@test.com` / `test123` (musteri)

**Gereksinimler**:
- AWS credentials
- DynamoDB permissions
- Users table oluşturulmuş olmalı

---

## Environment Variables

Script'ler çalışmadan önce `.env` dosyasında şunlar olmalı:

```bash
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
DYNAMODB_TABLE_USERS=basvideo-users
DYNAMODB_TABLE_ROOMS=basvideo-rooms
DYNAMODB_TABLE_CHANNELS=basvideo-channels
DYNAMODB_TABLE_PAYMENTS=basvideo-payments
```

---

## Notlar

- Migration script'i idempotent'tir (birden fazla çalıştırılabilir)
- Seed script'i mevcut kullanıcıları güncellemez
- Production'da seed script'i çalıştırılmamalıdır

---

**Son Güncelleme**: 2024


# 🎯 AKSİYON PLANI - ÖNCELİKLİ EKSİKLER

**Tarih:** 6 Kasım 2025  
**Durum:** Kod analizi tamamlandı, aksiyon planı hazırlandı

---

## 📊 KOD ANALİZİ SONUÇLARI

### Tespit Edilen Durumlar:
- ✅ **Backend hazır**: Express.js, Socket.io, DynamoDB client mevcut
- ⚠️ **localStorage aşırı kullanımı**: 217 kullanım tespit edildi
- ⚠️ **DynamoDB hazır ama kullanılmıyor**: 176 referans var ama in-memory Map kullanılıyor
- ❌ **Authentication**: localStorage tabanlı, session yönetimi yok
- ❌ **Payment Gateway**: Backend endpoint'leri var ama gerçek entegrasyon yok

---

# 🔴 FAZ 1: KRİTİK GÜVENLİK VE ALTYAPI (1-2 Hafta)

## 1.1 Session Management ve Authentication İyileştirmesi

### Mevcut Durum:
- ❌ localStorage'da kullanıcı bilgileri saklanıyor
- ❌ Session expire yok
- ❌ JWT token yok
- ❌ Backend authentication endpoint'i eksik

### Yapılacaklar:
1. **Backend'de JWT Token Sistemi**
   - `jsonwebtoken` paketi ekle
   - `/api/auth/login` endpoint'i oluştur
   - `/api/auth/verify` endpoint'i oluştur
   - `/api/auth/refresh` endpoint'i oluştur

2. **Frontend'de Session Yönetimi**
   - localStorage yerine sessionStorage kullan (geçici)
   - Token refresh mekanizması
   - Auto-logout (inactivity timeout)
   - Session expire kontrolü

3. **Güvenlik İyileştirmeleri**
   - CSRF token ekle
   - XSS koruması güçlendir
   - Rate limiting frontend'de de uygula

**Dosyalar:**
- `backend/api/routes/auth-routes.js` (yeni)
- `services/auth-service.js` (güncelle)
- `app.js` (güncelle)

**Tahmini Süre:** 3-4 gün

---

## 1.2 DynamoDB Entegrasyonu

### Mevcut Durum:
- ✅ DynamoDB client hazır
- ❌ In-memory Map kullanılıyor (users, messages, payments)
- ❌ Table'lar oluşturulmamış

### Yapılacaklar:
1. **DynamoDB Table'ları Oluştur**
   ```bash
   # create-dynamodb-tables.sh script'ini çalıştır
   ```

2. **Backend'de DynamoDB Kullanımı**
   - `users` Map → DynamoDB `basvideo-users` table
   - `messages` Map → DynamoDB `basvideo-messages` table
   - `payments` Map → DynamoDB `basvideo-payments` table
   - `rooms` Map → DynamoDB `basvideo-rooms` table

3. **Fallback Mekanizması**
   - DynamoDB bağlantı hatası durumunda in-memory'e düş
   - Error handling ve logging

**Dosyalar:**
- `backend/api/app.js` (güncelle)
- `create-dynamodb-tables.sh` (çalıştır)
- `backend/api/services/dynamodb-service.js` (yeni)

**Tahmini Süre:** 2-3 gün

---

## 1.3 Şifre Sıfırlama Sistemi

### Mevcut Durum:
- ❌ Şifre sıfırlama sistemi yok
- ❌ Email servisi hazır ama entegre değil

### Yapılacaklar:
1. **Backend Endpoint'leri**
   - `POST /api/auth/forgot-password` - Reset token oluştur
   - `POST /api/auth/reset-password` - Şifre sıfırla
   - `GET /api/auth/verify-reset-token` - Token doğrula

2. **Frontend UI**
   - "Şifremi Unuttum" linki
   - Reset password sayfası
   - Email gönderimi bildirimi

3. **Email Entegrasyonu**
   - Email service'i kullan
   - Reset link email'i gönder

**Dosyalar:**
- `backend/api/routes/auth-routes.js` (güncelle)
- `forgot-password.html` (yeni)
- `reset-password.html` (yeni)
- `services/email-service.js` (entegre et)

**Tahmini Süre:** 2 gün

---

# 🟡 FAZ 2: ÖDEME VE ENTEGRASYONLAR (2-3 Hafta)

## 2.1 Gerçek Ödeme Gateway Entegrasyonu (iyzico)

### Mevcut Durum:
- ✅ Backend payment endpoint'leri hazır
- ❌ Gerçek gateway entegrasyonu yok
- ❌ Simülasyon modunda çalışıyor

### Yapılacaklar:
1. **iyzico SDK Kurulumu**
   ```bash
   npm install iyzipay
   ```

2. **Backend Entegrasyonu**
   - iyzico API key'leri (.env)
   - Payment initialization
   - Payment callback handler
   - Webhook handler

3. **Frontend Entegrasyonu**
   - iyzico checkout form
   - Payment success/failure handling
   - 3D Secure desteği

**Dosyalar:**
- `backend/api/services/payment-gateway-service.js` (yeni)
- `backend/api/routes/payment-routes.js` (güncelle)
- `modules/payment/payment-module.js` (güncelle)

**Tahmini Süre:** 5-7 gün

**Not:** iyzico hesabı ve API key'leri gerekli

---

## 2.2 Email/SMS Bildirim Sistemi

### Mevcut Durum:
- ✅ Email service hazır (`backend/api/services/email-service.js`)
- ❌ Entegre değil
- ❌ SMS servisi yok

### Yapılacaklar:
1. **Email Entegrasyonu**
   - SendGrid veya Mailgun entegrasyonu
   - Template'ler oluştur
   - Sipariş, yayın, takip bildirimleri

2. **SMS Entegrasyonu**
   - Twilio veya benzeri servis
   - Kritik bildirimler için SMS

3. **Bildirim Yönetimi**
   - Kullanıcı bildirim tercihleri
   - Bildirim geçmişi

**Dosyalar:**
- `backend/api/services/email-service.js` (güncelle)
- `backend/api/services/sms-service.js` (yeni)
- `backend/api/routes/notification-routes.js` (yeni)

**Tahmini Süre:** 3-4 gün

---

## 2.3 Kargo Entegrasyonu

### Mevcut Durum:
- ⚠️ `services/real-cargo-service.js` var ama entegre değil
- ❌ Gerçek kargo API entegrasyonu yok

### Yapılacaklar:
1. **Kargo API Entegrasyonu**
   - MNG Kargo API
   - Yurtiçi Kargo API
   - Aras Kargo API

2. **Backend Endpoint'leri**
   - Kargo ücreti hesaplama
   - Kargo takip no oluşturma
   - Kargo durumu sorgulama

3. **Frontend Entegrasyonu**
   - Kargo seçimi
   - Kargo takibi
   - Kargo ücreti gösterimi

**Dosyalar:**
- `backend/api/services/cargo-service.js` (yeni)
- `backend/api/routes/cargo-routes.js` (yeni)
- `services/real-cargo-service.js` (güncelle)

**Tahmini Süre:** 4-5 gün

---

# 🟢 FAZ 3: PANEL ENTEGRASYONLARI (2-3 Hafta)

## 3.1 Canlı Yayın Panel Entegrasyonu

### Mevcut Durum:
- ❌ Panel'de yayın durumu yok
- ❌ Panel'den yayın kontrolü yok
- ❌ Yayın istatistikleri yok

### Yapılacaklar:
1. **Panel Widget'ları**
   - Aktif yayın durumu kartı
   - İzleyici sayısı
   - Yayın süresi
   - Yayın kontrol butonları

2. **Backend Endpoint'leri**
   - `/api/livestream/status` - Yayın durumu
   - `/api/livestream/stop` - Yayını durdur
   - `/api/livestream/stats` - İstatistikler

3. **Real-time Updates**
   - WebSocket ile canlı güncellemeler
   - İzleyici sayısı güncellemesi

**Dosyalar:**
- `components/livestream-dashboard-widget.html` (yeni)
- `backend/api/routes/livestream-routes.js` (güncelle)
- `panels/*/panel-app.js` (güncelle)

**Tahmini Süre:** 4-5 gün

---

## 3.2 POS Satış Sistemi

### Mevcut Durum:
- ❌ POS sayfası yok
- ⚠️ `modules/pos/pos-module.js` var ama eksik

### Yapılacaklar:
1. **POS Sayfası Oluştur**
   - 2 kolonlu layout (Dashboard + POS)
   - Ürün arama ve listesi
   - Sepet yönetimi
   - Ödeme işlemleri

2. **POS Özellikleri**
   - Barkod okuma (QR kod scanner)
   - Hızlı ürün ekleme
   - İskonto sistemi
   - Fiş oluşturma

3. **Backend Entegrasyonu**
   - POS satış endpoint'leri
   - Fiş oluşturma
   - Stok güncelleme

**Dosyalar:**
- `pos.html` (yeni)
- `modules/pos/pos-module.js` (tamamla)
- `backend/api/routes/pos-routes.js` (yeni)

**Tahmini Süre:** 5-7 gün

---

## 3.3 Takip Sistemi Tamamlama

### Mevcut Durum:
- ⚠️ `services/follow-service.js` var
- ❌ Takip butonları eksik
- ❌ Takip bildirimleri yok

### Yapılacaklar:
1. **Takip Butonları**
   - Üretici panelinde hammaddeci takip
   - Satıcı panelinde üretici takip
   - Müşteri panelinde satıcı takip

2. **Takip Bildirimleri**
   - Yeni takipçi bildirimi
   - Bildirim sayısı
   - Bildirim geçmişi

3. **Takip İstatistikleri**
   - Takipçi sayısı
   - Takip trend grafikleri

**Dosyalar:**
- `services/follow-service.js` (güncelle)
- `panels/*/panel-app.js` (güncelle)
- `components/follow-widget.html` (yeni)

**Tahmini Süre:** 3-4 gün

---

# 📋 HAFTALIK PLAN

## Hafta 1 (6-12 Kasım)
- ✅ Session Management ve JWT
- ✅ DynamoDB Entegrasyonu
- ✅ Şifre Sıfırlama

## Hafta 2 (13-19 Kasım)
- ✅ iyzico Entegrasyonu
- ✅ Email/SMS Bildirimleri
- ✅ Kargo Entegrasyonu (başlangıç)

## Hafta 3 (20-26 Kasım)
- ✅ Canlı Yayın Panel Entegrasyonu
- ✅ POS Satış Sistemi (başlangıç)

## Hafta 4 (27 Kasım - 3 Aralık)
- ✅ POS Satış Sistemi (tamamla)
- ✅ Takip Sistemi Tamamlama
- ✅ Test ve Bug Fix

---

# 🚀 HEMEN BAŞLANABİLECEK İŞLER

## 1. Session Management (Bugün Başla)
```bash
# Backend'de JWT ekle
cd backend/api
npm install jsonwebtoken bcryptjs
```

## 2. DynamoDB Table'ları Oluştur (Bugün)
```bash
# Script'i çalıştır
./create-dynamodb-tables.sh
```

## 3. Şifre Sıfırlama UI (Bugün)
- HTML sayfaları oluştur
- Frontend form'ları hazırla

---

# 📊 İLERLEME TAKİBİ

## Tamamlanan: 0/9
- [ ] Session Management
- [ ] DynamoDB Entegrasyonu
- [ ] Şifre Sıfırlama
- [ ] iyzico Entegrasyonu
- [ ] Email/SMS Bildirimleri
- [ ] Kargo Entegrasyonu
- [ ] Canlı Yayın Panel Entegrasyonu
- [ ] POS Satış Sistemi
- [ ] Takip Sistemi Tamamlama

---

# 💡 ÖNERİLER

1. **Önce Altyapı**: Session ve DynamoDB önce tamamlanmalı
2. **Test Ortamı**: Her faz sonrası test edilmeli
3. **Dokümantasyon**: Her özellik için dokümantasyon yazılmalı
4. **Backup**: Her faz öncesi backup alınmalı

---

**Son Güncelleme:** 6 Kasım 2025  
**Hazırlayan:** AI Assistant  
**Durum:** Hazır - Uygulamaya başlanabilir




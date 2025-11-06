# 🚀 Şimdi Yapılabilecekler - BasVideo.com Backend Deploy Sonrası

## ✅ Tamamlananlar

1. ✅ **Backend EC2'de çalışıyor**
   - URL: `http://107.23.178.153:4000`
   - Health check: `{"ok":true}`
   - PM2 ile yönetiliyor

2. ✅ **DynamoDB tabloları hazır**
   - `basvideo-users`
   - `basvideo-rooms`
   - `basvideo-channels`
   - `basvideo-payments`

3. ✅ **IAM izinleri eklendi**
   - DynamoDB full access
   - AWS IVS erişimi

---

## 🎯 ŞİMDİ YAPILABİLECEKLER

### 1. 🔗 **Frontend'i Backend'e Bağlama** (ÖNCELİK: YÜKSEK)

Frontend şu anda `localhost:4000` kullanıyor. Production backend URL'ine güncellenmeli.

**Yapılacaklar:**
- `live-stream.js` → `getAPIBaseURL()` fonksiyonunu güncelle
- `panels/panel-app.js` → Backend URL'lerini güncelle
- Production URL: `http://107.23.178.153:4000`

**Dosyalar:**
- `live-stream.js` (satır 536-548)
- `panels/panel-app.js` (satır 1816, 1830, 1855)

---

### 2. 🌐 **Domain Yönlendirme (Opsiyonel)**

`api.basvideo.com` → `107.23.178.153` yönlendirmesi.

**Seçenekler:**
- **Route 53** (AWS): A kaydı ekle
- **DNS Provider**: A kaydı ekle
- **Nginx Reverse Proxy**: EC2'de nginx kur, domain yönlendir

---

### 3. 🔒 **HTTPS/SSL Sertifikası**

HTTP → HTTPS geçişi.

**Yöntemler:**
- **AWS Certificate Manager (ACM)** + **Application Load Balancer (ALB)**
- **Let's Encrypt** (ücretsiz, Nginx ile)

**Maliyet:**
- ALB: ~$16/ay
- ACM: Ücretsiz
- Let's Encrypt: Ücretsiz

---

### 4. 📊 **API Testleri**

Backend endpoint'lerini test et:

```bash
# Health check
curl http://107.23.178.153:4000/api/health

# Room oluştur
curl -X POST http://107.23.178.153:4000/api/rooms/create \
  -H "x-admin-token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roomName": "Test Room"}'

# Payments status
curl "http://107.23.178.153:4000/api/payments/status?userEmail=test@example.com"
```

---

### 5. 🎥 **AWS IVS Entegrasyonu**

Backend'den AWS IVS channel/stream key oluşturma.

**API Endpoints:**
- `POST /api/admin/ivs/channel` - Channel oluştur
- `GET /api/admin/ivs/channels` - Channel listesi
- `POST /api/rooms/:roomId/channels/:channelId/claim-key` - Stream key claim

**Not:** AWS IVS quota sorunu var (1 stream key limit). Support case açıldı, bekleniyor.

---

### 6. 📈 **Monitoring ve Logging**

**Seçenekler:**
- **CloudWatch**: AWS native monitoring
- **PM2 Monitoring**: `pm2 monit`
- **Application Insights**: Backend log analizi

---

### 7. 🔄 **Auto Scaling (İleride)**

Trafik artarsa otomatik ölçeklendirme:
- **Auto Scaling Group**: EC2 instance sayısını artır
- **Application Load Balancer**: Traffic dağıtımı

**Maliyet:** ~$20-50/ay (trafiğe göre)

---

### 8. 💾 **Database Backup**

DynamoDB backup stratejisi:
- **On-demand backup**: Manuel backup
- **Point-in-time recovery**: Otomatik backup
- **Cross-region replication**: Disaster recovery

---

### 9. 🚀 **Frontend Deployment**

Frontend'i S3 + CloudFront'a deploy et:
- S3 bucket: `dunyanin-en-acayip-sitesi-328185871955`
- CloudFront: CDN dağıtımı
- Domain: `basvideo.com`

---

### 10. 🧪 **Testing**

**Yapılacak Testler:**
- ✅ Backend health check
- ⏳ Room oluşturma
- ⏳ Channel oluşturma
- ⏳ Stream key claim
- ⏳ Payment status check
- ⏳ Frontend → Backend bağlantısı
- ⏳ Multi-user canlı yayın testi

---

## 📝 Öncelik Sırası

### Hemen Yapılmalı (Bugün)
1. ✅ Frontend'i backend URL'e bağla
2. ⏳ API testleri yap
3. ⏳ Frontend → Backend bağlantısını test et

### Kısa Vadede (Bu Hafta)
4. ⏳ Domain yönlendirme (api.basvideo.com)
5. ⏳ HTTPS/SSL ekle
6. ⏳ Monitoring kur

### Orta Vadede (Bu Ay)
7. ⏳ Auto scaling
8. ⏳ Backup stratejisi
9. ⏳ Performance optimizasyonu

---

## 💰 Maliyet Özeti

### Mevcut Maliyet (Aylık)
- **EC2 t3.micro**: ~$7-8 (Free tier biterse)
- **DynamoDB**: ~$0.25 (PAY_PER_REQUEST, minimal kullanım)
- **Data Transfer**: ~$1-5 (traffic'e göre)
- **Toplam**: ~$8-15/ay

### Gelecek Eklemeler
- **ALB + HTTPS**: +$16/ay
- **Auto Scaling**: +$7-14/ay (her ek instance)
- **CloudWatch**: ~$1-5/ay
- **Backup**: ~$1-3/ay

---

## 🔧 Komutlar

### Backend Kontrol
```bash
# SSH bağlan
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153

# PM2 durumu
pm2 status

# Logları görüntüle
pm2 logs basvideo-backend

# Backend'i yeniden başlat
pm2 restart basvideo-backend
```

### API Testleri
```bash
# Health check
curl http://107.23.178.153:4000/api/health

# Payments status
curl "http://107.23.178.153:4000/api/payments/status?userEmail=test@example.com"
```

---

## 📞 Sonraki Adımlar

**1. Frontend'i güncelle** (en öncelikli)
**2. API testleri yap**
**3. Domain yönlendirme** (opsiyonel)

Hangi işleme başlayalım? 🚀






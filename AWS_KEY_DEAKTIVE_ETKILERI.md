# AWS Access Key Deaktive Etme - Etki Analizi

## ⚠️ ÖNEMLİ UYARI

**Access Key devre dışı bırakılırsa:**

### 🚫 Çalışmayacak Servisler:
1. **AWS IVS (Interactive Video Service)**
   - Canlı yayın oluşturma
   - Channel yönetimi
   - Stream key alma

2. **DynamoDB**
   - User kayıtları
   - Room/Channel verileri
   - Payment verileri

3. **AWS STS (Identity)**
   - AWS hesap doğrulama
   - Credential kontrolü

### ✅ Çalışmaya Devam Edecek Servisler:
1. **Agora.io** (STREAM_PROVIDER=AGORA ise)
   - Canlı yayın sistemi
   - Agora kendi credentials kullanır

2. **Frontend**
   - Statik dosyalar
   - UI/UX

3. **Backend API (AWS olmayan endpoint'ler)**
   - Health check
   - Chat, beğeni, davet sistemi (in-memory)

## 🔄 Önerilen Yol: Önce Yeni Key, Sonra Eski Key'i Kapat

### Adım 1: Yeni Access Key Oluştur
1. AWS Console: https://console.aws.amazon.com/iam/
2. IAM > Users > [User adı] > Security credentials
3. **"Create access key"** butonuna tıklayın
4. Yeni key'i kopyalayın (hemen kaydedin!)

### Adım 2: Backend'de Güncelle
1. Backend sunucuya SSH ile bağlanın
2. `.env` dosyasını açın:
   ```bash
   cd /var/www/basvideo/backend/api
   nano .env
   ```
3. Yeni key'leri güncelleyin:
   ```env
   AWS_ACCESS_KEY_ID=yeni_access_key_id
   AWS_SECRET_ACCESS_KEY=yeni_secret_key
   ```
4. Backend'i restart edin:
   ```bash
   pm2 restart basvideo-api
   ```

### Adım 3: Test Et
1. Backend health check:
   ```bash
   curl http://localhost:4000/api/health
   ```
2. AWS IVS test (opsiyonel):
   ```bash
   curl http://localhost:4000/api/admin/aws/verify
   ```

### Adım 4: Eski Key'i Deaktive Et
1. AWS Console > IAM > Users > Security credentials
2. Eski key'in yanında **"Deactivate"** veya **"Delete"**
3. Onaylayın

### Adım 5: GitHub Push
Artık eski key kullanılmıyor, GitHub'a push edebilirsiniz!

## 🎯 Alternatif: Geçici Çözüm

Eğer şu an backend çalışıyorsa ve durdurmak istemiyorsanız:

1. **GitHub'dan secret'ları allow edin** (geçici)
2. Push'u yapın
3. **Sonra** yeni key oluşturup değiştirin
4. Eski key'i deaktive edin

## 📊 Durum Kontrolü

**Backend şu an çalışıyor mu?**
- Evet → Önce yeni key oluştur, değiştir, sonra eski key'i kapat
- Hayır → Direkt key'i kapatabilirsiniz, GitHub'a push edin

## ⚠️ Dikkat

- Access key deaktive edilirse **backend anında çalışmayı durdurur**
- Agora kullanıyorsanız sadece AWS servisleri etkilenir
- Yeni key oluşturmak **2 dakika** sürer
- Backend restart **10 saniye** sürer

**Öneri: Önce yeni key oluştur, değiştir, test et, sonra eski key'i kapat!**


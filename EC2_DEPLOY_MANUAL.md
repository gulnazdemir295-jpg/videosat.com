# EC2 DEPLOYMENT - Manuel Adımlar

## EC2 IP: 18.138.240.4
## Key File: ~/.ssh/basvideo-backend-key.pem

---

## ADIM 1: Key Dosyasını Kontrol Et

Terminal'de:
```bash
ls -l ~/.ssh/basvideo-backend-key.pem
chmod 400 ~/.ssh/basvideo-backend-key.pem
```

---

## ADIM 2: SSH Bağlantısı Test Et

```bash
ssh -i ~/.ssh/basvideo-backend-key.pem ubuntu@18.138.240.4
```

**Eğer bağlanamazsan:**
- Key dosyası doğru mu? (AWS Console'dan indirdiğin key ile aynı mı?)
- EC2 instance "Running" durumunda mı?
- Security Group'da SSH (port 22) açık mı?

**İlk bağlantıda:** "Are you sure you want to continue connecting?" sorusuna `yes` yaz.

---

## ADIM 3: Backend Kodunu Kopyala

**Yeni bir terminal aç** (SSH bağlantısını kapatma), sonra:

```bash
cd /Users/gulnazdemir/Desktop/DENEME
scp -i ~/.ssh/basvideo-backend-key.pem -r backend/api ubuntu@18.138.240.4:/home/ubuntu/
```

Bu komut birkaç dakika sürebilir (dosyalar kopyalanıyor).

---

## ADIM 4: EC2'de Kurulum (SSH Bağlantısından Sonra)

SSH ile bağlandıktan sonra EC2'de şu komutları çalıştır:

### 4.1 Node.js Kurulumu

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # v18.x.x görmeli
npm --version
```

### 4.2 PM2 Kurulumu

```bash
sudo npm install -g pm2
pm2 --version
```

### 4.3 Backend Dizinine Git

```bash
cd /home/ubuntu/api
ls -la  # Dosyalar görünmeli (app.js, package.json, vs.)
```

### 4.4 Dependencies Kur

```bash
npm install
```

Bu işlem 5-10 dakika sürebilir (özellikle Mediasoup kurulumu).

### 4.5 .env Dosyası Oluştur

```bash
nano .env
```

**Aşağıdaki içeriği kopyala-yapıştır:**

```bash
PORT=4000
NODE_ENV=production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
ADMIN_TOKEN=basvideo-admin-token-2024-secure
DYNAMODB_TABLE_USERS=basvideo-users
DYNAMODB_TABLE_ROOMS=basvideo-rooms
DYNAMODB_TABLE_CHANNELS=basvideo-channels
DYNAMODB_TABLE_PAYMENTS=basvideo-payments
USE_DYNAMODB=true
```

**Nano'da:**
- Ctrl+X (çıkış)
- Y (kaydet)
- Enter (onayla)

### 4.6 PM2 ile Backend'i Başlat

```bash
pm2 start app.js --name basvideo-backend
pm2 logs basvideo-backend  # Logları gör (Ctrl+C ile çık)
```

**Görmen gerekenler:**
- `✅ DynamoDB client initialized` (veya in-memory warning)
- `✅ IVS backend API running on http://localhost:4000`

### 4.7 Sistem Açılışında Otomatik Başlat

```bash
pm2 startup
```

**Çıkan komutu çalıştır** (sudo ile başlayan bir komut, örnek: `sudo env PATH=...`)

Sonra:
```bash
pm2 save
```

### 4.8 Test Et

```bash
curl http://localhost:4000/api/health
```

**Çıktı:** `{"ok":true}` olmalı

---

## ADIM 5: Lokal Bilgisayarından Test

EC2'den çık (SSH bağlantısını kapat), lokal terminal'de:

```bash
curl http://18.138.240.4:4000/api/health
```

**Çıktı:** `{"ok":true}` olmalı

---

## SORUN GİDERME

### SSH Bağlantı Hatası

**Hata:** "Permission denied (publickey)"

**Çözüm:**
1. Key dosyası doğru mu kontrol et:
   ```bash
   ls -l ~/.ssh/basvideo-backend-key.pem
   chmod 400 ~/.ssh/basvideo-backend-key.pem
   ```

2. AWS Console'dan key pair adını kontrol et:
   - EC2 → Key Pairs → Key adı: `basvideo-backend-key` mi?

3. Key dosyasını yeniden indir (gerekirse)

### Backend Çalışmıyor

**Kontrol:**
```bash
pm2 status
pm2 logs basvideo-backend
```

**Restart:**
```bash
pm2 restart basvideo-backend
```

### Port 4000 Erişilemiyor

**Security Group kontrolü:**
- AWS Console → EC2 → Security Groups → `basvideo-backend-sg`
- Inbound rules'da Port 4000 (Custom TCP) açık mı?

---

## ✅ BAŞARILI DEPLOYMENT

Backend şimdi production'da çalışıyor:
- **URL:** `http://18.138.240.4:4000`
- **Health check:** `http://18.138.240.4:4000/api/health`
- **PM2 ile 7/24 çalışıyor**
- **Sistem restart'ta otomatik başlıyor**




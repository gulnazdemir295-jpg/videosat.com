# EC2 DEPLOYMENT REHBERİ - BasVideo.com Backend

## ADIM 5: EC2 INSTANCE OLUŞTUR

### AWS Console'dan:

1. **EC2 Console'a git:**
   - AWS Console → EC2 → Instances → Launch Instance

2. **Name and tags:**
   - Name: `basvideo-backend`

3. **Application and OS Images (AMI):**
   - **Ubuntu** → **Ubuntu Server 22.04 LTS** seç
   - AMI ID: `ami-0c55b159cbfafe1f0` (us-east-1)

4. **Instance type:**
   - **t3.micro** (Free tier bitmişse **t3.small** - $15/ay)
   - 2 vCPU, 2 GB RAM (t3.small)

5. **Key pair (login):**
   - "Create new key pair" tıkla
   - Key pair name: `basvideo-backend-key`
   - Key pair type: **RSA**
   - Private key file format: **.pem**
   - **"Create key pair"** tıkla → Key otomatik indirilecek (`basvideo-backend-key.pem`)
   - **ÖNEMLİ:** Bu key'i güvenli yere kaydet, bir daha gösterilmez!

6. **Network settings:**
   - **Edit** tıkla
   - Security group: **Create security group**
   - Security group name: `basvideo-backend-sg`
   - Description: `Backend API security group`
   
   **Inbound rules (Add security group rule):**
   - **Rule 1:**
     - Type: SSH
     - Port: 22
     - Source: My IP (sadece senin IP'den SSH)
   
   - **Rule 2:**
     - Type: HTTP
     - Port: 80
     - Source: Anywhere-IPv4 (0.0.0.0/0)
   
   - **Rule 3:**
     - Type: HTTPS
     - Port: 443
     - Source: Anywhere-IPv4 (0.0.0.0/0)
   
   - **Rule 4:**
     - Type: Custom TCP
     - Port: 4000
     - Source: Anywhere-IPv4 (0.0.0.0/0) - Backend API için

7. **Configure storage:**
   - Size: **20 GB** (gp3)
   - (Root volume)

8. **Launch Instance:**
   - **"Launch instance"** tıkla
   - Instance başlatılıyor...

9. **Instance'ı bekle:**
   - Status: **running** olana kadar bekle (1-2 dakika)
   - **Public IPv4 address** not al (örn: `54.xxx.xxx.xxx`)

---

## EC2 INSTANCE HAZIR! ✅

**Önemli Bilgiler:**
- **Public IP:** `54.xxx.xxx.xxx` (kendi IP'n)
- **Key file:** `basvideo-backend-key.pem` (indirdiğin dosya)
- **Username:** `ubuntu` (Ubuntu için)

---

## ADIM 6: BACKEND'İ EC2'YE DEPLOY ET

### Lokal Bilgisayarında:

**1. Key dosyasını güvenli yere taşı:**
```bash
cd ~/Downloads
mv basvideo-backend-key.pem ~/.ssh/
chmod 400 ~/.ssh/basvideo-backend-key.pem
```

**2. Backend kodunu EC2'ye kopyala:**
```bash
cd /Users/gulnazdemir/Desktop/DENEME
scp -i ~/.ssh/basvideo-backend-key.pem -r backend/api ubuntu@<EC2-IP>:/home/ubuntu/
```
**ÖNEMLİ:** `<EC2-IP>` yerine gerçek IP'yi yaz!

**3. SSH ile EC2'ye bağlan:**
```bash
ssh -i ~/.ssh/basvideo-backend-key.pem ubuntu@<EC2-IP>
```

### EC2 Instance İçinde (SSH bağlantısından sonra):

**1. Node.js 18.x kur:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # v18.x.x görmeli
npm --version
```

**2. PM2 kur (process manager - otomatik restart):**
```bash
sudo npm install -g pm2
pm2 --version
```

**3. Backend dizinine git:**
```bash
cd /home/ubuntu/api
ls -la  # Dosyalar görünmeli
```

**4. Dependencies kur:**
```bash
npm install
```
(Bu sefer Mediasoup da kurulacak - Linux'ta çalışır)

**5. .env dosyası oluştur:**
```bash
nano .env
```

**.env içeriği (kopyala-yapıştır):**
```bash
PORT=4000
NODE_ENV=production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAUY2LG7ZJ3IQTWA6C
AWS_SECRET_ACCESS_KEY=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
ADMIN_TOKEN=<güvenli-random-token-buraya>
DYNAMODB_TABLE_USERS=basvideo-users
DYNAMODB_TABLE_ROOMS=basvideo-rooms
DYNAMODB_TABLE_CHANNELS=basvideo-channels
DYNAMODB_TABLE_PAYMENTS=basvideo-payments
USE_DYNAMODB=true
```

**Ctrl+X → Y → Enter** (kaydet ve çık)

**6. PM2 ile backend'i başlat:**
```bash
pm2 start app.js --name basvideo-backend
pm2 logs basvideo-backend  # Logları gör
```

**Ctrl+C** ile loglardan çık

**7. PM2 status kontrol:**
```bash
pm2 status  # "online" görünmeli
```

**8. Sistem açılışında otomatik başlat:**
```bash
pm2 startup  # Çıkan komutu çalıştır (sudo ile)
pm2 save
```

**9. Test et (EC2'den):**
```bash
curl http://localhost:4000/api/health
```
Çıktı: `{"ok":true}` olmalı

**10. Test et (lokal bilgisayarından):**
```bash
curl http://<EC2-IP>:4000/api/health
```
Çıktı: `{"ok":true}` olmalı

---

## ✅ DEPLOYMENT TAMAMLANDI!

**Backend şimdi production'da çalışıyor:**
- URL: `http://<EC2-IP>:4000`
- PM2 ile 7/24 çalışıyor
- Sistem restart'ta otomatik başlıyor

---

## YARDIMCI KOMUTLAR

**PM2 Komutları:**
```bash
pm2 logs basvideo-backend    # Logları gör
pm2 restart basvideo-backend # Restart
pm2 stop basvideo-backend    # Durdur
pm2 delete basvideo-backend  # Sil
pm2 status                   # Durum
```

**Backend kodunu güncelle:**
```bash
# Lokal bilgisayarında:
scp -i ~/.ssh/basvideo-backend-key.pem -r backend/api/* ubuntu@<EC2-IP>:/home/ubuntu/api/

# EC2'de:
cd /home/ubuntu/api
npm install  # Yeni dependencies varsa
pm2 restart basvideo-backend
```

---

## SONRAKI ADIM: FRONTEND GÜNCELLEME

Frontend kodunda backend URL'ini güncelle:
- Eski: `http://localhost:4000`
- Yeni: `http://<EC2-IP>:4000`




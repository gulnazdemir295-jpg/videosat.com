# 🚀 NGINX KURULUMU - ADIM ADIM REHBER

**Tarih:** 5 Ocak 2025  
**EC2 IP:** 107.23.178.153  
**Domain:** basvideo.com  
**Backend Port:** 4000

---

## 📋 ÖN KOŞULLAR

- ✅ EC2 instance çalışıyor (107.23.178.153)
- ✅ Backend PM2 ile çalışıyor (port 4000)
- ✅ SSH key dosyası mevcut
- ✅ Domain sahibisiniz (basvideo.com)

---

## 🔧 ADIM 1: EC2'YE SSH BAĞLAN

**Lokal bilgisayarınızda:**

```bash
ssh -i ~/.ssh/basvideo-backend-key.pem ubuntu@107.23.178.153
```

**Eğer SSH key farklı bir yerdeyse:**
```bash
ssh -i /path/to/your/key.pem ubuntu@107.23.178.153
```

**Bağlantı başarılı olursa:** EC2 terminal'inde olmalısınız.

---

## 📦 ADIM 2: NGINX KUR

**EC2 terminal'inde:**

```bash
# Paket listesini güncelle
sudo apt update

# Nginx kur
sudo apt install nginx -y

# Nginx durumunu kontrol et
sudo systemctl status nginx
```

**Beklenen:** `active (running)` görünmeli

**Eğer çalışmıyorsa:**
```bash
sudo systemctl start nginx
sudo systemctl enable nginx  # Sistem açılışında otomatik başlat
```

---

## 🔐 ADIM 3: SECURITY GROUP AYARLARI

**AWS Console'dan (Lokal bilgisayarınızda):**

1. AWS Console → EC2 → Security Groups
2. `basvideo-backend-sg` (veya backend'inizin security group'u) seç
3. **Inbound rules** → **Edit inbound rules**
4. Şu kuralları ekle (yoksa):
   - **Type:** HTTP, **Port:** 80, **Source:** 0.0.0.0/0
   - **Type:** HTTPS, **Port:** 443, **Source:** 0.0.0.0/0
5. **Save rules**

**Kontrol:**
```bash
# EC2'den test (başka terminal aç)
curl http://107.23.178.153
# Beklenen: Nginx default sayfası (HTML)
```

---

## ⚙️ ADIM 4: NGINX CONFIG OLUŞTUR

**EC2 terminal'inde:**

```bash
# Config dosyası oluştur
sudo nano /etc/nginx/sites-available/basvideo-backend
```

**İçeriği ekle (kopyala-yapıştır):**

```nginx
server {
    listen 80;
    server_name api.basvideo.com 107.23.178.153;

    # Backend'e yönlendir
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout ayarları
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Kaydet:** `Ctrl+X` → `Y` → `Enter`

---

## 🔗 ADIM 5: NGINX SITE AKTİF ET

**EC2 terminal'inde:**

```bash
# Symbolic link oluştur
sudo ln -s /etc/nginx/sites-available/basvideo-backend /etc/nginx/sites-enabled/

# Default site'ı devre dışı bırak (opsiyonel)
sudo rm /etc/nginx/sites-enabled/default

# Nginx config'i test et
sudo nginx -t
```

**Beklenen:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Hata varsa:** Config dosyasını kontrol et, yukarıdaki adımları tekrarla.

---

## 🔄 ADIM 6: NGINX'İ YENİDEN BAŞLAT

**EC2 terminal'inde:**

```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

**Beklenen:** `active (running)`

---

## 🧪 ADIM 7: TEST ET

**EC2 terminal'inde:**

```bash
# Localhost'tan test
curl http://localhost/api/health
```

**Beklenen:** `{"ok":true}`

**Lokal bilgisayarınızdan (yeni terminal):**

```bash
curl http://107.23.178.153/api/health
```

**Beklenen:** `{"ok":true}`

**Eğer çalışmıyorsa:**
- Backend çalışıyor mu kontrol et: `pm2 status`
- Security Group ayarları kontrol et
- Nginx log'larını kontrol et: `sudo tail -f /var/log/nginx/error.log`

---

## 🌐 ADIM 8: DNS AYARLARI

**Domain sağlayıcınızın DNS panelinde (basvideo.com domain sağlayıcısı):**

### A Kaydı Ekle:

**Type:** A  
**Name:** `api` (veya `@` root için)  
**Value:** `107.23.178.153`  
**TTL:** `3600` (veya default)

**Örnek:**
```
Type: A
Name: api
Value: 107.23.178.153
TTL: 3600
```

**Kaydet ve bekle:** DNS propagation 5-30 dakika sürebilir.

---

## 🔍 ADIM 9: DNS PROPAGATION KONTROLÜ

**DNS'in yayıldığını kontrol et:**

```bash
# Lokal bilgisayarınızda
nslookup api.basvideo.com
# veya
dig api.basvideo.com
```

**Beklenen:** `107.23.178.153` IP'si görünmeli

**Eğer görünmüyorsa:**
- 5-10 dakika bekle
- Tekrar kontrol et
- Domain sağlayıcınızın DNS ayarlarını kontrol et

---

## 🔒 ADIM 10: SSL SERTİFİKASI (HTTPS)

**DNS yayıldıktan sonra (en az 5 dakika bekleyin):**

### Certbot Kur:

**EC2 terminal'inde:**

```bash
# Certbot kur
sudo apt install certbot python3-certbot-nginx -y
```

### SSL Sertifikası Al:

```bash
# Let's Encrypt sertifikası al
sudo certbot --nginx -d api.basvideo.com
```

**Sorular:**
1. **Email adresi:** Email'inizi girin
2. **Terms of Service:** `A` (Agree) yazın, Enter
3. **Share email:** `N` (No) yazın, Enter
4. **HTTP to HTTPS redirect:** `2` (Redirect) yazın, Enter

**Başarılı olursa:**
```
Congratulations! Your certificate and chain have been saved at:
/etc/letsencrypt/live/api.basvideo.com/fullchain.pem
```

---

## ✅ ADIM 11: HTTPS TEST

**Lokal bilgisayarınızda:**

```bash
# HTTPS test
curl https://api.basvideo.com/api/health
```

**Beklenen:** `{"ok":true}`

**Tarayıcıda test:**
```
https://api.basvideo.com/api/health
```

**Beklenen:** Yeşil kilit ikonu ve `{"ok":true}`

---

## 🎯 ADIM 12: OTOMATIK YENİLEME

**Certbot otomatik yenileme zaten aktif, ama test edelim:**

**EC2 terminal'inde:**

```bash
# Test et (dry run)
sudo certbot renew --dry-run
```

**Beklenen:** Başarılı mesaj

---

## 📊 SONUÇ

**Nginx kurulumu tamamlandı!**

✅ **Backend URL:** `https://api.basvideo.com`  
✅ **HTTPS:** Aktif (Let's Encrypt)  
✅ **Domain:** Çalışıyor  
✅ **Port:** 80/443 (standart)  
✅ **Reverse Proxy:** Aktif  

---

## 🐛 SORUN GİDERME

### Sorun 1: Nginx başlamıyor

```bash
# Log'ları kontrol et
sudo tail -f /var/log/nginx/error.log

# Config test
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx
```

---

### Sorun 2: 502 Bad Gateway

**Sebep:** Backend çalışmıyor olabilir

```bash
# Backend durumunu kontrol et
pm2 status

# Backend'i başlat
pm2 restart basvideo-backend

# Backend log'larını kontrol et
pm2 logs basvideo-backend
```

---

### Sorun 3: SSL Sertifikası Alınamıyor

**Sebep:** DNS yayılmamış olabilir

```bash
# DNS kontrolü
nslookup api.basvideo.com

# Bekle: DNS propagation (5-30 dakika)
# Sonra tekrar dene
```

---

### Sorun 4: Port 80/443 Erişilemiyor

**Sebep:** Security Group ayarları

**Çözüm:**
1. AWS Console → EC2 → Security Groups
2. `basvideo-backend-sg` → Edit inbound rules
3. Port 80 ve 443 ekle

---

## 📝 KONTROL LİSTESİ

- [ ] EC2'ye SSH bağlandım
- [ ] Nginx kuruldu
- [ ] Security Group ayarları yapıldı (80, 443)
- [ ] Nginx config oluşturuldu
- [ ] Nginx site aktif edildi
- [ ] Nginx test edildi (`nginx -t`)
- [ ] Nginx yeniden başlatıldı
- [ ] Backend test edildi (`curl http://localhost/api/health`)
- [ ] DNS A kaydı eklendi (api.basvideo.com → 107.23.178.153)
- [ ] DNS propagation kontrol edildi
- [ ] SSL sertifikası alındı (certbot)
- [ ] HTTPS test edildi (`curl https://api.basvideo.com/api/health`)

---

## 🎉 TAMAMLANDI!

**Nginx kurulumu başarılı!** 

Artık:
- ✅ `https://api.basvideo.com` → Backend API
- ✅ HTTPS aktif
- ✅ Domain çalışıyor
- ✅ Canlı yayın sayfası çalışacak

**Sonraki adım:** Frontend'i test et!

---

**Son Güncelleme:** 5 Ocak 2025  
**Durum:** ✅ Adım adım rehber hazır


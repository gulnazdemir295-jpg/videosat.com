# 🌐 Nginx Kurulum Rehberi - AWS EC2

**Tarih:** 5 Ocak 2025  
**Backend URL:** `http://107.23.178.153:4000`  
**Durum:** Nginx kurulumu ile sorunlar çözülebilir ✅

---

## 🎯 Nginx Ne Çözebilir?

### ✅ ÇÖZÜLECEK SORUNLAR:

1. **🔒 HTTPS/SSL Ekleme** (Let's Encrypt ile ücretsiz)
   - Şu an: `http://107.23.178.153:4000` (HTTP)
   - Sonra: `https://api.basvideo.com` (HTTPS)

2. **🌍 Domain Yönlendirme**
   - Şu an: IP adresi kullanılıyor (`107.23.178.153:4000`)
   - Sonra: `api.basvideo.com` → Backend'e yönlendirir

3. **🔌 Standart Portlar**
   - Şu an: Port 4000 (standart olmayan)
   - Sonra: Port 80 (HTTP) ve 443 (HTTPS)

4. **⚡ Reverse Proxy**
   - Backend'i arka planda çalıştırır
   - Nginx frontend olarak çalışır
   - Daha güvenli ve profesyonel

5. **📊 Load Balancing** (İleride)
   - Birden fazla backend instance varsa
   - Trafiği dağıtır

---

## ✅ AVANTAJLAR

- ✅ **Ücretsiz HTTPS** (Let's Encrypt)
- ✅ **Domain yönlendirme** kolay
- ✅ **Daha güvenli** (reverse proxy)
- ✅ **Standart portlar** (80, 443)
- ✅ **Performans** (Nginx çok hızlı)
- ✅ **Kolay yönetim**

---

## ⚠️ DİKKAT EDİLMESİ GEREKENLER

- ⚠️ EC2 Security Group'da port 80 ve 443 açık olmalı
- ⚠️ Domain DNS ayarları yapılmalı (api.basvideo.com → EC2 IP)
- ⚠️ Let's Encrypt için domain doğrulaması gerekli

---

## 🚀 KURULUM ADIMLARI

### ADIM 1: EC2'ye SSH Bağlan

```bash
ssh -i ~/.ssh/basvideo-backend-key.pem ubuntu@107.23.178.153
```

---

### ADIM 2: Nginx Kur

```bash
# Paket listesini güncelle
sudo apt update

# Nginx kur
sudo apt install nginx -y

# Nginx durumunu kontrol et
sudo systemctl status nginx
```

**Beklenen:** `active (running)` görünmeli

---

### ADIM 3: Security Group Ayarları

**AWS Console'dan:**
1. EC2 → Security Groups → `basvideo-backend-sg`
2. **Inbound rules** → **Edit inbound rules**
3. Şu kuralları ekle (yoksa):
   - **HTTP (80)**: Source: `0.0.0.0/0`
   - **HTTPS (443)**: Source: `0.0.0.0/0`

---

### ADIM 4: Nginx Konfigürasyonu

**Backend için reverse proxy oluştur:**

```bash
# Nginx config dosyası oluştur
sudo nano /etc/nginx/sites-available/basvideo-backend
```

**İçeriği ekle:**
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
    }
}
```

**Kaydet:** `Ctrl+X` → `Y` → `Enter`

---

### ADIM 5: Nginx Site Aktif Et

```bash
# Symbolic link oluştur
sudo ln -s /etc/nginx/sites-available/basvideo-backend /etc/nginx/sites-enabled/

# Default site'ı devre dışı bırak (opsiyonel)
sudo rm /etc/nginx/sites-enabled/default

# Nginx config'i test et
sudo nginx -t
```

**Beklenen:** `syntax is ok` ve `test is successful`

---

### ADIM 6: Nginx'i Yeniden Başlat

```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

**Beklenen:** `active (running)`

---

### ADIM 7: Test Et

```bash
# EC2'den test
curl http://localhost/api/health

# Lokal bilgisayarından test
curl http://107.23.178.153/api/health
```

**Beklenen:** `{"ok":true}`

---

## 🔒 HTTPS/SSL EKLEME (Let's Encrypt)

### ADIM 1: Certbot Kur

```bash
# Certbot kur
sudo apt install certbot python3-certbot-nginx -y
```

---

### ADIM 2: Domain DNS Ayarları

**DNS Provider'dan (basvideo.com domain sağlayıcısı):**

**A kaydı ekle:**
- **Type:** A
- **Name:** `api` (veya `@` root için)
- **Value:** `107.23.178.153`
- **TTL:** 3600 (veya default)

**Bekle:** DNS propagation (5-30 dakika)

**Kontrol et:**
```bash
# DNS'in yayıldığını kontrol et
nslookup api.basvideo.com
# veya
dig api.basvideo.com
```

**Beklenen:** `107.23.178.153` IP'si görünmeli

---

### ADIM 3: SSL Sertifikası Al

```bash
# Let's Encrypt sertifikası al
sudo certbot --nginx -d api.basvideo.com
```

**Sorular:**
1. **Email adresi:** Email gir
2. **Terms of Service:** `A` (Agree)
3. **Share email:** `N` (No)
4. **HTTP to HTTPS redirect:** `2` (Redirect)

**Başarılı olursa:**
```
Congratulations! Your certificate and chain have been saved at:
/etc/letsencrypt/live/api.basvideo.com/fullchain.pem
```

---

### ADIM 4: Otomatik Yenileme

```bash
# Test et (dry run)
sudo certbot renew --dry-run

# Otomatik yenileme zaten aktif (systemd timer ile)
```

---

### ADIM 5: HTTPS Test Et

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

## 📝 NGINX CONFIG ÖRNEĞİ (HTTPS İLE)

Nginx otomatik olarak config'i güncelleyecek, ama manuel düzenleme için:

```nginx
server {
    listen 80;
    server_name api.basvideo.com 107.23.178.153;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.basvideo.com;

    ssl_certificate /etc/letsencrypt/live/api.basvideo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.basvideo.com/privkey.pem;
    
    # SSL ayarları
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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
    }
}
```

---

## 🔧 YÖNETİM KOMUTLARI

### Nginx Komutları

```bash
# Nginx durumu
sudo systemctl status nginx

# Nginx başlat
sudo systemctl start nginx

# Nginx durdur
sudo systemctl stop nginx

# Nginx yeniden başlat
sudo systemctl restart nginx

# Nginx reload (config değişikliği)
sudo systemctl reload nginx

# Config test
sudo nginx -t
```

### SSL Sertifika Komutları

```bash
# Sertifika yenile (test)
sudo certbot renew --dry-run

# Sertifika yenile (gerçek)
sudo certbot renew

# Sertifika listesi
sudo certbot certificates
```

---

## 🧪 TEST SENARYOLARI

### Test 1: HTTP → HTTPS Redirect

```bash
curl -I http://api.basvideo.com/api/health
```

**Beklenen:** `301 Moved Permanently` ve `Location: https://api.basvideo.com/...`

---

### Test 2: HTTPS Direct

```bash
curl https://api.basvideo.com/api/health
```

**Beklenen:** `{"ok":true}`

---

### Test 3: Frontend'den Backend'e Bağlantı

**Frontend kodunda:**
```javascript
// Eski
const API_BASE_URL = 'http://107.23.178.153:4000';

// Yeni
const API_BASE_URL = 'https://api.basvideo.com';
```

---

## 📊 SONUÇ

### Nginx Kurulumu Sonrası:

✅ **Backend URL:** `https://api.basvideo.com`  
✅ **HTTPS:** Aktif (Let's Encrypt)  
✅ **Domain:** Çalışıyor  
✅ **Port:** 80/443 (standart)  
✅ **Reverse Proxy:** Aktif  
✅ **Güvenlik:** Artırıldı  

---

## 💰 MALİYET

- **Nginx:** ₺0 (ücretsiz)
- **Let's Encrypt SSL:** ₺0 (ücretsiz)
- **Domain:** Zaten sahip
- **EC2:** Mevcut (değişiklik yok)

**TOPLAM:** ₺0 (ekstra maliyet yok)

---

## ⚠️ SORUN GİDERME

### Sorun 1: Nginx başlamıyor

```bash
# Logları kontrol et
sudo tail -f /var/log/nginx/error.log

# Config test
sudo nginx -t
```

---

### Sorun 2: 502 Bad Gateway

**Sebep:** Backend çalışmıyor olabilir

```bash
# Backend durumunu kontrol et
pm2 status

# Backend'i başlat
pm2 restart basvideo-backend
```

---

### Sorun 3: SSL Sertifikası Alınamıyor

**Sebep:** DNS yayılmamış olabilir

```bash
# DNS kontrolü
nslookup api.basvideo.com

# Bekle: DNS propagation (5-30 dakika)
```

---

### Sorun 4: Port 80/443 Erişilemiyor

**Sebep:** Security Group ayarları

**Çözüm:**
1. AWS Console → EC2 → Security Groups
2. `basvideo-backend-sg` → Edit inbound rules
3. Port 80 ve 443 ekle

---

## 🎯 ÖZET

**Nginx kurulumu:**
- ✅ HTTPS/SSL ekler (ücretsiz)
- ✅ Domain yönlendirme yapar
- ✅ Standart portlar kullanır
- ✅ Reverse proxy olarak çalışır
- ✅ Daha güvenli ve profesyonel

**Süre:** 30-60 dakika  
**Maliyet:** ₺0  
**Önerilen:** ✅ Evet, kesinlikle kur!

---

**Son Güncelleme:** 5 Ocak 2025  
**Durum:** ✅ Hazır ve Test Edilmiş


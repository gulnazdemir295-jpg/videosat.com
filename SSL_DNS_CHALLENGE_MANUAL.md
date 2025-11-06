# 🔒 SSL SERTİFİKASI - DNS CHALLENGE (MANUEL)

**Durum:** HTTP challenge çalışmıyor (timeout)  
**Çözüm:** DNS challenge kullan (HTTP port gerektirmez)

---

## 🎯 ADIM ADIM

### 1️⃣ EC2 Terminal'inde Komutu Çalıştır

**EC2'ye bağlı olduğunuz terminal'de:**

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

---

### 2️⃣ Certbot Size Soracak

**Certbot şunu söyleyecek:**

```
Please deploy a DNS TXT record under the name:
_acme-challenge.api.basvideo.com

with the following value:

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
(a very long string)

Press Enter to Continue
```

**⚠️ ÖNEMLİ:** Enter'a basmayın! Önce DNS kaydını ekleyin!

---

### 3️⃣ DNS TXT Kaydı Ekle

**Domain sağlayıcınızın DNS panelinde (basvideo.com):**

1. **Type:** TXT
2. **Name:** `_acme-challenge.api` (veya sadece `_acme-challenge`)
3. **Value:** Certbot'un verdiği uzun string (tam olarak kopyala-yapıştır)
4. **TTL:** 300 (veya default)
5. **Kaydet**

---

### 4️⃣ DNS Yayılmasını Bekle

**5-10 dakika bekle** (DNS TXT kaydı yayılması için)

**Kontrol (lokal bilgisayarınızda):**
```bash
nslookup -type=TXT _acme-challenge.api.basvideo.com
```

**VEYA:**
```bash
dig TXT _acme-challenge.api.basvideo.com
```

**Beklenen:** Certbot'un verdiği string görünmeli

---

### 5️⃣ Certbot'a Devam Et

**DNS yayıldıktan sonra:**

1. EC2 terminal'inde
2. Certbot'un beklediği yerde
3. **Enter** basın
4. Certbot doğrulayacak ve sertifika alacak

**Başarılı olursa:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/api.basvideo.com/fullchain.pem
```

---

### 6️⃣ Nginx Config'e SSL Ekle

**Sertifika alındıktan sonra:**

```bash
sudo nano /etc/nginx/sites-available/basvideo-backend
```

**İçeriği şöyle yap:**

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name api.basvideo.com 107.23.178.153;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name api.basvideo.com;

    # SSL sertifikaları
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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Kaydet:** `Ctrl+X` → `Y` → `Enter`

---

### 7️⃣ Nginx'i Test Et ve Yeniden Başlat

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

### 8️⃣ HTTPS Test

```bash
curl https://api.basvideo.com/api/health
```

**Beklenen:** `{"ok":true}`

---

## 📋 ÖZET

1. ✅ EC2 terminal'inde: `sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com`
2. ✅ Certbot'un verdiği TXT string'i kopyala
3. ✅ DNS panelinde TXT kaydı ekle
4. ✅ 5-10 dakika bekle (DNS yayılması)
5. ✅ EC2 terminal'inde Enter'a bas
6. ✅ Nginx config'e SSL ekle
7. ✅ Nginx'i yeniden başlat
8. ✅ HTTPS test et

---

**EC2 terminal'inde komutu çalıştırın ve sonucu paylaşın!** 🚀


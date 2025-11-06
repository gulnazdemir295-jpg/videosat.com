# 🔒 SSL SERTİFİKASI - SSH KEY İLE ÇÖZÜM

**Durum:** EC2 Instance Connect çalışmıyor  
**Çözüm:** SSH key ile bağlanıp DNS challenge yapacağız

---

## 🎯 ÇÖZÜM: DNS CHALLENGE (SSH KEY İLE)

**Downloads klasöründeki key çalışıyor:** `~/Downloads/basvideo-backend-key.pem`

---

## 📋 ADIM ADIM

### 1️⃣ Lokal Terminal'de SSH Bağlan

**Mac terminal'inizde:**

```bash
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
```

**Bağlantı başarılı olursa:** EC2 terminal'inde olmalısınız.

---

### 2️⃣ DNS Challenge Komutu

**EC2 terminal'inde:**

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

---

### 3️⃣ Certbot Size Soracak

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

### 4️⃣ DNS TXT Kaydı Ekle

**Domain sağlayıcınızın DNS panelinde:**

1. **Type:** TXT
2. **Name:** `_acme-challenge.api` (veya sadece `_acme-challenge`)
3. **Value:** Certbot'un verdiği uzun string (tam olarak)
4. **TTL:** 300
5. **Kaydet**

---

### 5️⃣ DNS Yayılmasını Bekle

**5-10 dakika bekle**

**Kontrol (yeni terminal açın):**
```bash
nslookup -type=TXT _acme-challenge.api.basvideo.com
```

**Beklenen:** Certbot'un verdiği string görünmeli

---

### 6️⃣ Certbot'a Devam Et

**DNS yayıldıktan sonra:**

1. EC2 terminal'inde (SSH bağlantısı hala açık)
2. Certbot'un beklediği yerde
3. **Enter** basın
4. Sertifika alınacak

---

### 7️⃣ Nginx Config'e SSL Ekle

**Sertifika alındıktan sonra (EC2 terminal'inde):**

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

    ssl_certificate /etc/letsencrypt/live/api.basvideo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.basvideo.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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

### 8️⃣ Nginx'i Yeniden Başlat

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

### 9️⃣ HTTPS Test

```bash
curl https://api.basvideo.com/api/health
```

**Beklenen:** `{"ok":true}`

---

## 🚀 HAZIR MISINIZ?

**1. Mac terminal'inizde SSH bağlanın:**
```bash
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
```

**2. EC2 terminal'inde DNS challenge komutunu çalıştırın:**
```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

**3. Certbot'un verdiği TXT string'i paylaşın, DNS kaydını birlikte ekleyelim!**

---

**SSH bağlantısını yaptınız mı?** 🚀


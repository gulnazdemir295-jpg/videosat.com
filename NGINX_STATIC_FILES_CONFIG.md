# 📁 Nginx Static Files Serving - services/ Dizini

**Sorun:** Backend'den static files serve edilemiyor  
**Çözüm:** Nginx üzerinden static files serve et (daha hızlı ve doğru)

---

## 🔧 NGINX CONFIG DÜZENLEME

### EC2 Terminal'inde:

```bash
sudo nano /etc/nginx/sites-available/basvideo-backend
```

---

## 📝 CONFIG'E EKLEYİN

**Mevcut config'e `location /services/` bloğunu ekleyin (location /'dan ÖNCE):**

```nginx
server {
    listen 443 ssl http2;
    server_name api.basvideo.com;

    ssl_certificate /etc/letsencrypt/live/api.basvideo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.basvideo.com/privkey.pem;
    
    # Static files serving (services/ dizini için)
    location /services/ {
        alias /home/ubuntu/services/;
        try_files $uri =404;
        add_header Cache-Control "public, max-age=3600";
    }
    
    # ACME challenge (Let's Encrypt için)
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri =404;
    }

    # Backend API
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

## ✅ KAYDETME VE TEST

### 1. Kaydet:
- `Ctrl+X` → `Y` → `Enter`

### 2. Config test:
```bash
sudo nginx -t
```

**Beklenen:** `syntax is ok` ve `test is successful`

### 3. Nginx reload:
```bash
sudo systemctl reload nginx
```

---

## 🧪 TEST

### 1. Static file test:
```bash
curl https://api.basvideo.com/services/notification-service.js | head -30
```

**Beklenen:** JavaScript kodu görünmeli

### 2. Tarayıcıdan test:
```
https://api.basvideo.com/services/notification-service.js
```

**Beklenen:** Dosya içeriği görünmeli

---

## 📋 ÖNEMLİ NOTLAR

- **`location /services/`** bloğu **`location /`** bloğundan **ÖNCE** olmalı
- **`alias`** kullanıyoruz (root değil) - `/services/` path'i için
- Dosyalar `/home/ubuntu/services/` altında olmalı

---

## 🚀 SONRA

Config'i kaydettikten sonra:
1. `sudo nginx -t` (test)
2. `sudo systemctl reload nginx` (reload)
3. Test: `curl https://api.basvideo.com/services/notification-service.js`

---

**Son Güncelleme:** 6 Kasım 2025  
**Durum:** ✅ Hazır


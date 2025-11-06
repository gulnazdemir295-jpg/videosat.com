# 📝 Nginx Config - Tam Versiyon (Static Files ile)

**Dosya:** `/etc/nginx/sites-available/basvideo-backend`

---

## 🔧 TAM CONFIG

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

    # Let's Encrypt ACME challenge için
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri =404;
    }

    # Static files serving (services/ dizini için) - ÖNEMLİ: location /'dan ÖNCE!
    location /services/ {
        alias /home/ubuntu/services/;
        try_files $uri =404;
        add_header Cache-Control "public, max-age=3600";
    }

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

---

## 📋 EKLEME ADIMLARI

### 1. Nano'da `location /` bloğunu bulun

### 2. `location /` bloğundan ÖNCE şunu ekleyin:

```nginx
    # Static files serving (services/ dizini için)
    location /services/ {
        alias /home/ubuntu/services/;
        try_files $uri =404;
        add_header Cache-Control "public, max-age=3600";
    }
```

### 3. Kaydet: `Ctrl+X` → `Y` → `Enter`

---

## ⚠️ ÖNEMLİ

- `location /services/` bloğu `location /` bloğundan **ÖNCE** olmalı
- Nginx location'ları yukarıdan aşağıya sırayla kontrol eder
- Eğer `location /` önce gelirse, `/services/` istekleri backend'e gider

---

## ✅ SONRA

1. `sudo nginx -t` (test)
2. `sudo systemctl reload nginx` (reload)
3. Test: `curl https://api.basvideo.com/services/notification-service.js`

---

**Son Güncelleme:** 6 Kasım 2025


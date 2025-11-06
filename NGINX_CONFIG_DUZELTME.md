# 🔧 Nginx Config Düzeltme - Hata Düzeltme

**Sorun:** `location /.well-known/acme-challenge/` bloğu düzgün kapatılmamış ve `location /services/` yanlış yere eklenmiş.

---

## ❌ YANLIŞ FORMAT (Şu anki):

```nginx
location /.well-known/acme-challenge/ {
    root /var/www/html    # Static files serving (services/ dizini için)

location /services/ {
    alias /home/ubuntu/services/;
    try_files $uri =404;
    add_header Cache-Control "public, max-age=3600";
};

    try_files $uri =404;
}
```

---

## ✅ DOĞRU FORMAT:

```nginx
    # Let's Encrypt ACME challenge için
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri =404;
    }

    # Static files serving (services/ dizini için)
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
```

---

## 📋 DÜZELTME ADIMLARI

### 1. Nano'da yanlış bloğu silin

### 2. Doğru formatı ekleyin:

- `location /.well-known/acme-challenge/` bloğunu düzgün kapatın (noktalı virgül ekleyin)
- `location /services/` bloğunu ayrı bir blok olarak ekleyin
- Her blok kendi `{}` içinde olmalı

### 3. Kaydet: `Ctrl+X` → `Y` → `Enter`

---

## ⚠️ ÖNEMLİ

- Her `location` bloğu kendi `{}` içinde olmalı
- `root /var/www/html;` satırının sonunda noktalı virgül (`;`) olmalı
- Bloklar birbirinden ayrı olmalı (iç içe değil)

---

## ✅ SONRA

1. `sudo nginx -t` (test)
2. `sudo systemctl reload nginx` (reload)
3. Test: `curl https://api.basvideo.com/services/notification-service.js`

---

**Son Güncelleme:** 6 Kasım 2025


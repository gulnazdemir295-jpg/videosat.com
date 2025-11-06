# ⚡ NGINX HIZLI KOMUTLAR - KOPYALA YAPIŞTIR

**EC2 IP:** 107.23.178.153  
**SSH Key:** `basvideo-backend-key.pem` (veya sizin key dosyanız)

---

## 🔌 1. EC2'YE BAĞLAN

```bash
ssh -i ~/.ssh/basvideo-backend-key.pem ubuntu@107.23.178.153
```

---

## 📦 2. NGINX KUR (TEK SEFERDE)

```bash
sudo apt update && sudo apt install nginx -y && sudo systemctl start nginx && sudo systemctl enable nginx && sudo systemctl status nginx
```

---

## ⚙️ 3. NGINX CONFIG OLUŞTUR

```bash
sudo tee /etc/nginx/sites-available/basvideo-backend > /dev/null <<'EOF'
server {
    listen 80;
    server_name api.basvideo.com 107.23.178.153;

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
EOF
```

---

## 🔗 4. NGINX SITE AKTİF ET

```bash
sudo ln -s /etc/nginx/sites-available/basvideo-backend /etc/nginx/sites-enabled/ && sudo rm -f /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl restart nginx
```

---

## 🧪 5. TEST ET

```bash
curl http://localhost/api/health
```

**Beklenen:** `{"ok":true}`

---

## 🔒 6. SSL SERTİFİKASI (DNS YAYILDIKTAN SONRA)

```bash
sudo apt install certbot python3-certbot-nginx -y && sudo certbot --nginx -d api.basvideo.com
```

**Sorular:**
- Email: Email'inizi girin
- Terms: `A` yazın, Enter
- Share email: `N` yazın, Enter
- Redirect: `2` yazın, Enter

---

## ✅ 7. HTTPS TEST

```bash
curl https://api.basvideo.com/api/health
```

**Beklenen:** `{"ok":true}`

---

## 🔍 YARDIMCI KOMUTLAR

### Nginx Durumu
```bash
sudo systemctl status nginx
```

### Nginx Log'ları
```bash
sudo tail -f /var/log/nginx/error.log
```

### Backend Durumu
```bash
pm2 status
```

### Backend Log'ları
```bash
pm2 logs basvideo-backend
```

### DNS Kontrolü (Lokal bilgisayarınızda)
```bash
nslookup api.basvideo.com
```

---

**Not:** DNS ayarları domain sağlayıcınızın panelinden yapılmalı!


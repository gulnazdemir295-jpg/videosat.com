# ✅ DNS YAYILDI - SSL SERTİFİKASI AL

**Durum:** DNS TXT kaydı doğru ve yayıldı ✅  
**Sonraki adım:** EC2 terminal'inde Enter'a bas

---

## 🎯 EC2 TERMINAL'İNDE

**SSH bağlantınız açık mı?** (`ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153`)

**Eğer kapandıysa tekrar bağlanın:**
```bash
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
```

---

## 📋 EC2 TERMINAL'İNDE YAPILACAKLAR

### 1. Certbot'un Beklediği Yerde

**EC2 terminal'inde şunu görmelisiniz:**
```
Press Enter to Continue
```

**Şimdi:**
1. **Enter'a basın** ⏎
2. Certbot DNS'i kontrol edecek
3. ✅ SSL sertifikası alınacak!

---

### 2. Başarılı Olursa

**Başarılı mesaj:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/api.basvideo.com/fullchain.pem
```

**Sonra:**
1. Nginx config'e SSL ekleyeceğiz
2. HTTPS test edeceğiz
3. Tamamlandı! ✅

---

## 🚀 SONRAKI ADIMLAR (Sertifika alındıktan sonra)

### Adım 1: Nginx Config'e SSL Ekle

**EC2 terminal'inde:**
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

### Adım 2: Nginx'i Test Et ve Yeniden Başlat

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

### Adım 3: HTTPS Test

```bash
curl https://api.basvideo.com/api/health
```

**Beklenen:** `{"ok":true}`

---

## 🎉 ÖZET

**Şu an:**
- ✅ DNS yayıldı
- ✅ Value doğru
- ⏳ EC2 terminal'inde Enter'a bas

**Enter'a bastıktan sonra:**
- ✅ SSL sertifikası alınacak
- ✅ Nginx config'e SSL ekleyeceğiz
- ✅ HTTPS çalışacak!

---

**EC2 terminal'inde Enter'a basın ve sonucu paylaşın!** 🚀


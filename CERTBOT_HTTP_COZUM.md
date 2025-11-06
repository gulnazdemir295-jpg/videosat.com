# 🚀 Certbot HTTP-01 Challenge - DNS Sorunu Çözümü

**Sorun:** DNS TXT kaydı 5 kez denendi, hala çalışmıyor  
**Çözüm:** HTTP-01 challenge kullanacağız (DNS'e gerek YOK!)

---

## ✅ AVANTAJLAR

- ✅ **DNS TXT kaydına gerek YOK!**
- ✅ **Otomatik** (Certbot her şeyi yapar)
- ✅ **Daha hızlı** (DNS propagation bekleme yok)
- ✅ **Daha kolay** (tek komut)

---

## 📋 ÖN KOŞULLAR

1. ✅ Nginx kurulu ve çalışıyor
2. ✅ Port 80 açık (Security Group)
3. ✅ `api.basvideo.com` DNS A kaydı var (107.23.178.153)
4. ✅ Nginx HTTP olarak çalışıyor

---

## 🚀 ADIM ADIM

### ADIM 1: Nginx Durumunu Kontrol Et

**EC2 terminal'inde:**

```bash
# Nginx çalışıyor mu?
sudo systemctl status nginx

# Port 80 dinleniyor mu?
sudo netstat -tlnp | grep :80
# VEYA
sudo ss -tlnp | grep :80
```

**Beklenen:** Nginx `active (running)` ve port 80 `LISTEN`

---

### ADIM 2: Nginx HTTP Config Kontrolü

**Nginx config dosyasını kontrol et:**

```bash
sudo cat /etc/nginx/sites-available/basvideo-backend
```

**HTTP config olmalı (SSL YOK):**

```nginx
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
    }
}
```

**Eğer SSL config varsa, HTTP'ye çevir (geçici olarak)**

---

### ADIM 3: Certbot Nginx Plugin ile SSL Al

**EC2 terminal'inde:**

```bash
sudo certbot --nginx -d api.basvideo.com
```

**Sorular:**
1. **Email adresi:** Email gir (örn: your@email.com)
2. **Terms of Service:** `A` (Agree)
3. **Share email:** `N` (No)
4. **HTTP to HTTPS redirect:** `2` (Redirect)

**Certbot otomatik olarak:**
- ✅ HTTP-01 challenge yapar
- ✅ SSL sertifikasını alır
- ✅ Nginx config'ini günceller
- ✅ HTTPS'e yönlendirir

---

### ADIM 4: Başarı Kontrolü

**Başarılı olursa:**

```
Congratulations! Your certificate and chain have been saved at:
/etc/letsencrypt/live/api.basvideo.com/fullchain.pem
```

**Test et:**

```bash
# HTTPS test
curl https://api.basvideo.com/api/health
```

**Beklenen:** `{"ok":true}`

---

## ⚠️ SORUN GİDERME

### Sorun 1: "Connection refused" veya "Timeout"

**Sebep:** Port 80 kapalı veya Nginx çalışmıyor

**Çözüm:**
```bash
# Nginx'i başlat
sudo systemctl start nginx

# Security Group'da port 80 açık mı kontrol et
# AWS Console → EC2 → Security Groups → Inbound Rules
```

---

### Sorun 2: "Domain not found"

**Sebep:** DNS A kaydı yok veya yayılmamış

**Çözüm:**
```bash
# DNS kontrolü
nslookup api.basvideo.com
# VEYA
dig api.basvideo.com
```

**Beklenen:** `107.23.178.153` IP'si görünmeli

---

### Sorun 3: "Too many requests"

**Sebep:** Let's Encrypt rate limit (5 başarısız deneme)

**Çözüm:** 1 saat bekleyin veya staging environment kullanın:

```bash
sudo certbot --nginx -d api.basvideo.com --staging
```

---

## 🎯 ÖZET

**HTTP-01 Challenge:**
- ✅ DNS TXT kaydına gerek YOK
- ✅ Otomatik (Certbot her şeyi yapar)
- ✅ Daha hızlı
- ✅ Daha kolay

**Komut:**
```bash
sudo certbot --nginx -d api.basvideo.com
```

---

**Nginx çalışıyor mu? Port 80 açık mı? Komutu çalıştıralım!** 🚀



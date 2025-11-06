# 🔒 SSL SERTİFİKASI - DNS CHALLENGE YÖNTEMİ

**Durum:** HTTP challenge çalışmıyor (timeout)  
**Çözüm:** DNS challenge kullan (HTTP port gerektirmez)

---

## 🎯 DNS CHALLENGE ADIMLARI

### 1️⃣ Certbot Komutu

**EC2 terminal'inde:**

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

XXXXXXXXXXXXX (uzun bir string)

Before continuing, verify the record is deployed.
```

---

### 3️⃣ DNS TXT Kaydı Ekle

**Domain sağlayıcınızın DNS panelinde:**

1. **Type:** TXT
2. **Name:** `_acme-challenge.api` (veya `_acme-challenge`)
3. **Value:** Certbot'un verdiği uzun string
4. **TTL:** 300 (veya default)
5. **Kaydet**

---

### 4️⃣ DNS Yayılmasını Bekle

**5-10 dakika bekle** (DNS yayılması için)

**Kontrol:**
```bash
nslookup -type=TXT _acme-challenge.api.basvideo.com
```

**Beklenen:** Certbot'un verdiği string görünmeli

---

### 5️⃣ Certbot'a Devam Et

**DNS yayıldıktan sonra:**

1. EC2 terminal'inde
2. Certbot'un beklediği yerde
3. **Enter** basın
4. Certbot doğrulayacak ve sertifika alacak

---

### 6️⃣ Nginx Config'e SSL Ekle

**Sertifika alındıktan sonra:**

```bash
# Nginx config'i manuel güncelle
sudo nano /etc/nginx/sites-available/basvideo-backend
```

**SSL ekle:**
```nginx
server {
    listen 443 ssl http2;
    server_name api.basvideo.com;

    ssl_certificate /etc/letsencrypt/live/api.basvideo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.basvideo.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        # ... proxy ayarları ...
    }
}

server {
    listen 80;
    server_name api.basvideo.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🎯 HIZLI YÖNTEM

**Eğer DNS challenge çok uzun sürerse:**

**Geçici çözüm:** Self-signed certificate kullan
- Browser'da güvenlik uyarısı verir
- Ama HTTPS çalışır
- Daha sonra Let's Encrypt ile değiştirilebilir

---

**DNS challenge yöntemini denemek ister misiniz?** 🚀


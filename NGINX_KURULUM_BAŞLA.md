# 🚀 NGINX KURULUMU - BAŞLANGIÇ

**Durum:** SSH bağlantısı manuel olarak yapılmalı  
**Adım adım komutları aşağıda**

---

## 📋 ADIM 1: EC2'YE BAĞLAN

**Terminal'inizde şu komutu çalıştırın:**

```bash
ssh -i ~/.ssh/basvideo-backend-key.pem ubuntu@107.23.178.153
```

**Eğer bağlanamazsanız:**
- SSH key dosyasının yolunu kontrol edin
- EC2 instance'ının çalıştığından emin olun
- Security Group'da port 22 (SSH) açık olmalı

**Bağlantı başarılı olursa:** EC2 terminal'inde olmalısınız.

---

## 📦 ADIM 2: NGINX KUR (KOPYALA-YAPIŞTIR)

**EC2 terminal'inde şu komutları çalıştırın (sırayla):**

```bash
# 1. Paket listesini güncelle
sudo apt update

# 2. Nginx kur
sudo apt install nginx -y

# 3. Nginx'i başlat ve otomatik başlatmayı etkinleştir
sudo systemctl start nginx
sudo systemctl enable nginx

# 4. Durumu kontrol et
sudo systemctl status nginx
```

**Beklenen:** `active (running)` görünmeli

---

## ⚙️ ADIM 3: NGINX CONFIG OLUŞTUR

**EC2 terminal'inde:**

```bash
# Config dosyası oluştur
sudo nano /etc/nginx/sites-available/basvideo-backend
```

**Açılan editörde şu içeriği yapıştırın:**

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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Kaydet:** `Ctrl+X` → `Y` → `Enter`

---

## 🔗 ADIM 4: NGINX SITE AKTİF ET

**EC2 terminal'inde:**

```bash
# Symbolic link oluştur
sudo ln -s /etc/nginx/sites-available/basvideo-backend /etc/nginx/sites-enabled/

# Default site'ı kaldır (opsiyonel)
sudo rm -f /etc/nginx/sites-enabled/default

# Config'i test et
sudo nginx -t
```

**Beklenen:** `syntax is ok` ve `test is successful`

---

## 🔄 ADIM 5: NGINX'İ YENİDEN BAŞLAT

```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

**Beklenen:** `active (running)`

---

## 🧪 ADIM 6: TEST ET

```bash
# Backend testi
curl http://localhost/api/health
```

**Beklenen:** `{"ok":true}`

**Eğer çalışmıyorsa:**
```bash
# Backend durumunu kontrol et
pm2 status

# Backend çalışmıyorsa başlat
pm2 restart basvideo-backend
```

---

## 🔐 ADIM 7: AWS SECURITY GROUP AYARLARI

**AWS Console'dan (tarayıcınızda):**

1. AWS Console → EC2 → Security Groups
2. `basvideo-backend-sg` (veya backend'inizin security group'u) seç
3. **Inbound rules** → **Edit inbound rules**
4. **Add rule** butonuna tıkla:
   - **Type:** HTTP
   - **Port:** 80
   - **Source:** 0.0.0.0/0
   - **Description:** Nginx HTTP
5. Tekrar **Add rule:**
   - **Type:** HTTPS
   - **Port:** 443
   - **Source:** 0.0.0.0/0
   - **Description:** Nginx HTTPS
6. **Save rules**

---

## 🌐 ADIM 8: DNS AYARLARI (DOMAIN SAĞLAYICINIZDA)

**basvideo.com domain sağlayıcınızın DNS panelinde:**

### A Kaydı Ekle:

**Type:** A  
**Name:** `api`  
**Value:** `107.23.178.153`  
**TTL:** `3600` (veya default)

**Kaydet ve bekle:** DNS propagation 5-30 dakika sürebilir.

---

## 🔍 ADIM 9: DNS KONTROLÜ

**Lokal bilgisayarınızda (yeni terminal):**

```bash
nslookup api.basvideo.com
```

**Beklenen:** `107.23.178.153` IP'si görünmeli

**Eğer görünmüyorsa:** 5-10 dakika bekleyip tekrar kontrol edin.

---

## 🔒 ADIM 10: SSL SERTİFİKASI (DNS YAYILDIKTAN SONRA)

**EC2 terminal'inde:**

```bash
# Certbot kur
sudo apt install certbot python3-certbot-nginx -y

# SSL sertifikası al
sudo certbot --nginx -d api.basvideo.com
```

**Sorular:**
1. **Email adresi:** Email'inizi girin
2. **Terms of Service:** `A` yazın, Enter
3. **Share email:** `N` yazın, Enter
4. **HTTP to HTTPS redirect:** `2` yazın, Enter

**Başarılı olursa:** SSL sertifikası otomatik yapılandırılacak.

---

## ✅ ADIM 11: HTTPS TEST

**Lokal bilgisayarınızda:**

```bash
curl https://api.basvideo.com/api/health
```

**Beklenen:** `{"ok":true}`

**Tarayıcıda test:**
```
https://api.basvideo.com/api/health
```

**Beklenen:** Yeşil kilit ikonu ve `{"ok":true}`

---

## 🎉 TAMAMLANDI!

**Nginx kurulumu başarılı!**

Artık:
- ✅ `https://api.basvideo.com` → Backend API
- ✅ HTTPS aktif
- ✅ Domain çalışıyor
- ✅ Canlı yayın sayfası çalışacak

---

## 📞 YARDIM

**Herhangi bir adımda sorun yaşarsanız:**
1. Hata mesajını paylaşın
2. Hangi adımda olduğunuzu belirtin
3. Birlikte çözelim!

---

**Hazır mısınız? Adım 1'den başlayalım!** 🚀


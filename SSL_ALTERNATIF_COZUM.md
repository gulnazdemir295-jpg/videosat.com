# 🔒 SSL SERTİFİKASI - ALTERNATİF ÇÖZÜM

**Sorun:** Let's Encrypt timeout alıyor  
**Sebep:** Security Group veya firewall sorunu

---

## 🔍 KONTROL

**Security Group'da port 80 kontrolü:**

1. **AWS Console → EC2 → Security Groups**
2. Security group'unu seç
3. **Gelen kurallar** (Inbound rules) kontrol et
4. **Port 80 (HTTP)** var mı?

**Eğer yoksa:**
- Port 80 ekle
- Kaynak: `Herkes` (0.0.0.0/0)

**Eğer varsa:**
- 5-10 dakika bekle (AWS ayarları yayılması için)
- Tekrar dene

---

## 🔄 ALTERNATİF: DNS-01 Challenge (Let's Encrypt)

**HTTP challenge çalışmazsa, DNS challenge kullanabiliriz:**

```bash
# EC2'de
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

**Bu yöntem:**
- DNS kaydı eklemenizi ister
- HTTP port gerektirmez
- Daha uzun sürer ama çalışır

---

## 🔄 ALTERNATİF 2: Self-Signed Certificate (Geçici)

**SSL için geçici çözüm:**

```bash
# EC2'de
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/api.basvideo.com.key \
  -out /etc/nginx/ssl/api.basvideo.com.crt \
  -subj "/CN=api.basvideo.com"

# Nginx config'e ekle
```

**Not:** Browser'da güvenlik uyarısı verir, ama çalışır.

---

## 🎯 ÖNERİLEN ÇÖZÜM

**Security Group'da port 80 kontrolü:**

1. Port 80 **kesinlikle** olmalı
2. Kaynak: `0.0.0.0/0` (Herkes)
3. 5-10 dakika bekle
4. SSL sertifikasını tekrar al

**Eğer hala çalışmazsa:**
- DNS challenge kullan
- Veya self-signed certificate (geçici)

---

**Security Group'da port 80 var mı? Kontrol edip haber verin!** 🚀


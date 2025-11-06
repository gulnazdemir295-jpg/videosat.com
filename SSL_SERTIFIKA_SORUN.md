# 🔒 SSL SERTİFİKASI SORUNU - FIREWALL

**Hata:** Let's Encrypt ACME challenge'a erişemiyor  
**Sebep:** Security Group'da port 80 veya firewall sorunu

---

## 🔍 SORUN TESPİTİ

**Let's Encrypt şunu deniyor:**
```
http://api.basvideo.com/.well-known/acme-challenge/...
```

**Ama erişemiyor:** Timeout (firewall problem)

---

## ✅ ÇÖZÜM: SECURITY GROUP AYARLARI

### AWS Console'dan:

1. **AWS Console → EC2 → Security Groups**
2. **`basvideo-backend-sg` (veya backend'inizin security group'u) seç**
3. **Inbound rules → Edit inbound rules**
4. **Şu kuralları ekle/kontrol et:**

**Kural 1:**
- **Type:** HTTP
- **Port:** 80
- **Source:** `0.0.0.0/0` (tüm IP'ler)
- **Description:** Let's Encrypt HTTP

**Kural 2:**
- **Type:** HTTPS
- **Port:** 443
- **Source:** `0.0.0.0/0`
- **Description:** HTTPS

5. **Save rules**

---

## 🔍 KONTROL

**Security Group'da şunlar olmalı:**
- ✅ Port 22 (SSH) - Zaten var
- ✅ Port 80 (HTTP) - Let's Encrypt için gerekli
- ✅ Port 443 (HTTPS) - SSL için gerekli
- ✅ Port 4000 (Backend) - Zaten var

---

## 🧪 TEST

**Security Group ayarlarını yaptıktan sonra:**

```bash
# 1. HTTP test (port 80)
curl http://api.basvideo.com/api/health

# 2. ACME challenge test
curl http://api.basvideo.com/.well-known/acme-challenge/test

# 3. SSL sertifikası tekrar al
sudo certbot --nginx -d api.basvideo.com
```

---

## ⚠️ ÖNEMLİ

**Let's Encrypt doğrulaması için:**
- Port 80 **mutlaka açık** olmalı (HTTP)
- Let's Encrypt server'ları `api.basvideo.com` üzerinden erişebilmeli
- Security Group'da `0.0.0.0/0` (tüm IP'ler) olmalı

---

## 📋 ADIMLAR

1. ✅ AWS Console → EC2 → Security Groups
2. ✅ Security group'u seç
3. ✅ Inbound rules → Edit
4. ✅ Port 80 (HTTP) ekle → `0.0.0.0/0`
5. ✅ Port 443 (HTTPS) ekle → `0.0.0.0/0`
6. ✅ Save
7. ✅ SSL sertifikası tekrar al

---

**Security Group ayarlarını yaptınız mı?** 🚀


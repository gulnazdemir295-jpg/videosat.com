# 🔐 SECURITY GROUP KONTROLÜ - SSL İÇİN

**Sorun:** Let's Encrypt ACME challenge'a erişemiyor  
**Çözüm:** Security Group'da port 80 ve 443 açık olmalı

---

## 🎯 YAPILACAKLAR

### AWS Console'dan:

1. **AWS Console → EC2 → Security Groups**
2. **Instance'ınızın security group'unu bulun:**
   - Instance'ı seçin
   - **Security** tab → Security Group adını görün
   - Genellikle: `basvideo-backend-sg` veya benzeri

3. **Security Group'u seçin**
4. **Inbound rules → Edit inbound rules**
5. **Add rule** butonuna tıklayın

---

## 📋 EKLENECEK KURALLAR

### Kural 1: HTTP (Port 80) - Let's Encrypt için zorunlu

**Type:** HTTP  
**Port:** 80  
**Source:** `0.0.0.0/0`  
**Description:** `Let's Encrypt HTTP Challenge`

### Kural 2: HTTPS (Port 443) - SSL için

**Type:** HTTPS  
**Port:** 443  
**Source:** `0.0.0.0/0`  
**Description:** `HTTPS`

6. **Save rules**

---

## 🔍 KONTROL

**Security Group'da şunlar olmalı:**

| Type | Port | Source | Description |
|------|------|--------|-------------|
| SSH | 22 | My IP (veya 0.0.0.0/0) | SSH erişimi |
| HTTP | 80 | 0.0.0.0/0 | Let's Encrypt |
| HTTPS | 443 | 0.0.0.0/0 | HTTPS |
| Custom TCP | 4000 | 0.0.0.0/0 | Backend API |

---

## 🧪 TEST

**Security Group ayarlarını yaptıktan sonra (1-2 dakika bekle):**

```bash
# 1. HTTP test
curl http://api.basvideo.com/api/health

# 2. ACME challenge test
curl http://api.basvideo.com/.well-known/acme-challenge/test

# 3. SSL sertifikası al
sudo certbot --nginx -d api.basvideo.com
```

---

## ⚠️ ÖNEMLİ NOT

**Let's Encrypt doğrulaması için:**
- Port 80 **mutlaka açık** olmalı
- `0.0.0.0/0` (tüm IP'ler) olmalı
- Let's Encrypt server'ları erişebilmeli

**Güvenlik:**
- Port 80/443 sadece HTTP/HTTPS için
- Backend port 4000 ayrı bir kuralda
- SSH port 22 sadece My IP olabilir (güvenlik için)

---

## 📞 YARDIM

**Security Group ayarlarını yaptınız mı?**

1. AWS Console → EC2 → Security Groups
2. Security group'u seç
3. Inbound rules → Edit
4. Port 80 ve 443 ekle
5. Save

**Yaptıktan sonra haber verin, SSL sertifikasını tekrar alalım!** 🚀


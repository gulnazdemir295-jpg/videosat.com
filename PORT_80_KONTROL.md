# 🔍 PORT 80 KONTROLÜ

**Durum:** Port 443 zaten var ✅  
**Kontrol:** Port 80 (HTTP) var mı?

---

## 🔍 KONTROL

**Gelen kurallarda port 80 var mı?**

**Security Group'da şunları kontrol edin:**

1. **Gelen kurallar** (Inbound rules) listesinde
2. **Port 80** (HTTP) var mı kontrol edin

**Eğer yoksa:**
- Port 80 ekleyin (HTTP)
- Kaynak: `Herkes` (0.0.0.0/0)

---

## 📋 MEVCUT KURALLAR

**Şu anda olması gerekenler:**

| Port | Tür | Durum |
|------|-----|-------|
| 443 | HTTPS | ✅ Var (kullanıcı onayladı) |
| 80 | HTTP | ❓ Kontrol et |
| 4000 | Custom TCP | ❓ Kontrol et |
| 22 | SSH | ❓ Kontrol et |

---

## ✅ PORT 80 EKLEME

**Eğer port 80 yoksa:**

1. **Kural ekle** (Add rule)
2. **Tür:** `HTTP` seç
3. **Port:** `80` (otomatik dolar)
4. **Kaynak:** `Herkes` (0.0.0.0/0)
5. **Açıklama:** `Let's Encrypt HTTP`
6. **Kuralları kaydet**

---

## 🧪 TEST

**Port 80 ekledikten sonra (1-2 dakika bekleyin):**

```bash
# HTTP test
curl http://api.basvideo.com/api/health

# SSL sertifikası al
sudo certbot --nginx -d api.basvideo.com
```

---

**Port 80 (HTTP) var mı? Kontrol edip haber verin!** 🚀


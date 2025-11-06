# 🔧 Security Group Port 80 Düzeltme

**Sorun:** Port 80 sadece `95.10.3.43/32` IP'sine açık  
**Çözüm:** Port 80'i `0.0.0.0/0` olarak değiştirmek

---

## ❌ MEVCUT DURUM

**Port 80 (HTTP) Kuralı:**
- Security Group Rule ID: `sgr-018f210acc440f819`
- Port: `80`
- Protocol: `TCP`
- Source: `95.10.3.43/32` ❌ (Sadece bir IP'ye açık)

**Sorun:** Let's Encrypt sunucuları bu IP'den erişemez!

---

## ✅ YAPILACAK DEĞİŞİKLİK

**Port 80 (HTTP) Kuralını Düzelt:**

1. **AWS Console → EC2 → Security Groups**
2. **Security Group'u seçin**
3. **Inbound rules → Edit inbound rules**
4. **Port 80 kuralını bulun** (sgr-018f210acc440f819)
5. **Kuralı seçin ve 'Düzenle' (Edit) butonuna tıklayın**
6. **Source'u değiştirin:**
   - **ESKİ:** `95.10.3.43/32`
   - **YENİ:** `0.0.0.0/0`
7. **'Kaydet' (Save) butonuna tıklayın**

---

## 📋 SONUÇ

**Port 80 (HTTP) Kuralı (Düzeltilmiş):**
- Security Group Rule ID: `sgr-018f210acc440f819`
- Port: `80`
- Protocol: `TCP`
- Source: `0.0.0.0/0` ✅ (Tüm IP'lere açık)

---

## 🧪 TEST

**Düzeltmeyi yaptıktan sonra (1-2 dakika bekle):**

```bash
# EC2 terminal'inde
curl -I http://107.23.178.153

# Mac Terminal'den
curl -I http://107.23.178.153

# Domain test
curl -I http://api.basvideo.com
```

**Beklenen:** `HTTP/1.1 200 OK` veya benzeri

---

## 🚀 SONRAKI ADIM

**Port 80 düzeltildikten sonra:**

```bash
sudo certbot --nginx -d api.basvideo.com
```

**Bu sefer başarılı olmalı!** ✅

---

## ⚠️ GÜVENLİK NOTU

- **Port 80:** Let's Encrypt için `0.0.0.0/0` olmalı (geçici olarak)
- **Port 443:** HTTPS için `0.0.0.0/0` olmalı
- **Port 22:** SSH için `95.10.3.43/32` kalabilir (güvenlik için)
- **Port 4000:** Backend için `0.0.0.0/0` olabilir (Nginx üzerinden erişilecek)

**SSL sertifikası alındıktan sonra:**
- Port 80'i kapatabilirsiniz (HTTPS redirect yapıyor)
- Veya `95.10.3.43/32` olarak kısıtlayabilirsiniz

---

**🚀 Port 80'i düzelttiniz mi? Sonra Certbot'u tekrar çalıştıracağız!**


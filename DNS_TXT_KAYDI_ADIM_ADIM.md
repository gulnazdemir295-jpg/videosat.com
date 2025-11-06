# 📝 DNS TXT KAYDI EKLEME - ADIM ADIM

**Certbot'un istediği değer:**
```
_acme-challenge.api.basvideo.com
Value: JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8
```

---

## 🎯 ADIM ADIM

### 1️⃣ Domain Sağlayıcınızın DNS Paneline Gidin

**basvideo.com domain'inin DNS yönetim paneli:**
- Namecheap, GoDaddy, Cloudflare, Route 53, vs.
- DNS yönetim sayfasına gidin

---

### 2️⃣ TXT Kaydı Ekle

**DNS panelinde:**

1. **"DNS Kayıtları"** veya **"DNS Records"** veya **"Manage DNS"** bölümüne gidin
2. **"Add Record"** veya **"Kayıt Ekle"** butonuna tıklayın
3. Şu bilgileri girin:

   **Type:** `TXT` (Text Record)
   
   **Name/Host:** `_acme-challenge.api` 
   - VEYA sadece `_acme-challenge`
   - VEYA tam olarak `_acme-challenge.api.basvideo.com`
   
   **Value/Content:** `JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8`
   - **TAM OLARAK** bu string'i kopyala-yapıştır
   
   **TTL:** `300` (veya default - 3600)

4. **"Save"** veya **"Kaydet"** butonuna tıklayın

---

### 3️⃣ DNS Yayılmasını Bekle

**5-10 dakika bekle** (bazen daha hızlı olabilir)

**Kontrol edelim (her 30 saniyede bir):**

```bash
nslookup -type=TXT _acme-challenge.api.basvideo.com
```

**Beklenen:** `JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8` görünmeli

---

### 4️⃣ EC2 Terminal'inde Enter'a Bas

**DNS yayıldıktan sonra:**

1. EC2 terminal'inizde (SSH bağlantısı hala açık)
2. Certbot'un beklediği yerde
3. **Enter** basın
4. SSL sertifikası alınacak! ✅

---

## 📋 ÖZET

**DNS Kaydı:**
- **Type:** TXT
- **Name:** `_acme-challenge.api`
- **Value:** `JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8`
- **TTL:** 300

**Sonra:**
1. 5-10 dakika bekle
2. DNS kontrolü yap
3. EC2 terminal'inde Enter bas
4. SSL sertifikası al!

---

**DNS kaydını eklediniz mi? Ekledikten sonra haber verin, birlikte kontrol edelim!** 🚀


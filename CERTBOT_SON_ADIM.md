# 🎯 Certbot Son Adım - SSL Sertifikası Alıyoruz

**Durum:** EC2'ye bağlandınız ✅  
**Sıradaki:** Certbot komutunu çalıştırıp SSL sertifikasını alacağız

---

## 📋 ADIM ADIM

### ADIM 1: Certbot Komutunu Çalıştır

**EC2 terminal'inde (şu anda bağlı olduğunuz yerde) şu komutu çalıştırın:**

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

---

### ADIM 2: Certbot'un Çıktısını Bekleyin

**Certbot size şunu soracak:**

```
Please deploy a DNS TXT record under the name
_acme-challenge.api.basvideo.com with the following value:

[YENİ BİR VALUE BURADA OLACAK]

Before continuing, verify the record is deployed.
Press Enter to Continue
```

---

### ADIM 3: Yeni DNS TXT Kaydını Kontrol Edin

**ÖNEMLİ:** Certbot her seferinde yeni bir value üretir!

**Eğer yeni bir value görürseniz:**
1. GoDaddy DNS paneline gidin
2. Eski TXT kaydını silin
3. Yeni value ile yeni TXT kaydı ekleyin:
   - **Name:** `_acme-challenge.api`
   - **Value:** Certbot'un verdiği yeni value (tırnak YOK!)
   - **TTL:** 600 (veya minimum)

**Eğer aynı value görürseniz:**
- DNS kaydı zaten doğru, Enter'a basın!

---

### ADIM 4: Enter'a Basın

**DNS kaydını kontrol ettikten sonra Enter'a basın ⏎**

**Başarılı olursa:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/api.basvideo.com/fullchain.pem
Key is saved at: /etc/letsencrypt/live/api.basvideo.com/privkey.pem
```

**Hata alırsanız:**
- Hata mesajını bana gönderin, birlikte çözelim!

---

## 🚀 ŞİMDİ NE YAPMALIYIZ?

1. **Certbot komutunu çalıştırın:** `sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com`
2. **Certbot'un verdiği value'yu kontrol edin**
3. **Eğer yeni value varsa, GoDaddy'de güncelleyin**
4. **Enter'a basın**
5. **Sonucu paylaşın!**

---

**Certbot komutunu çalıştırdınız mı? Ne görüyorsunuz?** 🚀



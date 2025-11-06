# 🤝 Birlikte Certbot Çalıştırma

**Durum:** EC2'ye bağlandık ✅  
**Sonraki:** Certbot komutunu interaktif modda çalıştıralım

---

## 📋 ADIM ADIM

### ADIM 1: Mac Terminal'de SSH Bağlantısı ✅

**Terminal'de şu komutu çalıştırın:**

```bash
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
```

**Başarılı olursa şunu göreceksiniz:**
```
ubuntu@ip-172-31-31-180:~$
```

---

### ADIM 2: Certbot Komutunu Çalıştır

**EC2 terminal'inde (SSH bağlantısı açıkken):**

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

**Certbot şunu gösterecek:**
```
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Requesting a certificate for api.basvideo.com

Please deploy a DNS TXT record under the name
_acme-challenge.api.basvideo.com with the following value:

[YENİ BİR VALUE GÖRECEKSİNİZ - ÖNCEKİ DEĞİL!]

Before continuing, verify the record is deployed.
Press Enter to Continue
```

---

### ADIM 3: Certbot'un Verdiği Value'yu Paylaşın

**Certbot size YENİ bir TXT value verecek.**

**Lütfen bu value'yu bana gönderin!** 

Örnek format:
```
abc123xyz456def789...
```

**VEYA tam çıktıyı paylaşın:**
```
Please deploy a DNS TXT record under the name
_acme-challenge.api.basvideo.com with the following value:

[VALUE BURADA]
```

---

### ADIM 4: DNS Kaydını Ekleyelim

**Ben size GoDaddy'de nasıl ekleneceğini söyleyeceğim:**
1. Önceki kaydı sil
2. Yeni kayıt ekle
3. Value'yu doğru yap

---

### ADIM 5: DNS Yayılmasını Kontrol

**Ben DNS yayılmasını kontrol edeceğim.**

---

### ADIM 6: Enter'a Bas

**DNS yayıldıktan sonra:**
- EC2 terminal'inde Enter'a basın
- ✅ Sertifika alınacak!

---

## 🚀 ŞİMDİ NE YAPMALIYIZ?

1. **Mac Terminal'de SSH bağlantısı açın** (yukarıdaki komut)
2. **Certbot komutunu çalıştırın** (yukarıdaki komut)
3. **Certbot'un verdiği value'yu bana gönderin**
4. **Birlikte DNS'i ekleyelim!**

---

**SSH bağlantısını açtınız mı? Certbot komutunu çalıştırdınız mı?** 🚀


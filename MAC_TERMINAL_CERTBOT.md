# 💻 Mac Terminal'den Certbot Çalıştırma

**Durum:** SSH ile EC2'ye bağlandınız, şimdi Certbot çalıştıracağız

---

## 📋 ADIM ADIM

### ADIM 1: Mac Terminal'de SSH Bağlantısı

**Mac Terminal'de şu komutu çalıştırın:**

```bash
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
```

**Bağlandıktan sonra şunu göreceksiniz:**
```
ubuntu@ip-172-31-31-180:~$
```

✅ **EC2'ye bağlandınız!**

---

### ADIM 2: Certbot Komutunu Çalıştırın

**EC2 terminal'inde (Mac Terminal'den SSH ile bağlandıktan sonra) şu komutu çalıştırın:**

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

---

### ADIM 3: Certbot'un Çıktısını Bekleyin

**Certbot şunu soracak:**

```
Please deploy a DNS TXT record under the name
_acme-challenge.api.basvideo.com with the following value:

[VALUE BURADA]

Before continuing, verify the record is deployed.
Press Enter to Continue
```

---

### ADIM 4: Value Kontrolü

**Eğer Certbot yeni value verirse:**
- Yeni value'yu bana gönderin
- GoDaddy'ye ekleyeceğiz

**Eğer Certbot mevcut value'yu sorarsa:**
- Mevcut value: `-02yOWYNyaJ0k85VE3ZMhS6RLis2GZFLowuc_brMA3A`
- Bu value zaten DNS'de var, direkt Enter'a basın

**Eğer Certbot value sormazsa:**
- Direkt Enter'a basın

---

### ADIM 5: Enter'a Basın

**Terminal'de Enter'a basın ⏎**

**Başarılı olursa:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/api.basvideo.com/fullchain.pem
```

---

## 🚀 ŞİMDİ NE YAPMALIYIZ?

1. **Mac Terminal'de SSH ile EC2'ye bağlanın**
2. **Certbot komutunu çalıştırın**
3. **Certbot'un çıktısını bana gönderin**
4. **Birlikte devam edelim!**

---

**Mac Terminal'de SSH bağlantısını açtınız mı? Certbot komutunu çalıştırdınız mı?** 🚀




# ✅ DNS Kaydı Eklendi - Sıradaki Adımlar

**Durum:** DNS TXT kaydı GoDaddy'ye eklendi ✅  
**Sıradaki:** DNS kontrolü yapıp Certbot komutunu çalıştıracağız

---

## 📋 ADIM ADIM

### ADIM 1: DNS Propagation Bekleyin (1-2 dakika)

**DNS kaydının yayılması için 1-2 dakika bekleyin.**

---

### ADIM 2: DNS Kontrolü Yapın

**Google Admin Toolbox ile kontrol edin:**

🔗 **Link:** https://toolbox.googleapps.com/apps/dig/#TXT/_acme-challenge.api.basvideo.com

**Linke tıklayın ve şunu kontrol edin:**

**Doğru görünmesi gereken:**
```
ySxHOJ_GcTSyokiXicUVX1sxFYLLTI4TdYA4A1IglxY
```

**Eğer eski value görünüyorsa:**
- 2-3 dakika daha bekleyin
- GoDaddy'de kaydın doğru olduğundan emin olun

**Eğer yeni value görünüyorsa:**
- ✅ DNS kaydı doğru! Devam edebiliriz!

---

### ADIM 3: Certbot Komutunu Tekrar Çalıştırın

**EC2 terminal'inde (hala bağlıysanız):**

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

---

### ADIM 4: Certbot'un Çıktısını Bekleyin

**Certbot size şunu soracak:**

```
Please deploy a DNS TXT record under the name
_acme-challenge.api.basvideo.com with the following value:

[VALUE BURADA]

Before continuing, verify the record is deployed.
Press Enter to Continue
```

---

### ADIM 5: Value Kontrolü

**Eğer Certbot aynı value'yu gösterirse (`ySxHOJ_GcTSyokiXicUVX1sxFYLLTI4TdYA4A1IglxY`):**
- ✅ DNS kaydı doğru! Enter'a basın!

**Eğer Certbot yeni bir value gösterirse:**
- GoDaddy'de tekrar güncelleyin (eski kaydı sil, yeni ekle)
- 1-2 dakika bekleyin
- Enter'a basın

---

### ADIM 6: Enter'a Basın

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

1. ⏳ 1-2 dakika bekleyin (DNS propagation)
2. ⏳ Google Admin Toolbox ile kontrol edin
3. ⏳ Certbot komutunu çalıştırın
4. ⏳ Value'yu kontrol edin
5. ⏳ Enter'a basın

---

**1-2 dakika beklediniz mi? DNS kontrolü yaptınız mı?** 🚀



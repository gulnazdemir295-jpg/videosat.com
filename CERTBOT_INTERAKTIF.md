# 🔧 Certbot Interaktif Mod Çözümü

**Sorun:** Certbot non-interactive modda çalışmıyor  
**Çözüm:** Interaktif modda çalıştırmalıyız

---

## ⚠️ DURUM

**DNS yayıldı ve doğru! ✅**
- Value: `-02yOWYNyaJ0k85VE3ZMhS6RLis2GZFLowuc_brMA3A`
- Tüm DNS sunucularında görünüyor

**Ama Certbot interaktif mod gerektiriyor.**

---

## 🎯 ÇÖZÜM: Script ile Otomatikleştirme

**Ben bir script oluşturacağım, siz EC2'de çalıştıracaksınız.**

**VEYA**

**AWS Console'dan EC2 Instance Connect ile bağlanıp manuel komut çalıştırabilirsiniz.**

---

## 📋 MANUEL KOMUT (EC2 Terminal'de)

**Eğer EC2 terminal'ine erişebilirseniz:**

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

**Certbot soracak:**
```
Please deploy a DNS TXT record under the name
_acme-challenge.api.basvideo.com with the following value:

[YENİ VALUE GÖRECEKSİNİZ - ÖNCEKİ DEĞİL!]

Press Enter to Continue
```

**Yapılacaklar:**
1. **Yeni value'yu GoDaddy'ye ekleyin** (önceki kaydı silin)
2. **5-10 dakika bekleyin**
3. **Enter'a basın**
4. ✅ Sertifika alınacak!

---

## 🤖 ALTERNATİF: Ben Script Hazırlayacağım

**Ben bir script hazırlayacağım, siz EC2'de çalıştıracaksınız.**

**Hangisini tercih edersiniz?**
1. Manuel komut (EC2 terminal'de)
2. Script (ben hazırlayacağım)

---

**EC2 terminal'ine erişebiliyor musunuz?** 🚀


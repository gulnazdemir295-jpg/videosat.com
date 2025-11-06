# 🔄 Yeni Certbot Value Alma

**Sorun:** Eski DNS value hala görünüyor  
**Çözüm:** Yeni Certbot çalıştırıp yeni value alalım

---

## 📋 ADIM ADIM

### ADIM 1: GoDaddy'de Eski DNS Kaydını Sil

**GoDaddy DNS panelinde:**

1. `_acme-challenge.api` TXT kaydını bulun
2. **SİLİN** (Delete)
3. **Kaydet**

**ÖNEMLİ:** Eski kayıt tamamen silinmeli!

---

### ADIM 2: EC2 Terminal'de Yeni Certbot Çalıştır

**EC2 terminal'inde (SSH bağlantısı açıkken):**

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

**Certbot size YENİ bir value verecek!**

**Çıktı şöyle olacak:**
```
Please deploy a DNS TXT record under the name
_acme-challenge.api.basvideo.com with the following value:

[YENİ VALUE BURADA - ÖNCEKİNDEN FARKLI OLMALI!]

Press Enter to Continue
```

---

### ADIM 3: Yeni Value'yu Paylaşın

**Certbot'un verdiği YENİ value'yu bana gönderin!**

**Örnek:**
```
abc123xyz456def789ghi012jkl345...
```

**VEYA tam çıktıyı paylaşın.**

---

### ADIM 4: GoDaddy'ye Yeni Value'yu Ekleyelim

**Ben size tam adımları söyleyeceğim:**
1. Type: TXT
2. Name: `_acme-challenge.api`
3. Value: `[YENİ VALUE]` (tırnak YOK!)
4. TTL: 300
5. Kaydet

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

1. **GoDaddy'de eski DNS kaydını silin**
2. **EC2 terminal'de yeni Certbot komutunu çalıştırın**
3. **Yeni value'yu bana gönderin**
4. **Birlikte DNS'i ekleyelim!**

---

**Eski DNS kaydını sildiniz mi? Yeni Certbot komutunu çalıştırdınız mı?** 🚀


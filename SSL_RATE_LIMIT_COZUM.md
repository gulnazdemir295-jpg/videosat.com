# ⏰ SSL SERTİFİKASI - RATE LİMİT SORUNU

**Sorun:** Let's Encrypt rate limit - Çok fazla deneme yapıldı  
**Çözüm:** Beklemek veya staging environment kullanmak

---

## 🔍 SORUN

**Let's Encrypt mesajı:**
```
too many failed authorizations (5) for "api.basvideo.com" 
in the last 1h0m0s, retry after 2025-11-05 21:21:48 UTC
```

**Anlamı:**
- Son 1 saatte 5 kez başarısız deneme yapıldı
- 21:21:48 UTC'ye kadar beklemek gerekiyor
- Rate limit: Domain başına saatte 5 başarısız deneme

---

## ⏰ ÇÖZÜM 1: BEKLEMEK (ÖNERİLEN)

**Süre:** 21:21:48 UTC'ye kadar (yaklaşık 1 saat)

**Bekledikten sonra:**
1. DNS challenge yöntemi ile tekrar dene
2. Bu sefer başarılı olmalı

---

## 🔄 ÇÖZÜM 2: STAGING ENVIRONMENT (TEST İÇİN)

**Staging environment rate limit yok:**

```bash
sudo certbot certonly --staging --manual --preferred-challenges dns -d api.basvideo.com
```

**⚠️ ÖNEMLİ:**
- Staging sertifikası **production için geçerli değil**
- Browser'da güvenlik uyarısı verir
- Sadece test için

**Production sertifikası için:**
- Beklemek gerekiyor
- Veya staging'den sonra production'a geç

---

## 🎯 ÇÖZÜM 3: DNS CHALLENGE (BEKLEDİKTEN SONRA)

**Rate limit bittikten sonra (21:21:48 UTC):**

```bash
# EC2'ye SSH ile bağlan
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153

# DNS challenge
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

**Bu yöntem:**
- HTTP port gerektirmez
- Rate limit'ten etkilenir (ama bekleme sonrası çalışır)
- DNS TXT kaydı eklemeniz gerekir

---

## 📋 ÖZET

**Durum:**
- ✅ Nginx kuruldu
- ✅ Backend proxy çalışıyor
- ✅ DNS yayıldı
- ⏰ Let's Encrypt rate limit - 1 saat bekleme

**Sonraki adım:**
1. 21:21:48 UTC'ye kadar bekle (yaklaşık 1 saat)
2. DNS challenge yöntemi ile tekrar dene
3. SSL sertifikası al
4. Nginx config'e SSL ekle

---

## ⏰ NE ZAMAN TEKRAR DENEYEBİLİRİZ?

**Rate limit bitiş:** 21:21:48 UTC

**Şu anki saat:** Kontrol edelim

**Bekleme süresi:** Yaklaşık 1 saat

---

**Rate limit bittikten sonra haber verin, DNS challenge ile SSL sertifikasını alalım!** 🚀


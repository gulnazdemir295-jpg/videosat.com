# 🔧 GoDaddy DNS TXT Kaydı Güncelleme

**Sorun:** GoDaddy'de eski DNS TXT kaydı var  
**Çözüm:** Eski kaydı silip yeni value ile yeni kayıt ekleyeceğiz

---

## 📋 ADIM ADIM

### ADIM 1: GoDaddy DNS Paneline Gidin

1. **GoDaddy.com** → Giriş yapın
2. **My Products** → **DNS** → **basvideo.com** domain'ini seçin
3. **DNS Management** sayfasına gidin

---

### ADIM 2: Eski TXT Kaydını Silin

**DNS kayıtlarında şunu bulun:**
- **Type:** TXT
- **Name:** `_acme-challenge.api`
- **Value:** `-02yOWYNyaJ0k85VE3ZMhS6RLis2GZFLowuc_brMA3A` (ESKİ - SİLİNECEK)

**Eski kaydı silin:**
- Kaydın yanındaki **3 nokta (⋮)** → **Delete** → **Save**

---

### ADIM 3: Yeni TXT Kaydı Ekleyin

**"Add" veya "+" butonuna tıklayın:**

- **Type:** `TXT`
- **Name:** `_acme-challenge.api` (sadece bu, .basvideo.com YOK!)
- **Value:** `ySxHOJ_GcTSyokiXicUVX1sxFYLLTI4TdYA4A1IglxY` (YENİ - tırnak YOK!)
- **TTL:** `600` (veya minimum)

**"Save" butonuna tıklayın**

---

### ADIM 4: DNS Propagation Kontrolü

**Google Admin Toolbox ile kontrol edin:**

🔗 **Link:** https://toolbox.googleapps.com/apps/dig/#TXT/_acme-challenge.api.basvideo.com

**1-2 dakika bekleyin, sonra linke tıklayın**

**Doğru görünmesi gereken:**
```
;ANSWER
_acme-challenge.api.basvideo.com. 600 IN TXT "ySxHOJ_GcTSyokiXicUVX1sxFYLLTI4TdYA4A1IglxY"
```

**Eğer eski value görünüyorsa:**
- 2-3 dakika daha bekleyin
- GoDaddy'de kaydın doğru olduğundan emin olun

---

### ADIM 5: Certbot Komutunu Tekrar Çalıştırın

**EC2 terminal'inde (hala bağlıysanız):**

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

**Certbot size yeni bir value verebilir veya aynı value'yu verebilir.**

**Eğer aynı value görürseniz (`ySxHOJ_GcTSyokiXicUVX1sxFYLLTI4TdYA4A1IglxY`):**
- DNS kaydı doğru, Enter'a basın!

**Eğer yeni value görürseniz:**
- GoDaddy'de tekrar güncelleyin (eski kaydı sil, yeni ekle)
- 1-2 dakika bekleyin
- Enter'a basın

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Name:** `_acme-challenge.api` (sadece bu, .basvideo.com YOK!)
2. **Value:** Tırnak YOK! Sadece value'yu kopyala-yapıştır
3. **Eski kaydı mutlaka silin!** (İki kayıt olmamalı)
4. **DNS propagation:** 1-2 dakika sürebilir

---

## 🚀 ŞİMDİ NE YAPMALIYIZ?

1. ✅ GoDaddy DNS paneline gidin
2. ✅ Eski TXT kaydını silin (`-02yOWYNyaJ0k85VE3ZMhS6RLis2GZFLowuc_brMA3A`)
3. ✅ Yeni TXT kaydı ekleyin (`ySxHOJ_GcTSyokiXicUVX1sxFYLLTI4TdYA4A1IglxY`)
4. ✅ 1-2 dakika bekleyin
5. ✅ Google Admin Toolbox ile kontrol edin
6. ✅ Certbot komutunu tekrar çalıştırın

---

**GoDaddy'de güncellemeyi yaptınız mı? Sonucu paylaşın!** 🚀



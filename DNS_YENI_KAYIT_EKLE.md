# ✅ Yeni DNS TXT Kaydı Ekleme

**Durum:** Eski TXT kaydı silindi ✅  
**Sıradaki:** Yeni TXT kaydını ekleyeceğiz

---

## 📋 ADIM ADIM

### ADIM 1: GoDaddy DNS Paneline Gidin

**Zaten oradasınız!** DNS Management sayfasında olmalısınız.

---

### ADIM 2: "Ekle" veya "+" Butonuna Tıklayın

**DNS kayıtları tablosunun üstünde veya yanında:**
- **"Ekle"** (Add) butonuna tıklayın
- VEYA **"+"** ikonuna tıklayın

---

### ADIM 3: Yeni TXT Kaydı Bilgilerini Girin

**Açılan formda şu bilgileri girin:**

- **Tür (Type):** `TXT` seçin
- **Ad (Name):** `_acme-challenge.api` (sadece bu, .basvideo.com YOK!)
- **Veri (Data/Value):** `ySxHOJ_GcTSyokiXicUVX1sxFYLLTI4TdYA4A1IglxY` (tırnak YOK!)
- **TTL:** `600` (veya `600 saniye`)

---

### ADIM 4: Kaydet

**"Kaydet" (Save) butonuna tıklayın**

---

### ADIM 5: DNS Kontrolü (1-2 dakika sonra)

**DNS yayılmasını kontrol edin:**

🔗 **Link:** https://toolbox.googleapps.com/apps/dig/#TXT/_acme-challenge.api.basvideo.com

**Doğru görünmesi gereken:**
```
ySxHOJ_GcTSyokiXicUVX1sxFYLLTI4TdYA4A1IglxY
```

---

### ADIM 6: Certbot Komutunu Tekrar Çalıştırın

**EC2 terminal'inde (hala bağlıysanız):**

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

**Aynı value görürseniz (`ySxHOJ_GcTSyokiXicUVX1sxFYLLTI4TdYA4A1IglxY`):**
- DNS kaydı doğru, Enter'a basın!

**Eğer yeni value görürseniz:**
- GoDaddy'de tekrar güncelleyin (eski kaydı sil, yeni ekle)
- 1-2 dakika bekleyin
- Enter'a basın

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Ad (Name):** `_acme-challenge.api` (sadece bu, .basvideo.com YOK!)
2. **Veri (Value):** Tırnak YOK! Sadece value'yu kopyala-yapıştır
3. **TTL:** `600` veya `600 saniye`
4. **DNS propagation:** 1-2 dakika sürebilir

---

## 🚀 ŞİMDİ NE YAPMALIYIZ?

1. ✅ Eski TXT kaydı silindi (yaptınız!)
2. ⏳ Yeni TXT kaydı ekleyin
3. ⏳ 1-2 dakika bekleyin
4. ⏳ Google Admin Toolbox ile kontrol edin
5. ⏳ Certbot komutunu tekrar çalıştırın

---

**Yeni TXT kaydını eklediniz mi? Sonucu paylaşın!** 🚀



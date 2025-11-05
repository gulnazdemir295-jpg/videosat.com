# 📍 "Add permissions" Butonunu Bulma

## 🎯 Şu An Neredesin?

**IAM → Users → basvideo.com → İzinler (Permissions) sekmesi**

---

## 🔍 "Add permissions" Butonunu Bul

### Yer 1: Sağ Üst Köşe
- Sayfanın **sağ üst köşesine** bak
- **"Add permissions"** veya **"İzin ekle"** butonu olmalı
- Mavi/yeşil buton

### Yer 2: Permissions Tablosunun Üstü
- **"Permissions"** veya **"İzinler"** tablosunun **üstünde**
- **"Add permissions"** butonu

### Yer 3: Açılır Menü
- Sağ üstte **"..." (üç nokta)** menüsüne tıkla
- **"Add permissions"** seçeneğini bul

---

## 📋 TIKLAMA SIRASI

1. **"Add permissions"** butonuna tıkla
2. **"Attach policies directly"** seçeneğini seç (ilk seçenek)
3. **"Next"** butonuna tıkla
4. Arama kutusuna **`basvideo-s3-access`** yaz (özel policy oluşturduysan)
   VEYA
   Arama kutusuna **`S3`** yaz (AWS managed policy arıyorsan)
5. Policy'yi işaretle
6. **"Next"** → **"Add permissions"**

---

## ⚠️ Eğer "Add permissions" Butonu Görünmüyorsa

**Neden:**
- Root kullanıcı ile giriş yapmamış olabilirsin
- Yeterli yetkiye sahip olmayabilirsin

**Çözüm:**
- Root kullanıcı ile giriş yap
- VEYA
- Admin yetkisine sahip bir kullanıcı ile giriş yap

---

## 🔄 Alternatif: Doğrudan Policy Sayfasından

Eğer buton çalışmazsa:

1. **Sol menüden** → **"Policies"** → **"Create policy"** (yeni policy için)
   VEYA
2. **Policies** listesinde **`basvideo-s3-access`** policy'sini bul
3. Policy'ye tıkla
4. **"Users"** tab'ına git
5. **"Attach"** veya **"Add"** butonuna tıkla
6. **`basvideo.com`** kullanıcısını seç

---

## 📸 Ekran Görüntüsü Beklenen Görünüm

```
┌─────────────────────────────────────────┐
│ Users > basvideo.com                    │
├─────────────────────────────────────────┤
│ [Sekmeler: İzinler | Gruplar | ...]     │
├─────────────────────────────────────────┤
│ Permissions (İzinler)                   │
│                                         │
│ [+ Add permissions] ← BURAYA TIKLA     │
│                                         │
│ Permissions policies (0)               │
│ No policies attached                    │
└─────────────────────────────────────────┘
```

---

## ✅ Adımlar Özeti

1. **"Add permissions"** butonunu bul ve tıkla
2. **"Attach policies directly"** seç
3. Arama yap ve policy seç
4. **Add permissions** ile onayla

---

**"Add permissions" butonunu buldun mu? Nerede görünüyor?**



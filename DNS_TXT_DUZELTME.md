# 🔧 DNS TXT KAYDI DÜZELTME

**Sorun:** Value'da tırnak var  
**Çözüm:** Tırnakları kaldırın

---

## ❌ YANLIŞ

**GoDaddy DNS panelinde:**
```
Type: TXT
Name: _acme-challenge.api
Value: "JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8"  ❌ (Tırnak var!)
```

---

## ✅ DOĞRU

**GoDaddy DNS panelinde:**
```
Type: TXT
Name: _acme-challenge.api
Value: JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8  ✅ (Tırnak yok!)
```

---

## 🔧 DÜZELTME ADIMLARI

### 1. GoDaddy DNS Panelinde

1. **DNS Yönetimi** sayfasına gidin
2. **TXT kaydını bulun** (`_acme-challenge.api`)
3. **Düzenle** (Edit) butonuna tıklayın
4. **Value** kısmından **tırnakları kaldırın:**
   - Eski: `"JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8"`
   - Yeni: `JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8`
5. **Kaydet** (Save)

---

### 2. Alternatif: Kaydı Sil ve Yeniden Ekle

**Eğer düzenleme çalışmazsa:**

1. **Mevcut TXT kaydını silin**
2. **Yeni kayıt ekle:**
   - Type: TXT
   - Name: `_acme-challenge.api`
   - Value: `JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8` (tırnak YOK!)
   - TTL: 300
3. **Kaydet**

---

## 📋 KONTROL

**Value kısmında:**
- ❌ `"JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8"` (yanlış)
- ✅ `JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8` (doğru)

**Tırnak olmamalı!**

---

## 🔄 DÜZELTTİKTEN SONRA

1. **5-10 dakika bekle** (DNS yayılması)
2. **Kontrol:**
   ```bash
   nslookup -type=TXT _acme-challenge.api.basvideo.com
   ```
3. **EC2 terminal'inde Enter bas**
4. **SSL sertifikası alınacak!** ✅

---

**Tırnakları kaldırdınız mı? Düzelttikten sonra haber verin, kontrol edelim!** 🚀


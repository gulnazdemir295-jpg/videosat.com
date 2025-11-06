# 🔍 GODADDY DNS TXT KAYDI KONTROLÜ

**Eklenen kayıt:**
- **Type:** TXT
- **Name:** `_acme-challenge.api`
- **Value:** `JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8`

---

## ✅ GODADDY'DE KONTROL

**GoDaddy DNS panelinde:**

1. **DNS Yönetimi** sayfasına gidin
2. **TXT** kayıtlarını kontrol edin
3. Şu kaydın var olduğundan emin olun:
   - **Type:** TXT
   - **Name:** `_acme-challenge.api`
   - **Value:** `JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8`

---

## ⚠️ ÖNEMLİ NOTLAR

**GoDaddy'de TXT kaydı eklerken:**

1. **Name kısmı:**
   - `_acme-challenge.api` yazın
   - VEYA tam olarak `_acme-challenge.api.basvideo.com`
   - GoDaddy bazen otomatik olarak domain'i ekler

2. **Value kısmı:**
   - `JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8`
   - Tırnak işareti olmadan yazın
   - Tam olarak bu string olmalı

3. **TTL:**
   - 300 (5 dakika) veya default

---

## 🔄 DNS YAYILMASI

**GoDaddy'de DNS yayılması:**
- Genellikle: 5-30 dakika
- Bazen: 1-2 saat (nadir)

**Kontrol:**
```bash
nslookup -type=TXT _acme-challenge.api.basvideo.com
```

**Beklenen:** `JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8` görünmeli

---

## 📋 KONTROL LİSTESİ

- [ ] GoDaddy DNS panelinde TXT kaydı görünüyor mu?
- [ ] Name: `_acme-challenge.api` doğru mu?
- [ ] Value: `JnE6wh9lx35wu143-MPkNk56JICj1LncYjo-3pjBhO8` doğru mu?
- [ ] Kayıt kaydedildi mi?

---

**GoDaddy DNS panelinde kayıt görünüyor mu? Kontrol edip haber verin!** 🚀


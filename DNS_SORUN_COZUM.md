# 🔧 DNS YAYILMA SORUNU ÇÖZÜMÜ

**Sorun:** 15 dakika geçti, DNS hala yayılmadı  
**Durum:** DNS kontrolü yapılıyor

---

## 🔍 DNS KONTROLÜ

**Farklı DNS server'larından kontrol:**

```bash
# Google DNS ile
nslookup api.basvideo.com 8.8.8.8

# Cloudflare DNS ile
nslookup api.basvideo.com 1.1.1.1

# AWS Route 53 DNS ile
nslookup api.basvideo.com 205.251.192.1
```

---

## 🔍 OLASI SORUNLAR

### 1. DNS A Kaydı Yanlış mı?

**Domain sağlayıcınızın DNS panelinde kontrol edin:**

- **Type:** A (A Record olmalı, CNAME değil!)
- **Name:** `api` (veya `@` root için)
- **Value:** `107.23.178.153` (IP doğru mu?)
- **TTL:** `3600` veya daha düşük

**CNAME kaydı varsa:**
- CNAME kaldırın
- A kaydı ekleyin

---

### 2. DNS Sağlayıcısı Yavaş mı?

**Bazı DNS sağlayıcıları yavaş olabilir:**
- 30 dakika - 2 saat sürebilir
- TTL değeri yüksekse daha yavaş yayılır

**Çözüm:**
- TTL değerini düşürün (300-600)
- DNS kaydını tekrar kaydedin

---

### 3. DNS Cache Sorunu mu?

**Local DNS cache temizle:**

```bash
# macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Sonra tekrar kontrol et
nslookup api.basvideo.com
```

---

### 4. Domain Sağlayıcısı Doğru mu?

**DNS panelinde kontrol:**
- Kayıt kaydedildi mi?
- Hata mesajı var mı?
- DNS server'lar doğru mu?

---

## 🔄 ALTERNATİF: IP İLE ÇALIŞMA (Geçici)

**DNS yayılana kadar IP ile çalışabiliriz:**

**Frontend'de:**
```javascript
// Geçici olarak IP kullan
const API_BASE_URL = 'http://107.23.178.153/api';
```

**SSL sertifikası için:** DNS yayılması zorunlu (Let's Encrypt domain doğrulaması yapar)

---

## 🎯 ÇÖZÜM ADIMLARI

### Adım 1: DNS Kaydını Kontrol Et

**Domain sağlayıcınızın DNS panelinde:**
1. DNS kayıtlarını listeleyin
2. `api.basvideo.com` A kaydı var mı kontrol edin
3. IP adresi `107.23.178.153` doğru mu kontrol edin

---

### Adım 2: Farklı DNS Server'lardan Test

```bash
# Google DNS
nslookup api.basvideo.com 8.8.8.8

# Cloudflare DNS
nslookup api.basvideo.com 1.1.1.1
```

**Eğer bu DNS server'larında görünüyorsa:**
- Local DNS cache sorunu olabilir
- Cache'i temizleyin

---

### Adım 3: DNS Kaydını Yeniden Kaydet

**Bazen DNS kaydını silip tekrar eklemek hızlandırır:**
1. Mevcut A kaydını silin
2. 2-3 dakika bekleyin
3. A kaydını tekrar ekleyin
4. TTL değerini düşük tutun (300)

---

### Adım 4: Domain Sağlayıcısına Sor

**Eğer hala yayılmıyorsa:**
- Domain sağlayıcınızın destek ekibiyle iletişime geçin
- DNS kaydının neden yayılmadığını sorun

---

## 🧪 TEST KOMUTLARI

**DNS yayıldı mı kontrol:**

```bash
# Method 1: nslookup
nslookup api.basvideo.com

# Method 2: dig
dig api.basvideo.com

# Method 3: host
host api.basvideo.com

# Method 4: curl (DNS + HTTP)
curl -v http://api.basvideo.com/api/health
```

**Beklenen:** `107.23.178.153` IP'si görünmeli

---

## 📋 KONTROL LİSTESİ

- [ ] DNS A kaydı doğru mu? (Type: A, Name: api, Value: 107.23.178.153)
- [ ] DNS kaydı kaydedildi mi?
- [ ] TTL değeri düşük mü? (300-600)
- [ ] Farklı DNS server'lardan test edildi mi?
- [ ] Local DNS cache temizlendi mi?
- [ ] Domain sağlayıcısına soruldu mu?

---

## 💡 ÖNERİ

**DNS yayılması beklenirken:**
- IP ile çalışabilirsiniz (`http://107.23.178.153`)
- SSL sertifikası için DNS yayılması gerekli
- DNS yayıldıktan sonra SSL ekleriz

**DNS yayıldığında haber verin, SSL sertifikası alalım!** 🚀

---

**Son Güncelleme:** 5 Ocak 2025  
**Durum:** ⏳ DNS yayılması bekleniyor (15+ dakika)


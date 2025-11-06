# 🔐 SECURITY GROUP AYARLARI - TÜRKÇE REHBER

**Sorun:** SSL sertifikası alınamıyor - Let's Encrypt erişemiyor  
**Çözüm:** Security Group'da port 80 ve 443 açık olmalı

---

## 🎯 ADIM ADIM (AWS Console - Türkçe)

### 1️⃣ EC2 Konsoluna Git

1. **AWS Console** → **EC2** (sol menüden)
2. **Örnekler** (Instances) sekmesine tıkla
3. `107.23.178.153` IP'sine sahip örneği seç

---

### 2️⃣ Security Group'u Bul

1. Örneği seçtikten sonra, altta **Güvenlik** (Security) sekmesine tıkla
2. **Güvenlik grupları** (Security groups) bölümünde grup adını gör
   - Örnek: `basvideo-backend-sg` veya benzeri
3. **Güvenlik grubu adına tıkla** (mavi link)

---

### 3️⃣ Gelen Kuralları Düzenle

1. Açılan sayfada **Gelen kurallar** (Inbound rules) sekmesine tıkla
2. **Gelen kuralları düzenle** (Edit inbound rules) butonuna tıkla

---

### 4️⃣ Port 80 (HTTP) Ekle

1. **Kural ekle** (Add rule) butonuna tıkla
2. **Tür** (Type): `HTTP` seç
3. **Port aralığı** (Port range): `80` (otomatik dolar)
4. **Kaynak** (Source): `Herkes` (Anywhere) veya `0.0.0.0/0` yaz
5. **Açıklama** (Description): `Let's Encrypt HTTP` yaz

---

### 5️⃣ Port 443 (HTTPS) Ekle

1. Tekrar **Kural ekle** (Add rule) butonuna tıkla
2. **Tür** (Type): `HTTPS` seç
3. **Port aralığı** (Port range): `443` (otomatik dolar)
4. **Kaynak** (Source): `Herkes` (Anywhere) veya `0.0.0.0/0` yaz
5. **Açıklama** (Description): `HTTPS` yaz

---

### 6️⃣ Kaydet

1. Altta **Kuralları kaydet** (Save rules) butonuna tıkla
2. Bekle: 1-2 dakika (AWS ayarları yayılması için)

---

## 📋 KONTROL LİSTESİ

**Gelen kurallarda şunlar olmalı:**

| Tür | Port | Kaynak | Açıklama |
|-----|------|--------|----------|
| SSH | 22 | Benim IP'm (veya Herkes) | SSH erişimi |
| HTTP | 80 | Herkes (0.0.0.0/0) | Let's Encrypt |
| HTTPS | 443 | Herkes (0.0.0.0/0) | HTTPS |
| Özel TCP | 4000 | Herkes (0.0.0.0/0) | Backend API |

---

## 🧪 TEST

**Ayarları yaptıktan 1-2 dakika sonra:**

```bash
# 1. HTTP test
curl http://api.basvideo.com/api/health

# 2. SSL sertifikası al
sudo certbot --nginx -d api.basvideo.com
```

---

## ⚠️ ÖNEMLİ NOTLAR

**Let's Encrypt için:**
- Port 80 **mutlaka açık** olmalı
- **Kaynak:** `Herkes` (0.0.0.0/0) olmalı
- Let's Encrypt sunucuları erişebilmeli

**Güvenlik:**
- Port 80/443 sadece HTTP/HTTPS için
- Backend port 4000 ayrı bir kuralda
- SSH port 22 sadece "Benim IP'm" olabilir (güvenlik için)

---

## 🎯 SONRAKI ADIM

**Security Group ayarlarını yaptıktan sonra:**

1. 1-2 dakika bekle (AWS ayarları yayılması için)
2. Bana haber ver
3. SSL sertifikasını tekrar alacağız

---

**Security Group ayarlarını yaptınız mı?** 🚀


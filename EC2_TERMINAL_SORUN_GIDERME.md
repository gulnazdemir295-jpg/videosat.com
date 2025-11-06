# 🔧 EC2 Terminal Sorun Giderme

**Sorun:** EC2 terminal'inde hata alıyorsunuz

---

## 🔍 SORUN TESPİTİ

### 1. SSH Bağlantı Sorunları

**Hata mesajları:**
- `Permission denied (publickey)` → Key permission sorunu
- `Connection refused` → Security Group sorunu
- `Connection timed out` → Network sorunu

### 2. Certbot Komut Sorunları

**Hata mesajları:**
- `sudo: command not found` → Sudo yüklü değil
- `certbot: command not found` → Certbot yüklü değil
- `Permission denied` → Sudo yetkisi sorunu

---

## 🔧 ÇÖZÜMLER

### ÇÖZÜM 1: Key Permission Hatası

**Mac Terminal'de:**

```bash
chmod 400 ~/Downloads/basvideo-backend-key.pem
ls -la ~/Downloads/basvideo-backend-key.pem
```

**Beklenen:**
```
-r-------- 1 user staff 1692 ... basvideo-backend-key.pem
```

**Sonra tekrar bağlanın:**
```bash
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
```

---

### ÇÖZÜM 2: Key Dosyası Bulunamadı

**Mac Terminal'de key dosyasını bulun:**

```bash
find ~ -name "basvideo-backend-key.pem" 2>/dev/null
```

**VEYA:**

```bash
ls -la ~/Downloads/*.pem
ls -la ~/.ssh/*.pem
```

**Key dosyasını bulduktan sonra doğru path ile bağlanın:**
```bash
ssh -i [BULDUĞUNUZ_PATH] ubuntu@107.23.178.153
```

---

### ÇÖZÜM 3: Security Group Sorunu

**AWS Console'da kontrol edin:**
1. EC2 → Security Groups
2. Instance'ınızın Security Group'unu bulun
3. Inbound Rules'da SSH (port 22) açık mı kontrol edin
4. Source: `0.0.0.0/0` olmalı

---

### ÇÖZÜM 4: Certbot Yüklü Değil

**EC2 terminal'inde (bağlandıktan sonra):**

```bash
which certbot
```

**Eğer bulunamazsa:**

```bash
sudo apt update
sudo apt install certbot -y
```

---

### ÇÖZÜM 5: Sudo Yetkisi Sorunu

**EC2 terminal'inde:**

```bash
sudo whoami
```

**Beklenen:** `root`

**Eğer hata alırsanız, ubuntu kullanıcısı sudo yetkisine sahip olmalı.**

---

### ÇÖZÜM 6: Network/Connection Sorunu

**Mac Terminal'de ping testi:**

```bash
ping -c 3 107.23.178.153
```

**Eğer ping çalışmazsa:**
- Instance durdu mu kontrol edin (AWS Console)
- Security Group'da SSH açık mı kontrol edin
- Network ACL sorunu olabilir

---

## 🚀 HIZLI TEST

**Mac Terminal'de şu komutları sırayla çalıştırın:**

```bash
# 1. Key permission
chmod 400 ~/Downloads/basvideo-backend-key.pem

# 2. SSH bağlantı testi
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153 "echo 'Bağlantı başarılı!' && hostname"

# 3. Eğer bağlantı başarılıysa, Certbot kontrolü
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153 "which certbot && certbot --version"
```

---

## 📋 HANGİ HATA MESAJINI ALIYORSUNUZ?

**Lütfen tam hata mesajını paylaşın:**
- Terminal çıktısı
- Hata mesajı
- Komutunuz

**Birlikte çözelim!** 🚀




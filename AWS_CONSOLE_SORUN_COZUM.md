# 🔧 AWS Console Instance Connect Sorunu - Çözüm

**Hata:** `Failed to connect to your instance - Error establishing SSH connection`

**Durum:** AWS Console'dan EC2 Instance Connect çalışmıyor  
**Çözüm:** Mac Terminal'den SSH ile bağlanacağız (bu çalışıyor!)

---

## ✅ ÇÖZÜM: Mac Terminal'den SSH

**AWS Console Instance Connect sorunu olabilir, ama Mac Terminal'den SSH çalışıyor!**

---

## 📋 ADIM ADIM

### ADIM 1: Mac Terminal'i Aç

**Mac Terminal'i açın:**
- Spotlight: `Cmd + Space` → "Terminal"
- VEYA: Applications → Utilities → Terminal

---

### ADIM 2: SSH ile EC2'ye Bağlan

**Mac Terminal'de şu komutu çalıştırın:**

```bash
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
```

**Eğer "Permission denied" hatası alırsanız:**

```bash
chmod 400 ~/Downloads/basvideo-backend-key.pem
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
```

**Başarılı olursa şunu göreceksiniz:**
```
Welcome to Ubuntu...
ubuntu@ip-172-31-31-180:~$
```

✅ **EC2'ye bağlandınız!**

---

### ADIM 3: Certbot Komutunu Çalıştır

**EC2 terminal'inde (bağlandıktan sonra) şu komutu çalıştırın:**

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

---

### ADIM 4: Certbot'un Çıktısını Bekleyin

**Certbot size şunu soracak:**

```
Please deploy a DNS TXT record under the name
_acme-challenge.api.basvideo.com with the following value:

[VALUE BURADA]

Before continuing, verify the record is deployed.
Press Enter to Continue
```

---

### ADIM 5: Enter'a Basın

**DNS kaydı zaten ekli!** (`-02yOWYNyaJ0k85VE3ZMhS6RLis2GZFLowuc_brMA3A`)

**Terminal'de Enter'a basın ⏎**

**Başarılı olursa:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/api.basvideo.com/fullchain.pem
```

---

## 🔍 AWS CONSOLE SORUNU NEDEN OLABİLİR?

**AWS Console Instance Connect için:**
- IAM role gerekebilir
- Instance Connect agent yüklü olmalı
- Network sorunu olabilir

**Ama SSH ile bağlanabiliyoruz, o yeterli!**

---

## 🚀 ŞİMDİ NE YAPMALIYIZ?

1. **Mac Terminal'i açın**
2. **SSH komutunu çalıştırın:** `ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153`
3. **Certbot komutunu çalıştırın:** `sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com`
4. **Sonucu paylaşın!**

---

**Mac Terminal'den bağlanın, AWS Console'a gerek yok!** 🚀




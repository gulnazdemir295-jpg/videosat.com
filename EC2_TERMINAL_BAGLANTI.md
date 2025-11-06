# 🔌 EC2 Terminal Bağlantısı - Adım Adım

**Yöntem:** Mac Terminal'den SSH ile bağlanacağız

---

## 📋 ADIM ADIM

### ADIM 1: Mac Terminal'i Açın

**Mac Terminal'i açın:**
- **Spotlight:** `Cmd + Space` → "Terminal" yazın → Enter
- **VEYA:** Applications → Utilities → Terminal

---

### ADIM 2: SSH Komutunu Hazırlayın

**Mac Terminal'de şu komutu çalıştırın:**

```bash
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
```

**Eğer "Permission denied" hatası alırsanız:**

```bash
chmod 400 ~/Downloads/basvideo-backend-key.pem
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
```

---

### ADIM 3: Bağlantı Kontrolü

**Başarılı olursa şunu göreceksiniz:**
```
Welcome to Ubuntu 24.04.3 LTS...
ubuntu@ip-172-31-31-180:~$
```

✅ **EC2'ye bağlandınız!**

---

### ADIM 4: Certbot Komutunu Çalıştırın

**EC2 terminal'inde (bağlandıktan sonra) şu komutu çalıştırın:**

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

---

## 🚀 ŞİMDİ NE YAPMALIYIZ?

1. Mac Terminal'i açın
2. SSH komutunu çalıştırın
3. Bağlandıktan sonra Certbot komutunu çalıştırın
4. Sonucu paylaşın!

---

**Mac Terminal'i açtınız mı? Komutu çalıştırdınız mı?** 🚀



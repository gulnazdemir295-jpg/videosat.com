# 💻 Mac Terminal'den EC2 İşlemleri - Adım Adım

**Hedef:** SSL sertifikasını almak için Certbot çalıştırmak

---

## 🔧 ADIM 1: Mac Terminal'i Aç

**Mac'te Terminal'i açın:**
- Spotlight: `Cmd + Space` → "Terminal" yazın
- VEYA: Applications → Utilities → Terminal

---

## 🔧 ADIM 2: SSH ile EC2'ye Bağlan

**Terminal'de şu komutu çalıştırın:**

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

## 🔧 ADIM 3: Certbot Komutunu Çalıştır

**EC2 terminal'inde (bağlandıktan sonra):**

```bash
sudo certbot certonly --manual --preferred-challenges dns -d api.basvideo.com
```

**Certbot şunu soracak:**
```
Please deploy a DNS TXT record under the name
_acme-challenge.api.basvideo.com with the following value:

[YENİ BİR VALUE GÖRECEKSİNİZ VEYA ESKİ VALUE'YU SORACAK]

Before continuing, verify the record is deployed.
Press Enter to Continue
```

---

## 🔧 ADIM 4: DNS Kontrolü

**DNS kaydı zaten ekli!** (`-02yOWYNyaJ0k85VE3ZMhS6RLis2GZFLowuc_brMA3A`)

**Eğer Certbot yeni value isterse:**
- Yeni value'yu bana gönderin
- GoDaddy'ye ekleyeceğiz

**Eğer Certbot eski value'yu sorarsa:**
- Direkt Enter'a basın (DNS zaten hazır)

**Eğer Certbot value sormazsa:**
- Direkt Enter'a basın

---

## 🔧 ADIM 5: Enter'a Bas ve Sonucu Bekle

**Terminal'de Enter'a basın ⏎**

**Başarılı olursa:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/api.basvideo.com/fullchain.pem
```

**Hata olursa:**
- Hata mesajını bana gönderin

---

## 🚀 ŞİMDİ NE YAPMALIYIZ?

1. **Mac Terminal'i açın**
2. **SSH komutunu çalıştırın** (yukarıdaki komut)
3. **Bağlandıktan sonra Certbot komutunu çalıştırın**
4. **Sonucu bana gönderin!**

---

**Terminal'i açtınız mı? SSH komutunu çalıştırdınız mı?** 🚀




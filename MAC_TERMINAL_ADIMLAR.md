# 💻 Mac Terminal'den EC2'ye Bağlanma

**Yöntem:** Mac Terminal → SSH → EC2

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

[YENİ BİR VALUE GÖRECEKSİNİZ - ÖNCEKİ DEĞİL!]

Press Enter to Continue
```

---

## 🔧 ADIM 4: DNS TXT Kaydını Ekle

**Certbot size YENİ bir value verecek (örnek: `abc123xyz...`)**

### GoDaddy DNS Panelinde:

1. **Önceki TXT kaydını silin** (`_acme-challenge.api`)
2. **Yeni kayıt ekle:**
   - Type: TXT
   - Name: `_acme-challenge.api`
   - Value: `[CERTBOT'UN VERDİĞİ YENİ VALUE]` (tırnak YOK!)
   - TTL: 300
3. **Kaydet**

---

## 🔧 ADIM 5: DNS Yayılmasını Bekle

**5-10 dakika bekleyin** (DNS yayılması)

**Kontrol için (Mac Terminal'de - YENİ bir terminal açın):**

```bash
nslookup -type=TXT _acme-challenge.api.basvideo.com
```

**VEYA:**

```bash
dig TXT _acme-challenge.api.basvideo.com
```

**Beklenen:** Certbot'un verdiği value görünmeli

---

## 🔧 ADIM 6: EC2 Terminal'inde Enter'a Bas

**DNS yayıldıktan sonra:**

1. **EC2 terminal'ine geri dönün** (SSH bağlantısı açık olmalı)
2. **Enter'a basın** ⏎
3. ✅ **Sertifika alınacak!**

---

## ✅ BAŞARILI MESAJ

```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/api.basvideo.com/fullchain.pem
```

**Sonra:**
- Nginx config'e SSL ekleyeceğiz
- HTTPS test edeceğiz
- Tamamlandı! ✅

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Certbot her seferinde yeni value verir** - Önceki value geçersiz olur
2. **Önceki DNS kaydını silin** - Yeni kayıt ekleyin
3. **DNS yayılması 5-30 dakika sürebilir** - Sabırlı olun
4. **EC2 terminal açık kalmalı** - Enter'a basmak için

---

**Mac Terminal'den bağlanıp Certbot komutunu çalıştırın!** 🚀


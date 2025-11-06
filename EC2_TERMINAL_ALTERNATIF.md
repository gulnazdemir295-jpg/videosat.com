# 🔧 EC2 Terminal Alternatif Yöntemler

**Sorun:** EC2 terminal çalışmıyor  
**Çözüm:** Alternatif bağlantı yöntemleri

---

## 🌐 YÖNTEM 1: AWS Console - EC2 Instance Connect

### Adımlar:

1. **AWS Console'a gidin:** https://console.aws.amazon.com/ec2/
2. **EC2 Instances** sayfasına gidin
3. **Instance'ınızı seçin** (107.23.178.153)
4. **"Connect"** butonuna tıklayın
5. **"EC2 Instance Connect"** sekmesini seçin
6. **"Connect"** butonuna tıklayın
7. ✅ Terminal açılacak!

**Avantaj:** SSH key gerekmez, tarayıcıdan çalışır

---

## 🌐 YÖNTEM 2: AWS Console - Session Manager

### Önce Session Manager Plugin Kurulumu (Mac):

```bash
brew install session-manager-plugin
```

### Adımlar:

1. **AWS Console'a gidin:** https://console.aws.amazon.com/ec2/
2. **EC2 Instances** sayfasına gidin
3. **Instance'ınızı seçin**
4. **"Connect"** butonuna tıklayın
5. **"Session Manager"** sekmesini seçin
6. **"Connect"** butonuna tıklayın
7. ✅ Terminal açılacak!

**Not:** IAM role'ü Session Manager için yapılandırılmış olmalı

---

## 💻 YÖNTEM 3: Lokal Terminal - SSH (Tekrar Deneme)

### Mac Terminal'de:

```bash
# Key permission kontrolü
chmod 400 ~/Downloads/basvideo-backend-key.pem

# SSH bağlantısı
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
```

**Eğer hata verirse:**
- Key path'i kontrol edin
- Key permission'ı kontrol edin (`chmod 400`)
- Security Group'da SSH (port 22) açık mı kontrol edin

---

## 🎯 TERMINAL AÇILDIKTAN SONRA

**Certbot komutu (interaktif):**

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

**Yapılacaklar:**
1. **YENİ VALUE'YU GoDaddy'ye ekleyin** (önceki kaydı silin, yeni ekleyin)
2. **5-10 dakika bekleyin** (DNS yayılması)
3. **DNS kontrolü yapın:** `nslookup -type=TXT _acme-challenge.api.basvideo.com`
4. **Enter'a basın**
5. ✅ Sertifika alınacak!

---

## ⚠️ ÖNEMLİ NOT

**Certbot her seferinde yeni bir TXT value oluşturur!**
- Önceki value geçersiz olur
- Yeni value'yu GoDaddy'ye eklemelisiniz
- Her denemede yeni kayıt gerekir

---

**Hangi yöntemi denemek istersiniz?** 🚀


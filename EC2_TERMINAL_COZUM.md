# 🔧 EC2 Terminal Çözümü

**Sorun:** EC2 terminal çalışmıyor  
**Çözüm:** Alternatif yöntemler

---

## 🌐 YÖNTEM 1: AWS Systems Manager Session Manager

### Adım 1: Session Manager Plugin Kurulumu (Mac)

**Terminal'de:**

```bash
brew install session-manager-plugin
```

### Adım 2: AWS Console'dan Bağlan

1. **AWS Console:** https://console.aws.amazon.com/ec2/
2. **EC2 Instances** → Instance'ınızı seçin
3. **"Connect"** butonuna tıklayın
4. **"Session Manager"** sekmesini seçin
5. **"Connect"** butonuna tıklayın
6. ✅ Terminal açılacak!

**Not:** IAM role'ü Session Manager için yapılandırılmış olmalı

---

## 🌐 YÖNTEM 2: AWS CloudShell

### Adım 1: AWS CloudShell Aç

1. **AWS Console:** https://console.aws.amazon.com/
2. **Sağ üstte CloudShell ikonuna tıklayın** (terminal simgesi)
3. ✅ CloudShell açılacak!

### Adım 2: CloudShell'den EC2'ye Bağlan

**CloudShell'de:**

```bash
# Key'i yükle (CloudShell'de)
aws s3 cp s3://[BUCKET]/basvideo-backend-key.pem ~/basvideo-backend-key.pem

# VEYA doğrudan SSH (eğer key CloudShell'de varsa)
ssh -i ~/basvideo-backend-key.pem ubuntu@107.23.178.153
```

---

## 💻 YÖNTEM 3: Mac Terminal - SSH Troubleshooting

### Adım 1: Key Permission Kontrolü

```bash
chmod 400 ~/Downloads/basvideo-backend-key.pem
ls -la ~/Downloads/basvideo-backend-key.pem
```

**Beklenen:**
```
-r-------- 1 user staff 1692 ... basvideo-backend-key.pem
```

### Adım 2: SSH Verbose Mod

```bash
ssh -v -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
```

**Hata mesajını paylaşın!**

### Adım 3: SSH Config Dosyası

**~/.ssh/config dosyası oluşturun:**

```
Host ec2-basvideo
    HostName 107.23.178.153
    User ubuntu
    IdentityFile ~/Downloads/basvideo-backend-key.pem
    StrictHostKeyChecking no
```

**Sonra:**

```bash
ssh ec2-basvideo
```

---

## 🔧 YÖNTEM 4: Benim Tarafımdan Komut Çalıştırma

**Eğer SSH bağlantısı çalışıyorsa, ben komutları çalıştırabilirim!**

**Ama Certbot interaktif mod gerektiriyor, bu yüzden:**
- Siz terminal'de komutları çalıştırın
- Ben size rehberlik edeyim

---

## 🎯 EN KOLAY YÖNTEM

**AWS Console - EC2 Instance Connect:**

1. **AWS Console:** https://console.aws.amazon.com/ec2/
2. **Instance'ı seçin**
3. **"Connect"** → **"EC2 Instance Connect"**
4. ✅ Terminal açılacak!

**Bu yöntemi denediniz mi?** 🚀


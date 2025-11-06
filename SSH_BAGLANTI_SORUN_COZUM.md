# 🔧 SSH BAĞLANTI SORUN ÇÖZÜMÜ

**Hata:** `Permission denied (publickey)`

---

## 🔍 Olası Sorunlar ve Çözümler

### 1. SSH Key Dosyası İzinleri

```bash
chmod 400 ~/.ssh/basvideo-backend-key.pem
ls -la ~/.ssh/basvideo-backend-key.pem
```

**Beklenen:** `-r--------` görünmeli

---

### 2. EC2 Instance Durumu

**AWS Console'dan kontrol et:**
1. AWS Console → EC2 → Instances
2. `107.23.178.153` IP'sine sahip instance'ı bul
3. **State** kontrolü: `running` olmalı
4. **Public IPv4 address** kontrolü: `107.23.178.153` olmalı

**Eğer instance durmuşsa:** Start instance yap

---

### 3. Security Group - SSH Portu (22)

**AWS Console'dan:**
1. EC2 → Instances → Instance'ı seç
2. **Security** tab → Security Group'a tıkla
3. **Inbound rules** kontrol et:
   - **Type:** SSH
   - **Port:** 22
   - **Source:** My IP (veya 0.0.0.0/0 - güvenlik riski var!)

**Yoksa ekle:** Add rule → SSH → Port 22 → My IP → Save

---

### 4. Kullanıcı Adı Kontrolü

**Ubuntu AMI için:** `ubuntu`  
**Amazon Linux için:** `ec2-user`  
**Debian için:** `admin` veya `debian`

**Farklı kullanıcı adı deneyin:**
```bash
# Amazon Linux için
ssh -i ~/.ssh/basvideo-backend-key.pem ec2-user@107.23.178.153

# Debian için
ssh -i ~/.ssh/basvideo-backend-key.pem admin@107.23.178.153
```

---

### 5. SSH Key Doğru mu?

**AWS Console'dan kontrol:**
1. EC2 → Instances → Instance'ı seç
2. **Connect** butonuna tıkla
3. **SSH client** tab'ına bak
4. Orada gösterilen key pair name'i kontrol et

**Eğer farklı bir key ise:**
- O key'i indirip kullanın
- Veya yeni key pair oluşturup instance'a ekleyin

---

### 6. EC2 Instance IP Değişmiş Olabilir

**EC2 instance'ın IP'si değişmiş olabilir (stop/start sonrası).**

**AWS Console'dan kontrol:**
1. EC2 → Instances
2. Instance'ı seç
3. **Public IPv4 address** değerini kontrol et
4. Güncel IP ile tekrar deneyin

---

## 🔄 Alternatif: EC2 Instance Connect

**AWS Console üzerinden bağlanabilirsiniz:**

1. AWS Console → EC2 → Instances
2. Instance'ı seç
3. **Connect** butonuna tıkla
4. **EC2 Instance Connect** seçeneğini seç
5. **Connect** butonuna tıkla

**Bu yöntem SSH key gerektirmez!**

---

## 🆘 Acil Durum: Yeni Key Pair

**Eğer hiçbiri çalışmazsa:**

1. **AWS Console → EC2 → Key Pairs → Create key pair**
2. Yeni key'i indir
3. **Instance → Actions → Security → Modify instance attributes**
4. Yeni key pair'i seç
5. Yeni key ile bağlan

**⚠️ Bu yöntem eski key'i devre dışı bırakır!**

---

## 📋 KONTROL LİSTESİ

- [ ] SSH key izinleri doğru (`chmod 400`)
- [ ] EC2 instance `running` durumunda
- [ ] Security Group'da port 22 (SSH) açık
- [ ] Kullanıcı adı doğru (`ubuntu`, `ec2-user`, vs.)
- [ ] SSH key doğru (AWS Console'da kontrol)
- [ ] IP adresi güncel (`107.23.178.153`)

---

## 🎯 Sonraki Adım

**Hangi sorun var?**
1. EC2 instance durumu?
2. Security Group ayarları?
3. SSH key doğru mu?
4. IP adresi güncel mi?

**Bana söyleyin, birlikte çözelim!** 🚀


# 🔧 EC2 BAĞLANTI ALTERNATİF ÇÖZÜMLERİ

**Sorun:** SSH key çalışmıyor, EC2 Instance Connect açılmıyor

---

## 🎯 ÇÖZÜM 1: Session Manager (ÖNERİLEN)

**Avantajlar:**
- ✅ SSH key gerektirmez
- ✅ Tarayıcıda çalışır
- ✅ Güvenli
- ✅ IAM ile kontrol edilir

**Adımlar:**
1. AWS Console → EC2 → Instances
2. Instance'ı seç
3. Connect → Session Manager
4. Connect

**Eğer Session Manager görünmüyorsa:**
- Systems Manager Agent kurulu olmayabilir
- IAM role gerekebilir

---

## 🎯 ÇÖZÜM 2: AWS Console'dan Key Pair Kontrolü

**Instance'ın hangi key pair kullandığını bul:**

1. EC2 → Instances → Instance'ı seç
2. **Details** tab → **Key pair name** kontrol et
3. **Connect** → **SSH client** → Key pair adını gör

**Eğer key pair adı farklıysa:**
- O key'i kullan
- Veya yeni key oluştur

---

## 🎯 ÇÖZÜM 3: Yeni Key Pair Oluştur

**1. Yeni key oluştur:**
- EC2 → Key Pairs → Create key pair
- Name: `basvideo-new-key`
- Type: RSA
- Format: .pem
- Create → İndir

**2. Instance'a ekle:**
- Instance → Actions → Security → Modify instance attributes
- Key pair name → Yeni key'i seç
- Save

**3. Yeni key ile bağlan:**
```bash
chmod 400 ~/Downloads/basvideo-new-key.pem
ssh -i ~/Downloads/basvideo-new-key.pem ubuntu@107.23.178.153
```

---

## 🎯 ÇÖZÜM 4: EC2 Serial Console

**Bazı durumlarda çalışabilir:**
- EC2 → Instances → Instance'ı seç
- Connect → EC2 Serial Console
- Connect

**Not:** Bu yöntem her instance'da çalışmayabilir.

---

## 🎯 ÇÖZÜM 5: AWS CloudShell

**AWS Console üzerinden terminal:**
1. AWS Console → CloudShell (üst çubukta terminal ikonu)
2. CloudShell açılır
3. EC2'ye SSH ile bağlanabilirsiniz

**Avantaj:** AWS içinden bağlanır, key gerektirmez

---

## 📋 HANGİ ÇÖZÜMÜ DENEYELİM?

**Öneri sırası:**
1. ✅ **Session Manager** (en kolay)
2. ✅ **Key pair kontrolü** (doğru key'i bul)
3. ✅ **Yeni key oluştur** (en garantili)
4. ✅ **CloudShell** (AWS içinden)

**Hangi yöntemi denemek istersiniz?** 🚀


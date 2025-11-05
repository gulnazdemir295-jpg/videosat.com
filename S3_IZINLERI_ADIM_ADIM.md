# 🔐 S3 İzinleri Ekleme - Adım Adım

## ⚠️ S3 Deployment İçin Gerekli

Frontend'i S3'e deploy etmek için IAM kullanıcısına S3 izinleri eklenmeli.

---

## 📋 ADIMLAR

### 1️⃣ AWS IAM Console'a Git
**URL:** https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/users

### 2️⃣ Kullanıcıyı Bul
- **Users** listesinden **`basvideo.com`** kullanıcısına tıkla

### 3️⃣ İzinleri Ekle
- Sağ üstte **"Add permissions"** butonuna tıkla
- **"Attach policies directly"** seçeneğini seç (ilk seçenek)
- **"Next"** butonuna tıkla

### 4️⃣ Policy Seç

**SEÇENEK A:** AWS Managed Policy
- Arama kutusuna **`S3`** yaz
- Herhangi bir **S3** içeren policy'yi seç (örn: `AmazonS3FullAccess` veya `S3FullAccess`)
- **"Next"** butonuna tıkla

**SEÇENEK B:** Özel Policy Oluştur (Policy listede yoksa)
- IAM Console → Sol menüden **"Policies"** → **"Create policy"**
- **JSON** tab'ına tıkla
- `s3-policy.json` dosyasındaki içeriği kopyala-yapıştır
- **Policy name:** `basvideo-s3-access`
- **Create policy** tıkla
- Geri dön → **Users** → **basvideo.com** → **Add permissions**
- Arama kutusuna **`basvideo-s3-access`** yaz ve seç

### 5️⃣ Onayla
- **"Add permissions"** butonuna tıkla

---

## ✅ İzinler Eklendikten Sonra

Bana haber ver, frontend'i S3'e deploy edelim! 

Şu komutu çalıştırabilirsin:
```bash
chmod +x deploy-frontend-to-s3.sh
./deploy-frontend-to-s3.sh
```

---

## 🔍 Hızlı Test

İzinler eklendikten sonra test et:
```bash
aws s3 ls s3://dunyanin-en-acayip-sitesi-328185871955/
```

Başarılı olursa dosya listesi görünmeli! ✅


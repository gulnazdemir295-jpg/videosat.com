# 🔐 IAM S3 İzinleri Ekleme Rehberi

## 📋 Frontend S3 Deployment İçin Gerekli

Frontend dosyalarını S3'e deploy etmek için IAM kullanıcısına S3 izinleri eklenmesi gerekiyor.

---

## 🔧 Adımlar

### 1. AWS Console'a Giriş
- https://us-east-1.console.aws.amazon.com/iam/home
- Root kullanıcı veya admin ile giriş yap

### 2. IAM User'a Git
- Sol menüden **Users** → **basvideo.com** kullanıcısına tıkla

### 3. İzinleri Ekle
- **Add permissions** butonuna tıkla
- **Attach policies directly** seçeneğini seç
- Arama kutusuna `S3` yaz
- **AmazonS3FullAccess** policy'sini işaretle
- **Next** → **Add permissions** tıkla

### ALTERNATİF: Özel Policy (Daha Güvenli)

Sadece belirli bucket'a erişim için:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::dunyanin-en-acayip-sitesi-328185871955",
        "arn:aws:s3:::dunyanin-en-acayip-sitesi-328185871955/*"
      ]
    }
  ]
}
```

---

## ✅ İzinler Eklendikten Sonra

S3'e deploy etmek için:

```bash
cd /Users/gulnazdemir/Desktop/DENEME

# Frontend dosyalarını S3'e sync et
aws s3 sync . s3://dunyanin-en-acayip-sitesi-328185871955 \
  --exclude "backend/*" \
  --exclude "node_modules/*" \
  --exclude ".git/*" \
  --exclude "*.md" \
  --exclude "*.sh" \
  --exclude "*.zip" \
  --exclude "VideoSat-Project-2024-GulnazDemir-NEW.zip" \
  --exclude "VideoSat-Project-2024-GulnazDemir.zip" \
  --delete
```

---

## 🔍 Kontrol

İzinler eklendikten sonra test et:

```bash
# S3 bucket listesi
aws s3 ls s3://dunyanin-en-acayip-sitesi-328185871955
```

---

## ⚠️ Not

İzinleri ekledikten sonra bana haber ver, frontend'i deploy edelim! 🚀





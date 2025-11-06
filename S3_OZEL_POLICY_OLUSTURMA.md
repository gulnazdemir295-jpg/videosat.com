# 🔐 S3 Özel Policy Oluşturma - Adım Adım

## ✅ Çözüm: Özel Policy Oluştur

S3 policy'leri listede yoksa, kendimiz oluşturalım!

---

## 📋 ADIMLAR

### 1️⃣ Policies Sayfasına Git

AWS Console → **IAM** → Sol menüden **"Policies"** → **"Create policy"** butonuna tıkla

**URL:** https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/policies

---

### 2️⃣ JSON Tab'ına Geç

- **"JSON"** tab'ına tıkla (üstteki sekmelerden)

---

### 3️⃣ JSON İçeriğini Yapıştır

Aşağıdaki JSON'u **tamamen sil** ve **yerine şunu yapıştır:**

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
        "s3:ListBucket",
        "s3:PutObjectAcl",
        "s3:GetObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::dunyanin-en-acayip-sitesi-328185871955",
        "arn:aws:s3:::dunyanin-en-acayip-sitesi-328185871955/*"
      ]
    }
  ]
}
```

**NOT:** `s3-policy.json` dosyasını açıp içeriğini kopyalayabilirsin!

---

### 4️⃣ Policy İsmini Gir

- **Policy name:** `basvideo-s3-access`
- **Description:** `S3 bucket access for basvideo.com frontend deployment` (opsiyonel)

---

### 5️⃣ Policy'yi Oluştur

- **"Create policy"** butonuna tıkla

✅ Policy oluşturuldu!

---

### 6️⃣ Policy'yi Kullanıcıya Ekle

1. **IAM** → **Users** → **`basvideo.com`** kullanıcısına tıkla

2. **"Add permissions"** → **"Attach policies directly"**

3. Arama kutusuna **`basvideo-s3-access`** yaz

4. Policy'yi **işaretle** (checkbox)

5. **"Next"** → **"Add permissions"**

---

## ✅ Kontrol Et

Policy eklendikten sonra test et:

```bash
aws s3 ls s3://dunyanin-en-acayip-sitesi-328185871955/
```

Başarılı olursa dosya listesi görünür! ✅

---

## 🎯 Hızlı Erişim

- **Policies:** https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/policies
- **Users:** https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/users

---

## 💡 Not

Bu policy sadece `dunyanin-en-acayip-sitesi-328185871955` bucket'ına erişim verir. Güvenli! 🔒






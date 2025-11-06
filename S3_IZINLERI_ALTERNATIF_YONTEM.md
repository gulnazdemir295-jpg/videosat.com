# 🔐 S3 İzinleri Ekleme - Alternatif Yöntem

## ❌ "AmazonS3FullAccess" Listede Yok

Eğer AWS Console'da "AmazonS3FullAccess" policy'sini bulamıyorsan, şu alternatifleri dene:

---

## ✅ YÖNTEM 1: Farklı İsimlerle Ara

1. **Arama kutusuna farklı terimler yaz:**
   - `S3` → Tüm S3 policy'lerini listeler
   - `Full Access` → Tüm full access policy'lerini listeler
   - `Amazon S3` → S3 ile ilgili policy'ler

2. **Şu policy'lerden birini seç:**
   - ✅ `AmazonS3FullAccess` (varsa)
   - ✅ `S3FullAccess` (eski isim)
   - ✅ Herhangi bir `S3` içeren policy

---

## ✅ YÖNTEM 2: Özel Policy Oluştur (ÖNERİLEN)

### Adımlar:

1. **IAM Console'da** → Sol menüden **"Policies"** → **"Create policy"**

2. **JSON tab'ına tıkla** ve şu JSON'u yapıştır:

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

3. **"Next"** → **"Policy name"** gir: `basvideo-s3-access`

4. **"Create policy"** tıkla

5. **Users** → **`basvideo.com`** → **Add permissions** → **"Attach policies directly"**

6. **Arama kutusuna** `basvideo-s3-access` yaz

7. **Policy'yi seç** ve **"Add permissions"** tıkla

---

## ✅ YÖNTEM 3: AWS CLI ile Ekle (Hızlı)

Eğer AWS CLI'den erişimin varsa:

```bash
# Policy JSON dosyasını oluştur
cat > s3-policy.json << 'EOF'
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
EOF

# Policy oluştur (root kullanıcı ile)
aws iam create-policy \
  --policy-name basvideo-s3-access \
  --policy-document file://s3-policy.json

# Policy'yi user'a ekle
aws iam attach-user-policy \
  --user-name basvideo.com \
  --policy-arn arn:aws:iam::328185871955:policy/basvideo-s3-access
```

⚠️ **Not:** Bu komutlar root kullanıcı veya admin yetkisi gerektirir.

---

## 🔍 Kontrol Et

Hangi yöntemi seçersen seç, sonra test et:

```bash
aws s3 ls s3://dunyanin-en-acayip-sitesi-328185871955/
```

Başarılı olursa dosya listesi görünür! ✅

---

## 💡 Öneri

**YÖNTEM 2** (Özel Policy Oluştur) en güvenli ve önerilen yöntemdir.
Sadece gerekli bucket'a erişim verir.





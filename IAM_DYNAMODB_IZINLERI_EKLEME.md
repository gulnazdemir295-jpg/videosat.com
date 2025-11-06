# IAM DynamoDB İzinleri Ekleme Rehberi

## ⚠️ ÖNEMLİ: Backend şu anda çalışıyor ama DynamoDB izinleri eksik!

Backend başarıyla EC2'ye deploy edildi ve çalışıyor. Ancak DynamoDB erişimi için IAM izinleri eklenmesi gerekiyor.

---

## 🔐 IAM İzinlerini Ekleme Adımları

### 1. AWS Console'a Giriş Yap
- https://us-east-1.console.aws.amazon.com/iam/home adresine git
- Root kullanıcı veya admin yetkisi ile giriş yap

### 2. IAM User'a Git
- Sol menüden **Users** → **basvideo.com** kullanıcısına tıkla

### 3. İzinleri Ekle
- **Add permissions** butonuna tıkla
- **Attach policies directly** seçeneğini seç
- Arama kutusuna `DynamoDB` yaz
- **AmazonDynamoDBFullAccess** policy'sini işaretle
- **Next** → **Add permissions** tıkla

### ALTERNATİF: Özel Policy (Daha Güvenli)

Eğer sadece gerekli izinleri vermek istersen, şu JSON policy'yi kullan:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:DescribeTable",
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:ListTables"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:328185871955:table/basvideo-*"
      ]
    }
  ]
}
```

---

## 📊 DynamoDB Tablolarını Oluşturma

IAM izinleri eklendikten sonra, EC2'ye SSH ile bağlan ve:

```bash
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
cd /home/ubuntu
./create-dynamodb-tables.sh
```

---

## ✅ Kontrol

Tablolar oluşturulduktan sonra:

```bash
aws dynamodb list-tables --region us-east-1
```

Şu tablolar görünmeli:
- `basvideo-users`
- `basvideo-rooms`
- `basvideo-channels`
- `basvideo-payments`

---

## 🎯 Mevcut Durum

✅ **Backend EC2'de çalışıyor:** `http://107.23.178.153:4000`
✅ **Health check başarılı:** `/api/health` → `{"ok":true}`
✅ **PM2 ile yönetiliyor:** Otomatik restart
⚠️ **DynamoDB izinleri eksik:** İzinler eklendikten sonra tablolar oluşturulacak
✅ **Fallback aktif:** Şu anda in-memory storage kullanılıyor (geçici)

---

## 📝 Sonraki Adımlar

1. IAM izinlerini ekle (yukarıdaki adımlar)
2. DynamoDB tablolarını oluştur (`create-dynamodb-tables.sh`)
3. Backend'i yeniden başlat: `pm2 restart basvideo-backend`
4. Frontend'i backend URL'e bağla: `http://107.23.178.153:4000`





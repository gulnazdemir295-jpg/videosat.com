#!/bin/bash

# Frontend S3 Deployment Script
# IAM S3 izinleri eklendikten sonra çalıştırılmalı

S3_BUCKET="dunyanin-en-acayip-sitesi-328185871955"
REGION="us-east-1"

echo "🚀 Frontend S3 Deployment Başlıyor..."
echo "Bucket: $S3_BUCKET"
echo "Region: $REGION"
echo ""

# 1. S3 bucket erişimini test et
echo "1️⃣ S3 bucket erişimini kontrol ediyorum..."
if aws s3 ls "s3://$S3_BUCKET" 2>&1 | grep -q "PRE\|$S3_BUCKET"; then
    echo "✅ S3 bucket erişimi başarılı"
else
    echo "❌ S3 bucket erişimi başarısız!"
    echo "⚠️  IAM S3 izinlerini kontrol edin: IAM_S3_IZINLERI_EKLEME.md"
    exit 1
fi
echo ""

# 2. Frontend dosyalarını S3'e sync et
echo "2️⃣ Frontend dosyaları S3'e yükleniyor..."
aws s3 sync . "s3://$S3_BUCKET" \
  --exclude "backend/*" \
  --exclude "node_modules/*" \
  --exclude ".git/*" \
  --exclude "*.md" \
  --exclude "*.sh" \
  --exclude "*.zip" \
  --exclude "VideoSat-Project-2024-GulnazDemir-NEW.zip" \
  --exclude "VideoSat-Project-2024-GulnazDemir.zip" \
  --exclude ".env*" \
  --exclude "*.log" \
  --exclude ".DS_Store" \
  --delete \
  --region $REGION

if [ $? -eq 0 ]; then
    echo "✅ Frontend dosyaları başarıyla yüklendi"
else
    echo "❌ Yükleme sırasında hata oluştu"
    exit 1
fi
echo ""

# 3. CloudFront invalidation (opsiyonel - distribution ID gerekli)
echo "3️⃣ CloudFront cache temizleme..."
echo "ℹ️  CloudFront distribution ID gerekli"
echo "   Komut: aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths \"/*\""
echo ""

# 4. S3 bucket policy kontrolü (public read access)
echo "4️⃣ S3 bucket policy kontrolü..."
echo "ℹ️  Public read access için bucket policy kontrol edin"
echo ""

echo "🎉 Deployment tamamlandı!"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. S3 bucket'ın public read access'e sahip olduğundan emin ol"
echo "2. CloudFront cache temizle (distribution ID ile)"
echo "3. Browser'da test et"






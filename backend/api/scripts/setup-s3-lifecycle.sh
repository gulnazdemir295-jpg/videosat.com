#!/bin/bash
# ============================================
# S3 Lifecycle Policies Setup Script
# ============================================
# Bu script S3 bucket için lifecycle policies oluşturur.

set -e

BUCKET_NAME="${S3_BUCKET:-dunyanin-en-acayip-sitesi-328185871955}"
REGION="${AWS_REGION:-us-east-1}"

echo "🚀 S3 Lifecycle Policies Kurulumu Başlatılıyor..."
echo "🪣 Bucket: $BUCKET_NAME"
echo "🌍 Region: $REGION"
echo ""

# Lifecycle Policy JSON
LIFECYCLE_JSON=$(cat <<EOF
{
  "Rules": [
    {
      "Id": "DeleteOldLogs",
      "Status": "Enabled",
      "Prefix": "logs/",
      "Expiration": {
        "Days": 30
      }
    },
    {
      "Id": "TransitionToGlacier",
      "Status": "Enabled",
      "Prefix": "backups/",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 180,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ]
    },
    {
      "Id": "DeleteOldBackups",
      "Status": "Enabled",
      "Prefix": "backups/",
      "Expiration": {
        "Days": 365
      }
    },
    {
      "Id": "AbortIncompleteMultipartUpload",
      "Status": "Enabled",
      "AbortIncompleteMultipartUpload": {
        "DaysAfterInitiation": 7
      }
    }
  ]
}
EOF
)

# Lifecycle policy uygula
echo "📋 Lifecycle policy uygulanıyor..."
aws s3api put-bucket-lifecycle-configuration \
  --bucket "$BUCKET_NAME" \
  --lifecycle-configuration "$LIFECYCLE_JSON" \
  --region "$REGION"

echo "✅ Lifecycle policy uygulandı"
echo ""
echo "📋 Oluşturulan Kurallar:"
echo "   1. Delete Old Logs: 30 gün sonra sil"
echo "   2. Transition to Glacier: 90 gün sonra Glacier'a taşı"
echo "   3. Transition to Deep Archive: 180 gün sonra Deep Archive'a taşı"
echo "   4. Delete Old Backups: 365 gün sonra sil"
echo "   5. Abort Incomplete Multipart Upload: 7 gün sonra iptal et"
echo ""

# Versioning aktif et
echo "📦 S3 Versioning aktif ediliyor..."
aws s3api put-bucket-versioning \
  --bucket "$BUCKET_NAME" \
  --versioning-configuration Status=Enabled \
  --region "$REGION"

echo "✅ S3 Versioning aktif edildi"
echo ""

# Encryption aktif et
echo "🔐 S3 Encryption aktif ediliyor..."
aws s3api put-bucket-encryption \
  --bucket "$BUCKET_NAME" \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }' \
  --region "$REGION"

echo "✅ S3 Encryption aktif edildi"
echo ""

echo "✅ S3 Lifecycle Policies Kurulumu Tamamlandı!"


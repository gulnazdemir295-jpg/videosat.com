#!/bin/bash
# ============================================
# DynamoDB Point-in-Time Recovery (PITR) Setup
# ============================================
# Bu script DynamoDB tabloları için PITR'ı aktif eder.

set -e

REGION="${AWS_REGION:-us-east-1}"
TABLES=(
  "basvideo-users"
  "basvideo-rooms"
  "basvideo-channels"
  "basvideo-payments"
)

echo "🚀 DynamoDB PITR Kurulumu Başlatılıyor..."
echo "🌍 Region: $REGION"
echo "📊 Tablolar: ${TABLES[*]}"
echo ""

for table in "${TABLES[@]}"; do
  echo "📦 $table tablosu için PITR aktif ediliyor..."
  
  # PITR aktif et
  aws dynamodb update-continuous-backups \
    --table-name "$table" \
    --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true \
    --region "$REGION" 2>/dev/null || {
      echo "⚠️  $table tablosu bulunamadı veya PITR zaten aktif"
      continue
    }
  
  echo "✅ $table için PITR aktif edildi"
  
  # PITR durumunu kontrol et
  sleep 2
  PITR_STATUS=$(aws dynamodb describe-continuous-backups \
    --table-name "$table" \
    --region "$REGION" \
    --query 'ContinuousBackupsDescription.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus' \
    --output text 2>/dev/null || echo "UNKNOWN")
  
  echo "   Status: $PITR_STATUS"
  echo ""
done

echo "✅ DynamoDB PITR Kurulumu Tamamlandı!"
echo ""
echo "📝 Notlar:"
echo "   - PITR ile son 35 gün içindeki herhangi bir noktaya geri dönebilirsiniz"
echo "   - PITR maliyeti tablo boyutuna göre değişir"
echo "   - Backup'lar otomatik olarak yönetilir"
echo ""
echo "🔍 PITR durumunu kontrol etmek için:"
echo "   aws dynamodb describe-continuous-backups --table-name <table-name> --region $REGION"


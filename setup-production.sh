#!/bin/bash

# BasVideo.com Production Setup Script
# DynamoDB + Mediasoup Setup

set -e

REGION="us-east-1"

echo "🚀 BasVideo.com Production Setup Başlatılıyor..."
echo ""

# 1. DynamoDB Tabloları
echo "📊 ADIM 1: DynamoDB Tabloları Oluşturuluyor..."
echo ""

create_table() {
  local table_name=$1
  local partition_key=$2
  local sort_key=$3
  
  echo "  📝 $table_name oluşturuluyor..."
  
  if [ -z "$sort_key" ]; then
    aws dynamodb create-table \
      --table-name "$table_name" \
      --attribute-definitions "AttributeName=$partition_key,AttributeType=S" \
      --key-schema "AttributeName=$partition_key,KeyType=HASH" \
      --billing-mode PAY_PER_REQUEST \
      --region $REGION \
      --output json > /dev/null 2>&1 || echo "    ⚠️  Tablo zaten mevcut veya hata oluştu"
  else
    aws dynamodb create-table \
      --table-name "$table_name" \
      --attribute-definitions \
        "AttributeName=${partition_key%:*},AttributeType=${partition_key#*:}" \
        "AttributeName=${sort_key%:*},AttributeType=${sort_key#*:}" \
      --key-schema \
        "AttributeName=${partition_key%:*},KeyType=HASH" \
        "AttributeName=${sort_key%:*},KeyType=RANGE" \
      --billing-mode PAY_PER_REQUEST \
      --region $REGION \
      --output json > /dev/null 2>&1 || echo "    ⚠️  Tablo zaten mevcut veya hata oluştu"
  fi
  
  echo "    ✅ $table_name hazır"
}

create_table "basvideo-users" "email" ""
create_table "basvideo-rooms" "roomId" ""
create_table "basvideo-channels" "channelId:S" "roomId:S"
create_table "basvideo-payments" "paymentId" ""

echo ""
echo "✅ DynamoDB Tabloları Hazır!"
echo ""

# Tabloları listele
echo "📊 Oluşturulan Tablolar:"
aws dynamodb list-tables --region $REGION --query 'TableNames[?contains(@, `basvideo`)]' --output table 2>/dev/null || echo "  (Tablolar oluşturuluyor, birkaç saniye bekleyin)"

echo ""
echo "🎉 ADIM 1 TAMAMLANDI!"
echo ""
echo "📋 Sonraki Adımlar:"
echo "  1. Backend kodunu DynamoDB için güncelle"
echo "  2. Mediasoup dependency ekle"
echo "  3. EC2 instance oluştur"
echo "  4. Deploy et"







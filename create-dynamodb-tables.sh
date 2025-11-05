#!/bin/bash

# DynamoDB Tablolarını Oluştur
# Bu script IAM izinleri eklendikten sonra çalıştırılmalı

REGION="us-east-1"

echo "📊 DynamoDB tabloları oluşturuluyor..."

# Users Table
aws dynamodb create-table \
  --table-name basvideo-users \
  --attribute-definitions AttributeName=email,AttributeType=S \
  --key-schema AttributeName=email,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION \
  --no-cli-pager

echo "✅ basvideo-users tablosu oluşturuldu"

# Rooms Table
aws dynamodb create-table \
  --table-name basvideo-rooms \
  --attribute-definitions AttributeName=roomId,AttributeType=S \
  --key-schema AttributeName=roomId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION \
  --no-cli-pager

echo "✅ basvideo-rooms tablosu oluşturuldu"

# Channels Table
aws dynamodb create-table \
  --table-name basvideo-channels \
  --attribute-definitions AttributeName=channelId,AttributeType=S AttributeName=roomId,AttributeType=S \
  --key-schema AttributeName=channelId,KeyType=HASH \
  --global-secondary-indexes \
    "[{
      \"IndexName\": \"RoomIdIndex\",
      \"KeySchema\": [
        {\"AttributeName\": \"roomId\", \"KeyType\": \"HASH\"}
      ],
      \"Projection\": {
        \"ProjectionType\": \"ALL\"
      }
    }]" \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION \
  --no-cli-pager

echo "✅ basvideo-channels tablosu oluşturuldu"

# Payments Table
aws dynamodb create-table \
  --table-name basvideo-payments \
  --attribute-definitions AttributeName=paymentId,AttributeType=S \
  --key-schema AttributeName=paymentId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION \
  --no-cli-pager

echo "✅ basvideo-payments tablosu oluşturuldu"

echo ""
echo "🎉 Tüm tablolar oluşturuldu!"
echo "📋 Tabloları kontrol etmek için: aws dynamodb list-tables --region $REGION"



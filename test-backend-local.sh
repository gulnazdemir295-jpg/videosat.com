#!/bin/bash

# Backend Local Test Script

echo "🧪 Backend Local Test Başlatılıyor..."
echo ""

cd /Users/gulnazdemir/Desktop/DENEME/backend/api

# .env dosyası kontrolü
if [ ! -f .env ]; then
  echo "⚠️  .env dosyası bulunamadı, örnek oluşturuluyor..."
  cat > .env << EOF
PORT=4000
NODE_ENV=development
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAUY2LG7ZJ3IQTWA6C
AWS_SECRET_ACCESS_KEY=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
ADMIN_TOKEN=test-admin-token-123
DYNAMODB_TABLE_USERS=basvideo-users
DYNAMODB_TABLE_ROOMS=basvideo-rooms
DYNAMODB_TABLE_CHANNELS=basvideo-channels
DYNAMODB_TABLE_PAYMENTS=basvideo-payments
USE_DYNAMODB=true
EOF
  echo "✅ .env dosyası oluşturuldu"
fi

echo "🚀 Backend başlatılıyor..."
echo "📍 Port: 4000"
echo "🔗 Test URL: http://localhost:4000/api/health"
echo ""
echo "⚠️  Backend'i durdurmak için: Ctrl+C"
echo ""

# Backend'i başlat
npm start




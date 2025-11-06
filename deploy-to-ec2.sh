#!/bin/bash

# 🚀 EC2'ye Deploy Script
# Kullanım: ./deploy-to-ec2.sh

set -e

KEY_PATH="$HOME/Downloads/basvideo-backend-key.pem"
EC2_HOST="ubuntu@107.23.178.153"
EC2_PATH="/home/ubuntu/api"
LOCAL_PATH="backend/api"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║        🚀 EC2'ye Deploy Başlatılıyor...                      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Key dosyası kontrolü
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ Key dosyası bulunamadı: $KEY_PATH"
    exit 1
fi

# Key permissions
chmod 400 "$KEY_PATH" 2>/dev/null || true

# 1. Package.json kopyala
echo "📦 1. package.json kopyalanıyor..."
scp -i "$KEY_PATH" \
    "$LOCAL_PATH/package.json" \
    "$EC2_HOST:$EC2_PATH/" || {
    echo "❌ package.json kopyalanamadı"
    exit 1
}
echo "✅ package.json kopyalandı"

# 2. App.js kopyala
echo "📄 2. app.js kopyalanıyor..."
scp -i "$KEY_PATH" \
    "$LOCAL_PATH/app.js" \
    "$EC2_HOST:$EC2_PATH/" || {
    echo "❌ app.js kopyalanamadı"
    exit 1
}
echo "✅ app.js kopyalandı"

# 3. Test dosyalarını kopyala
echo "🧪 3. Test dosyaları kopyalanıyor..."
scp -i "$KEY_PATH" \
    -r "$LOCAL_PATH/tests" \
    "$EC2_HOST:$EC2_PATH/" 2>/dev/null || {
    echo "⚠️ Test dosyaları kopyalanamadı (opsiyonel)"
}
echo "✅ Test dosyaları kopyalandı"

# 4. EC2'de npm install
echo "📥 4. NPM install çalıştırılıyor..."
ssh -i "$KEY_PATH" "$EC2_HOST" << 'ENDSSH'
cd /home/ubuntu/api
echo "📦 Yeni paketler yükleniyor..."
npm install 2>&1 | tail -10
echo ""
echo "✅ NPM install tamamlandı"
ENDSSH

# 5. Backend restart
echo "🔄 5. Backend restart ediliyor..."
ssh -i "$KEY_PATH" "$EC2_HOST" << 'ENDSSH'
cd /home/ubuntu/api
pm2 restart basvideo-backend
echo ""
echo "📋 PM2 durumu:"
pm2 status
echo ""
echo "📊 Son log'lar:"
pm2 logs basvideo-backend --lines 10 --nostream
ENDSSH

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║        ✅ DEPLOY TAMAMLANDI!                                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "🧪 Test etmek için:"
echo "   ssh -i $KEY_PATH $EC2_HOST"
echo "   cd /home/ubuntu/api"
echo "   npm test"
echo ""

#!/bin/bash
# Basvideo.com Deployment Script
# Kullanım: ./deploy-basvideo.sh

set -e

echo "🚀 Basvideo.com Deployment Başlıyor..."
echo ""

# 1. Git durumu kontrol
echo "📦 Git durumu kontrol ediliyor..."
git status --short

# 2. Backend kurulumu
echo ""
echo "⚙️  Backend kurulumu..."
cd backend/api

if [ ! -f .env ]; then
    echo "⚠️  .env dosyası bulunamadı. .env.example'dan kopyalanıyor..."
    cp .env.example .env
    echo "✅ .env dosyası oluşturuldu. Lütfen gerçek değerleri girin!"
    echo "   nano .env  # veya vi .env"
    exit 1
fi

echo "📦 npm paketleri yükleniyor..."
npm install --production

# 3. PM2 ile başlat
echo ""
echo "🔄 PM2 ile backend başlatılıyor..."
if command -v pm2 &> /dev/null; then
    pm2 restart basvideo-api || pm2 start app.js --name basvideo-api
    pm2 save
    echo "✅ Backend PM2 ile başlatıldı"
else
    echo "⚠️  PM2 bulunamadı. 'npm install -g pm2' ile kurun"
    echo "   Manuel başlatma: node app.js"
fi

# 4. Health check
echo ""
echo "🏥 Backend health check..."
sleep 2
curl -f http://localhost:4000/api/health || echo "⚠️  Backend henüz hazır değil"

echo ""
echo "✅ Deployment tamamlandı!"
echo ""
echo "📝 Sonraki adımlar:"
echo "   1. .env dosyasını kontrol edin (gerçek credentials)"
echo "   2. Nginx reverse proxy yapılandırın (opsiyonel)"
echo "   3. SSL sertifikası kurun (Let's Encrypt)"
echo "   4. Frontend'i deploy edin"


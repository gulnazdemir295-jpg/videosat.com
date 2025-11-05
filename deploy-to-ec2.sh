#!/bin/bash

# Backend EC2 Deployment Script
# BasVideo.com Production Deployment

set -e

EC2_IP="18.138.240.4"
KEY_FILE=""
EC2_USER="ubuntu"

echo "🚀 BasVideo.com Backend EC2 Deployment"
echo "📍 EC2 IP: $EC2_IP"
echo ""

# Key dosyasını bul
if [ -f ~/Downloads/basvideo-backend-key.pem ]; then
  KEY_FILE=~/Downloads/basvideo-backend-key.pem
elif [ -f ~/.ssh/basvideo-backend-key.pem ]; then
  KEY_FILE=~/.ssh/basvideo-backend-key.pem
elif [ -f ~/basvideo-backend-key.pem ]; then
  KEY_FILE=~/basvideo-backend-key.pem
else
  echo "❌ Key dosyası bulunamadı!"
  echo "Lütfen key dosyasının yerini belirtin:"
  echo "  ~/Downloads/basvideo-backend-key.pem"
  echo "  ~/.ssh/basvideo-backend-key.pem"
  echo "  veya başka bir yer"
  exit 1
fi

echo "✅ Key dosyası bulundu: $KEY_FILE"
echo ""

# Key permissions
echo "🔐 Key permissions ayarlanıyor..."
chmod 400 "$KEY_FILE"
echo "✅ Key permissions: $(ls -l "$KEY_FILE" | awk '{print $1}')"
echo ""

# SSH bağlantı testi
echo "🔌 SSH bağlantısı test ediliyor..."
if ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$EC2_USER@$EC2_IP" "echo 'SSH OK'" 2>/dev/null; then
  echo "✅ SSH bağlantısı başarılı!"
else
  echo "⚠️  SSH bağlantısı test edilemedi (normal, ilk kez bağlanıyorsun)"
fi
echo ""

echo "📦 Backend kodu EC2'ye kopyalanıyor..."
cd /Users/gulnazdemir/Desktop/DENEME

# Backend kodunu kopyala
scp -i "$KEY_FILE" -r backend/api "$EC2_USER@$EC2_IP:/home/$EC2_USER/" || {
  echo "❌ SCP hatası! Manuel olarak yapmalısın:"
  echo ""
  echo "scp -i $KEY_FILE -r backend/api $EC2_USER@$EC2_IP:/home/$EC2_USER/"
  exit 1
}

echo "✅ Backend kodu kopyalandı!"
echo ""
echo "📋 Sonraki Adımlar (EC2'de SSH ile):"
echo ""
echo "1. SSH ile bağlan:"
echo "   ssh -i $KEY_FILE $EC2_USER@$EC2_IP"
echo ""
echo "2. EC2'de kurulum komutlarını çalıştır (aşağıdaki komutları kopyala-yapıştır):"
echo ""
cat << 'DEPLOY_COMMANDS'
# Node.js kur
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kur
sudo npm install -g pm2

# Backend dizinine git
cd /home/ubuntu/api

# Dependencies kur
npm install

# .env dosyası oluştur
nano .env
# (Aşağıdaki içeriği yapıştır, Ctrl+X → Y → Enter)

# PM2 ile başlat
pm2 start app.js --name basvideo-backend
pm2 startup
pm2 save

# Test et
curl http://localhost:4000/api/health
DEPLOY_COMMANDS

echo ""
echo "📝 .env dosyası içeriği (nano .env içine yapıştır):"
echo ""
cat << 'ENV_CONTENT'
PORT=4000
NODE_ENV=production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
ADMIN_TOKEN=basvideo-admin-token-2024-secure
DYNAMODB_TABLE_USERS=basvideo-users
DYNAMODB_TABLE_ROOMS=basvideo-rooms
DYNAMODB_TABLE_CHANNELS=basvideo-channels
DYNAMODB_TABLE_PAYMENTS=basvideo-payments
USE_DYNAMODB=true
ENV_CONTENT

echo ""
echo "✅ Deployment script tamamlandı!"
echo ""

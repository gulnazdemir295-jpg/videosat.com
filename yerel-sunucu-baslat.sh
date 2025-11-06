#!/bin/bash

# Yerel Sunucu Başlatma Script'i
# VideoSat Multi-Channel Room Backend

echo "🚀 Yerel Sunucu Başlatılıyor..."
echo ""

# Backend dizinine git
cd "$(dirname "$0")/backend/api" || exit

# Mevcut backend process'ini durdur
echo "📛 Mevcut backend process'i kontrol ediliyor..."
if pgrep -f "node app.js" > /dev/null; then
    echo "   ⚠️  Mevcut backend process bulundu, durduruluyor..."
    pkill -f "node app.js"
    sleep 2
fi

# Backend'i başlat
echo "✅ Backend başlatılıyor..."
echo ""

node app.js













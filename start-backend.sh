#!/bin/bash

# VideoSat Backend Başlatma Scripti
# Agora.io ile canlı yayın sistemi

echo "🚀 VideoSat Backend Başlatılıyor..."
echo ""

# Dizin kontrolü
if [ ! -d "backend/api" ]; then
    echo "❌ backend/api klasörü bulunamadı!"
    exit 1
fi

cd backend/api

# Node modules kontrolü
if [ ! -d "node_modules" ]; then
    echo "📦 Node modules yükleniyor..."
    npm install
fi

# .env dosyası kontrolü
if [ ! -f ".env" ]; then
    echo "⚠️ .env dosyası bulunamadı!"
    echo "📝 .env.example dosyasından kopyalayın ve AGORA_APP_ID, AGORA_APP_CERTIFICATE ekleyin"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env.example'dan .env oluşturuldu"
        echo "⚠️ LÜTFEN .env DOSYASINA AGORA CREDENTIALS EKLEYİN!"
    fi
else
    echo "✅ .env dosyası bulundu"
fi

# Agora credentials kontrolü
if ! grep -q "AGORA_APP_ID" .env 2>/dev/null || [ -z "$(grep AGORA_APP_ID .env | cut -d'=' -f2 | tr -d ' ')" ]; then
    echo "⚠️ AGORA_APP_ID .env dosyasında bulunamadı veya boş!"
    echo "📝 Lütfen .env dosyasına AGORA_APP_ID ve AGORA_APP_CERTIFICATE ekleyin"
    echo ""
    echo "Örnek:"
    echo "AGORA_APP_ID=your_app_id_here"
    echo "AGORA_APP_CERTIFICATE=your_app_certificate_here"
    echo "STREAM_PROVIDER=AGORA"
    echo ""
    read -p "Devam etmek istiyor musunuz? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Agora credentials bulundu"
fi

# Port kontrolü
PORT=${PORT:-3000}
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️ Port $PORT zaten kullanımda!"
    echo "🔍 Kullanılan process:"
    lsof -Pi :$PORT -sTCP:LISTEN
    echo ""
    read -p "Process'i sonlandırmak istiyor musunuz? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill -9 $(lsof -ti:$PORT) 2>/dev/null
        echo "✅ Process sonlandırıldı"
        sleep 2
    else
        echo "❌ Backend başlatılamadı - port kullanımda"
        exit 1
    fi
fi

echo ""
echo "🎬 Backend başlatılıyor..."
echo "📍 URL: http://localhost:$PORT"
echo "📡 API: http://localhost:$PORT/api"
echo ""
echo "Durdurmak için Ctrl+C"
echo ""

# Backend'i başlat
npm start


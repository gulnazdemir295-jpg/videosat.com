#!/bin/bash

# Backend API Test Script
BACKEND_URL="http://107.23.178.153:4000"

echo "🧪 Backend API Testleri Başlıyor..."
echo "Backend URL: $BACKEND_URL"
echo ""

# 1. Health Check
echo "1️⃣ Health Check Test..."
HEALTH=$(curl -s "$BACKEND_URL/api/health")
if echo "$HEALTH" | grep -q "ok"; then
    echo "✅ Health check başarılı: $HEALTH"
else
    echo "❌ Health check başarısız: $HEALTH"
fi
echo ""

# 2. Payments Status
echo "2️⃣ Payments Status Test..."
PAYMENT=$(curl -s "$BACKEND_URL/api/payments/status?userEmail=test@example.com")
echo "Payments status: $PAYMENT"
echo ""

# 3. Admin Stream Key Status (requires token)
echo "3️⃣ Admin Stream Key Status Test..."
ADMIN_TOKEN="test-token" # Gerçek token ile değiştirilmeli
STREAM_KEY=$(curl -s -H "x-admin-token: $ADMIN_TOKEN" "$BACKEND_URL/api/admin/stream-key/status")
echo "Stream key status: $STREAM_KEY"
echo ""

# 4. Rooms List (requires admin token)
echo "4️⃣ Admin Rooms List Test..."
ROOMS=$(curl -s -H "x-admin-token: $ADMIN_TOKEN" "$BACKEND_URL/api/admin/rooms")
echo "Rooms: $ROOMS"
echo ""

echo "✅ Testler tamamlandı!"





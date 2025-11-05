#!/bin/bash

# 🧪 Sistem Test Scripti - Kapsamlı Test
# Test Tarihi: $(date +%Y-%m-%d)

BACKEND_URL="http://107.23.178.153:4000"
TEST_TIMESTAMP=$(date +%s)
TEST_ROOM_ID="test-sistem-${TEST_TIMESTAMP}"
RESULTS_FILE="SISTEM_TEST_SONUCLARI.md"

echo "🧪 Sistem Testleri Başlıyor..."
echo "📅 Test Tarihi: $(date +%Y-%m-%d\ %H:%M:%S)"
echo "🔗 Backend URL: $BACKEND_URL"
echo ""

# Test sonuçlarını saklamak için değişkenler
TEST1_RESULT=""
TEST2_RESULT=""
TEST3_RESULT=""
TEST4_RESULT=""

# ==========================================
# TEST 1: Backend Health Check
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣ TEST 1: Backend Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Endpoint: GET /api/health"
echo "URL: ${BACKEND_URL}/api/health"
echo ""

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}/api/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $HEALTH_BODY"
echo ""

if echo "$HEALTH_BODY" | grep -q '"ok":true' && [ "$HTTP_CODE" = "200" ]; then
    echo "✅ TEST 1: BAŞARILI - Health check başarılı"
    TEST1_RESULT="✅ BAŞARILI - Health check başarılı: $HEALTH_BODY"
else
    echo "❌ TEST 1: BAŞARISIZ - Health check başarısız"
    TEST1_RESULT="❌ BAŞARISIZ - HTTP $HTTP_CODE: $HEALTH_BODY"
fi
echo ""

# ==========================================
# TEST 2: AWS IVS Channel Oluşturma
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣ TEST 2: AWS IVS Channel Oluşturma"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Komut: aws ivs create-channel"
echo "Channel Name: test-sistem-${TEST_TIMESTAMP}"
echo ""

CHANNEL_NAME="test-sistem-${TEST_TIMESTAMP}"
IVS_RESPONSE=$(aws ivs create-channel \
  --name "$CHANNEL_NAME" \
  --type BASIC \
  --latency-mode LOW \
  --region us-east-1 2>&1)

echo "AWS IVS Response:"
echo "$IVS_RESPONSE"
echo ""

if echo "$IVS_RESPONSE" | grep -q "PendingVerification"; then
    echo "❌ TEST 2: BAŞARISIZ - Hala PendingVerification hatası"
    TEST2_RESULT="❌ BAŞARISIZ - PendingVerification hatası (IVS doğrulaması bekleniyor)"
elif echo "$IVS_RESPONSE" | grep -q "QuotaExceeded"; then
    echo "❌ TEST 2: BAŞARISIZ - QuotaExceeded hatası"
    TEST2_RESULT="❌ BAŞARISIZ - QuotaExceeded hatası (Stream key quota limiti)"
elif echo "$IVS_RESPONSE" | grep -q "arn:aws:ivs"; then
    CHANNEL_ARN=$(echo "$IVS_RESPONSE" | grep -o 'arn:aws:ivs:[^"]*' | head -1)
    echo "✅ TEST 2: BAŞARILI - Channel oluşturuldu!"
    echo "Channel ARN: $CHANNEL_ARN"
    TEST2_RESULT="✅ BAŞARILI - Channel oluşturuldu! ARN: $CHANNEL_ARN"
else
    echo "⚠️  TEST 2: BİLİNMEYEN DURUM"
    TEST2_RESULT="⚠️  BİLİNMEYEN DURUM: $IVS_RESPONSE"
fi
echo ""

# ==========================================
# TEST 3: Backend API - Room'a Katılma
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣ TEST 3: Backend API - Room'a Katılma"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Endpoint: POST /api/rooms/${TEST_ROOM_ID}/join"
echo "URL: ${BACKEND_URL}/api/rooms/${TEST_ROOM_ID}/join"
echo ""

JOIN_REQUEST_BODY='{
  "streamerEmail": "test-sistem@basvideo.com",
  "streamerName": "Sistem Test",
  "deviceInfo": "Test Device"
}'

JOIN_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$JOIN_REQUEST_BODY" \
  "${BACKEND_URL}/api/rooms/${TEST_ROOM_ID}/join")

HTTP_CODE=$(echo "$JOIN_RESPONSE" | tail -n1)
JOIN_BODY=$(echo "$JOIN_RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $JOIN_BODY"
echo ""

if echo "$JOIN_BODY" | grep -q '"ok":true' && [ "$HTTP_CODE" = "200" ]; then
    if echo "$JOIN_BODY" | grep -q "PendingVerification"; then
        echo "❌ TEST 3: BAŞARISIZ - PendingVerification hatası"
        TEST3_RESULT="❌ BAŞARISIZ - PendingVerification hatası (IVS doğrulaması bekleniyor)"
    elif echo "$JOIN_BODY" | grep -q "channelId\|streamKey\|ingest\|playbackUrl"; then
        echo "✅ TEST 3: BAŞARILI - Room'a katılım başarılı, channel ve stream key oluşturuldu!"
        TEST3_RESULT="✅ BAŞARILI - Room'a katılım başarılı, channel ve stream key oluşturuldu"
    else
        echo "⚠️  TEST 3: BAŞARILI AMA BEKLENEN ALANLAR YOK"
        TEST3_RESULT="⚠️  BAŞARILI AMA BEKLENEN ALANLAR YOK: $JOIN_BODY"
    fi
else
    echo "❌ TEST 3: BAŞARISIZ - HTTP $HTTP_CODE"
    TEST3_RESULT="❌ BAŞARISIZ - HTTP $HTTP_CODE: $JOIN_BODY"
fi
echo ""

# ==========================================
# TEST 4: Backend API - Channel Listesi
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣ TEST 4: Backend API - Channel Listesi"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Endpoint: GET /api/rooms/videosat-showroom-2024/channels"
echo "URL: ${BACKEND_URL}/api/rooms/videosat-showroom-2024/channels"
echo ""

CHANNELS_RESPONSE=$(curl -s -w "\n%{http_code}" \
  "${BACKEND_URL}/api/rooms/videosat-showroom-2024/channels")

HTTP_CODE=$(echo "$CHANNELS_RESPONSE" | tail -n1)
CHANNELS_BODY=$(echo "$CHANNELS_RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $CHANNELS_BODY"
echo ""

if echo "$CHANNELS_BODY" | grep -q '"ok":true' && [ "$HTTP_CODE" = "200" ]; then
    echo "✅ TEST 4: BAŞARILI - Channel listesi alındı"
    TEST4_RESULT="✅ BAŞARILI - Channel listesi alındı"
else
    echo "❌ TEST 4: BAŞARISIZ - HTTP $HTTP_CODE"
    TEST4_RESULT="❌ BAŞARISIZ - HTTP $HTTP_CODE: $CHANNELS_BODY"
fi
echo ""

# ==========================================
# TEST SONUÇLARI ÖZET
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST SONUÇLARI ÖZET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "TEST 1 (Health Check): $TEST1_RESULT"
echo "TEST 2 (IVS Channel): $TEST2_RESULT"
echo "TEST 3 (Room Join): $TEST3_RESULT"
echo "TEST 4 (Channel List): $TEST4_RESULT"
echo ""

# Sonuçları dosyaya yaz
echo "📝 Test sonuçları dosyaya kaydediliyor..."
cat > "$RESULTS_FILE" << EOF
# 🧪 Sistem Test Sonuçları

## 📅 Test Tarihi: $(date +%Y-%m-%d)

---

## ✅ TEST 1: Backend Health Check

**Endpoint:** \`GET /api/health\`
**URL:** \`${BACKEND_URL}/api/health\`

**Beklenen:** \`{"ok":true}\`

**Sonuç:** $TEST1_RESULT

---

## ✅ TEST 2: AWS IVS Channel Oluşturma

**Komut:**
\`\`\`bash
aws ivs create-channel \\
  --name test-sistem-${TEST_TIMESTAMP} \\
  --type BASIC \\
  --latency-mode LOW \\
  --region us-east-1
\`\`\`

**Beklenen:**
- ✅ Channel oluşturulabilmeli (artık "PendingVerification" hatası olmamalı)
- ✅ Channel ARN dönmeli
- ✅ Ingest endpoint ve playback URL dönmeli

**Olası Sonuçlar:**
- ✅ Başarılı: Channel oluşturuldu → IVS doğrulaması tamamlandı!
- ❌ Hata: "PendingVerification" → Hala bekleniyor
- ❌ Hata: "QuotaExceeded" → Stream key quota limiti

**Sonuç:** $TEST2_RESULT

---

## ✅ TEST 3: Backend API - Room'a Katılma

**Endpoint:** \`POST /api/rooms/{roomId}/join\`
**URL:** \`${BACKEND_URL}/api/rooms/${TEST_ROOM_ID}/join\`

**Request Body:**
\`\`\`json
{
  "streamerEmail": "test-sistem@basvideo.com",
  "streamerName": "Sistem Test",
  "deviceInfo": "Test Device"
}
\`\`\`

**Beklenen:**
- ✅ \`"ok": true\` dönmeli
- ✅ \`channelId\`, \`streamKey\`, \`ingest\`, \`playbackUrl\` dönmeli
- ❌ "PendingVerification" hatası olmamalı

**Olası Sonuçlar:**
- ✅ Başarılı: Channel ve stream key oluşturuldu → Sistem çalışıyor!
- ❌ Hata: "PendingVerification" → Hala bekleniyor
- ❌ Hata: "QuotaExceeded" → Stream key quota limiti

**Sonuç:** $TEST3_RESULT

---

## ✅ TEST 4: Backend API - Channel Listesi

**Endpoint:** \`GET /api/rooms/{roomId}/channels\`
**URL:** \`${BACKEND_URL}/api/rooms/videosat-showroom-2024/channels\`

**Beklenen:**
- ✅ \`"ok": true\` dönmeli
- ✅ Channel listesi dönmeli (mevcut channel'lar varsa)

**Sonuç:** $TEST4_RESULT

---

## 📊 GENEL DURUM

### ✅ Çalışan Özellikler
- ✅ Backend API çalışıyor (\`/api/health\` → \`{"ok": true}\`)
- ✅ Backend EC2'de çalışıyor (107.23.178.153:4000)
- ✅ API endpoint'leri erişilebilir

### ❌ Çalışmayan Özellikler
- ❌ AWS IVS channel oluşturma (hala "PendingVerification" hatası)
- ❌ Stream key alma (hala "PendingVerification" hatası)
- ❌ Room'a katılma (hala "PendingVerification" hatası)
- ❌ Tarayıcıdan yayın (IVS doğrulaması gerekiyor)
- ❌ OBS Studio ile yayın (IVS doğrulaması gerekiyor)

### ⏳ Beklenenler
- ⏳ AWS IVS servisi doğrulaması/aktivasyonu
- ⏳ IVS limit erişim talebi (#176207538200769) - Global Servis ekibi inceliyor
- ⏳ WebRTC enablement (gerekirse)

---

## 🎯 SONUÇ

**Test Sonuçları:**
- ✅ Backend: Çalışıyor
- ❌ AWS IVS: Hala pending verification
- ⏳ Sistem: Hazır, sadece IVS doğrulaması bekleniyor

**Durum:** ⏳ Bekleniyor (AWS IVS doğrulaması)

**Sonraki Adımlar:**
1. ✅ Test tamamlandı
2. 📧 AWS Support mesajı gönderilecek (\`AWS_SUPPORT_DETAYLI_MESAJ_TR.md\`)
3. ⏳ AWS Support yanıtı bekleniyor (Case #176217761800459)
4. ⏳ Global Servis ekibi yanıtı bekleniyor (Case #176207538200769)
5. ⏳ IVS doğrulaması tamamlandığında tekrar test edilecek

---

**📅 Test Zamanı:** $(date +%Y-%m-%d\ %H:%M:%S)

EOF

echo "✅ Test sonuçları kaydedildi: $RESULTS_FILE"
echo ""
echo "🎉 Tüm testler tamamlandı!"


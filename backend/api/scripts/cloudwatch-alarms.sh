#!/bin/bash
# ============================================
# CloudWatch Alarms Setup Script
# ============================================
# Bu script CloudWatch alarm'larını oluşturur.
# Production ortamında çalıştırılmalıdır.

set -e

# Configuration
REGION="${AWS_REGION:-us-east-1}"
ALARM_EMAIL="${ALARM_EMAIL:-admin@basvideo.com}"
SNS_TOPIC_NAME="videosat-alarms"

echo "🚀 CloudWatch Alarms Kurulumu Başlatılıyor..."
echo "🌍 Region: $REGION"
echo "📧 Alarm Email: $ALARM_EMAIL"
echo ""

# SNS Topic oluştur (eğer yoksa)
echo "📧 SNS Topic oluşturuluyor..."
TOPIC_ARN=$(aws sns create-topic \
  --name "$SNS_TOPIC_NAME" \
  --region "$REGION" \
  --query 'TopicArn' \
  --output text 2>/dev/null || \
  aws sns list-topics \
    --region "$REGION" \
    --query "Topics[?contains(TopicArn, '$SNS_TOPIC_NAME')].TopicArn" \
    --output text | head -1)

if [ -z "$TOPIC_ARN" ]; then
  echo "❌ SNS Topic oluşturulamadı"
  exit 1
fi

echo "✅ SNS Topic: $TOPIC_ARN"

# Email subscription (eğer yoksa)
echo "📧 Email subscription ekleniyor..."
aws sns subscribe \
  --topic-arn "$TOPIC_ARN" \
  --protocol email \
  --notification-endpoint "$ALARM_EMAIL" \
  --region "$REGION" 2>/dev/null || echo "⚠️  Subscription zaten var veya hata oluştu"

echo "✅ Email subscription eklendi. Lütfen email'inizi onaylayın!"
echo ""

# ============================================
# API Health Check Alarm
# ============================================
echo "📊 API Health Check Alarm oluşturuluyor..."
aws cloudwatch put-metric-alarm \
  --alarm-name "VideoSat-API-Health-Check-Failed" \
  --alarm-description "API health check başarısız oldu" \
  --metric-name "HealthCheckFailed" \
  --namespace "VideoSat/API" \
  --statistic "Sum" \
  --period 60 \
  --evaluation-periods 2 \
  --threshold 1 \
  --comparison-operator "GreaterThanOrEqualToThreshold" \
  --alarm-actions "$TOPIC_ARN" \
  --region "$REGION" 2>/dev/null || echo "⚠️  Alarm zaten var"

echo "✅ API Health Check Alarm oluşturuldu"
echo ""

# ============================================
# High Error Rate Alarm
# ============================================
echo "📊 High Error Rate Alarm oluşturuluyor..."
aws cloudwatch put-metric-alarm \
  --alarm-name "VideoSat-High-Error-Rate" \
  --alarm-description "Yüksek hata oranı tespit edildi" \
  --metric-name "ErrorRate" \
  --namespace "VideoSat/API" \
  --statistic "Average" \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 0.05 \
  --comparison-operator "GreaterThanThreshold" \
  --alarm-actions "$TOPIC_ARN" \
  --region "$REGION" 2>/dev/null || echo "⚠️  Alarm zaten var"

echo "✅ High Error Rate Alarm oluşturuldu"
echo ""

# ============================================
# High Response Time Alarm
# ============================================
echo "📊 High Response Time Alarm oluşturuluyor..."
aws cloudwatch put-metric-alarm \
  --alarm-name "VideoSat-High-Response-Time" \
  --alarm-description "Yüksek response time tespit edildi" \
  --metric-name "ResponseTime" \
  --namespace "VideoSat/API" \
  --statistic "Average" \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 2000 \
  --comparison-operator "GreaterThanThreshold" \
  --alarm-actions "$TOPIC_ARN" \
  --region "$REGION" 2>/dev/null || echo "⚠️  Alarm zaten var"

echo "✅ High Response Time Alarm oluşturuldu"
echo ""

# ============================================
# DynamoDB Throttling Alarm
# ============================================
echo "📊 DynamoDB Throttling Alarm oluşturuluyor..."
for table in basvideo-users basvideo-rooms basvideo-channels basvideo-payments; do
  echo "   - $table"
  aws cloudwatch put-metric-alarm \
    --alarm-name "VideoSat-DynamoDB-Throttling-$table" \
    --alarm-description "DynamoDB throttling tespit edildi: $table" \
    --metric-name "UserErrors" \
    --namespace "AWS/DynamoDB" \
    --statistic "Sum" \
    --period 60 \
    --evaluation-periods 1 \
    --threshold 1 \
    --comparison-operator "GreaterThanThreshold" \
    --dimensions Name=TableName,Value="$table" \
    --alarm-actions "$TOPIC_ARN" \
    --region "$REGION" 2>/dev/null || echo "     ⚠️  Alarm zaten var"
done

echo "✅ DynamoDB Throttling Alarm'ları oluşturuldu"
echo ""

# ============================================
# High CPU Usage Alarm (EC2 için)
# ============================================
echo "📊 High CPU Usage Alarm oluşturuluyor..."
aws cloudwatch put-metric-alarm \
  --alarm-name "VideoSat-High-CPU-Usage" \
  --alarm-description "Yüksek CPU kullanımı tespit edildi" \
  --metric-name "CPUUtilization" \
  --namespace "AWS/EC2" \
  --statistic "Average" \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator "GreaterThanThreshold" \
  --alarm-actions "$TOPIC_ARN" \
  --region "$REGION" 2>/dev/null || echo "⚠️  Alarm zaten var (EC2 instance ID gerekli)"

echo "✅ High CPU Usage Alarm oluşturuldu"
echo ""

# ============================================
# Özet
# ============================================
echo "✅ CloudWatch Alarms Kurulumu Tamamlandı!"
echo ""
echo "📋 Oluşturulan Alarm'lar:"
echo "   1. API Health Check Failed"
echo "   2. High Error Rate"
echo "   3. High Response Time"
echo "   4. DynamoDB Throttling (4 tablo)"
echo "   5. High CPU Usage"
echo ""
echo "📧 Alarm'lar şu email'e gönderilecek: $ALARM_EMAIL"
echo "   Lütfen email'inizi onaylayın!"
echo ""
echo "🔍 Alarm'ları kontrol etmek için:"
echo "   aws cloudwatch describe-alarms --region $REGION"


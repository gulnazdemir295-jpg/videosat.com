#!/bin/bash
# ============================================
# AWS Cost Monitoring Setup Script
# ============================================
# Bu script AWS cost monitoring ve alert'lerini yapılandırır.

set -e

REGION="${AWS_REGION:-us-east-1}"
BUDGET_AMOUNT="${BUDGET_AMOUNT:-100}"  # USD
ALERT_EMAIL="${ALERT_EMAIL:-admin@basvideo.com}"
BUDGET_NAME="VideoSat-Monthly-Budget"

echo "🚀 AWS Cost Monitoring Kurulumu Başlatılıyor..."
echo "🌍 Region: $REGION"
echo "💰 Budget: \$$BUDGET_AMOUNT/month"
echo "📧 Alert Email: $ALERT_EMAIL"
echo ""

# Budget JSON
BUDGET_JSON=$(cat <<EOF
{
  "BudgetName": "$BUDGET_NAME",
  "BudgetLimit": {
    "Amount": "$BUDGET_AMOUNT",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST",
  "CostFilters": {
    "TagKeyValue": [
      "user:Project\$VideoSat"
    ]
  },
  "CalculatedSpend": {
    "ActualSpend": {
      "Amount": "0",
      "Unit": "USD"
    }
  },
  "BudgetType": "COST"
}
EOF
)

# Budget oluştur
echo "💰 Budget oluşturuluyor..."
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget "$BUDGET_JSON" \
  --notifications-with-subscribers '[
    {
      "Notification": {
        "NotificationType": "ACTUAL",
        "ComparisonOperator": "GREATER_THAN",
        "Threshold": 80,
        "ThresholdType": "PERCENTAGE"
      },
      "Subscribers": [
        {
          "SubscriptionType": "EMAIL",
          "Address": "$ALERT_EMAIL"
        }
      ]
    },
    {
      "Notification": {
        "NotificationType": "ACTUAL",
        "ComparisonOperator": "GREATER_THAN",
        "Threshold": 100,
        "ThresholdType": "PERCENTAGE"
      },
      "Subscribers": [
        {
          "SubscriptionType": "EMAIL",
          "Address": "$ALERT_EMAIL"
        }
      ]
    },
    {
      "Notification": {
        "NotificationType": "FORECASTED",
        "ComparisonOperator": "GREATER_THAN",
        "Threshold": 100,
        "ThresholdType": "PERCENTAGE"
      },
      "Subscribers": [
        {
          "SubscriptionType": "EMAIL",
          "Address": "$ALERT_EMAIL"
        }
      ]
    }
  ]' 2>/dev/null || {
    echo "⚠️  Budget zaten var veya oluşturulamadı"
  }

echo "✅ Budget oluşturuldu: $BUDGET_NAME"
echo ""
echo "📊 Budget Alert'leri:"
echo "   - %80 threshold: Budget'un %80'ine ulaşıldığında"
echo "   - %100 threshold: Budget limitine ulaşıldığında"
echo "   - Forecasted %100: Tahmin edilen maliyet limiti aşacaksa"
echo ""

# Cost Explorer'ı aktif et (otomatik aktif)
echo "📈 Cost Explorer aktif (AWS tarafından otomatik aktif)"
echo ""

# Resource tagging önerisi
echo "📋 Resource Tagging Önerisi:"
echo "   Tüm AWS resource'larını şu tag'lerle işaretleyin:"
echo "   - Project: VideoSat"
echo "   - Environment: Production"
echo "   - CostCenter: Engineering"
echo ""

echo "✅ AWS Cost Monitoring Kurulumu Tamamlandı!"
echo ""
echo "🔍 Cost'ları görüntülemek için:"
echo "   https://console.aws.amazon.com/cost-management/home?region=$REGION"


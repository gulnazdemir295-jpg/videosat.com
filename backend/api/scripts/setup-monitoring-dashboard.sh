#!/bin/bash
# ============================================
# CloudWatch Dashboard Setup Script
# ============================================
# Bu script CloudWatch dashboard'larını oluşturur.

set -e

REGION="${AWS_REGION:-us-east-1}"
DASHBOARD_NAME="VideoSat-Production"

echo "🚀 CloudWatch Dashboard Kurulumu Başlatılıyor..."
echo "🌍 Region: $REGION"
echo "📊 Dashboard: $DASHBOARD_NAME"
echo ""

# Dashboard JSON
DASHBOARD_JSON=$(cat <<EOF
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "VideoSat/API", "RequestCount", { "stat": "Sum", "label": "Total Requests" } ],
          [ ".", "ErrorCount", { "stat": "Sum", "label": "Errors" } ],
          [ ".", "ResponseTime", { "stat": "Average", "label": "Avg Response Time" } ]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "$REGION",
        "title": "API Overview",
        "yAxis": {
          "left": {
            "label": "Count"
          },
          "right": {
            "label": "Time (ms)"
          }
        }
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "VideoSat/API", "ErrorRate", { "stat": "Average", "label": "Error Rate" } ],
          [ ".", "SuccessRate", { "stat": "Average", "label": "Success Rate" } ]
        ],
        "period": 300,
        "stat": "Average",
        "region": "$REGION",
        "title": "API Success/Error Rates",
        "yAxis": {
          "left": {
            "min": 0,
            "max": 1
          }
        }
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "AWS/DynamoDB", "ConsumedReadCapacityUnits", { "stat": "Sum", "dimensions": { "TableName": "basvideo-users" } } ],
          [ ".", "ConsumedWriteCapacityUnits", { "stat": "Sum", "dimensions": { "TableName": "basvideo-users" } } ]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "$REGION",
        "title": "DynamoDB - Users Table"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "AWS/EC2", "CPUUtilization", { "stat": "Average", "label": "CPU Usage" } ],
          [ ".", "NetworkIn", { "stat": "Sum", "label": "Network In" } ],
          [ ".", "NetworkOut", { "stat": "Sum", "label": "Network Out" } ]
        ],
        "period": 300,
        "stat": "Average",
        "region": "$REGION",
        "title": "EC2 Instance Metrics"
      }
    },
    {
      "type": "log",
      "properties": {
        "query": "SOURCE '/aws/ec2/videosat-backend' | fields @timestamp, @message\n| filter @message like /ERROR/\n| stats count() by bin(5m)",
        "region": "$REGION",
        "title": "Error Logs (Last 1 Hour)",
        "view": "timeSeries",
        "stacked": false
      }
    }
  ]
}
EOF
)

# Dashboard oluştur
echo "📊 Dashboard oluşturuluyor..."
aws cloudwatch put-dashboard \
  --dashboard-name "$DASHBOARD_NAME" \
  --dashboard-body "$DASHBOARD_JSON" \
  --region "$REGION"

echo "✅ Dashboard oluşturuldu: $DASHBOARD_NAME"
echo ""
echo "🔍 Dashboard'u görüntülemek için:"
echo "   https://console.aws.amazon.com/cloudwatch/home?region=$REGION#dashboards:name=$DASHBOARD_NAME"


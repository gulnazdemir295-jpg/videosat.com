# 📊 Log Aggregation Yapılandırma Rehberi

## 📋 Genel Bakış

Log aggregation, tüm log'ları merkezi bir yerde toplar ve analiz eder.

---

## 🎯 Log Aggregation Çözümleri

### 1. **AWS CloudWatch Logs**
- **Kullanım**: AWS-native çözüm
- **Avantajlar**: AWS entegrasyonu, kolay kurulum
- **Sınırlamalar**: Sınırlı analiz özellikleri

### 2. **ELK Stack (Elasticsearch, Logstash, Kibana)**
- **Kullanım**: Enterprise log aggregation
- **Avantajlar**: Güçlü analiz, görselleştirme
- **Sınırlamalar**: Karmaşık kurulum, yüksek maliyet

### 3. **Datadog**
- **Kullanım**: SaaS log management
- **Avantajlar**: Kolay kurulum, güçlü analiz
- **Sınırlamalar**: Ücretli

### 4. **Splunk**
- **Kullanım**: Enterprise log management
- **Avantajlar**: Güçlü analiz, enterprise features
- **Sınırlamalar**: Çok pahalı

---

## 🚀 AWS CloudWatch Logs Kurulumu

### 1. CloudWatch Log Group Oluştur

```bash
# Log group oluştur
aws logs create-log-group \
  --log-group-name /aws/ec2/videosat-backend \
  --region us-east-1

# Retention policy (30 gün)
aws logs put-retention-policy \
  --log-group-name /aws/ec2/videosat-backend \
  --retention-in-days 30 \
  --region us-east-1
```

### 2. CloudWatch Logs Agent Kurulumu (EC2)

```bash
# CloudWatch Logs agent kur
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Config dosyası oluştur
sudo nano /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
```

### 3. CloudWatch Agent Config

```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/videosat/app.log",
            "log_group_name": "/aws/ec2/videosat-backend",
            "log_stream_name": "{instance_id}",
            "timestamp_format": "%Y-%m-%d %H:%M:%S"
          },
          {
            "file_path": "/var/log/videosat/error.log",
            "log_group_name": "/aws/ec2/videosat-backend",
            "log_stream_name": "{instance_id}-error",
            "timestamp_format": "%Y-%m-%d %H:%M:%S"
          }
        ]
      }
    }
  }
}
```

### 4. Agent Başlat

```bash
# Agent'ı başlat
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
  -s
```

---

## 💻 Backend Integration

### 1. Winston Logger (Zaten Var)

```javascript
// utils/logger.js - Zaten mevcut
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/app.log'
    })
  ]
});

module.exports = logger;
```

### 2. CloudWatch Logs Transport (Opsiyonel)

```bash
npm install winston-cloudwatch
```

```javascript
// utils/logger.js - CloudWatch transport ekle
const winston = require('winston');
const CloudWatchTransport = require('winston-cloudwatch');

const logger = winston.createLogger({
  // ... existing config
  transports: [
    // ... existing transports
    // CloudWatch (production'da)
    ...(process.env.NODE_ENV === 'production' ? [
      new CloudWatchTransport({
        logGroupName: '/aws/ec2/videosat-backend',
        logStreamName: `backend-${require('os').hostname()}`,
        awsRegion: process.env.AWS_REGION || 'us-east-1',
        messageFormatter: ({ level, message, meta }) => {
          return JSON.stringify({
            level,
            message,
            ...meta
          });
        }
      })
    ] : [])
  ]
});
```

---

## 📊 Log Queries (CloudWatch Logs Insights)

### 1. Error Logs Query

```sql
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100
```

### 2. API Request Query

```sql
fields @timestamp, @message
| filter @message like /API Request/
| parse @message "method=* path=* status=*" as method, path, status
| stats count() by path, status
```

### 3. Response Time Query

```sql
fields @timestamp, @message
| filter @message like /Response Time/
| parse @message "time=*" as responseTime
| stats avg(responseTime), max(responseTime), min(responseTime) by bin(5m)
```

### 4. User Activity Query

```sql
fields @timestamp, @message
| filter @message like /User/
| parse @message "email=*" as email
| stats count() by email
| sort count desc
| limit 10
```

---

## 🔧 Log Retention & Archival

### 1. Log Retention Policy

```bash
# Retention policy ayarla (30 gün)
aws logs put-retention-policy \
  --log-group-name /aws/ec2/videosat-backend \
  --retention-in-days 30 \
  --region us-east-1
```

### 2. Log Archival (S3)

```bash
# Log'ları S3'e export et
aws logs create-export-task \
  --log-group-name /aws/ec2/videosat-backend \
  --from 1640995200000 \
  --to 1641081600000 \
  --destination videosat-logs \
  --destination-prefix logs/2024-01-01 \
  --region us-east-1
```

---

## 📈 Log Monitoring

### CloudWatch Alarms

```bash
# Error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name videosat-high-error-rate \
  --alarm-description "Yüksek error rate" \
  --metric-name ErrorCount \
  --namespace VideoSat/Logs \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions <sns-topic-arn>
```

---

## 💰 Maliyet

### CloudWatch Logs
- **Ingestion**: $0.50 per GB
- **Storage**: $0.03 per GB/month
- **Data Transfer**: Outbound maliyeti

**Tahmini Aylık Maliyet**: $10-50 (log volume'a göre)

---

## 🧪 Test Senaryoları

### 1. Log Ingestion Test
```bash
# Log yaz
logger.info('Test log message');

# CloudWatch'da göründüğünü kontrol et
aws logs tail /aws/ec2/videosat-backend --follow
```

### 2. Log Query Test
```bash
# CloudWatch Logs Insights'da query çalıştır
aws logs start-query \
  --log-group-name /aws/ec2/videosat-backend \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string "fields @timestamp, @message | filter @message like /ERROR/ | limit 10"
```

---

## 📝 Best Practices

1. **Structured Logging**: JSON format kullan
2. **Log Levels**: Uygun log level'ları kullan
3. **Sensitive Data**: Hassas bilgileri loglama
4. **Retention**: Uygun retention policy ayarla
5. **Monitoring**: Log-based alarm'lar kur
6. **Archival**: Eski log'ları S3'e archive et

---

## 🔗 Kaynaklar

- [AWS CloudWatch Logs Documentation](https://docs.aws.amazon.com/cloudwatch/latest/logs/)
- [Winston Documentation](https://github.com/winstonjs/winston)

---

**Son Güncelleme**: 2024-11-06


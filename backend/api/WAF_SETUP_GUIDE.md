# 🛡️ AWS WAF (Web Application Firewall) Kurulum Rehberi

## 📋 Genel Bakış

AWS WAF, web uygulamanızı yaygın web exploit'lerden ve bot'lardan korur.

---

## 🎯 WAF Kullanım Senaryoları

### 1. **DDoS Protection**
- Rate limiting
- IP whitelist/blacklist
- Geo-blocking

### 2. **SQL Injection Protection**
- SQL injection pattern detection
- XSS protection
- Command injection protection

### 3. **Bot Protection**
- Bot detection
- CAPTCHA challenge
- Rate limiting per IP

### 4. **Custom Rules**
- IP whitelist (admin panel için)
- Geo-blocking (belirli ülkeleri engelle)
- Request size limiting

---

## 🚀 Kurulum Adımları

### 1. WAF Web ACL Oluştur

```bash
# WAF Web ACL oluştur
aws wafv2 create-web-acl \
  --scope CLOUDFRONT \
  --default-action Allow={} \
  --name VideoSat-WAF \
  --description "VideoSat Production WAF" \
  --region us-east-1
```

### 2. Managed Rule Groups Ekle

#### AWS Managed Rules
```bash
# AWS Managed Rules - Core Rule Set
aws wafv2 associate-web-acl \
  --web-acl-id <web-acl-id> \
  --resource-arn <cloudfront-distribution-arn> \
  --region us-east-1
```

**Önerilen Rule Groups:**
- **AWSManagedRulesCommonRuleSet**: SQL injection, XSS, etc.
- **AWSManagedRulesKnownBadInputsRuleSet**: Known bad inputs
- **AWSManagedRulesLinuxRuleSet**: Linux-specific attacks
- **AWSManagedRulesUnixRuleSet**: Unix-specific attacks
- **AWSManagedRulesWordPressRuleSet**: WordPress attacks (eğer kullanılıyorsa)

### 3. Rate Based Rules

```bash
# Rate limiting rule (100 request/5 minutes per IP)
aws wafv2 create-rule \
  --scope CLOUDFRONT \
  --name VideoSat-RateLimit \
  --metric-name VideoSatRateLimit \
  --rate-key IP \
  --rate-limit 2000 \
  --region us-east-1
```

### 4. IP Whitelist (Admin Panel)

```bash
# Admin IP whitelist
aws wafv2 create-ip-set \
  --scope CLOUDFRONT \
  --name AdminIPWhitelist \
  --addresses "1.2.3.4/32" "5.6.7.8/32" \
  --region us-east-1

# Rule oluştur
aws wafv2 create-rule \
  --scope CLOUDFRONT \
  --name AdminIPWhitelistRule \
  --priority 1 \
  --statement '{
    "IPSetReferenceStatement": {
      "ARN": "<ip-set-arn>"
    }
  }' \
  --action Allow={} \
  --region us-east-1
```

### 5. Geo-Blocking (Opsiyonel)

```bash
# Belirli ülkeleri engelle
aws wafv2 create-rule \
  --scope CLOUDFRONT \
  --name GeoBlockRule \
  --priority 10 \
  --statement '{
    "GeoMatchStatement": {
      "CountryCodes": ["CN", "RU", "KP"]
    }
  }' \
  --action Block={} \
  --region us-east-1
```

---

## 📊 WAF Metrics & Monitoring

### CloudWatch Metrics
- **AllowedRequests**: İzin verilen istekler
- **BlockedRequests**: Engellenen istekler
- **CountedRequests**: Sayılan istekler

### CloudWatch Alarms
```bash
# High blocked requests alarm
aws cloudwatch put-metric-alarm \
  --alarm-name VideoSat-WAF-High-Blocked-Requests \
  --alarm-description "WAF'da yüksek engellenen istek sayısı" \
  --metric-name BlockedRequests \
  --namespace AWS/WAFV2 \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions <sns-topic-arn>
```

---

## 🔧 WAF Rule Örnekleri

### 1. SQL Injection Protection
```json
{
  "Name": "SQLInjectionRule",
  "Priority": 1,
  "Statement": {
    "ManagedRuleGroupStatement": {
      "VendorName": "AWS",
      "Name": "AWSManagedRulesCommonRuleSet"
    }
  },
  "Action": {
    "Block": {}
  },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "SQLInjectionRule"
  }
}
```

### 2. Rate Limiting
```json
{
  "Name": "RateLimitRule",
  "Priority": 2,
  "Statement": {
    "RateBasedStatement": {
      "Limit": 2000,
      "AggregateKeyType": "IP"
    }
  },
  "Action": {
    "Block": {}
  },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "RateLimitRule"
  }
}
```

### 3. Request Size Limiting
```json
{
  "Name": "RequestSizeLimitRule",
  "Priority": 3,
  "Statement": {
    "SizeConstraintStatement": {
      "FieldToMatch": {
        "Body": {}
      },
      "ComparisonOperator": "GT",
      "Size": 8192
    }
  },
  "Action": {
    "Block": {}
  }
}
```

---

## 🧪 WAF Test

### Test Senaryoları

1. **SQL Injection Test**
   ```bash
   curl "https://basvideo.com/api/users?id=1' OR '1'='1"
   # WAF tarafından engellenmeli
   ```

2. **XSS Test**
   ```bash
   curl "https://basvideo.com/api/search?q=<script>alert('xss')</script>"
   # WAF tarafından engellenmeli
   ```

3. **Rate Limiting Test**
   ```bash
   # 2000+ request gönder
   for i in {1..2100}; do
     curl "https://basvideo.com/api/health"
   done
   # 2000'den sonra engellenmeli
   ```

---

## 📝 Best Practices

1. **Start with AWS Managed Rules**: Başlangıç için AWS managed rules kullanın
2. **Monitor First**: İlk hafta sadece monitor edin, block etmeyin
3. **Gradual Rollout**: Kural'ları aşamalı olarak aktif edin
4. **Whitelist Important IPs**: Önemli IP'leri whitelist'e ekleyin
5. **Regular Review**: Düzenli olarak WAF log'larını review edin
6. **Cost Optimization**: Gereksiz rule'ları kaldırın (maliyet)

---

## 💰 WAF Maliyeti

- **Web ACL**: $5/ay
- **Rule**: $1/ay per rule
- **Request**: $0.60 per million requests
- **Managed Rule Group**: $1/ay per rule group

**Tahmini Aylık Maliyet**: ~$20-50 (kullanıma göre)

---

## 🔗 Kaynaklar

- [AWS WAF Documentation](https://docs.aws.amazon.com/waf/)
- [AWS WAF Pricing](https://aws.amazon.com/waf/pricing/)
- [AWS WAF Best Practices](https://docs.aws.amazon.com/waf/latest/developerguide/best-practices.html)

---

**Son Güncelleme**: 2024-11-06


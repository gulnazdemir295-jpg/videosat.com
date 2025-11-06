# ⚖️ Load Balancer Kurulum Rehberi

## 📋 Genel Bakış

Load Balancer, trafiği birden fazla backend instance'a dağıtır ve yüksek erişilebilirlik sağlar.

---

## 🎯 Load Balancer Türleri

### 1. **Application Load Balancer (ALB)**
- **Kullanım**: HTTP/HTTPS trafiği
- **Layer**: 7 (Application)
- **Özellikler**: Content-based routing, SSL termination, path-based routing

### 2. **Network Load Balancer (NLB)**
- **Kullanım**: TCP/UDP trafiği
- **Layer**: 4 (Transport)
- **Özellikler**: Yüksek performans, düşük latency

### 3. **Classic Load Balancer (CLB)**
- **Kullanım**: Legacy uygulamalar
- **Layer**: 4/7
- **Not**: Yeni projeler için önerilmez

---

## 🚀 Application Load Balancer (ALB) Kurulumu

### 1. Security Group Oluştur

```bash
# ALB security group
aws ec2 create-security-group \
  --group-name videosat-alb-sg \
  --description "VideoSat ALB Security Group" \
  --vpc-id vpc-xxx

# HTTP/HTTPS port'larını aç
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxx \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id sg-xxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

### 2. Target Group Oluştur

```bash
# Target group oluştur
aws elbv2 create-target-group \
  --name videosat-backend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxx \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --target-type instance
```

### 3. ALB Oluştur

```bash
# ALB oluştur
aws elbv2 create-load-balancer \
  --name videosat-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4
```

### 4. Listener Oluştur

```bash
# HTTP listener (80 -> 443 redirect)
aws elbv2 create-listener \
  --load-balancer-arn <alb-arn> \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=redirect,RedirectConfig='{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}'

# HTTPS listener
aws elbv2 create-listener \
  --load-balancer-arn <alb-arn> \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=<cert-arn> \
  --default-actions Type=forward,TargetGroupArn=<target-group-arn>
```

### 5. SSL/TLS Sertifika

```bash
# ACM'de sertifika oluştur (veya import et)
aws acm request-certificate \
  --domain-name basvideo.com \
  --subject-alternative-names "*.basvideo.com" \
  --validation-method DNS \
  --region us-east-1

# DNS validation yap (ACM'den gelen CNAME kayıtlarını ekle)
```

---

## 🔧 ALB Yapılandırması

### 1. Path-Based Routing

```bash
# API route'ları için rule
aws elbv2 create-rule \
  --listener-arn <listener-arn> \
  --priority 1 \
  --conditions Field=path-pattern,Values='/api/*' \
  --actions Type=forward,TargetGroupArn=<api-tg-arn>

# Admin route'ları için rule
aws elbv2 create-rule \
  --listener-arn <listener-arn> \
  --priority 2 \
  --conditions Field=path-pattern,Values='/admin/*' \
  --actions Type=forward,TargetGroupArn=<admin-tg-arn>
```

### 2. Host-Based Routing

```bash
# api.basvideo.com için rule
aws elbv2 create-rule \
  --listener-arn <listener-arn> \
  --priority 1 \
  --conditions Field=host-header,Values='api.basvideo.com' \
  --actions Type=forward,TargetGroupArn=<api-tg-arn>
```

### 3. Sticky Sessions (Session Affinity)

```bash
# Target group'u güncelle
aws elbv2 modify-target-group-attributes \
  --target-group-arn <target-group-arn> \
  --attributes Key=stickiness.enabled,Value=true \
               Key=stickiness.type,Value=lb_cookie \
               Key=stickiness.lb_cookie.duration_seconds,Value=3600
```

---

## 📊 Health Checks

### Health Check Yapılandırması

```bash
# Health check ayarları
aws elbv2 modify-target-group \
  --target-group-arn <target-group-arn> \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --health-check-protocol HTTP \
  --health-check-port 3000
```

### Health Check Endpoint

Backend'de health check endpoint'i zaten var:
```javascript
// /api/health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

---

## 🔒 Security

### 1. Security Groups
- ALB security group: 80, 443 port'ları açık
- Backend security group: Sadece ALB'dan gelen trafik

### 2. WAF Integration
```bash
# WAF web ACL'i ALB'ye bağla
aws wafv2 associate-web-acl \
  --web-acl-id <web-acl-id> \
  --resource-arn <alb-arn> \
  --region us-east-1
```

### 3. SSL/TLS Policy
```bash
# Modern SSL/TLS policy
aws elbv2 modify-load-balancer-attributes \
  --load-balancer-arn <alb-arn> \
  --attributes Key=ssl_protocols,Value='["TLSv1.2","TLSv1.3"]'
```

---

## 📈 Monitoring

### CloudWatch Metrics
- **RequestCount**: Toplam request sayısı
- **TargetResponseTime**: Target response time
- **HTTPCode_Target_2XX_Count**: Başarılı response'lar
- **HTTPCode_Target_4XX_Count**: Client error'lar
- **HTTPCode_Target_5XX_Count**: Server error'lar
- **HealthyHostCount**: Sağlıklı target sayısı
- **UnHealthyHostCount**: Sağlıksız target sayısı

### CloudWatch Alarms
```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name videosat-alb-high-errors \
  --alarm-description "ALB'de yüksek hata oranı" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=LoadBalancer,Value=<alb-arn> \
  --alarm-actions <sns-topic-arn>
```

---

## 💰 Maliyet

### ALB Maliyeti
- **Base Cost**: ~$16.20/ay
- **LCU (Load Balancer Capacity Units)**: Kullanıma göre
  - Rule evaluations: $0.10 per 1M
  - Active connections: $0.008 per hour per 1K
  - Processed bytes: $0.008 per GB

**Tahmini Aylık Maliyet**: $20-50 (trafiğe göre)

---

## 🧪 Test Senaryoları

### 1. Health Check Test
```bash
# Health check endpoint'ini test et
curl https://api.basvideo.com/api/health

# Target health durumunu kontrol et
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn>
```

### 2. Load Distribution Test
```bash
# Trafiği test et ve instance'lara dağılımını kontrol et
ab -n 1000 -c 10 https://api.basvideo.com/api/health

# Her instance'ın request aldığını doğrula
```

### 3. Failover Test
```bash
# Bir instance'ı durdur
aws ec2 stop-instances --instance-ids i-xxx

# ALB'nin trafiği diğer instance'lara yönlendirdiğini kontrol et
```

---

## 📝 Best Practices

1. **Multi-AZ Deployment**: En az 2 availability zone kullan
2. **Health Checks**: Düzenli health check yapılandırması
3. **SSL/TLS**: Modern SSL/TLS policy kullan
4. **WAF Integration**: WAF ile güvenlik artır
5. **Monitoring**: CloudWatch metrics ve alarms kur
6. **Cost Optimization**: Gereksiz rule'ları kaldır

---

## 🔗 Kaynaklar

- [AWS ALB Documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- [ALB Best Practices](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/best-practices.html)

---

**Son Güncelleme**: 2024-11-06


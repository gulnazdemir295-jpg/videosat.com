# 🔒 SSL/TLS Sertifika Yönetimi Rehberi

## 📋 Genel Bakış

SSL/TLS sertifikaları, HTTPS trafiğini şifrelemek ve güvenli iletişim sağlamak için kullanılır.

---

## 🎯 Sertifika Türleri

### 1. **AWS Certificate Manager (ACM)**
- **Kullanım**: AWS servisleri için (ALB, CloudFront, API Gateway)
- **Avantajlar**: Ücretsiz, otomatik yenileme, AWS entegrasyonu
- **Sınırlamalar**: Sadece AWS servislerinde kullanılabilir

### 2. **Let's Encrypt**
- **Kullanım**: Genel amaçlı, ücretsiz
- **Avantajlar**: Ücretsiz, otomatik yenileme, geniş destek
- **Sınırlamalar**: 90 günlük geçerlilik süresi

### 3. **Commercial Certificates**
- **Kullanım**: Enterprise ihtiyaçlar
- **Avantajlar**: Uzun geçerlilik, garanti, destek
- **Sınırlamalar**: Ücretli

---

## 🚀 AWS Certificate Manager (ACM) Kurulumu

### 1. Sertifika İsteği

```bash
# ACM'de sertifika iste
aws acm request-certificate \
  --domain-name basvideo.com \
  --subject-alternative-names "*.basvideo.com" "www.basvideo.com" \
  --validation-method DNS \
  --region us-east-1

# Output'tan CertificateArn'ı al
```

### 2. DNS Validation

```bash
# Validation bilgilerini al
aws acm describe-certificate \
  --certificate-arn <certificate-arn> \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions'

# DNS kayıtlarını ekle (Route 53 veya DNS provider)
# CNAME kayıtları:
# _abc123.basvideo.com -> _xyz789.acm-validations.aws.
```

### 3. Sertifika Durumunu Kontrol Et

```bash
# Sertifika durumunu kontrol et
aws acm describe-certificate \
  --certificate-arn <certificate-arn> \
  --region us-east-1 \
  --query 'Certificate.Status'

# "ISSUED" durumunda olmalı
```

### 4. ALB'ye Sertifika Ekle

```bash
# HTTPS listener oluştur
aws elbv2 create-listener \
  --load-balancer-arn <alb-arn> \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=<certificate-arn> \
  --default-actions Type=forward,TargetGroupArn=<target-group-arn>
```

### 5. CloudFront'a Sertifika Ekle

```bash
# CloudFront distribution'ı güncelle
aws cloudfront update-distribution \
  --id <distribution-id> \
  --distribution-config file://cloudfront-config.json

# cloudfront-config.json'da:
# "ViewerCertificate": {
#   "ACMCertificateArn": "<certificate-arn>",
#   "SSLSupportMethod": "sni-only",
#   "MinimumProtocolVersion": "TLSv1.2_2021"
# }
```

---

## 🔄 Sertifika Yenileme

### AWS ACM (Otomatik)
- ACM sertifikaları otomatik olarak yenilenir
- Manuel müdahale gerekmez
- 60 gün önceden yenileme başlar

### Let's Encrypt (Certbot)

```bash
# Certbot kurulumu
sudo apt-get update
sudo apt-get install certbot

# Sertifika al
sudo certbot certonly --standalone -d basvideo.com -d www.basvideo.com

# Sertifika yenileme (cron job)
# 0 0 1 * * certbot renew --quiet
```

---

## 🔧 SSL/TLS Yapılandırması

### 1. Modern SSL/TLS Policy

```bash
# ALB SSL policy
aws elbv2 modify-load-balancer-attributes \
  --load-balancer-arn <alb-arn> \
  --attributes Key=ssl_protocols,Value='["TLSv1.2","TLSv1.3"]'

# CloudFront SSL policy
# CloudFront console'dan: "Viewer Protocol Policy" -> "Redirect HTTP to HTTPS"
# "Minimum Protocol Version" -> "TLSv1.2_2021"
```

### 2. HSTS (HTTP Strict Transport Security)

```javascript
// app.js - Helmet zaten HSTS ekliyor
app.use(helmet({
  hsts: {
    maxAge: 31536000, // 1 yıl
    includeSubDomains: true,
    preload: true
  }
}));
```

### 3. SSL Labs Test

```bash
# SSL Labs test
curl https://www.ssllabs.com/ssltest/analyze.html?d=basvideo.com

# Target: A+ rating
```

---

## 📊 Sertifika Monitoring

### CloudWatch Alarms

```bash
# Sertifika süresi dolmadan önce alarm
aws cloudwatch put-metric-alarm \
  --alarm-name videosat-cert-expiring \
  --alarm-description "SSL sertifikası süresi dolmak üzere" \
  --metric-name DaysToExpiry \
  --namespace AWS/CertificateManager \
  --statistic Minimum \
  --period 86400 \
  --evaluation-periods 1 \
  --threshold 30 \
  --comparison-operator LessThanThreshold \
  --dimensions Name=CertificateArn,Value=<certificate-arn> \
  --alarm-actions <sns-topic-arn>
```

### Sertifika Süresi Kontrolü

```bash
# Sertifika süresini kontrol et
aws acm describe-certificate \
  --certificate-arn <certificate-arn> \
  --region us-east-1 \
  --query 'Certificate.NotAfter'
```

---

## 🔒 Security Best Practices

### 1. **TLS Version**
- Minimum: TLS 1.2
- Önerilen: TLS 1.3
- Eski versiyonları devre dışı bırak

### 2. **Cipher Suites**
- Güçlü cipher suite'ler kullan
- Eski cipher'ları devre dışı bırak

### 3. **Certificate Transparency**
- CT logs'a kayıt yap
- Sertifika şeffaflığı

### 4. **OCSP Stapling**
- OCSP stapling aktif et
- Performance artışı

---

## 💰 Maliyet

### AWS Certificate Manager
- **Sertifika**: Ücretsiz
- **Renewal**: Ücretsiz
- **Validation**: Ücretsiz

### Let's Encrypt
- **Sertifika**: Ücretsiz
- **Renewal**: Ücretsiz
- **Automation**: Ücretsiz

**Toplam Maliyet**: $0 (ACM veya Let's Encrypt kullanılıyorsa)

---

## 🧪 Test Senaryoları

### 1. SSL/TLS Test
```bash
# SSL Labs test
curl https://www.ssllabs.com/ssltest/analyze.html?d=basvideo.com

# OpenSSL test
openssl s_client -connect basvideo.com:443 -servername basvideo.com
```

### 2. Certificate Chain Test
```bash
# Certificate chain'i kontrol et
openssl s_client -connect basvideo.com:443 -showcerts
```

### 3. HSTS Test
```bash
# HSTS header'ını kontrol et
curl -I https://basvideo.com | grep -i strict-transport
```

---

## 📝 Notlar

- ACM sertifikaları sadece AWS servislerinde kullanılabilir
- Let's Encrypt 90 günlük geçerlilik süresi var
- ACM otomatik yenileme yapar
- Production'da minimum TLS 1.2 kullan

---

## 🔗 Kaynaklar

- [AWS Certificate Manager Documentation](https://docs.aws.amazon.com/acm/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)

---

**Son Güncelleme**: 2024-11-06


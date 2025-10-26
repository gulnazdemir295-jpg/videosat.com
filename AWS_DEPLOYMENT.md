# AWS Deployment Configuration

## AWS S3 Static Website Hosting

Bu proje AWS S3 üzerinde static website hosting olarak deploy edilebilir.

### Gerekli AWS Servisleri:
1. **S3 Bucket** - Static website hosting için
2. **CloudFront** - CDN ve HTTPS için
3. **Route 53** - Domain yönetimi için (opsiyonel)
4. **AWS Kinesis Video Streams** - Canlı yayın için (gelecek geliştirme)
5. **AWS Cognito** - Kullanıcı kimlik doğrulama için (gelecek geliştirme)

### Deployment Adımları:

#### 1. S3 Bucket Oluşturma
```bash
aws s3 mb s3://your-bucket-name --region us-east-1
```

#### 2. Static Website Hosting Etkinleştirme
```bash
aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html
```

#### 3. Bucket Policy Ayarlama
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

#### 4. Dosyaları Upload Etme
```bash
aws s3 sync . s3://your-bucket-name --exclude "*.md" --exclude ".git/*"
```

#### 5. CloudFront Distribution Oluşturma
- Origin Domain: your-bucket-name.s3-website-us-east-1.amazonaws.com
- Default Root Object: index.html
- Error Pages: 404 -> /index.html (SPA routing için)

### Environment Variables (Production için):
```javascript
const AWS_CONFIG = {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signalingEndpoint: process.env.SIGNALING_ENDPOINT
};
```

### Güvenlik Notları:
- AWS credentials'ları asla client-side'da saklamayın
- AWS Cognito kullanın kullanıcı kimlik doğrulama için
- HTTPS zorunlu kılın
- CORS policy'lerini doğru ayarlayın

### Monitoring ve Logging:
- CloudWatch ile monitoring
- S3 access logs
- CloudFront access logs
- Real User Monitoring (RUM)

### Cost Optimization:
- S3 Intelligent Tiering
- CloudFront caching policies
- Lambda@Edge for edge computing (opsiyonel)

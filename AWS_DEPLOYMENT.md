# AWS Deployment Configuration

## AWS S3 Bucket Configuration
- Bucket Name: dunyanin-en-acayip-sitesi-328185871955
- Region: us-east-1
- Static Website Hosting: Enabled
- Index Document: index.html
- Error Document: index.html

## CloudFront Distribution
- Origin: S3 bucket
- Default Root Object: index.html
- Price Class: Use All Edge Locations
- Compress Objects Automatically: Yes
- Viewer Protocol Policy: Redirect HTTP to HTTPS

## Domain Configuration
- Custom Domain: basvideo.com
- SSL Certificate: AWS Certificate Manager
- Route 53 Hosted Zone: Configured

## Deployment Commands

### Initial Setup
```bash
# Configure AWS CLI
aws configure
# Access Key: YOUR_AWS_ACCESS_KEY_HERE
# Secret Key: YOUR_AWS_SECRET_KEY_HERE
# Region: us-east-1
# Output format: json
```

### Deploy to S3
```bash
# Sync files to S3 bucket
aws s3 sync . s3://dunyanin-en-acayip-sitesi-328185871955 --delete

# Set bucket policy for public read access
aws s3api put-bucket-policy --bucket dunyanin-en-acayip-sitesi-328185871955 --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::dunyanin-en-acayip-sitesi-328185871955/*"
    }
  ]
}'

# Enable static website hosting
aws s3 website s3://dunyanin-en-acayip-sitesi-328185871955 --index-document index.html --error-document index.html
```

### CloudFront Configuration
```bash
# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "videosat-'$(date +%s)'",
  "Comment": "VideoSat E-commerce Platform",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-dunyanin-en-acayip-sitesi-328185871955",
        "DomainName": "dunyanin-en-acayip-sitesi-328185871955.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-dunyanin-en-acayip-sitesi-328185871955",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "Enabled": true,
  "PriceClass": "PriceClass_All"
}'
```

## GitHub Pages Configuration

### CNAME File
```
basvideo.com
```

### GitHub Actions Workflow
```yaml
name: Deploy to AWS S3

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Deploy to S3
      run: |
        aws s3 sync . s3://dunyanin-en-acayip-sitesi-328185871955 --delete
        aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

## AWS Access Key Management

### Key Usage Status
- **Key 1** (AKIAUY2LG7ZJ3IQTWA6C): Son kullanım - 3 saat önce ✅ (Aktif)
- **Key 2** (AKIAUY2LG7ZJ4R6V3UEF): Son kullanım - 5 gün önce ❌ (Devre Dışı)

**Not:** 
- Aktif olarak kullanılan key, Key 1'dir. Production ortamında bu key'in GitHub Secrets'ta güncel olduğundan emin olun.
- Key 2 kullanılmayan erişim anahtarı olarak AWS IAM konsolundan devre dışı bırakıldı (güvenlik best practice).

### Key Rotation Recommendations
- Düzenli olarak key'leri rotate edin (3-6 ayda bir)
- Kullanılmayan key'leri devre dışı bırakın
- AWS IAM Console'dan key kullanım geçmişini kontrol edin

## Environment Variables
```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY_HERE
AWS_REGION=us-east-1
S3_BUCKET=dunyanin-en-acayip-sitesi-328185871955

# GitHub Configuration
GITHUB_TOKEN=YOUR_GITHUB_TOKEN_HERE
```

## Security Configuration

### S3 Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::dunyanin-en-acayip-sitesi-328185871955/*"
    }
  ]
}
```

### CloudFront Security Headers
```json
{
  "ResponseHeadersPolicy": {
    "SecurityHeadersConfig": {
      "StrictTransportSecurity": {
        "AccessControlMaxAgeSec": 31536000,
        "IncludeSubdomains": true,
        "Override": false
      },
      "ContentTypeOptions": {
        "Override": false
      },
      "FrameOptions": {
        "FrameOption": "DENY",
        "Override": false
      },
      "ReferrerPolicy": {
        "ReferrerPolicy": "strict-origin-when-cross-origin",
        "Override": false
      }
    }
  }
}
```

## Monitoring and Logging

### CloudWatch Logs
```bash
# Create log group
aws logs create-log-group --log-group-name /aws/s3/videosat-access-logs

# Enable S3 access logging
aws s3api put-bucket-logging --bucket dunyanin-en-acayip-sitesi-328185871955 --bucket-logging-status '{
  "LoggingEnabled": {
    "TargetBucket": "dunyanin-en-acayip-sitesi-328185871955-logs",
    "TargetPrefix": "access-logs/"
  }
}'
```

### CloudWatch Alarms
```bash
# Create alarm for high error rate
aws cloudwatch put-metric-alarm \
  --alarm-name "VideoSat-HighErrorRate" \
  --alarm-description "High error rate for VideoSat CloudFront distribution" \
  --metric-name "4xxErrorRate" \
  --namespace "AWS/CloudFront" \
  --statistic "Average" \
  --period 300 \
  --threshold 5.0 \
  --comparison-operator "GreaterThanThreshold" \
  --evaluation-periods 2
```

## Performance Optimization

### CloudFront Cache Behaviors
```json
{
  "CacheBehaviors": {
    "Quantity": 3,
    "Items": [
      {
        "PathPattern": "*.css",
        "TargetOriginId": "S3-dunyanin-en-acayip-sitesi-328185871955",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true
      },
      {
        "PathPattern": "*.js",
        "TargetOriginId": "S3-dunyanin-en-acayip-sitesi-328185871955",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true
      },
      {
        "PathPattern": "*.png",
        "TargetOriginId": "S3-dunyanin-en-acayip-sitesi-328185871955",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "DefaultTTL": 31536000,
        "MaxTTL": 31536000,
        "Compress": false
      }
    ]
  }
}
```

## Backup and Recovery

### S3 Cross-Region Replication
```bash
# Create replication configuration
aws s3api put-bucket-replication --bucket dunyanin-en-acayip-sitesi-328185871955 --replication-configuration '{
  "Role": "arn:aws:iam::328185871955:role/replication-role",
  "Rules": [
    {
      "ID": "ReplicateToEU",
      "Status": "Enabled",
      "Prefix": "",
      "Destination": {
        "Bucket": "arn:aws:s3:::dunyanin-en-acayip-sitesi-328185871955-eu",
        "StorageClass": "STANDARD"
      }
    }
  ]
}'
```

## Cost Optimization

### S3 Lifecycle Configuration
```json
{
  "Rules": [
    {
      "ID": "TransitionToIA",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        }
      ]
    },
    {
      "ID": "TransitionToGlacier",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

## Deployment Checklist

- [ ] AWS CLI configured with credentials
- [ ] S3 bucket created and configured
- [ ] CloudFront distribution created
- [ ] Domain configured with Route 53
- [ ] SSL certificate issued
- [ ] GitHub Actions workflow configured
- [ ] Environment variables set
- [ ] Monitoring and logging enabled
- [ ] Backup strategy implemented
- [ ] Performance optimization applied
- [ ] Security headers configured
- [ ] Cost optimization measures in place

## Troubleshooting

### Common Issues
1. **403 Forbidden**: Check S3 bucket policy and CloudFront origin settings
2. **CORS Errors**: Configure CORS policy for S3 bucket
3. **Cache Issues**: Create CloudFront invalidation
4. **SSL Certificate**: Ensure certificate is issued for correct domain
5. **Performance**: Check CloudFront cache behaviors and compression settings

### Useful Commands
```bash
# Check S3 bucket status
aws s3 ls s3://dunyanin-en-acayip-sitesi-328185871955

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"

# Check CloudFront distribution status
aws cloudfront get-distribution --id DISTRIBUTION_ID

# Monitor CloudWatch metrics
aws cloudwatch get-metric-statistics --namespace AWS/CloudFront --metric-name Requests --dimensions Name=DistributionId,Value=DISTRIBUTION_ID --start-time 2024-01-01T00:00:00Z --end-time 2024-01-02T00:00:00Z --period 3600 --statistics Sum
```

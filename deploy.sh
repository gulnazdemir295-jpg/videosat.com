#!/bin/bash

# AWS Deployment Script for Dünyanın En Acayip Sitesi
# Bu script AWS S3 ve CloudFront üzerinde static website hosting kurar

set -e

# Renkli çıktı için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonksiyonlar
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# AWS CLI kontrolü
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI kurulu değil. Lütfen önce AWS CLI'yi kurun."
        echo "Kurulum için: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI yapılandırılmamış. Lütfen 'aws configure' komutunu çalıştırın."
        exit 1
    fi
    
    print_success "AWS CLI kontrolü başarılı"
}

# Parametreler
BUCKET_NAME=""
REGION="us-east-1"
DOMAIN_NAME=""
CERTIFICATE_ARN=""
USE_CLOUDFORMATION=false

# Parametreleri parse et
while [[ $# -gt 0 ]]; do
    case $1 in
        --bucket-name)
            BUCKET_NAME="$2"
            shift 2
            ;;
        --region)
            REGION="$2"
            shift 2
            ;;
        --domain)
            DOMAIN_NAME="$2"
            shift 2
            ;;
        --certificate-arn)
            CERTIFICATE_ARN="$2"
            shift 2
            ;;
        --use-cloudformation)
            USE_CLOUDFORMATION=true
            shift
            ;;
        --help)
            echo "AWS Deployment Script for Dünyanın En Acayip Sitesi"
            echo ""
            echo "Kullanım: $0 [OPTIONS]"
            echo ""
            echo "Seçenekler:"
            echo "  --bucket-name NAME     S3 bucket adı (zorunlu)"
            echo "  --region REGION        AWS region (varsayılan: us-east-1)"
            echo "  --domain DOMAIN        Domain adı (opsiyonel)"
            echo "  --certificate-arn ARN   SSL sertifika ARN (opsiyonel)"
            echo "  --use-cloudformation    CloudFormation kullan (opsiyonel)"
            echo "  --help                 Bu yardım mesajını göster"
            echo ""
            echo "Örnek:"
            echo "  $0 --bucket-name my-awesome-site --region eu-west-1"
            exit 0
            ;;
        *)
            print_error "Bilinmeyen parametre: $1"
            echo "Yardım için: $0 --help"
            exit 1
            ;;
    esac
done

# Bucket adı kontrolü
if [ -z "$BUCKET_NAME" ]; then
    print_error "Bucket adı belirtilmedi. --bucket-name parametresi zorunlu."
    echo "Yardım için: $0 --help"
    exit 1
fi

# Bucket adı benzersizlik kontrolü
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    print_error "Bucket '$BUCKET_NAME' zaten mevcut. Farklı bir ad seçin."
    exit 1
fi

print_info "Deployment başlatılıyor..."
print_info "Bucket: $BUCKET_NAME"
print_info "Region: $REGION"

# AWS CLI kontrolü
check_aws_cli

# CloudFormation kullanımı
if [ "$USE_CLOUDFORMATION" = true ]; then
    print_info "CloudFormation template ile deployment başlatılıyor..."
    
    # CloudFormation stack adı
    STACK_NAME="dunyanin-en-acayip-sitesi-$(date +%s)"
    
    # CloudFormation parametreleri
    CF_PARAMS="BucketName=$BUCKET_NAME"
    if [ -n "$DOMAIN_NAME" ]; then
        CF_PARAMS="$CF_PARAMS DomainName=$DOMAIN_NAME"
    fi
    if [ -n "$CERTIFICATE_ARN" ]; then
        CF_PARAMS="$CF_PARAMS CertificateArn=$CERTIFICATE_ARN"
    fi
    
    # CloudFormation stack oluştur
    aws cloudformation create-stack \
        --stack-name "$STACK_NAME" \
        --template-body file://cloudformation-template.yaml \
        --parameters ParameterKey=BucketName,ParameterValue="$BUCKET_NAME" \
        --region "$REGION" \
        --capabilities CAPABILITY_IAM
    
    print_info "CloudFormation stack oluşturuluyor: $STACK_NAME"
    print_info "Stack durumunu kontrol etmek için: aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION"
    
    # Stack tamamlanmasını bekle
    print_info "Stack tamamlanması bekleniyor..."
    aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME" --region "$REGION"
    
    print_success "CloudFormation deployment tamamlandı!"
    
    # Output'ları göster
    print_info "Stack çıktıları:"
    aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].Outputs'
    
    exit 0
fi

# Manuel deployment
print_info "Manuel deployment başlatılıyor..."

# S3 bucket oluştur
print_info "S3 bucket oluşturuluyor: $BUCKET_NAME"
aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"

# Website hosting etkinleştir
print_info "Website hosting etkinleştiriliyor..."
aws s3 website "s3://$BUCKET_NAME" --index-document index.html --error-document index.html

# Bucket policy oluştur
print_info "Bucket policy oluşturuluyor..."
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file://bucket-policy.json

# Dosyaları upload et
print_info "Dosyalar upload ediliyor..."
aws s3 sync . "s3://$BUCKET_NAME" \
    --exclude "*.md" \
    --exclude ".git/*" \
    --exclude "*.sh" \
    --exclude "*.yaml" \
    --exclude "*.json" \
    --exclude ".DS_Store" \
    --exclude "node_modules/*"

# CloudFront distribution oluştur (opsiyonel)
if [ -n "$DOMAIN_NAME" ]; then
    print_info "CloudFront distribution oluşturuluyor..."
    
    # CloudFront config dosyası oluştur
    cat > cloudfront-config.json << EOF
{
    "CallerReference": "$(date +%s)",
    "Comment": "CloudFront distribution for $BUCKET_NAME",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$BUCKET_NAME",
                "DomainName": "$BUCKET_NAME.s3-website-$REGION.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$BUCKET_NAME",
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
        "MaxTTL": 31536000
    },
    "CustomErrorResponses": {
        "Quantity": 2,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            },
            {
                "ErrorCode": 403,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF

    # CloudFront distribution oluştur
    DISTRIBUTION_ID=$(aws cloudfront create-distribution --distribution-config file://cloudfront-config.json --query 'Distribution.Id' --output text)
    
    print_success "CloudFront distribution oluşturuldu: $DISTRIBUTION_ID"
fi

# Temizlik
rm -f bucket-policy.json cloudfront-config.json

# Sonuç
print_success "Deployment tamamlandı!"
print_info "Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

if [ -n "$DISTRIBUTION_ID" ]; then
    print_info "CloudFront URL: https://$DISTRIBUTION_ID.cloudfront.net"
fi

print_info "Sonraki adımlar:"
print_info "1. Website'i test edin"
print_info "2. Domain'i CloudFront'a bağlayın (opsiyonel)"
print_info "3. SSL sertifikası ekleyin (opsiyonel)"
print_info "4. Monitoring kurun (opsiyonel)"

print_success "Dünyanın En Acayip Sitesi başarıyla deploy edildi! 🎉"

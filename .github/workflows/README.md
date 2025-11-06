# GitHub Actions Workflows

Bu klasör VideoSat projesi için CI/CD pipeline workflow'larını içerir.

## Workflow Dosyaları

### 1. `ci.yml` - Continuous Integration
**Tetiklendiği Durumlar**:
- `main` veya `develop` branch'ine push
- Pull request açıldığında

**Yapılan İşlemler**:
- ✅ Test çalıştırma (Node.js 18.x ve 20.x)
- ✅ Coverage raporu oluşturma
- ✅ Code linting (ESLint)
- ✅ Security audit (npm audit)

**Job'lar**:
- `test`: Tüm testleri çalıştırır
- `lint`: Kod kalitesi kontrolü
- `security`: Güvenlik açıklarını kontrol eder

---

### 2. `deploy.yml` - Deployment
**Tetiklendiği Durumlar**:
- `main` branch'ine push
- Version tag'i push edildiğinde (`v*`)
- Manuel tetikleme (workflow_dispatch)

**Yapılan İşlemler**:
- ✅ Backend deployment (EC2)
- ✅ Frontend deployment (S3 + CloudFront)
- ✅ Deployment notification

**Gereken Secrets**:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `EC2_HOST` (opsiyonel)
- `EC2_USER` (opsiyonel)
- `EC2_SSH_KEY` (opsiyonel)

---

### 3. `code-quality.yml` - Code Quality Checks
**Tetiklendiği Durumlar**:
- Pull request açıldığında
- `main` veya `develop` branch'ine push

**Yapılan İşlemler**:
- ✅ Console.log kontrolü
- ✅ TODO/FIXME kontrolü
- ✅ Büyük dosya kontrolü
- ✅ Test coverage kontrolü

---

## GitHub Secrets Yapılandırması

Repository Settings > Secrets and variables > Actions bölümünden aşağıdaki secret'ları ekleyin:

### AWS Secrets
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=dunyanin-en-acayip-sitesi-328185871955
CLOUDFRONT_DISTRIBUTION_ID=your_distribution_id
```

### EC2 Secrets (Opsiyonel)
```
EC2_HOST=your_ec2_host
EC2_USER=ec2-user
EC2_SSH_KEY=your_ssh_private_key
```

---

## Workflow Kullanımı

### Otomatik Çalıştırma
- Her push'ta CI workflow'u otomatik çalışır
- `main` branch'ine merge edildiğinde deployment otomatik başlar

### Manuel Çalıştırma
1. GitHub repository'ye gidin
2. Actions sekmesine tıklayın
3. İstediğiniz workflow'u seçin
4. "Run workflow" butonuna tıklayın
5. Branch ve environment seçin
6. "Run workflow" butonuna tıklayın

---

## Workflow Durum Rozetleri

README.md dosyanıza ekleyebilirsiniz:

```markdown
![CI](https://github.com/USERNAME/REPO/workflows/CI%20-%20Test%20and%20Lint/badge.svg)
![Deploy](https://github.com/USERNAME/REPO/workflows/Deploy%20to%20Production/badge.svg)
```

---

## Troubleshooting

### Test Başarısız Olursa
- Test loglarını kontrol edin
- Local'de testleri çalıştırın: `cd backend/api && npm test`
- Environment variables'ı kontrol edin

### Deployment Başarısız Olursa
- AWS credentials'ı kontrol edin
- S3 bucket permissions'ı kontrol edin
- CloudFront distribution ID'yi kontrol edin
- EC2 SSH key'i kontrol edin

### Coverage Düşükse
- Yeni testler ekleyin
- Coverage threshold'u düşürün (geçici)
- Eksik test senaryolarını belirleyin

---

## İyileştirme Önerileri

- [ ] Docker container build ve push
- [ ] Multi-environment deployment (staging, production)
- [ ] Automated rollback mechanism
- [ ] Performance testing
- [ ] Load testing
- [ ] Database migration testing
- [ ] Slack/Discord notifications

---

**Son Güncelleme**: 2024


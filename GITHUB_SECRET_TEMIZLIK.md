# GitHub Secret Temizlik Rehberi

## ⚠️ Önemli Uyarı

Eski commit'lerde (082481f) AWS credentials var. Bu credentials'ları **hemen AWS'de deaktive etmeniz** önerilir çünkü public olacaklar.

## 🔐 AWS Credentials Deaktive Etme

1. AWS Console'a gidin: https://console.aws.amazon.com/iam/
2. **IAM > Users** bölümüne gidin
3. İlgili user'ı bulun
4. **Security credentials** sekmesine gidin
5. Eski access key'leri **Delete** edin

## ✅ Çözüm Seçenekleri

### Seçenek 1: GitHub'dan Allow Et (Hızlı)

GitHub'ın verdiği linklerden secret'ları allow edin:

1. Her bir link'e tıklayın
2. "Allow secret" butonuna tıklayın
3. Push'u tekrar deneyin

**Linkler:**
- AWS Access Key ID (1): https://github.com/gulnazdemir295-jpg/videosat.com/security/secret-scanning/unblock-secret/353hwhjZo6fymy2vPwv9QFR8RFQ
- AWS Secret Key (1): https://github.com/gulnazdemir295-jpg/videosat.com/security/secret-scanning/unblock-secret/353hwid9wozTjpQ9ABDgJhqpuxD
- AWS Access Key ID (2): https://github.com/gulnazdemir295-jpg/videosat.com/security/secret-scanning/unblock-secret/353hwjgTOW1USLDnM80piXtnXOf
- AWS Secret Key (2): https://github.com/gulnazdemir295-jpg/videosat.com/security/secret-scanning/unblock-secret/353hwi3Bi1xaMUMgRNpfhGAh2uI

### Seçenek 2: Git History Temizle (Önerilen)

Eski commit'teki credentials'ları tamamen kaldırmak için:

```bash
# ⚠️ DİKKAT: Bu işlem git history'yi değiştirir!
# Önce AWS credentials'ları deaktive edin!

# BFG Repo-Cleaner kullanarak (önerilen)
# https://rtyley.github.io/bfg-repo-cleaner/

# Veya manuel olarak:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch EC2_DEPLOYMENT_REHBERI.md EC2_DEPLOY_MANUAL.md deploy-to-ec2.sh test-backend-local.sh panels/ceo-admin.html" \
  --prune-empty --tag-name-filter cat -- --all

# Sonra force push (⚠️ TEHLİKELİ!)
git push origin --force --all
```

## 🎯 Önerilen Yol

1. **AWS credentials'ları deaktive edin** (AWS Console'dan)
2. **GitHub'dan allow edin** (hızlı çözüm)
3. Push'u tekrar deneyin
4. İleride git history'yi temizleyebilirsiniz

## 📝 Not

- Yeni commit'lerde credentials yok (temizlendi ✅)
- Eski commit'te hala var (082481f)
- GitHub Push Protection eski commit'leri de kontrol ediyor


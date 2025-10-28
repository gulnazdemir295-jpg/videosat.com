# Deployment Rehberi

## 🚀 Güvenli Deployment

### Pre-Commit Kontrolü

Git commit yapmadan önce güvenlik kontrolü için:

```bash
./pre-commit-check.sh
```

Bu script şunları kontrol eder:
- ✅ AWS Keys
- ✅ GitHub Tokens
- ✅ .env dosyaları
- ✅ Private keys

### GitHub'a Push

```bash
# 1. Değişiklikleri gözden geçirin
git status
git diff

# 2. Güvenlik kontrolü yapın
./pre-commit-check.sh

# 3. Dosyaları ekleyin (Hassas bilgiler hariç)
git add .

# 4. Commit yapın
git commit -m "Güncelleme: [açıklama]"

# 5. Push yapın
git push origin main
```

## ⚠️ ÖNEMLİ: Commit Etmeyin!

Aşağıdaki dosyalar **ASLA** commit edilmemelidir:

```
.env
.env.local
.env.production
*.key
*.pem
server.log
config/secrets.json
```

## 🔐 Güvenli Yapılandırma

### Local Development

```bash
# .env dosyası oluşturun
cp .env.example .env

# Gerçek değerleri girin (sadece local'de!)
nano .env
```

### Production Deploy

GitHub Actions ile otomatik deploy için:

1. GitHub Secrets ekleyin
2. Workflow dosyası `.github/workflows/deploy.yml`
3. Secrets kullanın: `${{ secrets.AWS_ACCESS_KEY_ID }}`

## 📋 Deployment Checklist

- [ ] Tüm .env dosyaları `.gitignore`da
- [ ] AWS credentials yok
- [ ] GitHub token yok
- [ ] Private key dosyaları yok
- [ ] `server.log` silindi
- [ ] Pre-commit check yapıldı
- [ ] Değişiklikler gözden geçirildi

## 🆘 Acil Durum

Eğer hassas bilgi commit edildiyse:

```bash
# 1. Keys'i rotate edin (AWS, GitHub)
# 2. Git geçmişini temizleyin
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch FILENAME" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Force push
git push origin --force --all
```

---

**Güvenli kodlama! 🔐**

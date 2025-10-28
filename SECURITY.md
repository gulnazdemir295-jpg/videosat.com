# Güvenlik Rehberi - VideoSat

## 🔐 Hassas Bilgiler

Bu proje **ASLA** aşağıdaki bilgileri commit etmemelidir:

- ❌ AWS Access Keys
- ❌ AWS Secret Keys
- ❌ GitHub Tokens
- ❌ API Keys
- ❌ Veritabanı şifreleri
- ❌ Ödeme gateway bilgileri
- ❌ Özel şifreler

## ✅ Güvenli Yapılandırma

### 1. Environment Variables

Tüm hassas bilgiler `.env` dosyasında saklanmalı:

```bash
# .env dosyası oluşturun (template'den kopyalayın)
cp .env.template .env

# .env dosyasını düzenleyin ve gerçek değerleri girin
```

### 2. GitHub Secrets

Production deploy için GitHub Secrets kullanın:

1. GitHub Repository → Settings
2. Secrets and variables → Actions
3. "New repository secret" ile ekleyin:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `GITHUB_TOKEN`

### 3. .gitignore

`.gitignore` dosyası şunları filtreler:
- `.env*` dosyaları
- `*.key`, `*.pem` dosyaları
- `server.log` ve log dosyaları
- Python cache dosyaları

## 🛡️ Güvenlik Best Practices

### Dosya Güvenliği

```bash
# Dosya izinlerini kontrol edin
chmod 600 .env  # Sadece owner okuyabilir

# Gereksiz dosyaları silin
rm -f server.log
```

### Kod Güvenliği

- ✅ Tüm hardcoded credentials kaldırıldı
- ✅ Environment variables kullanılıyor
- ✅ Placeholder değerler template'de

### Deploy Güvenliği

```bash
# Git commit önce kontrol
git status
git diff

# Hassas bilgi var mı?
grep -r "AKIA\|ghp_\|secret" --exclude-dir=node_modules .
```

## 🚨 Acil Durum

Eğer hassas bilgi yanlışlıkla commit edildiyse:

1. **Hemen GitHub'da geçersiz kılın:**
   - AWS IAM → Rotate keys
   - GitHub → Regenerate token

2. **Git geçmişini temizleyin:**
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch PATH_TO_FILE" \
  --prune-empty --tag-name-filter cat -- --all
```

3. **Force push yapın:**
```bash
git push origin --force --all
```

## 📞 Destek

Güvenlik sorunları için: security@videosat.com

---

**Son Güncelleme:** 2024
**Güvenlik Seviyesi:** ⭐⭐⭐⭐⭐

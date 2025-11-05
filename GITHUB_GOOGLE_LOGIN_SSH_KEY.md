# GitHub Google Login ile SSH Key Ekleme

## 🔐 Durum
GitHub'a **Google ile giriş** yapıyorsanız, GitHub şifreniz yoktur. Bu normaldir.

## ✅ SSH Key Ekleme - Şifre İstenirse

### Senaryo 1: Şifre İstenmez (Çoğu Durumda)
SSH key eklerken genellikle **şifre istenmez**. Sadece:
1. Key'i yapıştırın
2. "Add SSH key" butonuna tıklayın
3. Hazır! ✅

### Senaryo 2: Şifre İstenirse (Güvenlik Doğrulaması)
Eğer şifre istenirse, GitHub **Google hesabınızla** giriş yapmanızı ister:

1. **"Add SSH key"** butonuna tıkladığınızda
2. Bir pop-up pencere açılır
3. **"Sign in with Google"** veya **"Continue with Google"** seçeneğini görürsünüz
4. Google hesabınızla giriş yapın
5. SSH key eklenir

## 🔑 Alternatif: Personal Access Token (PAT)

Eğer Google login ile sorun yaşarsanız, **Personal Access Token** kullanabilirsiniz:

### Token Oluşturma:
1. GitHub > Settings > Developer settings
2. Personal access tokens > Tokens (classic)
3. "Generate new token (classic)"
4. Scopes: `repo` seçin
5. Token'ı oluşturun ve kopyalayın

### SSH Yerine HTTPS Kullanma:
SSH sorunlu olursa, HTTPS kullanabilirsiniz:

```bash
git remote set-url origin https://github.com/gulnazdemir295-jpg/videosat.com.git
```

Sonra GitHub Desktop'ta Personal Access Token kullanın.

## 🎯 Önerilen Yol

**Önce SSH key'i eklemeyi deneyin:**
1. https://github.com/settings/keys sayfasına gidin
2. "New SSH key" butonuna tıklayın
3. Key'i yapıştırın
4. "Add SSH key" butonuna tıklayın
5. Eğer şifre istenirse, Google ile giriş yapın

**Çoğu durumda şifre istenmez!** Direkt eklenir.

## 📝 Not

- Google ile giriş yapan hesaplarda GitHub şifresi yoktur
- SSH key eklerken genellikle şifre istenmez
- Eğer istenirse, Google OAuth ile giriş yaparsınız


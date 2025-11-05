# GitHub Device Login Sayfası Açıklaması

## 🔐 Bu Sayfa Nedir?

`https://github.com/login/device?skip_account_picker=true` sayfası GitHub'ın **cihaz bazlı kimlik doğrulama** sayfasıdır.

## 📱 Ne Zaman Açılır?

1. **GitHub Desktop** uygulamasından giriş yaparken
2. **Git CLI** ile ilk kez push yaparken
3. **VS Code** veya başka IDE'lerden GitHub'a bağlanırken
4. **GitHub CLI (gh)** ile ilk kez authenticate olurken

## ✅ Normal Bir Süreç

Bu sayfa **normal ve güvenli** bir süreçtir. GitHub, uygulamanızın kimliğini doğrulamak için kullanır.

## 🎯 Nasıl Kullanılır?

### Senaryo 1: GitHub Desktop'tan Açıldıysa
1. GitHub Desktop'ta bir işlem yapmaya çalıştınız
2. GitHub, tarayıcıda bu sayfayı açtı
3. **Giriş yapın** (Google ile veya GitHub hesabıyla)
4. GitHub Desktop otomatik olarak bağlanır

### Senaryo 2: Terminal'den Açıldıysa
1. Terminal'de `git push` veya benzeri bir komut çalıştırdınız
2. GitHub, tarayıcıda bu sayfayı açtı
3. **Giriş yapın**
4. Terminal'de işlem devam eder

## 🔄 Şu Anki Durumunuz

Muhtemelen:
- GitHub Desktop'ta push yapmaya çalışıyorsunuz
- Veya terminal'de `git push` komutunu çalıştırdınız
- GitHub, kimlik doğrulaması için bu sayfayı açtı

## ✅ Yapmanız Gerekenler

1. **Sayfada giriş yapın:**
   - Google ile giriş yapın (hesabınız Google ile bağlıysa)
   - Veya GitHub kullanıcı adı/şifre ile giriş yapın

2. **İzin verin:**
   - GitHub, uygulamanıza erişim izni isteyecek
   - "Authorize" veya "İzin ver" butonuna tıklayın

3. **GitHub Desktop'a dönün:**
   - İşlem otomatik olarak devam edecek

## ⚠️ Hata Alıyorsanız

Sayfada "Uh oh! There was an error while loading" görüyorsanız:

1. **Sayfayı yenileyin** (F5 veya Cmd+R)
2. **Başka bir tarayıcı** deneyin
3. **GitHub Desktop'ı yeniden başlatın**
4. **Terminal'de tekrar deneyin**

## 🔗 İlgili Linkler

- GitHub Device Flow: https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#device-flow
- GitHub Authentication: https://docs.github.com/en/authentication

## 📝 Not

Bu sayfa **güvenli** ve GitHub'ın resmi kimlik doğrulama sürecidir. Şüpheli bir sayfa değildir.


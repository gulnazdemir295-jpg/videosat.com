# SSH Key GitHub'a Ekleme Adımları

## ✅ SSH Key Oluşturuldu

SSH key başarıyla oluşturuldu. Şimdi GitHub'a eklemeniz gerekiyor.

## 🔑 Public Key (Bu key'i GitHub'a ekleyin):

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIA6xVNEFhio/aAHT7mhD0qYjjtOVM3MpFVPIp33ssdsb gulnazdemir295-jpg@github
```

## 📝 GitHub'a SSH Key Ekleme Adımları:

1. **Public key'i kopyalayın** (yukarıdaki key)

2. **GitHub'a gidin:**
   - https://github.com/settings/keys
   - Veya: GitHub > Settings > SSH and GPG keys

3. **"New SSH key" butonuna tıklayın**

4. **Formu doldurun:**
   - **Title**: "MacBook - GitHub Desktop" (veya istediğiniz bir isim)
   - **Key type**: "Authentication Key" (varsayılan)
   - **Key**: Yukarıdaki public key'i yapıştırın (ssh-ed25519 ile başlayan satır)

5. **"Add SSH key" butonuna tıklayın**

6. **GitHub şifrenizi girin** (güvenlik doğrulaması için)

## ✅ Test Etme

Key'i ekledikten sonra terminal'de test edin:

```bash
ssh -T git@github.com
```

Başarılı olursa şu mesajı göreceksiniz:
```
Hi gulnazdemir295-jpg! You've successfully authenticated, but GitHub does not provide shell access.
```

## 🚀 GitHub Desktop'ta Kullanım

SSH key'i GitHub'a ekledikten sonra:

1. **GitHub Desktop'ı yeniden başlatın**
2. **Push butonuna tıklayın**
3. Artık authentication sorunu olmayacak!

## 📝 Notlar

- SSH key dosyası: `~/.ssh/id_ed25519_github`
- Public key dosyası: `~/.ssh/id_ed25519_github.pub`
- SSH config dosyası: `~/.ssh/config` (GitHub için yapılandırıldı)

## 🔗 Hızlı Linkler

- SSH Keys Settings: https://github.com/settings/keys
- GitHub Desktop: Uygulamayı yeniden başlatın


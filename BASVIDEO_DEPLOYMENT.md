# BASVIDEO.COM'DA DEĞİŞİKLİKLERİ GÖRME REHBERİ

## 🚀 Hızlı Kontrol Listesi

### 1. GitHub'a Push Yapıldı mı?
```bash
# Terminal'de kontrol edin:
git log origin/main..HEAD --oneline

# Eğer commit'ler varsa, push yapın:
git push origin main
```

### 2. GitHub Pages Aktif mi?
- GitHub repository: https://github.com/gulnazdemir295-jpg/videosat.com
- Settings → Pages → Source: `main` branch seçili olmalı
- Custom domain: `basvideo.com` yazılı olmalı
- Enforce HTTPS: Aktif olmalı

### 3. Deployment Durumu
- Repository → Actions sekmesi
- Son deployment işlemini kontrol edin
- Yeşil tik = Başarılı!

### 4. Site URL'leri

**GitHub Pages URL:**
```
https://gulnazdemir295-jpg.github.io/videosat.com/
```

**Custom Domain (DNS yayılımı sonrası):**
```
https://basvideo.com
```

### 5. DNS Kontrolü

DNS kayıtlarınızın doğru olduğundan emin olun:
- A Kayıtları: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- CNAME: www → gulnazdemir295-jpg.github.io

DNS kontrolü için:
```bash
# Terminal'de DNS kayıtlarını kontrol edin:
nslookup basvideo.com
dig basvideo.com
```

### 6. Önbellek Temizleme

Tarayıcı önbelleğini temizleyin:
- Chrome/Edge: Ctrl+Shift+Delete (Windows) veya Cmd+Shift+Delete (Mac)
- Hard Refresh: Ctrl+F5 (Windows) veya Cmd+Shift+R (Mac)

### 7. Deployment Süresi

- **GitHub Pages Build:** 1-5 dakika
- **DNS Propagation:** 24-48 saat (ilk kez)
- **HTTPS Certificate:** 1-2 saat

## 🔍 Sorun Giderme

### Site görünmüyor:
1. GitHub Pages'in aktif olduğunu kontrol edin
2. Repository → Actions → Deployment durumunu kontrol edin
3. index.html dosyası root dizinde olmalı
4. DNS kayıtlarının doğru olduğundan emin olun

### Değişiklikler görünmüyor:
1. Tarayıcı önbelleğini temizleyin (Hard Refresh)
2. Deployment'in tamamlandığını kontrol edin
3. Doğru branch'de olduğunuzdan emin olun (`main`)
4. GitHub Pages URL'ini kontrol edin

### HTTPS çalışmıyor:
1. GitHub Pages → Enforce HTTPS'yi açın
2. DNS yayılımını bekleyin (24-48 saat)
3. Custom domain'in doğru yazıldığından emin olun

## 📞 Yardım

Sorun devam ederse:
- GitHub Actions loglarını kontrol edin
- GitHub Pages dokümantasyonuna bakın
- DNS sağlayıcınızın desteğiyle iletişime geçin


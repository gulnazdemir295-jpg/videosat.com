# AWS Access Key Değiştirme - Adım Adım Rehber

## 🎯 Amaç
Eski AWS access key'i güvenli şekilde yeni key ile değiştirmek ve GitHub'a push edebilmek.

## 📋 Adım Adım İşlem

### Adım 1: Yeni Access Key Oluştur (AWS Console'da)

**AWS IAM Console'da:**
1. Sol menüden **"Kullanıcılar"** (Users) seçin
2. Key'e sahip kullanıcıyı bulun (muhtemelen `basvideo.com`)
3. Kullanıcı adına tıklayın
4. **"Güvenlik kimlik bilgileri"** (Security credentials) sekmesine gidin
5. **"Erişim anahtarları"** (Access keys) bölümünde
6. **"Erişim anahtarı oluştur"** (Create access key) butonuna tıklayın
7. **"Application running outside AWS"** seçeneğini seçin
8. **"Sonraki"** (Next) butonuna tıklayın
9. **"Erişim anahtarı oluştur"** (Create access key) butonuna tıklayın
10. **ÖNEMLİ**: Yeni key'leri kopyalayın ve güvenli bir yere kaydedin!
    - Access Key ID
    - Secret Access Key (bir daha gösterilmeyecek!)

### Adım 2: Backend'de Güncelle

**Sunucuya SSH ile bağlanın:**
```bash
ssh -i basvide-backend-key.pem ubuntu@your-server-ip
# veya
ssh ubuntu@107.23.178.153
```

**Backend dizinine gidin:**
```bash
cd /var/www/basvideo/backend/api
# veya backend'in kurulu olduğu dizin
```

**.env dosyasını düzenleyin:**
```bash
nano .env
# veya
vi .env
```

**Yeni key'leri güncelleyin:**
```env
AWS_ACCESS_KEY_ID=yeni_access_key_id_buraya
AWS_SECRET_ACCESS_KEY=yeni_secret_key_buraya
```

**Dosyayı kaydedin:**
- Nano: `Ctrl+O` (kaydet), `Ctrl+X` (çık)
- Vi: `:wq` (kaydet ve çık)

### Adım 3: Backend'i Restart Et

```bash
# PM2 ile restart
pm2 restart basvideo-api

# Veya PM2 yoksa
pm2 start app.js --name basvideo-api
pm2 save
```

### Adım 4: Test Et

**Health check:**
```bash
curl http://localhost:4000/api/health
# veya sunucu IP'si ile
curl http://107.23.178.153:4000/api/health
```

**AWS bağlantı testi (opsiyonel):**
```bash
curl http://localhost:4000/api/admin/aws/verify
# (Admin token gerekli)
```

### Adım 5: Eski Key'i Deaktive Et

**AWS IAM Console'da:**
1. Kullanıcı > Security credentials
2. Eski key'in yanında **"Eylemler"** (Actions) menüsü
3. **"Erişim anahtarını devre dışı bırak"** (Deactivate access key) veya **"Sil"** (Delete)
4. Onaylayın

### Adım 6: GitHub Push

Artık eski key kullanılmıyor, GitHub'a push edebilirsiniz:

**Terminal'den:**
```bash
cd /Users/gulnazdemir/Desktop/DENEME
git push origin main
```

**Veya GitHub Desktop'tan:**
- Push butonuna tıklayın
- Artık authentication sorunu olmayacak

## ✅ Kontrol Listesi

- [ ] Yeni access key oluşturuldu
- [ ] Backend .env dosyası güncellendi
- [ ] Backend restart edildi
- [ ] Health check başarılı
- [ ] Eski key deaktive edildi
- [ ] GitHub push başarılı

## ⚠️ Önemli Notlar

1. **Yeni key'leri hemen kaydedin** - Secret key bir daha gösterilmeyecek
2. **Eski key'i deaktive etmeden önce** backend'in çalıştığını doğrulayın
3. **Backup alın** - Eğer sorun olursa eski key'i tekrar aktif edebilirsiniz
4. **GitHub push** - Eski key artık kullanılmıyor, push güvenli

## 🔄 Hızlı Komutlar

```bash
# Sunucuya bağlan
ssh ubuntu@107.23.178.153

# Backend dizini
cd /var/www/basvideo/backend/api

# .env düzenle
nano .env

# Backend restart
pm2 restart basvideo-api

# Test
curl http://localhost:4000/api/health
```

## 🆘 Sorun Giderme

**Backend çalışmıyorsa:**
```bash
pm2 logs basvideo-api
# Hataları kontrol et
```

**AWS bağlantı hatası:**
- Yeni key'lerin doğru kopyalandığından emin olun
- IAM permissions kontrol edin

**GitHub push hala engelleniyorsa:**
- Eski commit'teki credentials'ları GitHub'dan allow edin
- Veya git history'yi temizleyin


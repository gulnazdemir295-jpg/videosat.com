# Agora "invalid vendor key, can not find appid" - App ID Sorunu 🔍

## ⚠️ Sorun

Token olmadan da aynı hata alınıyor. Bu, **sorunun App ID'de** olduğunu gösteriyor.

"invalid vendor key, can not find appid" hatası = Agora, verilen App ID'yi tanımıyor.

## ✅ Kontrol Edilmesi Gerekenler

### 1. Agora Console'da App ID Kontrolü

1. **Agora Console** → **Projeler** → `basvideo-canlı-yayın` projesine gidin
2. **"Temel Ayarlar"** veya **"Basic Info"** sekmesine gidin
3. **"Uygulama Kimliği" (App ID)** değerini **tam olarak** kopyalayın
4. Terminal'deki değerle **karakter karakter** karşılaştırın:

```bash
cd /Users/gulnazdemir/Desktop/DENEME/backend/api
cat .env | grep AGORA_APP_ID
```

### 2. App ID Formatı

- App ID **32 karakter** (hex format) olmalı
- Örnek: `aa3df0d5845042fd9d298901becdb0e2`
- Boşluk olmamalı
- Küçük/büyük harf önemli değil (hex)

### 3. Proje Aktif mi?

Agora Console'da:
- Proje **aktif** mi?
- Proje **suspended** (askıya alınmış) değil mi?
- Proje **silinmiş** mi?

### 4. App ID Doğru Projeden mi?

- App ID ve Certificate **aynı projeden** olmalı
- Farklı projelerden App ID ve Certificate kullanılıyorsa hata alırsınız

## 🔄 Çözüm Adımları

### Adım 1: Agora Console'dan App ID'yi Yeniden Kopyalayın

1. Agora Console → Projeler → `basvideo-canlı-yayın` projesine gidin
2. **"Uygulama Kimliği" (App ID)** değerini **tam olarak** kopyalayın
3. Terminal'deki değerle **karakter karakter** karşılaştırın

### Adım 2: .env Dosyasını Güncelleyin

```bash
cd /Users/gulnazdemir/Desktop/DENEME/backend/api
nano .env
```

1. `AGORA_APP_ID=` satırını bulun
2. Mevcut değeri **tamamen silin**
3. Agora Console'dan kopyaladığınız **yeni App ID**'yi yapıştırın
4. Başında/sonunda boşluk olmamalı
5. Kaydedin: `Ctrl + X`, `Y`, `Enter`

### Adım 3: Backend'i Yeniden Başlatın

```bash
cd /Users/gulnazdemir/Desktop/DENEME
pkill -f "node.*app.js"
./start-backend.sh
```

### Adım 4: Test Edin

1. Sayfayı hard refresh yapın: `Cmd + Shift + R`
2. "Yayını Başlat" butonuna tıklayın

## 🔍 Alternatif: Yeni Proje Oluşturun (Son Çare)

Eğer sorun devam ederse:

1. Agora Console'da **yeni bir proje** oluşturun
2. **Yeni App ID** ve **Yeni Certificate**'ı kopyalayın
3. `.env` dosyasını güncelleyin
4. Backend'i yeniden başlatın

---

**En önemli kontrol**: App ID'nin Agora Console'daki değerle **tam olarak eşleştiğinden** emin olun!





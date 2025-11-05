# Agora.io Console - Adım Adım Rehber

## 🎯 Şu Anda Agora.io Sitesindesiniz - Ne Yapmalısınız?

### Adım 1: Hesap Oluşturun veya Giriş Yapın

**Eğer hesabınız yoksa**:
1. Sağ üst köşede **"Sign Up"** veya **"Sign In"** butonuna tıklayın
2. E-posta adresinizi girin
3. Şifre oluşturun
4. Telefon doğrulaması gerekebilir (SMS veya e-posta)
5. Hesabınızı doğrulayın

**Eğer hesabınız varsa**:
1. **"Sign In"** butonuna tıklayın
2. E-posta ve şifre ile giriş yapın

---

### Adım 2: Console'a Giriş Yapın

1. Giriş yaptıktan sonra **"Console"** veya **"Go to Console"** butonuna tıklayın
2. Veya direkt: https://console.agora.io/ adresine gidin

**Console görünümü**:
- Sol menüde "Projects", "Analytics", "Settings" gibi sekmeler olmalı

---

### Adım 3: Yeni Proje Oluşturun

1. **Sol menüden "Projects"** sekmesine tıklayın
   - Veya ana sayfada "Create Project" butonuna tıklayın

2. **"Create Project"** butonuna tıklayın
   - Genellikle sağ üst köşede veya sayfanın ortasında

3. **Proje Bilgilerini Doldurun**:
   - **Project Name**: `basvideo-live-streaming` (veya istediğiniz isim)
   - **Scenario**: 
     - **"Live Streaming"** seçin (canlı yayın için)
     - Veya **"Video Call"** (varsayılan)
   - **Authentication**: 
     - **"App ID"** seçin (varsayılan, genelde otomatik seçilidir)

4. **"Submit"** veya **"Create"** butonuna tıklayın

---

### Adım 4: Proje Detay Sayfasına Gidin

1. Oluşturulan projeye **tıklayın** (proje listesinden)
2. Proje detay sayfası açılacak

**Bu sayfada göreceksiniz**:
- App ID
- App Certificate (varsa)
- Proje ayarları

---

### Adım 5: App ID'yi Kopyalayın

1. Proje detay sayfasında **"App ID"** bölümünü bulun
   - Genellikle sayfanın üst kısmında
   - Veya "Project Settings" sekmesinde

2. **App ID'yi kopyalayın**
   - Örnek format: `1234567890abcdef1234567890abcdef`
   - Uzunluğu: 32 karakter civarı

**Not**: App ID'yi bir yere kaydedin (notepad, text editör)

---

### Adım 6: App Certificate Oluşturun/Kopyalayın

1. **"App Certificate"** bölümünü bulun
   - Genellikle App ID'nin hemen altında
   - Veya "Project Settings" → "App Certificate" sekmesinde

2. **Eğer Certificate yoksa**:
   - **"Generate"** veya **"Create"** butonuna tıklayın
   - Onaylayın
   - Certificate oluşturulacak

3. **Certificate'ı görün**:
   - **"Show"** butonuna tıklayın
   - Certificate görünecek (uzun bir string)

4. **Certificate'ı kopyalayın**
   - Örnek format: `abc123def456ghi789jkl012mno345pqr678...`
   - Uzunluğu: 200+ karakter

**Not**: Certificate'ı da bir yere kaydedin

---

### Adım 7: .env Dosyasına Ekleyin

**Terminal'de**:

```bash
cd /Users/gulnazdemir/Desktop/DENEME/backend/api
nano .env
```

**Aşağıdaki satırları ekleyin/düzenleyin**:

```env
AGORA_APP_ID=buraya_kopyaladiginiz_app_id_yapistirin
AGORA_APP_CERTIFICATE=buraya_kopyaladiginiz_certificate_yapistirin
STREAM_PROVIDER=AGORA
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
```

**Örnek** (gerçek değerlerle):
```env
AGORA_APP_ID=1234567890abcdef1234567890abcdef
AGORA_APP_CERTIFICATE=abc123def456ghi789jkl012mno345pqr678stu901vwx234
STREAM_PROVIDER=AGORA
PORT=3000
```

**Kaydedin**:
- Nano'da: `Ctrl + X`, sonra `Y`, sonra `Enter`

---

### Adım 8: Backend'i Başlatın

```bash
cd /Users/gulnazdemir/Desktop/DENEME
./start-backend.sh
```

**Beklenen Çıktı**:
```
✅ Agora.io service yüklendi
✅ Backend API çalışıyor: http://localhost:3000
🔑 Agora Service: ✅ Aktif
```

**Eğer "❌ Devre Dışı" görürseniz**:
- `.env` dosyasında credentials'ları kontrol edin
- Backend'i yeniden başlatın

---

## 📋 Ekran Görüntüsü Olmadan Yol Haritası

### Console'da Göreceğiniz Menüler:

```
Console Ana Sayfa
├── Projects (Tıklayın)
│   ├── Create Project (Tıklayın)
│   │   ├── Project Name: basvideo-live-streaming
│   │   ├── Scenario: Live Streaming
│   │   └── Submit
│   └── [Oluşturulan Proje] (Tıklayın)
│       ├── App ID: [Kopyala]
│       └── App Certificate: [Generate] → [Show] → [Kopyala]
├── Analytics
└── Settings
```

---

## ⚠️ Önemli Notlar

1. **App ID ve Certificate**: İkisini de kopyaladığınızdan emin olun
2. **Boşluk Olmadan**: Kopyalarken başında/sonunda boşluk olmamasına dikkat edin
3. **Kaydet**: Kopyaladığınız değerleri bir yere kaydedin (güvenli bir yere)
4. **.env Dosyası**: Değerleri doğru yapıştırdığınızdan emin olun

---

## ✅ Kontrol

**Backend başlattığınızda**:
- `🔑 Agora Service: ✅ Aktif` görünmeli
- Eğer `❌ Devre Dışı` görünüyorsa:
  - `.env` dosyasını kontrol edin
  - App ID ve Certificate doğru mu?

---

## 🎯 Hızlı Özet

1. ✅ Console'da "Projects" → "Create Project"
2. ✅ Proje adı: `basvideo-live-streaming`
3. ✅ "Submit"
4. ✅ Proje detay sayfasında:
   - App ID kopyala
   - App Certificate Generate → Show → Kopyala
5. ✅ `backend/api/.env` dosyasına ekle
6. ✅ Backend'i başlat

---

**Şu anda Console'daysanız**: "Projects" sekmesine gidin ve "Create Project" butonuna tıklayın!


# App Certificate Nasıl Bulunur? 🔍

## ✅ Önce Doğrulama

**"Uygulama Kimliği" = "App ID"** → Zaten buldunuz! ✅

Şimdi **App Certificate**'ı bulmamız gerekiyor.

---

## 📍 App Certificate Nerede?

### Senaryo 1: Proje Detay Sayfasında (En Yaygın)

1. **Proje detay sayfasındasınız** (App ID'yi kopyaladığınız sayfa)

2. **Aşağıya kaydırın** veya sayfayı inceleyin

3. **"App Certificate"** veya **"Uygulama Sertifikası"** bölümünü arayın
   - Genellikle App ID'nin hemen altında
   - Veya sayfanın sağ tarafında bir panelde

4. **İki durum olabilir**:

   **A) Certificate VARSA**:
   - **"Show"** veya **"Göster"** butonuna tıklayın
   - Certificate görünecek (uzun bir string)
   - Kopyalayın

   **B) Certificate YOKSA**:
   - **"Generate"** veya **"Oluştur"** veya **"Create"** butonuna tıklayın
   - Onaylayın
   - Certificate oluşturulacak
   - Sonra **"Show"** butonuna tıklayın
   - Kopyalayın

---

### Senaryo 2: Project Settings Sekmesinde

1. Proje detay sayfasında **üst menüden**:
   - **"Project Settings"** veya **"Proje Ayarları"** sekmesine tıklayın
   - Veya sol menüden **"Settings"** → **"Project Settings"**

2. **"App Certificate"** bölümünü bulun

3. **"Show"** veya **"Generate"** butonuna tıklayın

---

### Senaryo 3: Authentication Sekmesinde

1. Proje detay sayfasında **"Authentication"** veya **"Kimlik Doğrulama"** sekmesine tıklayın

2. **"App Certificate"** bölümünü bulun

3. **"Show"** veya **"Generate"** butonuna tıklayın

---

## 🔍 Görsel İpuçları

**Arayın**:
- 📋 **"Certificate"** yazısı
- 🔒 **Kilit** veya **sertifika** ikonu
- 👁️ **"Show"** veya **"Göster"** butonu
- ➕ **"Generate"** veya **"Oluştur"** butonu
- ⚙️ **"Settings"** veya **"Ayarlar"** menüsü

**Certificate'ın Görünümü**:
- Uzun bir string (200+ karakter)
- Örnek: `abc123def456ghi789jkl012mno345pqr678stu901vwx234...`
- Genellikle tek satırda veya bir text box içinde

---

## 📝 Örnek Sayfa Yapısı

```
Proje Detay Sayfası
├── [Proje Adı]
├── App ID: [Kopyaladığınız değer] ✅
├── App Certificate: 
│   ├── [Generate] butonu (eğer yoksa)
│   └── [Show] butonu (eğer varsa)
├── [Diğer ayarlar]
└── [Menüler: Settings, Analytics, vb.]
```

---

## ⚠️ Önemli Notlar

1. **Certificate yoksa**: "Generate" butonuna tıklayın, otomatik oluşturulur
2. **Certificate gizliyse**: "Show" butonuna tıklayın, görünür hale gelir
3. **Kopyalarken**: Başında/sonunda boşluk olmamasına dikkat edin
4. **Kaydedin**: Certificate'ı güvenli bir yere kaydedin (notepad, text editör)

---

## 🎯 Hızlı Kontrol Listesi

- [ ] App ID kopyalandı ✅ (Zaten yaptınız)
- [ ] Proje detay sayfasındasınız
- [ ] Sayfayı aşağı kaydırdınız
- [ ] "App Certificate" veya "Uygulama Sertifikası" bölümünü buldunuz
- [ ] "Generate" veya "Show" butonuna tıkladınız
- [ ] Certificate'ı kopyaladınız

---

## 💡 Eğer Hala Bulamıyorsanız

1. **Sayfayı yenileyin** (F5 veya Ctrl+R)
2. **Farklı bir sekme** deneyin (Settings, Authentication, vb.)
3. **Sol menüden** "Settings" → "Project Settings" seçeneğini deneyin
4. **Arama özelliği** kullanın (Ctrl+F veya Cmd+F) → "Certificate" yazın

---

**Şu an yapmanız gereken**: Proje detay sayfasında App ID'nin altında veya yanında "App Certificate" bölümünü arayın! 🔍


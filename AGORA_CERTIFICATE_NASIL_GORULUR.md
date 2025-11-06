# Agora Certificate Nasıl Görülür? 🔍

## ⚠️ Sorun
- Certificate'lar masked (gizli) görünüyor
- "Show" butonu görünmüyor
- Copy butonu sadece masked değeri kopyalıyor (32 karakter)
- Certificate'ın tamamı 200+ karakter olmalı

## ✅ Çözüm Adımları

### Yöntem 1: Temel Ayarlar Sayfasına Git

1. **Sol menüden "Projeler"** → `basvideo-canlı-yayın` projesine tıklayın
2. **"Temel Ayarlar" (Basic Settings)** sekmesine gidin
   - Veya üst menüden **"Basic Info"** veya **"Project Settings"** sekmesine tıklayın
3. **"Güvenlik" (Security)** bölümünü bulun
4. **"Birincil Sertifika" (Primary Certificate)** yanında:
   - **"Show"** veya **"Göster"** butonunu arayın
   - Veya **göz ikonu** 👁️ bulun
   - Veya **"View"** butonunu arayın

### Yöntem 2: Authentication Sekmesi

1. Proje detay sayfasında üst menüden **"Authentication"** veya **"Kimlik Doğrulama"** sekmesine gidin
2. **"App Certificate"** bölümünü bulun
3. **"Show"** butonuna tıklayın

### Yöntem 3: Project Settings

1. Sol menüden **"Settings"** → **"Project Settings"** seçin
2. **"App Certificate"** bölümünü bulun
3. **"Show"** butonuna tıklayın

## 🔄 Swap (Takas) Tuşuna Basıldıysa

Eğer "Takas Sertifikaları" (Swap Certificates) tuşuna bastıysanız:
- Birincil ve İkincil sertifikalar yer değiştirmiş olabilir
- Şimdi **"Birincil Sertifika"** aslında eski **"İkincil Sertifika"** olabilir
- Her ikisini de **"Show"** ile görüp, **uzun olanı** (200+ karakter) kullanın

## 📋 Certificate Kontrolü

Certificate doğru kopyalandıysa:
- **Uzunluk**: 200-300 karakter arası olmalı
- **Format**: Tek satır, boşluk olmamalı
- **Örnek**: `abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567abc123def456...`

**Yanlış** (Masked değer):
- 32 karakter
- Örnek: `5ac32128193e418bb4bde5d0c367ef67`

## 🎯 Şimdi Yapmanız Gerekenler

1. Proje detay sayfasında **"Temel Ayarlar"** veya **"Basic Info"** sekmesine gidin
2. **"Güvenlik"** bölümünde **"Show"** butonunu bulun
3. **"Birincil Sertifika"** için **"Show"** butonuna tıklayın
4. Certificate'ın **tamamını** (200+ karakter) kopyalayın
5. `.env` dosyasına ekleyin

---

**Not**: Eğer "Show" butonu hala görünmüyorsa, proje ayarlarının farklı bir sekmesinde olabilir veya farklı bir sayfada olabilir.


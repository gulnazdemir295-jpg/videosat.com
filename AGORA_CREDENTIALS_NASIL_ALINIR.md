# Agora.io Credentials Nasıl Alınır?

## 📋 ÖNEMLİ: Agora.io AWS'den Bağımsızdır!

**Agora.io** ve **AWS** farklı platformlardır:
- ❌ **AWS'de** credential oluşturmaya **GEREK YOK**
- ✅ **Agora.io** kendi platformunda credentials sağlıyor
- ✅ **Ücretsiz** hesap açabilirsiniz

---

## 🔑 Agora.io Credentials Nasıl Alınır?

### Adım 1: Agora.io Hesabı Oluşturun

1. **Agora.io Console'a gidin**:
   - URL: https://console.agora.io/
   - "Sign Up" veya "Sign In" butonuna tıklayın

2. **Hesap oluşturun**:
   - E-posta ile kayıt olun
   - Ücretsiz plan mevcut (Free tier)
   - Telefon doğrulaması gerekebilir

3. **Console'a giriş yapın**

---

### Adım 2: Proje Oluşturun

1. **Console'da "Projects" sekmesine gidin**
   - Sol menüden "Projects" seçin
   - Veya direkt: https://console.agora.io/projects

2. **"Create Project" butonuna tıklayın**

3. **Proje bilgilerini doldurun**:
   - **Project Name**: `basvideo-live-streaming` (veya istediğiniz isim)
   - **Scenario**: "Live Streaming" veya "Video Call" seçin
   - **Authentication**: "App ID" seçin (varsayılan)

4. **"Submit" butonuna tıklayın**

---

### Adım 3: App ID ve App Certificate Alın

1. **Oluşturulan projeye tıklayın** (proje listesinden)

2. **Project Settings'e gidin**:
   - Proje detay sayfasında "Project Settings" veya "Config" sekmesi

3. **App ID'yi kopyalayın**:
   - **App ID**: Sayfada görünen ID (örn: `1234567890abcdef`)
   - Direkt kopyalayın

4. **App Certificate oluşturun/kopyalayın**:
   - **App Certificate** bölümüne gidin
   - Eğer yoksa "Generate" veya "Create" butonuna tıklayın
   - "Show" butonuna tıklayarak certificate'ı görün
   - **App Certificate**: Kopyalayın (örn: `abc123def456ghi789...`)

---

### Adım 4: .env Dosyasına Ekleyin

**backend/api/.env** dosyasını düzenleyin:

```env
# Agora.io Configuration (ZORUNLU)
AGORA_APP_ID=buraya_app_id_yapistir
AGORA_APP_CERTIFICATE=buraya_certificate_yapistir

# Streaming Provider
STREAM_PROVIDER=AGORA

# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
```

**Örnek** (gerçek değerler):
```env
AGORA_APP_ID=1234567890abcdef1234567890abcdef
AGORA_APP_CERTIFICATE=abc123def456ghi789jkl012mno345pqr678stu901vwx234
STREAM_PROVIDER=AGORA
PORT=3000
```

---

## 🎯 Hızlı Adımlar (Özet)

1. ✅ https://console.agora.io/ → Hesap oluştur
2. ✅ "Projects" → "Create Project"
3. ✅ Proje adı: `basvideo-live-streaming`
4. ✅ "Submit"
5. ✅ Proje detay sayfasında:
   - **App ID** kopyala
   - **App Certificate** oluştur ve kopyala
6. ✅ `backend/api/.env` dosyasına ekle

---

## ⚠️ ÖNEMLİ NOTLAR

### 1. AWS ile İlgisi Yok!

- ❌ AWS Console'da bir şey yapmanıza gerek yok
- ❌ AWS credentials'ları gerekmez
- ✅ Sadece Agora.io Console kullanılır

### 2. Ücretsiz Kullanım

- ✅ Agora.io ücretsiz tier sağlıyor
- ✅ 10,000 dakika/ay ücretsiz
- ✅ Geliştirme için yeterli

### 3. Güvenlik

- ⚠️ App Certificate'ı asla GitHub'a push etmeyin
- ⚠️ `.env` dosyası `.gitignore`'da olmalı (zaten var)
- ✅ Production'da environment variables kullanın

---

## 📝 Görsel Rehber (Adım Adım)

### Adım 1: Console'a Giriş
```
https://console.agora.io/
→ Sign Up / Sign In
```

### Adım 2: Proje Oluştur
```
Console → Projects → Create Project
→ Project Name: basvideo-live-streaming
→ Submit
```

### Adım 3: Credentials Al
```
Project Detail → Project Settings
→ App ID: [kopyala]
→ App Certificate: [Generate] → [Show] → [kopyala]
```

### Adım 4: .env Dosyasına Ekle
```bash
cd backend/api
nano .env
# AGORA_APP_ID=...
# AGORA_APP_CERTIFICATE=...
```

---

## 🔍 Kontrol

### Backend Başlattığınızda:

**Başarılı**:
```
✅ Agora.io service yüklendi
🔑 Agora Service: ✅ Aktif
```

**Hata** (credentials eksik):
```
⚠️ Agora service yüklenemedi: ...
🔑 Agora Service: ❌ Devre Dışı
```

**Çözüm**: `.env` dosyasında `AGORA_APP_ID` ve `AGORA_APP_CERTIFICATE` kontrol edin

---

## 💡 İpuçları

1. **App ID**: Kısa bir string (örn: 32 karakter)
2. **App Certificate**: Uzun bir string (örn: 200+ karakter)
3. **Her ikisi de zorunlu**: Sistem çalışması için ikisi de gerekli
4. **Test için**: Ücretsiz plan yeterli

---

## ❓ Sık Sorulan Sorular

### Q: AWS hesabı gerekli mi?
**A**: Hayır! Agora.io AWS'den bağımsız bir platform.

### Q: Ücretli mi? Kredi kartı gerekli mi?
**A**: 
- **Ücretsiz tier**: 10,000 dakika/ay ücretsiz
- **Kredi kartı**: Free tier için gerekmez
- **Ücretlendirme**: Sadece limit aşılırsa başlar
- **Geliştirme**: Ücretsiz plan yeterli

### Q: App Certificate'ı unuttum?
**A**: Agora Console'dan tekrar görebilirsiniz (Show butonu).

### Q: Birden fazla proje olabilir mi?
**A**: Evet, istediğiniz kadar proje oluşturabilirsiniz.

---

**Son Güncelleme**: 2025-01-05
**Durum**: ✅ Güncel


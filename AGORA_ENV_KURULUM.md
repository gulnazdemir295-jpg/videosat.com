# Agora.io .env Dosyası Kurulumu

## 🎯 Şimdi Yapmanız Gerekenler

### Adım 1: Terminal'de .env Dosyasını Açın

```bash
cd /Users/gulnazdemir/Desktop/DENEME/backend/api
nano .env
```

---

### Adım 2: Aşağıdaki Satırları Ekleyin/Düzenleyin

**Eğer .env dosyasında bu satırlar varsa**, değerlerini güncelleyin:
**Eğer yoksa**, dosyanın sonuna ekleyin:

```env
AGORA_APP_ID=buraya_kopyaladiginiz_app_id_yapistirin
AGORA_APP_CERTIFICATE=buraya_kopyaladiginiz_certificate_yapistirin
STREAM_PROVIDER=AGORA
PORT=3000
```

---

### Adım 3: Değerleri Yapıştırın

1. **`AGORA_APP_ID=`** satırının sağına, kopyaladığınız **App ID**'yi yapıştırın
   - Örnek: `AGORA_APP_ID=aa3d1234567890abcdef...`

2. **`AGORA_APP_CERTIFICATE=`** satırının sağına, kopyaladığınız **App Certificate**'ı yapıştırın
   - Örnek: `AGORA_APP_CERTIFICATE=abc123def456ghi789...`

3. **`STREAM_PROVIDER=AGORA`** olduğundan emin olun

4. **`PORT=3000`** olduğundan emin olun

---

### Adım 4: Kaydedin

**Nano editöründe**:
1. `Ctrl + X` (çıkış)
2. `Y` (kaydetmek için evet)
3. `Enter` (dosya adını onayla)

---

### Adım 5: Kontrol Edin

```bash
cat .env | grep AGORA
```

**Beklenen çıktı**:
```
AGORA_APP_ID=aa3d...
AGORA_APP_CERTIFICATE=abc123...
```

⚠️ **Önemli**: Başında/sonunda boşluk olmamalı!

---

### Adım 6: Backend'i Başlatın

```bash
cd /Users/gulnazdemir/Desktop/DENEME
./start-backend.sh
```

**Beklenen çıktı**:
```
✅ Agora.io service yüklendi
✅ Backend API çalışıyor: http://localhost:3000
🔑 Agora Service: ✅ Aktif
```

✅ **Eğer "🔑 Agora Service: ✅ Aktif" görürseniz**, her şey hazır!

❌ **Eğer "❌ Devre Dışı" görürseniz**:
- `.env` dosyasını kontrol edin
- App ID ve Certificate doğru mu?
- Boşluk var mı?

---

## 📋 Örnek .env Dosyası

```env
# Agora.io Credentials
AGORA_APP_ID=aa3d1234567890abcdef1234567890abcdef
AGORA_APP_CERTIFICATE=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567

# Stream Provider
STREAM_PROVIDER=AGORA

# Backend Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
```

---

## ⚠️ Güvenlik Notları

1. **.env dosyası** asla GitHub'a push edilmemeli (zaten .gitignore'da)
2. **App ID ve Certificate** hassas bilgilerdir, güvenli tutun
3. **Production'da** farklı credentials kullanın

---

**Şimdi terminal'de `nano .env` komutunu çalıştırın ve değerleri ekleyin!** 🚀


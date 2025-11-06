# 📋 MANUEL YAPILMASI GEREKENLER - TAM LİSTE

**Tarih:** 5 Ocak 2025  
**Durum:** Proje İnceleme ve Manuel İşlemler Raporu

---

## 🔴 YÜKSEK ÖNCELİK - ZORUNLU İŞLEMLER

### 1. 🔑 Agora.io Credentials Al ve Yapılandır

**Durum:** ⏳ SİZ YAPACAKSINIZ  
**Öncelik:** 🔴 KRİTİK - Sistem çalışması için zorunlu

**Adımlar:**
1. **Agora.io hesabı oluştur**
   - [console.agora.io](https://console.agora.io/) adresine git
   - Ücretsiz plan ile kayıt ol

2. **Proje oluştur**
   - Console → "Projects" → "Create Project"
   - Proje adı: `basvideo-live-streaming` (veya istediğiniz)
   - "Submit" butonuna tıkla

3. **App ID ve Certificate al**
   - Proje detay sayfasında:
     - **App ID**: Kopyala (örn: `1234567890abcdef`)
     - **App Certificate**: "Show" butonuna tıkla → Kopyala (örn: `abc123def456...`)

4. **`.env` dosyasını güncelle**
   ```bash
   cd backend/api
   nano .env  # veya code .env
   ```
   
   Şu satırları ekle/düzenle:
   ```env
   AGORA_APP_ID=buraya_app_id_yapistir
   AGORA_APP_CERTIFICATE=buraya_certificate_yapistir
   STREAM_PROVIDER=AGORA
   PORT=3000
   HOST=0.0.0.0
   NODE_ENV=development
   ADMIN_TOKEN=degistir_bu_tokeni_guvenli_random_bir_seyle
   ```

**⚠️ ÖNEMLİ:** 
- Bu bilgiler olmadan sistem çalışmaz!
- `.env` dosyasını asla GitHub'a push etmeyin

**Süre:** 5-10 dakika  
**Maliyet:** ₺0 (ücretsiz plan mevcut)

---

### 2. 🚀 Backend'i Başlat ve Test Et

**Durum:** ⏳ SİZ YAPACAKSINIZ  
**Öncelik:** 🔴 ZORUNLU

**Adımlar:**
1. **Backend'i başlat**
   ```bash
   cd /Users/gulnazdemir/Desktop/DENEME
   ./start-backend.sh
   ```
   
   VEYA manuel:
   ```bash
   cd backend/api
   npm start
   ```

2. **Backend'in çalıştığını doğrula**
   ```bash
   # Yeni terminal aç
   curl http://localhost:3000/api/health
   ```
   
   **Beklenen:** `{"ok": true}`

3. **Agora Service kontrolü**
   - Backend log'larında şunu görmelisiniz:
     ```
     🔑 Agora Service: ✅ Aktif
     ```
   - Eğer `❌ Devre Dışı` görünüyorsa:
     - `.env` dosyasında credentials kontrol et
     - Backend'i yeniden başlat

**Süre:** 2-3 dakika  
**Maliyet:** ₺0

---

### 3. 🌐 Frontend'i Çalıştır ve Test Et

**Durum:** ⏳ SİZ YAPACAKSINIZ  
**Öncelik:** 🔴 ZORUNLU

**Adımlar:**
1. **Yeni terminal aç** (backend çalışırken)
   ```bash
   cd /Users/gulnazdemir/Desktop/DENEME
   python3 -m http.server 8000
   ```

2. **Tarayıcıda aç**
   ```
   http://localhost:8000/index.html
   ```

3. **Frontend-Backend bağlantısını test et**
   - Browser console'u aç (F12)
   - Şunu yaz:
   ```javascript
   testBackendConnection();
   ```
   - Beklenen: `✅ Backend bağlantısı başarılı`

**Süre:** 2-3 dakika  
**Maliyet:** ₺0

---

## 🟡 ORTA ÖNCELİK - ÖNERİLEN İŞLEMLER

### 4. 🔐 Admin Token Değiştir

**Durum:** ⏳ ÖNERİLİR  
**Öncelik:** 🟡 GÜVENLİK

**Adımlar:**
1. Güvenli token oluştur:
   ```bash
   openssl rand -hex 32
   ```

2. `.env` dosyasında güncelle:
   ```env
   ADMIN_TOKEN=oluşturulan_token_buraya
   ```

3. Backend'i yeniden başlat

**Süre:** 2 dakika  
**Maliyet:** ₺0

---

### 5. 📊 AWS IVS Hesap Doğrulaması Bekleme

**Durum:** ⏳ AWS Support'tan yanıt bekleniyor  
**Öncelik:** 🟡 CANLI YAYIN İÇİN ÖNEMLİ

**Durum:**
- AWS Support Case: #176217761800459
- Beklenen süre: 24-48 saat
- Doğrulama tamamlandığında test edilecek

**Onay Sonrası Yapılacaklar:**
1. Channel oluşturma testi
2. Stream key alma testi
3. OBS Studio ile yayın testi
4. Tarayıcıdan yayın testi (WebRTC enablement sonrası)

**Süre:** Bekleme (24-48 saat)  
**Maliyet:** ₺0

---

### 6. 🌐 Production Backend URL Kontrolü

**Durum:** ⏳ KONTROL EDİLMELİ  
**Öncelik:** 🟡 PRODUCTION İÇİN

**Kontrol:**
- Production backend URL: `http://107.23.178.153:4000`
- Frontend kodunda bu URL kullanılıyor mu kontrol et
- Local development için `localhost:3000` kullanılmalı

**Test:**
```bash
curl http://107.23.178.153:4000/api/health
# Beklenen: {"ok": true}
```

**Süre:** 5 dakika  
**Maliyet:** ₺0

---

## 🟢 DÜŞÜK ÖNCELİK - OPSİYONEL İŞLEMLER

### 7. 📦 GitHub Push (Kod Güncellemeleri)

**Durum:** ⏳ YAPILACAK  
**Öncelik:** 🟢 OPSİYONEL

**Adımlar:**
```bash
git add .
git commit -m "Update: Manuel işlemler tamamlandı"
git push origin main
```

**Not:** `.env` dosyası `.gitignore`'da olduğu için push edilmeyecek (güvenli)

**Süre:** 5 dakika  
**Maliyet:** ₺0

---

### 8. 🌍 Domain Yönlendirme (Opsiyonel)

**Durum:** ⏳ OPSİYONEL  
**Öncelik:** 🟢 İLERİDE

**Yapılacaklar:**
- `api.basvideo.com` → `107.23.178.153` (A kaydı)
- Route 53 veya DNS provider üzerinden

**Maliyet:** Route 53 ~$0.50/ay

---

### 9. 🔒 HTTPS/SSL Sertifikası (Opsiyonel)

**Durum:** ⏳ OPSİYONEL  
**Öncelik:** 🟢 PRODUCTION İÇİN ÖNERİLİR

**Seçenekler:**
- **Let's Encrypt**: Ücretsiz (Nginx ile)
- **AWS ACM + ALB**: ~$16/ay

**Süre:** 30-60 dakika  
**Maliyet:** ₺0 (Let's Encrypt) veya ~$16/ay (ALB)

---

### 10. 📊 AWS S3 Deployment (Opsiyonel)

**Durum:** ⏳ OPSİYONEL  
**Öncelik:** 🟢 PRODUCTION HOSTING İÇİN

**Önkoşul:** IAM kullanıcısında S3 izinleri olmalı

**Adımlar:**
1. AWS Console → IAM → Users → `basvideo.com`
2. Add permissions → `AmazonS3FullAccess` ekle
3. Deploy:
   ```bash
   aws s3 sync . s3://dunyanin-en-acayip-sitesi-328185871955 \
     --exclude "backend/*" \
     --exclude "node_modules/*" \
     --exclude ".git/*" \
     --exclude "*.md" \
     --exclude "*.sh" \
     --exclude "*.zip" \
     --delete
   ```

**Maliyet:** ~$0.023/GB/ay

---

## 📋 HIZLI KONTROL LİSTESİ

### Sistem Çalışması İçin Zorunlu:
- [ ] ✅ Node.js kurulu (v18+) - **Kontrol edildi: v22.12.0**
- [ ] ✅ Backend bağımlılıkları yüklendi - **Kontrol edildi: node_modules mevcut**
- [ ] ⏳ Agora.io hesabı oluşturuldu - **SİZ YAPACAKSINIZ**
- [ ] ⏳ Agora App ID alındı - **SİZ YAPACAKSINIZ**
- [ ] ⏳ Agora App Certificate alındı - **SİZ YAPACAKSINIZ**
- [ ] ⏳ `.env` dosyasına Agora credentials eklendi - **SİZ YAPACAKSINIZ**
- [ ] ⏳ Backend başlatıldı ve test edildi - **SİZ YAPACAKSINIZ**
- [ ] ⏳ Frontend web server başlatıldı - **SİZ YAPACAKSINIZ**
- [ ] ⏳ Frontend-backend bağlantısı test edildi - **SİZ YAPACAKSINIZ**

### Önerilen:
- [ ] ⏳ Admin Token değiştirildi - **ÖNERİLİR**
- [ ] ⏳ Production backend URL kontrol edildi - **ÖNERİLİR**
- [ ] ⏳ AWS IVS doğrulaması bekleniyor - **AWS Support'tan yanıt bekleniyor**

### Opsiyonel:
- [ ] ⏳ GitHub push yapıldı - **OPSİYONEL**
- [ ] ⏳ Domain yönlendirme yapıldı - **OPSİYONEL**
- [ ] ⏳ HTTPS/SSL eklendi - **OPSİYONEL**
- [ ] ⏳ S3 deployment yapıldı - **OPSİYONEL**

---

## 🎯 ÖNCELİK SIRASI

### 🔴 Bugün Yapılmalı (1-2 saat):
1. Agora.io credentials al ve `.env` dosyasına ekle
2. Backend'i başlat ve test et
3. Frontend'i çalıştır ve test et

### 🟡 Bu Hafta Yapılabilir:
4. Admin Token değiştir
5. Production backend URL kontrol et
6. AWS IVS doğrulaması bekle ve test et

### 🟢 İleride Yapılabilir:
7. GitHub push
8. Domain yönlendirme
9. HTTPS/SSL ekle
10. S3 deployment

---

## 📚 DETAYLI REHBERLER

Projede mevcut detaylı rehberler:
- **`MANUEL_KURULUM_ADIMLARI.md`** - Detaylı kurulum rehberi
- **`KURULUM_HIZLI_BASLANGIC.md`** - Hızlı başlangıç (5 dakika)
- **`AGORA_SETUP_REHBERI.md`** - Agora.io kurulum rehberi
- **`MANUEL_YAPILACAKLAR_LISTESI.md`** - Önceki liste (güncellendi)

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Agora Credentials**: Asla GitHub'a push etmeyin
2. **`.env` Dosyası**: `.gitignore`'da olmalı (zaten var)
3. **Backend**: Her zaman çalışır durumda olmalı
4. **Frontend**: Web server üzerinden çalıştırılmalı (CORS için)
5. **Port**: Sistem default olarak 3000 port'unu kullanır
6. **Production Backend**: `http://107.23.178.153:4000` (EC2'de çalışıyor)

---

## 💰 MALİYET ÖZETİ

### Zorunlu İşlemler:
- **Maliyet:** ₺0 (tamamen ücretsiz)
- **Süre:** 1-2 saat

### Opsiyonel İşlemler:
- **GitHub Pages:** ₺0/ay
- **Domain:** Zaten sahip
- **AWS S3:** ~$0.10-1/ay (opsiyonel)
- **HTTPS (Let's Encrypt):** ₺0
- **HTTPS (ALB):** ~$16/ay

---

## 📞 YARDIM

Sorun yaşarsanız:
1. `MANUEL_KURULUM_ADIMLARI.md` dosyasına bakın
2. Backend log'larını kontrol edin
3. Browser console'daki hataları kontrol edin
4. Health check endpoint'lerini test edin

---

**Son Güncelleme:** 5 Ocak 2025  
**Durum:** ✅ Güncel ve Detaylı


# 📞 AWS Support Case Kategorisi Seçimi

## ❓ Hangi Kategori Seçilmeli?

### ✅ ÖNERİLEN: **"Account"** (Hesap)

**Neden "Account" seçmelisin?**

AWS IVS "pending verification" hatası genellikle **hesap doğrulaması/aktivasyonu** ile ilgilidir:
- ✅ Hesap doğrulaması (account verification)
- ✅ Servis aktivasyonu (service activation)
- ✅ Hesap ayarları (account settings)
- ✅ Hesap erişim sorunları

Bu yüzden **"Account"** kategori daha uygun!

---

### ❌ Alternatif: **"Billing"** (Faturalama)

**Ne zaman "Billing" seçilir?**
- Ödeme yöntemi eklenemiyorsa
- Faturalama ile ilgili sorunlar varsa
- Kredi kartı onayı bekleniyorsa
- Ücret sorguları için

**Senin durumunda:**
- Ödeme yöntemi zaten kontrol edildi (Adım 1 ✅)
- Sorun ödeme değil, hesap doğrulaması
- Bu yüzden "Billing" yerine "Account" daha uygun

---

## 📋 DETAYLI ADIMLAR

### 1. AWS Support Center'a Git

1. **AWS Console** → Sağ üst köşe → **"Support"** → **"Support Center"**
   - Veya direkt: https://console.aws.amazon.com/support/home

2. **"Create case"** (Destek çağrısı oluştur) butonuna tıkla

---

### 2. Case Type Seçimi

**Seç:** **"Account"** (Hesap) ✅

**Neden?**
- Hesap doğrulaması sorunu
- Servis aktivasyonu
- IVS pending verification hatası

---

### 3. Case Detaylarını Doldur

#### Subject (Konu):
```
IVS hesap doğrulaması bekleniyor - lütfen hesabı doğrulayın
```

#### Description (Açıklama):
```
Merhaba,

AWS IVS (Interactive Video Service) servisini kullanmaya çalışıyorum ancak 
"pending verification" (doğrulama bekleniyor) hatası alıyorum.

Zaten yaptıklarım:
✅ Root kullanıcıya MFA ekledim
✅ Hesap bilgilerini tamamladım (Account Settings)
✅ Ödeme yöntemi kontrol ettim ve mevcut

Lütfen IVS servisi için hesabımı doğrulayabilir misiniz?

Hata Mesajı:
"Your account is pending verification. Until the verification process is 
complete, you may not be able to carry out requests with this account."

Teknik Detaylar:
- Hata: PendingVerification
- Servis: AWS IVS (Interactive Video Service)
- Region: us-east-1
- Hesap ID: 328185871955
- Komut: aws ivs create-channel (CLI)

Test Sonucu:
EC2 instance'dan AWS CLI ile channel oluşturmayı denedim ancak yukarıdaki 
hatayı alıyorum.

Teşekkürler!
```

#### Service (Servis):
- **IVS** (Interactive Video Service) seç

#### Severity (Önem Derecesi):
- **General guidance** (Genel rehberlik) - Basic support plan için uygun

#### Contact method (İletişim yöntemi):
- **Web** (Web formu) - veya e-posta tercih edersen

---

### 4. Submit (Gönder)

1. Tüm alanları doldurduğundan emin ol
2. **"Submit"** (Gönder) butonuna tıkla
3. Case numarasını not al (e-posta ile de gelecek)

---

## 📧 ALTERNATIF: E-posta ile İletişim

Eğer web formu yerine e-posta tercih edersen:

**E-posta adresi:** AWS Support e-posta adresin (hesap ayarlarından kontrol et)

**Konu:** IVS hesap doğrulaması bekleniyor - lütfen hesabı doğrulayın

**Mesaj:** Yukarıdaki "Description" metnini kopyala-yapıştır

---

## ⏱️ Beklenen Süre

- **Basic Support Plan:** 24-48 saat içinde yanıt
- **Developer Support Plan:** 12-24 saat içinde yanıt
- **Business Support Plan:** 1 saat içinde yanıt

---

## ✅ ÖZET

**Seç:** **"Account"** (Hesap) ✅

**Neden?**
- IVS pending verification = Hesap doğrulaması sorunu
- Billing değil, Account kategorisi

**Sonraki Adım:**
1. "Account" seç
2. Yukarıdaki mesajı yaz
3. Submit et
4. 24-48 saat bekle

---

**📞 Case açtıktan sonra case numarasını paylaş, takip edelim!** 💪





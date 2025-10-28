# 📦 VideoSat E-Ticaret Platformu - Proje Paketi

## 👤 Proje Sahibi
**Gül Naz Demir**  
**2024**

## 📋 Proje Özeti

Bu proje, modern e-ticaret ve canlı yayın platformudur. Rol bazlı paneller ile hammadeciler, üreticiler, toptancılar, satıcılar ve müşteriler için özel çözümler sunar.

## 🎯 Ana Özellikler

### 🎥 Canlı Yayın Sistemi
- WebRTC tabanlı gerçek zamanlı video akışı
- Ürün seçimi ve slogan sistemi
- Canlı yayın bakiyesi yönetimi
- Süre satın alma paketleri

### 👥 Rol Bazlı Paneller
- **Hammadeciler**: Üreticilerle iletişim, teklif formları
- **Üreticiler**: Hammadeci ve toptancı iletişimi
- **Toptancılar**: Üretici ve satıcı iletişimi
- **Satıcılar**: Toptancı ve müşteri iletişimi
- **Müşteriler**: Sadece alışveriş sistemi
- **Admin**: Sipariş takip ve onay sistemi

### 🛍️ E-Ticaret Özellikleri
- Ürün yönetimi (kg, m², m³, litre, gram, adet)
- Sipariş takibi ve kargo yönetimi
- Teklif formları ve mesajlaşma
- POS satışları ve satış raporları
- Fatura yönetimi

## 🛠️ Teknoloji Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Real-time**: WebRTC, LocalStorage
- **Hosting**: AWS S3 + CloudFront CDN
- **Domain**: basvideo.com

## 📁 Dosya Yapısı

```
├── index.html              # Ana sayfa ve tüm paneller
├── styles.css              # Modern responsive tasarım
├── app.js                  # Tüm JavaScript fonksiyonları
├── panels/                 # Rol bazlı panel sayfaları
│   ├── hammaddeci.html     # Hammadeci paneli
│   ├── uretici.html        # Üretici paneli
│   ├── admin.html          # Admin paneli
│   ├── panel-styles.css    # Panel özel stilleri
│   └── panel-app.js        # Panel JavaScript fonksiyonları
├── test-live-stream.html   # Canlı yayın test sayfası
├── CNAME                   # Domain ayarı
├── AWS_DEPLOYMENT.md       # AWS deployment rehberi
├── README.md               # Proje dokümantasyonu
├── SECURITY_GUIDE.md       # Güvenlik rehberi
├── .gitignore              # Git ignore dosyası
└── PROJECT_INFO.md         # Bu dosya
```

## 🚀 Kurulum ve Çalıştırma

### 1. Dosyaları Açma
```bash
# ZIP dosyasını çıkarın
unzip VideoSat-Project-2024-GulnazDemir.zip
cd VideoSat-Project-2024-GulnazDemir
```

### 2. Yerel Test
```bash
# Basit HTTP server ile test edin
python -m http.server 8000
# veya
npx serve .
```

### 3. Tarayıcıda Açma
```
http://localhost:8000
```

## 🔐 Güvenlik Notları

⚠️ **ÖNEMLİ**: Bu proje prototip seviyesindedir ve gerçek üretim ortamında kullanmadan önce güvenlik önlemlerini uygulayın!

- Hassas bilgiler (AWS credentials, GitHub token) temizlendi
- `.gitignore` dosyası eklendi
- `SECURITY_GUIDE.md` güvenlik rehberi eklendi

## 📊 Test Senaryoları

### 1. Kayıt/Giriş Testi
- Farklı rollerle kayıt olma
- Giriş yapma ve çıkış yapma
- Admin paneli erişimi

### 2. Ürün Yönetimi Testi
- Ürün ekleme/düzenleme/silme
- Farklı birimlerle ürün ekleme
- Ürün filtreleme ve arama

### 3. Canlı Yayın Testi
- Kamera erişimi
- Ürün seçimi
- Yayın başlatma/durdurma

### 4. Mesajlaşma Testi
- Mesaj gönderme/alma
- Teklif formu gönderme
- Bildirim sistemi

## 🌐 Canlı Demo

- **Website**: https://d1wb9hhwdomuk7.cloudfront.net
- **Domain**: basvideo.com

## 📞 İletişim

- **Proje Sahibi**: Gül Naz Demir
- **Yıl**: 2024
- **E-posta**: info@videosat.com

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🙏 Teşekkürler

- **AWS** - Bulut altyapısı
- **GitHub** - Kod hosting
- **Font Awesome** - İkonlar
- **Google Fonts** - Tipografi

---

**⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**

**📅 Proje Tarihi**: 2024  
**👤 Geliştirici**: Gül Naz Demir
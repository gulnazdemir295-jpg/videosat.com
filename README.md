# Dünyanın En Acayip Sitesi - Canlı Yayın Platformu

## Proje Özeti

Bu proje, "Dünyanın En Acayip Sitesi" adlı e-ticaret ve canlı yayın platformunun AWS WebRTC teknolojisi kullanılarak geliştirilmiş versiyonudur. Platform, tedarik zinciri boyunca farklı kullanıcı rolleri için canlı yayın özellikli bir e-ticaret çözümü sunar.

## Özellikler

### 🎥 Canlı Yayın Sistemi
- **WebRTC Tabanlı**: Gerçek zamanlı video/audio streaming
- **Çoklu Kamera Desteği**: Kamera, mikrofon ve ekran paylaşımı
- **Canlı Sohbet**: Yayıncı ve izleyiciler arası gerçek zamanlı mesajlaşma
- **İzleyici Sayısı**: Anlık izleyici takibi

### 👥 Kullanıcı Rolleri
- **Hammadeciler**: Ham madde tedariki ve canlı yayın
- **Üreticiler**: Ürün üretimi ve satış
- **Toptancılar**: Toplu satış işlemleri
- **Satıcılar**: Perakende satış ve canlı yayın
- **Müşteriler**: Ürün satın alma ve yayın izleme
- **Admin**: Sistem yönetimi

### 🌐 AWS Entegrasyonu
- **S3 Static Hosting**: Website hosting
- **CloudFront CDN**: Hızlı içerik dağıtımı
- **Kinesis Video Streams**: Canlı yayın altyapısı (gelecek)
- **Cognito**: Kullanıcı kimlik doğrulama (gelecek)

### 📱 Responsive Tasarım
- **Mobil Uyumlu**: Tüm cihazlarda çalışır
- **Modern UI**: Gradient tasarım ve animasyonlar
- **Kullanıcı Dostu**: Sezgisel arayüz

## Teknolojiler

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **WebRTC**: Gerçek zamanlı iletişim
- **AWS SDK**: Cloud servisleri entegrasyonu
- **LocalStorage**: Geçici veri saklama
- **Font Awesome**: İkonlar

## Kurulum ve Çalıştırma

### Yerel Geliştirme
```bash
# Projeyi klonlayın
git clone https://github.com/your-username/dunyanin-en-acayip-sitesi.git

# Proje dizinine gidin
cd dunyanin-en-acayip-sitesi

# Basit HTTP server başlatın
python -m http.server 8000
# veya
npx serve .

# Tarayıcıda açın
http://localhost:8000
```

### AWS Deployment
```bash
# AWS CLI kurulumu (gerekirse)
aws configure

# S3 bucket oluşturun
aws s3 mb s3://your-bucket-name --region us-east-1

# Website hosting etkinleştirin
aws s3 website s3://your-bucket-name --index-document index.html

# Dosyaları upload edin
aws s3 sync . s3://your-bucket-name --exclude "*.md" --exclude ".git/*"
```

## Dosya Yapısı

```
├── index.html              # Ana sayfa
├── styles.css             # CSS stilleri
├── app.js                 # JavaScript uygulaması
├── package.json           # NPM konfigürasyonu
├── AWS_DEPLOYMENT.md      # AWS deployment rehberi
├── README.md              # Bu dosya
└── proje-sunumu.html      # Orijinal proje sunumu
```

## Kullanım

### 1. Kayıt Olma
- Ana sayfada "Kayıt Ol" butonuna tıklayın
- Bilgilerinizi doldurun ve rolünüzü seçin
- Kayıt işlemini tamamlayın

### 2. Giriş Yapma
- "Giriş Yap" butonuna tıklayın
- E-posta, şifre ve rolünüzü girin
- Dashboard'a erişim sağlayın

### 3. Canlı Yayın Başlatma
- Dashboard'da "Yayın Başlat" butonuna tıklayın
- Kamera/mikrofon izinlerini verin
- Yayın kontrollerini kullanın

### 4. Yayın İzleme
- Ana sayfada aktif yayınları görüntüleyin
- "Yayını İzle" butonuna tıklayın
- Canlı sohbete katılın

## Güvenlik

⚠️ **Önemli**: Bu demo versiyonunda güvenlik önlemleri sınırlıdır. Production kullanımı için:

- AWS Cognito ile kimlik doğrulama
- HTTPS zorunlu kılma
- CORS policy ayarları
- Input validation ve sanitization
- Rate limiting

## Gelecek Geliştirmeler

- [ ] AWS Kinesis Video Streams entegrasyonu
- [ ] AWS Cognito kimlik doğrulama
- [ ] Veritabanı entegrasyonu (DynamoDB)
- [ ] Ürün yönetimi sistemi
- [ ] Ödeme sistemi entegrasyonu
- [ ] Mobil uygulama
- [ ] AI çeviri sistemi
- [ ] Gümrük danışmanlığı modülü

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## İletişim

- Proje Sahibi: Dünyanın En Acayip Sitesi Team
- E-posta: info@dunyanin-en-acayip-sitesi.com
- Website: https://your-bucket-name.s3-website-us-east-1.amazonaws.com

## Teşekkürler

- AWS WebRTC ekibine
- WebRTC standartlarına katkıda bulunanlara
- Açık kaynak topluluğuna

---

**Not**: Bu proje eğitim ve demo amaçlıdır. Production kullanımı için ek güvenlik ve performans optimizasyonları gereklidir.

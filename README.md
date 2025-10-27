# 🛒 VideoSat - E-Ticaret Canlı Yayın Platformu

Modern e-ticaret ve canlı yayın platformu. Rol bazlı paneller ile hammadeciler, üreticiler, toptancılar, satıcılar ve müşteriler için özel çözümler.

## ✨ Özellikler

### 🎥 Canlı Yayın Sistemi

* **WebRTC** tabanlı gerçek zamanlı video akışı
* **Ürün seçimi** ve **slogan sistemi**
* **Canlı yayın bakiyesi** yönetimi
* **Süre satın alma** paketleri

### 👥 Rol Bazlı Paneller

* **Hammadeciler**: Üreticilerle iletişim, teklif formları
* **Üreticiler**: Hammadeci ve toptancı iletişimi
* **Toptancılar**: Üretici ve satıcı iletişimi
* **Satıcılar**: Toptancı ve müşteri iletişimi
* **Müşteriler**: Sadece alışveriş sistemi
* **Admin**: Sipariş takip ve onay sistemi

### 🛍️ E-Ticaret Özellikleri

* **Ürün yönetimi** (kg, m², m³, litre, gram, adet)
* **Sipariş takibi** ve **kargo yönetimi**
* **Teklif formları** ve **mesajlaşma**
* **POS satışları** ve **satış raporları**
* **Fatura yönetimi**

## 🛠️ Teknoloji Stack

* **Frontend**: HTML5, CSS3, Vanilla JavaScript
* **Real-time**: WebRTC, LocalStorage
* **Hosting**: AWS S3 + CloudFront CDN
* **Domain**: basvideo.com

## 🚀 Canlı Demo

* **Website**: https://d1wb9hhwdomuk7.cloudfront.net
* **Domain**: basvideo.com (GitHub Pages)

## 📱 Kullanım

### Kayıt ve Giriş

1. Ana sayfadan **"Kayıt Ol"** butonuna tıklayın
2. Rolünüzü seçin (Hammaddeci, Üretici, Toptancı, Satıcı, Müşteri)
3. Bilgilerinizi doldurun ve kayıt olun

### Canlı Yayın Başlatma

1. Dashboard'dan **"Canlı Yayın"** butonuna tıklayın
2. Satılacak ürünleri seçin
3. Slogan cümlelerini yazın
4. **"Yayını Başlat"** butonuna tıklayın

### Ürün Yönetimi

1. **"Ürün Yönetimi"** sayfasına gidin
2. **"Yeni Ürün Ekle"** butonuna tıklayın
3. Ürün bilgilerini doldurun
4. Birim seçin (kg, m², m³, litre, gram, adet)

## 🔧 Proje Yapısı

```
├── index.html          # Ana sayfa ve tüm paneller
├── styles.css          # Modern responsive tasarım
├── app.js             # Tüm JavaScript fonksiyonları
├── panels/            # Rol bazlı panel sayfaları
│   ├── hammaddeci.html
│   ├── uretici.html
│   ├── toptanci.html
│   ├── satici.html
│   ├── musteri.html
│   ├── admin.html
│   ├── panel-styles.css
│   └── panel-app.js
├── CNAME              # basvideo.com domain ayarı
├── AWS_DEPLOYMENT.md  # AWS deployment rehberi
└── README.md          # Bu dosya
```

## 📊 Rol Bazlı Özellikler

### Hammadeciler

* Üretici arama ve filtreleme
* Teklif formu gönderme
* Sipariş takibi
* Canlı yayın davetleri

### Üreticiler

* Hammadeci ve toptancı iletişimi
* Sipariş yönetimi (gelen/giden)
* Sipariş kabul/red/hazırlama
* Kargo takibi

### Toptancılar

* Üretici ve satıcı iletişimi
* Sipariş yönetimi
* Stok yönetimi
* Satış raporları

### Satıcılar

* Toptancı ve müşteri iletişimi
* Sipariş yönetimi
* POS satışları
* Müşteri yönetimi

### Müşteriler

* Satıcılardan alışveriş
* Sipariş takibi
* 5+ adet için toptan alım
* Fatura yönetimi

## 🌐 Deployment

### AWS S3 + CloudFront

```bash
aws s3 sync . s3://dunyanin-en-acayip-sitesi-328185871955
```

### GitHub Pages

```bash
git add .
git commit -m "Update e-commerce platform"
git push origin main
```

## 🔐 Güvenlik

* **HTTPS** zorunlu
* **CORS** politikaları
* **XSS** koruması
* **CSRF** tokenları
* **Rate limiting**

## 📈 Performans

* **CDN** ile global dağıtım
* **Gzip** sıkıştırma
* **Lazy loading** görseller
* **Minification** CSS/JS
* **Caching** stratejileri

## 🧪 Test

### Manuel Test Senaryoları

1. **Kayıt/Giriş Testi**
   - Farklı rollerle kayıt olma
   - Giriş yapma ve çıkış yapma
   - Şifre sıfırlama

2. **Ürün Yönetimi Testi**
   - Ürün ekleme/düzenleme/silme
   - Farklı birimlerle ürün ekleme
   - Ürün filtreleme ve arama

3. **Canlı Yayın Testi**
   - Kamera erişimi
   - Ürün seçimi
   - Yayın başlatma/durdurma

4. **Mesajlaşma Testi**
   - Mesaj gönderme/alma
   - Teklif formu gönderme
   - Bildirim sistemi

### Otomatik Testler

```bash
# Test komutları gelecekte eklenecek
npm test
npm run test:e2e
npm run test:performance
```

## 🐛 Bilinen Sorunlar

* [ ] Mobile responsive iyileştirmeleri
* [ ] Offline çalışma desteği
* [ ] Push notification sistemi
* [ ] Çoklu dil desteği

## 🚧 Gelecek Özellikler

* [ ] **AI Chatbot** müşteri desteği
* [ ] **Blockchain** ödeme sistemi
* [ ] **AR/VR** ürün görüntüleme
* [ ] **IoT** sensör entegrasyonu
* [ ] **Machine Learning** öneri sistemi

## 📞 İletişim

* **Website**: basvideo.com
* **GitHub**: https://github.com/gulnazdemir295-jpg/videosat.com
* **E-posta**: info@videosat.com
* **Telefon**: +90 (212) 555 0123

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 🙏 Teşekkürler

* **AWS** - Bulut altyapısı
* **GitHub** - Kod hosting
* **Font Awesome** - İkonlar
* **Google Fonts** - Tipografi

---

⭐ **Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**

## 📊 İstatistikler

![GitHub stars](https://img.shields.io/github/stars/gulnazdemir295-jpg/videosat.com?style=social)
![GitHub forks](https://img.shields.io/github/forks/gulnazdemir295-jpg/videosat.com?style=social)
![GitHub issues](https://img.shields.io/github/issues/gulnazdemir295-jpg/videosat.com)
![GitHub license](https://img.shields.io/github/license/gulnazdemir295-jpg/videosat.com)

## 🔄 Güncellemeler

### v1.0.0 (2024-01-15)
* İlk sürüm yayınlandı
* Temel e-ticaret özellikleri
* Canlı yayın sistemi
* Rol bazlı paneller

### v1.1.0 (Planlanan)
* Mobile app desteği
* Gelişmiş raporlama
* API entegrasyonu
* Çoklu dil desteği

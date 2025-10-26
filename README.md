# 🛒 Dünyanın En Acayip Sitesi - E-Ticaret Canlı Yayın Platformu

Modern e-ticaret ve canlı yayın platformu. Rol bazlı paneller ile hammadeciler, üreticiler, toptancılar, satıcılar ve müşteriler için özel çözümler.

## ✨ Özellikler

### 🎥 Canlı Yayın Sistemi
- **WebRTC** tabanlı gerçek zamanlı video akışı
- **Ürün seçimi** ve **slogan sistemi**
- **Canlı yayın bakiyesi** yönetimi
- **Süre satın alma** paketleri

### 👥 Rol Bazlı Paneller
- **Hammadeciler**: Üreticilerle iletişim, teklif formları
- **Üreticiler**: Hammadeci ve toptancı iletişimi
- **Toptancılar**: Üretici ve satıcı iletişimi  
- **Satıcılar**: Toptancı ve müşteri iletişimi
- **Müşteriler**: Sadece alışveriş sistemi
- **Admin**: Sipariş takip ve onay sistemi

### 🛍️ E-Ticaret Özellikleri
- **Ürün yönetimi** (kg, m², m³, litre, gram, adet)
- **Sipariş takibi** ve **kargo yönetimi**
- **Teklif formları** ve **mesajlaşma**
- **POS satışları** ve **satış raporları**
- **Fatura yönetimi**

## 🛠️ Teknoloji Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Real-time**: WebRTC, LocalStorage
- **Hosting**: AWS S3 + CloudFront CDN
- **Domain**: basvideo.com

## 🚀 Canlı Demo

- **Website**: https://d1wb9hhwdomuk7.cloudfront.net
- **Domain**: basvideo.com (GitHub Pages)

## 📱 Kullanım

### Kayıt ve Giriş
1. Ana sayfadan **"Kayıt Ol"** butonuna tıklayın
2. Rolünüzü seçin (Hammadeci, Üretici, Toptancı, Satıcı, Müşteri)
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
├── CNAME              # basvideo.com domain ayarı
└── README.md          # Bu dosya
```

## 📊 Rol Bazlı Özellikler

### Hammadeciler
- Üretici arama ve filtreleme
- Teklif formu gönderme
- Sipariş takibi
- Canlı yayın davetleri

### Üreticiler  
- Hammadeci ve toptancı iletişimi
- Sipariş yönetimi (gelen/giden)
- Sipariş kabul/red/hazırlama
- Kargo takibi

### Toptancılar
- Üretici ve satıcı iletişimi
- Sipariş yönetimi
- Stok yönetimi
- Satış raporları

### Satıcılar
- Toptancı ve müşteri iletişimi
- Sipariş yönetimi
- POS satışları
- Müşteri yönetimi

### Müşteriler
- Satıcılardan alışveriş
- Sipariş takibi
- 5+ adet için toptan alım
- Fatura yönetimi

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

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Website**: basvideo.com
- **GitHub**: [modern-canli-yayin-platformu](https://github.com/gulnazdemir295-jpg/modern-canli-yayin-platformu)

---

⭐ **Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**
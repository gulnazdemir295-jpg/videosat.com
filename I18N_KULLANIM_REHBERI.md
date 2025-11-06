# 🌍 Çoklu Dil Desteği (i18n) Kullanım Rehberi

**Tarih:** 6 Kasım 2025  
**Durum:** ✅ Hazır ve Kullanılabilir

---

## 🎯 Genel Bakış

i18n (internationalization) servisi, uygulamayı birden fazla dilde kullanmanızı sağlar. Şu an Türkçe ve İngilizce desteklenmektedir.

---

## 📦 Kurulum

i18n Service otomatik olarak `index.html`'de yüklenir:

```html
<script src="services/i18n-service.js"></script>
```

---

## 🚀 Kullanım

### 1. HTML'de Çeviri Kullanımı

#### Text Çevirisi
```html
<span data-i18n="app.welcome">Hoş Geldiniz</span>
```

#### Placeholder Çevirisi
```html
<input type="text" data-i18n="auth.email" placeholder="E-posta">
```

#### Title Çevirisi
```html
<button data-i18n-title="app.save" title="Kaydet">Kaydet</button>
```

#### Aria Label Çevirisi
```html
<button data-i18n-aria-label="app.close" aria-label="Kapat">X</button>
```

### 2. JavaScript'te Çeviri Kullanımı

#### Basit Çeviri
```javascript
const welcomeText = window.t('app.welcome');
console.log(welcomeText); // "Hoş Geldiniz" veya "Welcome"
```

#### Parametreli Çeviri
```javascript
// Çeviri: "Merhaba {{name}}!"
const greeting = window.t('app.greeting', { name: 'Ahmet' });
console.log(greeting); // "Merhaba Ahmet!"
```

#### i18n Service Kullanımı
```javascript
// Dil değiştir
window.i18nService.setLanguage('en');

// Mevcut dili al
const currentLang = window.i18nService.getCurrentLanguage();

// Desteklenen dilleri al
const languages = window.i18nService.getSupportedLanguages();

// Dil bilgilerini al
const info = window.i18nService.getLanguageInfo();
```

### 3. Dil Seçici Komponenti

#### HTML'e Ekle
```html
<!-- Language Selector -->
<div id="languageSelectorContainer"></div>

<script>
fetch('components/language-selector.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('languageSelectorContainer').innerHTML = html;
    });
</script>
```

#### Veya Doğrudan Include
```html
<!-- components/language-selector.html dosyasını sayfaya include edin -->
```

---

## 📝 Çeviri Anahtarları

### Genel (app.*)
- `app.name` - Uygulama adı
- `app.welcome` - Hoş geldiniz
- `app.loading` - Yükleniyor
- `app.error` - Hata
- `app.success` - Başarılı
- `app.cancel` - İptal
- `app.save` - Kaydet
- `app.delete` - Sil
- `app.edit` - Düzenle
- `app.add` - Ekle
- `app.search` - Ara
- `app.filter` - Filtrele
- `app.close` - Kapat

### Kimlik Doğrulama (auth.*)
- `auth.login` - Giriş Yap
- `auth.logout` - Çıkış Yap
- `auth.register` - Kayıt Ol
- `auth.email` - E-posta
- `auth.password` - Şifre
- `auth.forgotPassword` - Şifremi Unuttum
- `auth.rememberMe` - Beni Hatırla

### Navigasyon (nav.*)
- `nav.home` - Ana Sayfa
- `nav.dashboard` - Dashboard
- `nav.products` - Ürünler
- `nav.orders` - Siparişler
- `nav.messages` - Mesajlar
- `nav.settings` - Ayarlar
- `nav.liveStream` - Canlı Yayın

### Ürünler (products.*)
- `products.title` - Ürünler
- `products.add` - Yeni Ürün Ekle
- `products.edit` - Ürün Düzenle
- `products.delete` - Ürün Sil
- `products.name` - Ürün Adı
- `products.price` - Fiyat
- `products.stock` - Stok
- `products.category` - Kategori

### Siparişler (orders.*)
- `orders.title` - Siparişler
- `orders.status` - Durum
- `orders.total` - Toplam
- `orders.date` - Tarih
- `orders.pending` - Beklemede
- `orders.completed` - Tamamlandı
- `orders.cancelled` - İptal Edildi

### Mesajlar (messages.*)
- `messages.title` - Mesajlar
- `messages.send` - Gönder
- `messages.typeMessage` - Mesaj yazın...
- `messages.noMessages` - Henüz mesaj yok

### Ödemeler (payments.*)
- `payments.title` - Ödemeler
- `payments.method` - Ödeme Yöntemi
- `payments.amount` - Tutar
- `payments.status` - Durum
- `payments.process` - Ödeme İşle
- `payments.refund` - İade Et

### Analytics (analytics.*)
- `analytics.title` - Analytics
- `analytics.sales` - Satışlar
- `analytics.orders` - Siparişler
- `analytics.customers` - Müşteriler
- `analytics.products` - Ürünler

### Canlı Yayın (livestream.*)
- `livestream.start` - Yayını Başlat
- `livestream.stop` - Yayını Durdur
- `livestream.viewers` - İzleyiciler
- `livestream.likes` - Beğeniler
- `livestream.chat` - Sohbet

### Bildirimler (notifications.*)
- `notifications.title` - Bildirimler
- `notifications.new` - Yeni Bildirim
- `notifications.markAllRead` - Tümünü Okundu İşaretle

### Ayarlar (settings.*)
- `settings.title` - Ayarlar
- `settings.language` - Dil
- `settings.notifications` - Bildirimler
- `settings.privacy` - Gizlilik
- `settings.account` - Hesap

### Hatalar (error.*)
- `error.generic` - Bir hata oluştu
- `error.network` - Ağ hatası
- `error.unauthorized` - Yetkisiz erişim
- `error.notFound` - Bulunamadı
- `error.serverError` - Sunucu hatası

---

## 🔧 Gelişmiş Kullanım

### Dinamik Çeviri Ekleme

```javascript
// Tek çeviri ekle
window.i18nService.addTranslation('en', 'custom.key', 'Custom Value');

// Çeviri seti ekle
window.i18nService.addTranslations('en', {
    'custom.key1': 'Value 1',
    'custom.key2': 'Value 2'
});
```

### Event Listener

```javascript
// Dil değiştiğinde event dinle
window.i18nService.on('languageChanged', (lang) => {
    console.log('Dil değişti:', lang);
    // Özel işlemler yap
});
```

### Manuel Sayfa Çevirisi

```javascript
// Sayfayı manuel çevir
window.i18nService.translatePage();
```

---

## 📱 Dil Seçici Komponenti

### Özellikler
- Modern dropdown tasarım
- Bayrak ikonları
- Aktif dil göstergesi
- Mobile responsive
- Dark theme uyumlu

### Kullanım
```html
<!-- Header'a ekle -->
<header>
    <div id="languageSelectorContainer"></div>
</header>

<script>
fetch('components/language-selector.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('languageSelectorContainer').innerHTML = html;
    });
</script>
```

---

## 🌍 Yeni Dil Ekleme

### 1. Çevirileri Ekle

```javascript
// i18n-service.js dosyasına ekle
this.translations.es = {
    'app.welcome': 'Bienvenido',
    'app.loading': 'Cargando...',
    // ... diğer çeviriler
};
```

### 2. Desteklenen Dillere Ekle

```javascript
this.supportedLanguages = ['tr', 'en', 'es'];
```

### 3. Dil Seçiciye Ekle

```html
<!-- components/language-selector.html -->
<div class="language-option" data-lang="es">
    <span class="flag">🇪🇸</span>
    <span class="name">Español</span>
    <i class="fas fa-check" style="display: none;"></i>
</div>
```

---

## 📊 Özellikler

### Otomatik Çeviri
- `[data-i18n]` attribute'u olan elementler otomatik çevrilir
- Sayfa yüklendiğinde otomatik çeviri yapılır
- Dil değiştiğinde sayfa otomatik güncellenir

### LocalStorage
- Seçilen dil LocalStorage'da saklanır
- Sayfa yenilendiğinde dil korunur
- Kullanıcı tercihi hatırlanır

### Fallback
- Çeviri bulunamazsa fallback dil (Türkçe) kullanılır
- Çeviri bulunamazsa anahtar kendisi gösterilir

---

## 🎨 Özelleştirme

### Dil Seçici Stili

```css
.language-selector {
    /* Özel stil */
}
```

### Çeviri Formatı

```javascript
// Parametreli çeviri
const message = window.t('app.greeting', { 
    name: 'Ahmet',
    count: 5 
});
// Çeviri: "Merhaba {{name}}! {{count}} mesajınız var."
```

---

## ⚠️ Notlar

1. **Çeviri Anahtarları:** Çeviri anahtarları küçük harf ve nokta ile ayrılmalı (örn: `app.welcome`)
2. **HTML Attribute'ları:** `data-i18n`, `data-i18n-title`, `data-i18n-aria-label` kullanılabilir
3. **Dinamik İçerik:** JavaScript ile dinamik içerik için `window.t()` kullanın
4. **Yeni Çeviriler:** Yeni çeviriler eklemek için `addTranslation()` veya `addTranslations()` kullanın

---

## 🚀 Production Deployment

### 1. Çevirileri Kontrol Et

Tüm sayfalarda `[data-i18n]` attribute'larının doğru kullanıldığından emin olun.

### 2. Dil Seçiciyi Ekle

Dil seçici komponentini header veya navbar'a ekleyin.

### 3. Test Et

Her iki dilde de sayfayı test edin.

---

**Son Güncelleme:** 6 Kasım 2025  
**Durum:** ✅ Hazır ve Kullanılabilir


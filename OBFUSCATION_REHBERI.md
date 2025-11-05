# JavaScript Obfuscation Rehberi

## 📋 Genel Bakış

Proje tüm frontend JavaScript dosyalarını obfuscate edebilir. Bu, kodunuzu korur ve reverse engineering'i zorlaştırır.

## 🚀 Kullanım

### Otomatik Obfuscation

```bash
npm run obfuscate
# veya
node obfuscate.js
```

### HTML Dosyalarını Güncelleme

Obfuscated dosyaları kullanmak için HTML dosyalarını güncelle:

```bash
node update-html-to-min.js
```

## 📦 Obfuscated Dosyalar

Tüm obfuscated dosyalar `.min.js` uzantısıyla kaydedilir:

- `live-stream.js` → `live-stream.min.js`
- `app.js` → `app.min.js`
- `services/*.js` → `services/*.min.js`
- `modules/**/*.js` → `modules/**/*.min.js`

## ⚙️ Obfuscation Ayarları

Obfuscation ayarları `obfuscate.js` dosyasında yapılandırılmıştır:

- **Control Flow Flattening**: Kod akışını karmaşıklaştırır
- **Dead Code Injection**: Gereksiz kod ekler
- **String Array Encoding**: String'leri array'e çevirir
- **Self Defending**: Kodun değiştirilmesini engeller
- **Türkçe Karakter Desteği**: Türkçe karakterler korunur

## 🔧 Özelleştirme

`obfuscate.js` dosyasındaki `obfuscationOptions` objesini düzenleyerek:

```javascript
const obfuscationOptions = {
    // Production için daha güvenli
    debugProtection: true,
    disableConsoleOutput: true,
    
    // Türkçe karakter desteği
    stringArrayEncoding: [],
    unicodeEscapeSequence: false
};
```

## 📊 Sonuçlar

Obfuscation sonrası:
- Dosya boyutu artar (normal davranış)
- Kod okunması zorlaşır
- Reverse engineering zorlaşır
- Fonksiyonalite korunur

## ⚠️ Önemli Notlar

1. **Orijinal Dosyaları Yedekleyin**: Obfuscation geri alınamaz
2. **Test Edin**: Obfuscated dosyaların çalıştığından emin olun
3. **Production'da Kullanın**: Development'ta original dosyaları kullanın
4. **Git**: `.min.js` dosyalarını `.gitignore`'a ekleyebilirsiniz

## 🔍 Sorun Giderme

### Obfuscation Hatası

Eğer bir dosya obfuscate edilemiyorsa:
1. Syntax hatası olup olmadığını kontrol edin: `node -c dosya.js`
2. Türkçe karakter sorunları için `stringArrayEncoding: []` kullanın
3. Hata mesajını kontrol edin

### HTML Dosyaları Güncellenmedi

`update-html-to-min.js` scriptini manuel çalıştırın veya HTML dosyalarını manuel güncelleyin.

## 📝 Örnek Kullanım

```bash
# 1. Obfuscate et
npm run obfuscate

# 2. HTML dosyalarını güncelle
node update-html-to-min.js

# 3. Test et
# Tarayıcıda sayfayı aç ve konsolu kontrol et

# 4. Production'a deploy et
```

---

**Son Güncelleme**: 2025-01-05


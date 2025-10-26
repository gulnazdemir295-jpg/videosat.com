# 🎥 Modern Canlı Yayın Platformu

WebRTC tabanlı gerçek zamanlı canlı yayın platformu. Düşük gecikme, yüksek kalite ve senkronize yayın deneyimi sunar.

## ✨ Özellikler

- 🚀 **WebRTC P2P Bağlantı** - Milisaniye seviyesinde gecikme
- 🎥 **Gerçek Video Akışı** - Simülasyon değil, gerçek kamera akışı
- 🌐 **Global Erişim** - STUN sunucuları ile NAT geçişi
- 📱 **Mobil Uyumlu** - Tüm cihazlarda mükemmel performans
- 🔒 **Güvenli** - End-to-end şifreleme
- ⚡ **Gerçek Zamanlı** - Socket.IO ile anlık güncellemeler

## 🛠️ Teknoloji Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Real-time**: Socket.IO, WebRTC
- **Video Codec**: H.264
- **STUN Servers**: Google STUN servers

## 🚀 Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- Modern web tarayıcısı (Chrome, Firefox, Safari, Edge)

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/kullaniciadi/modern-canli-yayin-platformu.git
cd modern-canli-yayin-platformu
```

2. **Bağımlılıkları yükleyin**
```bash
cd live-stream-server
npm install
```

3. **Sunucuyu başlatın**
```bash
npm start
```

4. **Tarayıcıda açın**
```
http://localhost:3001
```

## 📱 Kullanım

### Yayın Başlatma
1. Ana sayfadan **"Gerçek Yayın Başlat"** butonuna tıklayın
2. Kameranızı başlatın
3. Yayın başlığını girin
4. **"Yayını Başlat"** butonuna tıklayın

### Yayın İzleme
1. Ana sayfadan **"Yayınları İzle"** butonuna tıklayın
2. Aktif yayınları görün
3. İzlemek istediğiniz yayına tıklayın

## 🌐 Canlı Demo

- **Ana Sayfa**: [http://localhost:3001](http://localhost:3001)
- **Gerçek Yayın**: [http://localhost:3001/../canli-yayin-gercek.html](http://localhost:3001/../canli-yayin-gercek.html)
- **Modern Yayın**: [http://localhost:3001/../canli-yayin-yap-modern.html](http://localhost:3001/../canli-yayin-yap-modern.html)
- **Yayın İzle**: [http://localhost:3001/../canli-yayin-izle-modern.html](http://localhost:3001/../canli-yayin-izle-modern.html)

## 📊 API Endpoints

- `GET /api/broadcasts` - Aktif yayınları listele
- `GET /api/categories` - Kategorileri listele
- `GET /api/broadcasts/:category` - Kategoriye göre yayınları listele

## 🔧 Geliştirme

### Proje Yapısı
```
├── index.html                 # Ana sayfa
├── canli-yayin-gercek.html   # WebRTC yayın
├── canli-yayin-yap-modern.html # Modern yayın başlat
├── canli-yayin-izle-modern.html # Yayın izle
├── hakkimizda.html           # Hakkımızda
├── iletisim.html             # İletişim
└── live-stream-server/       # Backend server
    ├── modern-server.js      # Ana server dosyası
    ├── package.json          # Bağımlılıklar
    └── README.md             # Server dokümantasyonu
```

### Katkıda Bulunma
1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- **E-posta**: info@moderncanliyayin.com
- **Telefon**: +90 (212) 555 0123
- **Website**: [Modern Canlı Yayın Platformu](http://localhost:3001)

## 🙏 Teşekkürler

- [WebRTC](https://webrtc.org/) - Gerçek zamanlı iletişim
- [Socket.IO](https://socket.io/) - Gerçek zamanlı mesajlaşma
- [Express.js](https://expressjs.com/) - Web framework
- [Node.js](https://nodejs.org/) - JavaScript runtime

---

⭐ **Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**

# 📊 Analytics Kullanım Rehberi

**Tarih:** 6 Kasım 2025  
**Durum:** ✅ Analytics Service ve Dashboard Widget'ları Hazır

---

## 🎯 Genel Bakış

Analytics sistemi, satış, sipariş, ürün, müşteri ve canlı yayın istatistiklerini toplayan ve görselleştiren bir sistemdir.

---

## 📦 Oluşturulan Dosyalar

### 1. Analytics Service
**Dosya:** `services/analytics-service.js`

**Özellikler:**
- Satış istatistikleri (Bugün, Hafta, Ay, Yıl, Toplam)
- Sipariş istatistikleri (Toplam, Bekleyen, Tamamlanan, İptal)
- Ürün istatistikleri (Toplam, Düşük stok, Tükendi)
- Müşteri istatistikleri (Toplam, Aktif, Yeni)
- Canlı yayın istatistikleri (Toplam yayın, İzleyici, Beğeni)
- En çok satan ürünler listesi
- Tarih aralığına göre satış raporu

### 2. Dashboard Widget'ları
**Dosya:** `components/dashboard-widgets.html`

**Özellikler:**
- 12 adet istatistik widget'ı
- Modern gradient tasarım
- Mobile responsive
- Otomatik güncelleme (30 saniye)
- Real-time veri

### 3. Analytics Charts
**Dosya:** `components/analytics-charts.html`

**Özellikler:**
- 5 adet interaktif grafik
- Chart.js 4.4.0 entegrasyonu
- Dark theme uyumlu
- Mobile responsive
- Otomatik güncelleme (30 saniye)

---

## 🚀 Kullanım

### 1. Analytics Service'i Yükle

Analytics Service, `index.html`'de otomatik olarak yüklenir:

```html
<script src="services/analytics-service.js"></script>
```

Veya manuel olarak:

```html
<script>
    // Analytics Service'i yükle
    const script = document.createElement('script');
    script.src = 'services/analytics-service.js';
    document.head.appendChild(script);
</script>
```

### 2. Dashboard Widget'larını Ekle

Dashboard sayfanıza widget'ları eklemek için:

```html
<!-- Dashboard Widget'ları -->
<div id="dashboardWidgetsContainer"></div>

<script>
    // Widget'ları yükle
    fetch('components/dashboard-widgets.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('dashboardWidgetsContainer').innerHTML = html;
        });
</script>
```

### 3. Analytics Charts'ı Ekle

Grafikleri eklemek için:

```html
<!-- Analytics Charts -->
<div id="analyticsChartsContainer"></div>

<script>
    // Charts'ı yükle
    fetch('components/analytics-charts.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('analyticsChartsContainer').innerHTML = html;
        });
</script>
```

---

## 📊 API Kullanımı

### İstatistikleri Al

```javascript
// Tüm istatistikleri al
const stats = window.analyticsService.getStats();

// Sadece satış istatistikleri
const salesStats = window.analyticsService.getSalesStats();

// Sadece sipariş istatistikleri
const orderStats = window.analyticsService.getOrderStats();

// Sadece ürün istatistikleri
const productStats = window.analyticsService.getProductStats();

// Sadece müşteri istatistikleri
const customerStats = window.analyticsService.getCustomerStats();

// Sadece canlı yayın istatistikleri
const livestreamStats = window.analyticsService.getLivestreamStats();
```

### En Çok Satan Ürünler

```javascript
// Top 10 ürün
const topProducts = window.analyticsService.getTopProducts(10);

// Top 5 ürün
const top5Products = window.analyticsService.getTopProducts(5);
```

### Tarih Aralığına Göre Rapor

```javascript
// Son 7 gün
const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);
const endDate = new Date();

const report = window.analyticsService.getSalesReport(startDate, endDate);
console.log(report);
// {
//   startDate: Date,
//   endDate: Date,
//   totalOrders: number,
//   totalSales: number,
//   averageOrderValue: number
// }
```

---

## 🎨 Widget Özellikleri

### Satış Widget'ları
- **Bugünkü Satış:** Günlük satış tutarı
- **Bu Hafta:** Haftalık satış tutarı
- **Bu Ay:** Aylık satış tutarı
- **Toplam Satış:** Tüm zamanların toplamı

### Sipariş Widget'ları
- **Toplam Sipariş:** Tüm siparişler
- **Bugünkü Siparişler:** Günlük yeni siparişler
- **Bekleyen Siparişler:** Onay bekleyen siparişler
- **Tamamlanan Siparişler:** Başarılı siparişler

### Ürün ve Müşteri Widget'ları
- **Toplam Ürün:** Tüm ürün sayısı
- **Toplam Müşteri:** Tüm müşteri sayısı
- **Canlı Yayın İstatistikleri:** Yayın, izleyici, beğeni
- **Ortalama Sepet Tutarı:** Ortalama sipariş tutarı

---

## 📈 Grafik Özellikleri

### 1. Satış Trendleri (Line Chart)
- Bugün, Hafta, Ay, Yıl, Toplam satışları gösterir
- Trend analizi için idealdir

### 2. Sipariş Durumu (Doughnut Chart)
- Bekleyen, Tamamlanan, İptal edilen siparişleri gösterir
- Görsel dağılım için idealdir

### 3. Ürün Dağılımı (Bar Chart)
- Stokta, Düşük stok, Tükendi ürünleri gösterir
- Stok yönetimi için idealdir

### 4. Aylık Satış Raporu (Bar Chart)
- Son 6 ayın satış verilerini gösterir
- Aylık karşılaştırma için idealdir

### 5. En Çok Satan Ürünler (Bar + Line Chart)
- Top 10 ürünü gösterir
- Satılan miktar ve gelir karşılaştırması

---

## 🔄 Otomatik Güncelleme

Widget'lar ve grafikler otomatik olarak her 30 saniyede bir güncellenir:

```javascript
// Otomatik güncelleme (30 saniye)
setInterval(() => {
    updateDashboardWidgets();
    updateCharts();
}, 30000);
```

---

## 📱 Mobile Responsive

Tüm widget'lar ve grafikler mobile cihazlarda otomatik olarak uyum sağlar:

- **Desktop:** Grid layout (4 sütun)
- **Tablet:** Grid layout (2 sütun)
- **Mobile:** Tek sütun

---

## 🎨 Tema Uyumluluğu

Tüm widget'lar ve grafikler dark theme ile uyumludur:

- **Arka plan:** `#1a1a1a`
- **Kenarlık:** `#dc2626` (kırmızı)
- **Metin:** `#ffffff` (beyaz)
- **İkincil metin:** `#9ca3af` (gri)

---

## 🔧 Özelleştirme

### Widget Renklerini Değiştir

`components/dashboard-widgets.html` dosyasında:

```css
.widget-icon {
    background: linear-gradient(135deg, #22c55e, #16a34a); /* Yeşil */
    /* Veya */
    background: linear-gradient(135deg, #3b82f6, #2563eb); /* Mavi */
}
```

### Grafik Renklerini Değiştir

`components/analytics-charts.html` dosyasında:

```javascript
datasets: [{
    borderColor: '#dc2626', // Kırmızı
    backgroundColor: 'rgba(220, 38, 38, 0.1)'
}]
```

---

## 📊 Veri Kaynakları

Analytics Service şu kaynaklardan veri toplar:

1. **Order Service:** Sipariş verileri
2. **Product Module:** Ürün verileri
3. **User Data:** Müşteri verileri
4. **LocalStorage:** Canlı yayın verileri

---

## ⚠️ Notlar

1. **Veri Güncelliği:** İstatistikler gerçek zamanlı değil, LocalStorage'dan hesaplanır
2. **Backend Entegrasyonu:** Gelecekte backend API'den veri çekilebilir
3. **Cache:** Veriler her hesaplamada yeniden hesaplanır
4. **Performance:** Büyük veri setlerinde performans optimizasyonu gerekebilir

---

## 🚀 Gelecek Geliştirmeler

1. **Backend API Entegrasyonu:** Gerçek zamanlı veri
2. **Export Özelliği:** PDF/Excel export
3. **Filtreleme:** Tarih, kategori, ürün filtreleme
4. **Karşılaştırma:** Dönem karşılaştırması
5. **Alert Sistemi:** Kritik eşikler için uyarılar

---

## 📞 Yardım

Sorun yaşarsanız:

1. Browser console'u kontrol edin
2. Analytics Service yüklendi mi kontrol edin: `typeof window.analyticsService`
3. Chart.js yüklendi mi kontrol edin: `typeof Chart`
4. Veri kaynaklarını kontrol edin (Order Service, Product Module)

---

**Son Güncelleme:** 6 Kasım 2025  
**Durum:** ✅ Hazır ve Kullanılabilir


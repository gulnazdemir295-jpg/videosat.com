# 📚 VideoSat Platform - Modüler Yapı Kullanım Rehberi

## 🎯 Genel Bakış

VideoSat platformu artık tamamen modüler bir yapıya sahiptir. Tüm modüller prosedür dokümantasyonlarına (PROCEDURES_WORKFLOW.md ve POS_SYSTEM_WORKFLOW.md) uygun olarak geliştirilmiştir.

## 📦 Oluşturulan Modüller

### ✅ Tamamlanan Modüller

1. **ModuleManager** (`modules/module-manager.js`)
   - Tüm modüllerin merkezi yönetimi
   - Bağımlılık yönetimi
   - Event sistemi
   - Prosedür doğrulama

2. **POSModule** (`modules/pos/pos-module.js`)
   - POS satış sistemi
   - Sepet yönetimi
   - Ödeme işlemleri (Nakit, Kart, Online, Taksitli, Kripto)
   - İndirim ve kampanya sistemi
   - Günlük/Haftalık raporlar
   - **Prosedür**: POS_SYSTEM_WORKFLOW.md

3. **ProductModule** (`modules/product/product-module.js`)
   - Ürün ekleme/düzenleme/silme
   - Birim yönetimi (kg, m², m³, litre, gram, adet) - **KRİTİK**
   - Stok yönetimi
   - Ürün filtreleme ve arama
   - **Prosedür**: PROCEDURES_WORKFLOW.md - Ürün Ekleme Prosedürü

4. **OrderModule** (`modules/order/order-module.js`)
   - Sipariş oluşturma
   - Sipariş durumu yönetimi
   - Kargo takibi
   - Sipariş onay/red/hazırlama
   - **Prosedür**: PROCEDURES_WORKFLOW.md - Sipariş Yönetimi

5. **ModuleLoader** (`modules/module-loader.js`)
   - Otomatik modül yükleme
   - Bağımlılık yönetimi
   - Modül kayıt

## 🚀 Kullanım

### 1. HTML Sayfalarına Modül Yükleme

#### Yöntem 1: Otomatik Yükleme (Önerilen)

```html
<!-- index.html, panels/*.html dosyalarında -->
<script src="modules/module-loader.js"></script>
```

Bu script otomatik olarak:
- Tüm modülleri yükler
- Bağımlılıkları çözer
- Modülleri kaydeder

#### Yöntem 2: Manuel Yükleme

```html
<!-- Önce Module Manager -->
<script src="modules/module-manager.js"></script>

<!-- Sonra modüller (sıralama önemli) -->
<script src="modules/product/product-module.js"></script>
<script src="modules/order/order-module.js"></script>
<script src="modules/pos/pos-module.js"></script>

<!-- Modülleri kaydet -->
<script>
document.addEventListener('DOMContentLoaded', () => {
    moduleManager.register('Product', new ProductModule());
    moduleManager.register('Order', new OrderModule());
    moduleManager.register('POS', new POSModule());
});
</script>
```

### 2. Modül Kullanımı

#### POS Modülü Kullanımı

```javascript
// Modülü al
const posModule = moduleManager.get('POS');

// Ürün sepete ekle
posModule.addToCart({
    id: 'PROD-123',
    name: 'Ürün Adı',
    price: 100,
    unit: 'adet'
}, 2);

// Sepet toplamını hesapla
const totals = posModule.calculateTotal();
console.log('Toplam:', totals.total);

// Ödeme işlemi
posModule.processPayment({
    method: 'cash',
    amount: totals.total,
    receivedAmount: 250,
    customerInfo: {
        name: 'Müşteri Adı',
        phone: '0555 123 45 67'
    }
}).then(result => {
    console.log('Satış tamamlandı:', result.sale);
    console.log('Fiş:', result.receipt);
});
```

#### Ürün Modülü Kullanımı

```javascript
const productModule = moduleManager.get('Product');

// Ürün ekle (PROSEDÜR UYUMLU)
try {
    const product = productModule.addProduct({
        name: 'Yeni Ürün',
        description: 'Ürün açıklaması',
        category: 'gida',
        unit: 'kg',  // KRİTİK: Birim seçimi
        price: 50,
        stock: 100,
        minOrder: 1
    });
    console.log('Ürün eklendi:', product);
} catch (error) {
    console.error('Hata:', error.message);
}

// Ürünleri listele
const products = productModule.getProducts({
    category: 'gida',
    inStock: true,
    sortBy: 'price'
});

// Stok güncelle
productModule.updateStock('PROD-123', -5);
```

#### Sipariş Modülü Kullanımı

```javascript
const orderModule = moduleManager.get('Order');

// Sipariş oluştur
const order = orderModule.createOrder({
    buyerId: 'USER-123',
    buyerRole: 'musteri',
    buyerName: 'Müşteri Adı',
    sellerId: 'USER-456',
    sellerRole: 'satici',
    sellerName: 'Satıcı Adı',
    items: [
        {
            productId: 'PROD-123',
            productName: 'Ürün Adı',
            unit: 'adet',
            unitPrice: 100,
            quantity: 2,
            subtotal: 200
        }
    ],
    totals: {
        subtotal: 200,
        vatAmount: 40,
        total: 240
    },
    shippingAddress: {
        street: 'Adres',
        city: 'Şehir',
        postalCode: '34000'
    },
    paymentMethod: 'cash'
});

// Sipariş durumu güncelle
orderModule.confirmOrder(order.id);
orderModule.prepareOrder(order.id);
orderModule.shipOrder(order.id, 'TRACK123', 'Aras Kargo');
```

### 3. Event Sistemi

Modüller arası iletişim için event sistemi kullanılır:

```javascript
// Event dinle
moduleManager.on('pos:saleCompleted', (e) => {
    console.log('Satış tamamlandı:', e.detail);
    // Sipariş oluştur
    const orderModule = moduleManager.get('Order');
    orderModule.createOrder({...});
});

moduleManager.on('product:stockUpdated', (e) => {
    console.log('Stok güncellendi:', e.detail);
    // UI güncelle
    updateStockDisplay(e.detail);
});

// Event gönder (modül içinden otomatik)
// Manuel gönderim için:
moduleManager.emit('custom:event', { data: 'value' });
```

## 📋 Sayfaya Entegrasyon Örnekleri

### index.html

```html
<!-- Scripts bölümüne ekle -->
<script src="modules/module-loader.js"></script>
<script src="services/payment-service.js"></script>
<script src="services/order-service.js"></script>
<script src="app.js"></script>
```

### panels/satici.html (POS Satışları)

```html
<!-- Mevcut scriptlerden önce -->
<script src="../modules/module-loader.js"></script>
<script src="../services/payment-service.js"></script>

<!-- Panel app.js'den sonra -->
<script>
document.addEventListener('DOMContentLoaded', () => {
    // POS modülü hazır olduğunda
    moduleManager.on('module:initialized', (e) => {
        if (e.detail.name === 'POS') {
            initializePOSInterface();
        }
    });
    
    function initializePOSInterface() {
        const posModule = moduleManager.get('POS');
        // POS arayüzünü başlat
        setupPOSUI(posModule);
    }
});
</script>
```

### panels/hammaddeci.html (Ürün Ekleme)

```html
<script src="../modules/module-loader.js"></script>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const productModule = moduleManager.get('Product');
    
    // Ürün ekleme formu
    document.getElementById('addProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        try {
            const product = productModule.addProduct({
                name: document.getElementById('productName').value,
                category: document.getElementById('productCategory').value,
                unit: document.getElementById('productUnit').value, // KRİTİK
                price: document.getElementById('productPrice').value,
                stock: document.getElementById('productStock').value
            });
            
            showAlert('Ürün başarıyla eklendi!', 'success');
            e.target.reset();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    });
});
</script>
```

## 🔄 Prosedür Uyumluluğu

Tüm modüller prosedür dokümantasyonlarına uygun çalışır:

### ✅ Ürün Ekleme Prosedürü
- ✅ Birim seçimi zorunlu (kg, m², m³, litre, gram, adet)
- ✅ Birim kontrolü ve validasyon
- ✅ Fiyat ve stok kontrolü

### ✅ POS Satış Prosedürü
- ✅ Günlük başlangıç bakiyesi
- ✅ Sepet yönetimi
- ✅ Ödeme yöntemleri (Nakit, Kart, Online, Taksitli, Kripto)
- ✅ İndirim sistemi
- ✅ Fatura oluşturma
- ✅ Günlük raporlar

### ✅ Sipariş Yönetimi Prosedürü
- ✅ Sipariş durumları (pending, confirmed, preparing, ready, shipped, delivered)
- ✅ Kargo takibi
- ✅ Ödeme durumu yönetimi

## 📊 Modül Durumu Kontrolü

```javascript
// Tüm modül durumlarını kontrol et
const statuses = moduleManager.getAllModuleStatuses();
console.log(statuses);

// Belirli bir modül durumu
const posStatus = moduleManager.getModuleStatus('POS');
console.log('POS Module:', posStatus);

// Modül listesi
const modules = moduleManager.listModules();
console.log('Loaded modules:', modules);
```

## 🛠️ Geliştirme İpuçları

1. **Modül Ekleme**: Yeni modül eklerken `module-loader.js` dosyasına ekleyin
2. **Bağımlılıklar**: Modül bağımlılıklarını doğru tanımlayın
3. **Event Kullanımı**: Modüller arası iletişim için event sistemi kullanın
4. **Prosedür Uyumu**: Tüm modüller prosedür dokümantasyonlarına uygun olmalı
5. **Error Handling**: Tüm modül fonksiyonlarında try-catch kullanın

## 📝 Sonraki Adımlar

1. ✅ Modül yapısı oluşturuldu
2. ✅ POS, Product, Order modülleri tamamlandı
3. ⏳ Ödeme modülü entegrasyonu
4. ⏳ Canlı yayın modülü
5. ⏳ Rol bazlı modüller
6. ⏳ Admin modülü
7. ⏳ Tüm sayfaların modüler yapıya entegrasyonu

## 🎯 Özet

Artık VideoSat platformu:
- ✅ Modüler yapıya sahip
- ✅ Prosedürlere uyumlu
- ✅ Genişletilebilir
- ✅ Bakımı kolay
- ✅ Test edilebilir

Tüm modüller `modules/` klasöründe ve kullanıma hazır!



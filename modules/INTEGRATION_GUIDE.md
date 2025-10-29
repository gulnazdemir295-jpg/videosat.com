/**
 * VideoSat Platform - Modül Entegrasyon Rehberi
 * 
 * Bu dosya, tüm modüllerin nasıl entegre edileceğini açıklar.
 * Prosedürler: PROCEDURES_WORKFLOW.md, POS_SYSTEM_WORKFLOW.md
 */

/**
 * MODÜL YAPISI
 * 
 * modules/
 * ├── module-manager.js          # Ana modül yöneticisi
 * ├── pos/
 * │   └── pos-module.js          # POS satış modülü
 * ├── product/
 * │   └── product-module.js      # Ürün yönetimi modülü
 * ├── order/
 * │   └── order-module.js       # Sipariş modülü
 * ├── payment/
 * │   └── payment-module.js      # Ödeme modülü (mevcut payment-service.js ile entegre)
 * ├── livestream/
 * │   └── livestream-module.js   # Canlı yayın modülü
 * ├── admin/
 * │   └── admin-module.js       # Admin modülü
 * └── roles/
 *     ├── hammaddeci-module.js   # Hammadeci rol modülü
 *     ├── uretici-module.js      # Üretici rol modülü
 *     ├── toptanci-module.js     # Toptancı rol modülü
 *     ├── satici-module.js       # Satıcı rol modülü
 *     └── musteri-module.js      # Müşteri rol modülü
 */

/**
 * HTML SAYFALARINA ENTEGRASYON
 * 
 * 1. Module Manager'ı yükle:
 *    <script src="modules/module-manager.js"></script>
 * 
 * 2. İhtiyaç duyulan modülleri yükle:
 *    <script src="modules/product/product-module.js"></script>
 *    <script src="modules/pos/pos-module.js"></script>
 *    <script src="modules/order/order-module.js"></script>
 * 
 * 3. Modülleri kaydet:
 *    <script>
 *        document.addEventListener('DOMContentLoaded', () => {
 *            // Modülleri kaydet
 *            moduleManager.register('Product', new ProductModule());
 *            moduleManager.register('POS', new POSModule());
 *            moduleManager.register('Order', new OrderModule());
 *        });
 *    </script>
 */

/**
 * ÖRNEK KULLANIM - POS Satışı
 */

// HTML'de:
/*
<script src="modules/module-manager.js"></script>
<script src="modules/product/product-module.js"></script>
<script src="modules/pos/pos-module.js"></script>
<script src="modules/order/order-module.js"></script>
<script src="services/payment-service.js"></script>

<script>
document.addEventListener('DOMContentLoaded', () => {
    // Modülleri kaydet
    moduleManager.register('Product', new ProductModule());
    moduleManager.register('POS', new POSModule());
    moduleManager.register('Order', new OrderModule());
    
    // POS modülünü kullan
    const posModule = moduleManager.get('POS');
    
    // Ürün sepete ekle
    posModule.addToCart({
        id: 'PROD-123',
        name: 'Ürün Adı',
        price: 100,
        unit: 'adet'
    }, 2);
    
    // Ödeme işlemi
    posModule.processPayment({
        method: 'cash',
        amount: 200,
        receivedAmount: 250,
        customerInfo: {
            name: 'Müşteri Adı',
            phone: '0555 123 45 67'
        }
    }).then(result => {
        console.log('Satış tamamlandı:', result);
    });
});
</script>
*/

/**
 * ÖRNEK KULLANIM - Ürün Ekleme
 */

/*
const productModule = moduleManager.get('Product');

// Ürün ekle
try {
    const product = productModule.addProduct({
        name: 'Yeni Ürün',
        description: 'Ürün açıklaması',
        category: 'gida',
        brand: 'Marka',
        unit: 'kg',  // KRİTİK: Birim seçimi
        price: 50,
        stock: 100,
        minOrder: 1
    });
    
    console.log('Ürün eklendi:', product);
} catch (error) {
    console.error('Ürün ekleme hatası:', error.message);
}
*/

/**
 * ÖRNEK KULLANIM - Sipariş Oluşturma
 */

/*
const orderModule = moduleManager.get('Order');

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
*/

/**
 * EVENT SİSTEMİ
 * 
 * Modüller arası iletişim için event sistemi kullanılır:
 * 
 * // Event dinle
 * moduleManager.on('pos:saleCompleted', (e) => {
 *     console.log('Satış tamamlandı:', e.detail);
 * });
 * 
 * // Event gönder (modül içinden)
 * moduleManager.emit('product:added', { product });
 */

/**
 * PROSEDÜR UYUMLULUĞU
 * 
 * Tüm modüller PROCEDURES_WORKFLOW.md ve POS_SYSTEM_WORKFLOW.md
 * prosedürlerine uygun olarak geliştirilmiştir:
 * 
 * - Ürün ekleme prosedürüne uygun birim kontrolü
 * - POS satış prosedürüne uygun ödeme işlemleri
 * - Sipariş yönetimi prosedürüne uygun durum yönetimi
 * - Ödeme ve komisyon prosedürüne uygun hesaplamalar
 */

/**
 * SERVİS ENTEGRASYONU
 * 
 * Modüller mevcut servislerle entegre çalışır:
 * - payment-service.js
 * - order-service.js
 * - websocket-service.js
 * - auth-service.js
 */

/**
 * LOCALSTORAGE YÖNETİMİ
 * 
 * Her modül kendi verilerini localStorage'da saklar:
 * - products: Ürün listesi
 * - orders: Sipariş listesi
 * - posCart: POS sepeti
 * - posSales: POS satışları
 */

/**
 * HATA YÖNETİMİ
 * 
 * Tüm modüller try-catch ile hata yönetimi yapar:
 * 
 * try {
 *     const result = await module.processPayment(...);
 * } catch (error) {
 *     console.error('Hata:', error.message);
 *     showAlert(error.message, 'error');
 * }
 */

console.log('✅ Module Integration Guide Loaded');



/**
 * Stock Service - Stok Yönetimi
 * Stok takibi, güncelleme, uyarıları
 */

class StockService {
    constructor() {
        this.listeners = [];
    }

    /**
     * Ürünleri localStorage'dan yükle
     */
    getProducts() {
        try {
            const productsData = localStorage.getItem('products');
            if (productsData) {
                return JSON.parse(productsData);
            }
        } catch (e) {
            console.error('Error loading products:', e);
        }
        return [];
    }

    /**
     * Ürünleri kaydet
     */
    saveProducts(products) {
        try {
            localStorage.setItem('products', JSON.stringify(products));
            this.notifyListeners();
        } catch (e) {
            console.error('Error saving products:', e);
        }
    }

    /**
     * Ürün stokunu getir
     * @param {number} productId - Ürün ID
     */
    getStock(productId) {
        const products = this.getProducts();
        const product = products.find(p => p.id === productId);
        return product ? (product.stock || 0) : 0;
    }

    /**
     * Stok kontrolü
     * @param {number} productId - Ürün ID
     * @param {number} quantity - İstenen miktar
     */
    checkStock(productId, quantity) {
        const stock = this.getStock(productId);
        return {
            available: stock >= quantity,
            stock: stock,
            required: quantity,
            shortage: Math.max(0, quantity - stock)
        };
    }

    /**
     * Stok azalt
     * @param {number} productId - Ürün ID
     * @param {number} quantity - Azaltılacak miktar
     */
    decreaseStock(productId, quantity) {
        if (quantity <= 0) {
            throw new Error('Miktar 0\'dan büyük olmalıdır');
        }

        const products = this.getProducts();
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            throw new Error('Ürün bulunamadı');
        }

        const product = products[productIndex];
        const currentStock = product.stock || 0;

        if (currentStock < quantity) {
            throw new Error(`Yetersiz stok. Mevcut stok: ${currentStock}, İstenen: ${quantity}`);
        }

        product.stock = currentStock - quantity;
        product.updatedAt = new Date().toISOString();

        // Düşük stok uyarısı kontrolü
        this.checkLowStockWarning(product);

        this.saveProducts(products);
        
        return product.stock;
    }

    /**
     * Stok artır
     * @param {number} productId - Ürün ID
     * @param {number} quantity - Artırılacak miktar
     */
    increaseStock(productId, quantity) {
        if (quantity <= 0) {
            throw new Error('Miktar 0\'dan büyük olmalıdır');
        }

        const products = this.getProducts();
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            throw new Error('Ürün bulunamadı');
        }

        const product = products[productIndex];
        product.stock = (product.stock || 0) + quantity;
        product.updatedAt = new Date().toISOString();

        this.saveProducts(products);
        
        return product.stock;
    }

    /**
     * Stok güncelle
     * @param {number} productId - Ürün ID
     * @param {number} newStock - Yeni stok miktarı
     */
    updateStock(productId, newStock) {
        if (newStock < 0) {
            throw new Error('Stok negatif olamaz');
        }

        const products = this.getProducts();
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            throw new Error('Ürün bulunamadı');
        }

        const product = products[productIndex];
        const oldStock = product.stock || 0;
        product.stock = newStock;
        product.updatedAt = new Date().toISOString();

        // Düşük stok uyarısı kontrolü
        if (newStock < oldStock) {
            this.checkLowStockWarning(product);
        }

        this.saveProducts(products);
        
        return product.stock;
    }

    /**
     * Düşük stok uyarısı kontrolü
     * @param {Object} product - Ürün objesi
     */
    checkLowStockWarning(product) {
        const lowStockThreshold = product.lowStockThreshold || 10;
        
        if (product.stock <= lowStockThreshold && product.stock > 0) {
            // Düşük stok uyarısı
            if (window.showAlert) {
                window.showAlert(
                    `${product.name} için stok kritik seviyede! Mevcut stok: ${product.stock}`,
                    'warning'
                );
            }

            // Event gönder
            if (window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('lowStockWarning', { 
                    detail: { product, threshold: lowStockThreshold } 
                }));
            }
        } else if (product.stock === 0) {
            // Stok tükenmiş uyarısı
            if (window.showAlert) {
                window.showAlert(
                    `${product.name} stoğu tükendi!`,
                    'error'
                );
            }

            // Event gönder
            if (window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('stockOut', { detail: { product } }));
            }
        }
    }

    /**
     * Düşük stoklu ürünleri getir
     * @param {number} threshold - Eşik değeri (opsiyonel)
     */
    getLowStockProducts(threshold = 10) {
        const products = this.getProducts();
        return products.filter(p => {
            const stock = p.stock || 0;
            const productThreshold = p.lowStockThreshold || threshold;
            return stock <= productThreshold && stock >= 0;
        });
    }

    /**
     * Stok tükenen ürünleri getir
     */
    getOutOfStockProducts() {
        const products = this.getProducts();
        return products.filter(p => (p.stock || 0) === 0);
    }

    /**
     * Stok değişikliklerini dinle
     * @param {Function} callback - Callback fonksiyonu
     */
    onStockChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Dinleyicilere bildirim gönder
     */
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback();
            } catch (e) {
                console.error('Error in stock listener:', e);
            }
        });
    }

    /**
     * Toplu stok güncelleme
     * @param {Array} updates - Güncellemeler [{productId, quantity}, ...]
     */
    bulkUpdateStock(updates) {
        const products = this.getProducts();
        const errors = [];

        updates.forEach(({ productId, quantity }) => {
            try {
                const productIndex = products.findIndex(p => p.id === productId);
                if (productIndex !== -1) {
                    products[productIndex].stock = quantity;
                    products[productIndex].updatedAt = new Date().toISOString();
                    this.checkLowStockWarning(products[productIndex]);
                } else {
                    errors.push(`Ürün bulunamadı: ${productId}`);
                }
            } catch (e) {
                errors.push(`Hata (${productId}): ${e.message}`);
            }
        });

        if (errors.length === 0) {
            this.saveProducts(products);
        }

        return {
            success: errors.length === 0,
            errors: errors
        };
    }
}

// Global instance oluştur
window.stockService = new StockService();

// Global fonksiyonlar
window.getStock = function(productId) {
    return window.stockService.getStock(productId);
};

window.checkStock = function(productId, quantity) {
    return window.stockService.checkStock(productId, quantity);
};

window.decreaseStock = function(productId, quantity) {
    return window.stockService.decreaseStock(productId, quantity);
};

window.increaseStock = function(productId, quantity) {
    return window.stockService.increaseStock(productId, quantity);
};

window.updateStock = function(productId, newStock) {
    return window.stockService.updateStock(productId, newStock);
};

console.log('✅ Stock Service Loaded');


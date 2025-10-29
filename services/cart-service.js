/**
 * Cart Service - Sepet Yönetimi
 * Tüm sepete ekleme, güncelleme, silme işlemlerini yönetir
 */

class CartService {
    constructor() {
        this.cart = this.loadCart();
        this.listeners = [];
    }

    /**
     * Sepeti localStorage'dan yükle
     */
    loadCart() {
        try {
            const cartData = localStorage.getItem('userCart');
            if (cartData) {
                return JSON.parse(cartData);
            }
        } catch (e) {
            console.error('Error loading cart:', e);
        }
        return [];
    }

    /**
     * Sepeti kaydet
     */
    saveCart() {
        try {
            localStorage.setItem('userCart', JSON.stringify(this.cart));
            this.notifyListeners();
        } catch (e) {
            console.error('Error saving cart:', e);
        }
    }

    /**
     * Sepete ürün ekle
     * @param {Object} product - Ürün objesi
     * @param {number} quantity - Miktar
     * @param {string} sellerId - Satıcı ID (opsiyonel)
     */
    addToCart(product, quantity = 1, sellerId = null) {
        if (!product || !product.id) {
            throw new Error('Geçersiz ürün');
        }

        if (quantity <= 0) {
            throw new Error('Miktar 0\'dan büyük olmalıdır');
        }

        // Stok kontrolü
        if (product.stock !== undefined && product.stock < quantity) {
            throw new Error(`Yetersiz stok. Mevcut stok: ${product.stock}`);
        }

        // Sepette aynı ürün var mı kontrol et
        const existingItem = this.cart.find(item => 
            item.productId === product.id && item.sellerId === sellerId
        );

        if (existingItem) {
            // Ürün varsa miktarı artır
            const newQuantity = existingItem.quantity + quantity;
            
            // Stok kontrolü
            if (product.stock !== undefined && product.stock < newQuantity) {
                throw new Error(`Yetersiz stok. Mevcut stok: ${product.stock}`);
            }
            
            existingItem.quantity = newQuantity;
            existingItem.updatedAt = new Date().toISOString();
        } else {
            // Yeni ürün ekle
            this.cart.push({
                id: Date.now(),
                productId: product.id,
                productName: product.name,
                productImage: product.image || null,
                price: product.price || 0,
                unit: product.unit || 'adet',
                quantity: quantity,
                sellerId: sellerId || null,
                sellerName: product.sellerName || null,
                category: product.category || null,
                addedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        this.saveCart();
        return this.getCart();
    }

    /**
     * Sepetten ürün çıkar
     * @param {number} cartItemId - Sepet item ID
     */
    removeFromCart(cartItemId) {
        this.cart = this.cart.filter(item => item.id !== cartItemId);
        this.saveCart();
        return this.getCart();
    }

    /**
     * Sepetteki ürün miktarını güncelle
     * @param {number} cartItemId - Sepet item ID
     * @param {number} quantity - Yeni miktar
     * @param {Object} product - Ürün objesi (stok kontrolü için)
     */
    updateCartItem(cartItemId, quantity, product = null) {
        const item = this.cart.find(item => item.id === cartItemId);
        
        if (!item) {
            throw new Error('Sepet öğesi bulunamadı');
        }

        if (quantity <= 0) {
            // Miktar 0 veya altındaysa ürünü kaldır
            return this.removeFromCart(cartItemId);
        }

        // Stok kontrolü
        if (product && product.stock !== undefined && product.stock < quantity) {
            throw new Error(`Yetersiz stok. Mevcut stok: ${product.stock}`);
        }

        item.quantity = quantity;
        item.updatedAt = new Date().toISOString();
        this.saveCart();
        
        return this.getCart();
    }

    /**
     * Sepeti getir
     */
    getCart() {
        return [...this.cart];
    }

    /**
     * Sepet boş mu kontrol et
     */
    isEmpty() {
        return this.cart.length === 0;
    }

    /**
     * Sepeti temizle
     */
    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    /**
     * Sepet toplam tutarını hesapla
     */
    calculateTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    /**
     * Sepetteki toplam ürün sayısını hesapla
     */
    getTotalItems() {
        return this.cart.reduce((total, item) => {
            return total + item.quantity;
        }, 0);
    }

    /**
     * Sepetteki öğe sayısını getir
     */
    getItemCount() {
        return this.cart.length;
    }

    /**
     * Sepet öğesi detayını getir
     * @param {number} cartItemId - Sepet item ID
     */
    getCartItem(cartItemId) {
        return this.cart.find(item => item.id === cartItemId);
    }

    /**
     * Sepet değişikliklerini dinle
     * @param {Function} callback - Callback fonksiyonu
     */
    onCartChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Dinleyicilere bildirim gönder
     */
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.getCart(), this.calculateTotal(), this.getTotalItems());
            } catch (e) {
                console.error('Error in cart listener:', e);
            }
        });
    }

    /**
     * Sepet istatistiklerini getir
     */
    getCartStats() {
        return {
            itemCount: this.getItemCount(),
            totalItems: this.getTotalItems(),
            totalAmount: this.calculateTotal(),
            isEmpty: this.isEmpty()
        };
    }
}

// Global instance oluştur
window.cartService = new CartService();

// Eski API uyumluluğu için global fonksiyonlar
window.addToCart = function(product, quantity, sellerId) {
    return window.cartService.addToCart(product, quantity, sellerId);
};

window.getCart = function() {
    return window.cartService.getCart();
};

window.removeFromCart = function(cartItemId) {
    return window.cartService.removeFromCart(cartItemId);
};

window.updateCartItem = function(cartItemId, quantity, product) {
    return window.cartService.updateCartItem(cartItemId, quantity, product);
};

window.clearCart = function() {
    return window.cartService.clearCart();
};

console.log('✅ Cart Service Loaded');


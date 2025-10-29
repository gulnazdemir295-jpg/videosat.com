/**
 * Order Service - Sipariş Yönetimi
 * Sipariş oluşturma, güncelleme, durum takibi
 */

class OrderService {
    constructor() {
        this.orders = this.loadOrders();
    }

    /**
     * Siparişleri localStorage'dan yükle
     */
    loadOrders() {
        try {
            const ordersData = localStorage.getItem('userOrders');
            if (ordersData) {
                return JSON.parse(ordersData);
            }
        } catch (e) {
            console.error('Error loading orders:', e);
        }
        return [];
    }

    /**
     * Siparişleri kaydet
     */
    saveOrders() {
        try {
            localStorage.setItem('userOrders', JSON.stringify(this.orders));
        } catch (e) {
            console.error('Error saving orders:', e);
        }
    }

    /**
     * Sipariş numarası oluştur
     */
    generateOrderNumber() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `ORD-${timestamp}-${random}`;
    }

    /**
     * Sepetten sipariş oluştur
     * @param {Object} orderData - Sipariş verisi
     */
    createOrder(orderData) {
        if (!orderData || !orderData.items || orderData.items.length === 0) {
            throw new Error('Sipariş öğeleri bulunamadı');
        }

        // Sipariş numarası oluştur
        const orderNumber = this.generateOrderNumber();

        // Sipariş objesi oluştur
        const order = {
            id: Date.now(),
            orderNumber: orderNumber,
            items: orderData.items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                price: item.price,
                unit: item.unit,
                subtotal: item.price * item.quantity
            })),
            subtotal: orderData.subtotal || 0,
            shippingCost: orderData.shippingCost || 0,
            total: orderData.total || 0,
            status: 'pending', // pending, confirmed, preparing, shipping, delivered, cancelled
            customerInfo: orderData.customerInfo || {},
            shippingAddress: orderData.shippingAddress || {},
            billingAddress: orderData.billingAddress || orderData.shippingAddress || {},
            paymentMethod: orderData.paymentMethod || 'cash',
            paymentStatus: 'pending', // pending, paid, failed, refunded
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notes: orderData.notes || ''
        };

        // Siparişi kaydet
        this.orders.push(order);
        this.saveOrders();

        // Stok güncelleme servisini çağır
        if (window.stockService) {
            order.items.forEach(item => {
                try {
                    window.stockService.decreaseStock(item.productId, item.quantity);
                    
                    // Products array'i güncelle (panel-app.js'deki)
                    if (window.products && Array.isArray(window.products)) {
                        const productIndex = window.products.findIndex(p => p.id === item.productId);
                        if (productIndex !== -1) {
                            window.products[productIndex].stock = window.stockService.getStock(item.productId);
                        }
                    }
                } catch (e) {
                    console.error(`Stok güncelleme hatası (${item.productId}):`, e);
                }
            });
        }

        // Event gönder
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('orderCreated', { detail: order }));
        }

        return order;
    }

    /**
     * Sipariş durumunu güncelle
     * @param {number} orderId - Sipariş ID
     * @param {string} status - Yeni durum
     */
    updateOrderStatus(orderId, status) {
        const order = this.orders.find(o => o.id === orderId);
        
        if (!order) {
            throw new Error('Sipariş bulunamadı');
        }

        const validStatuses = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error('Geçersiz sipariş durumu');
        }

        order.status = status;
        order.updatedAt = new Date().toISOString();
        this.saveOrders();

        // Event gönder
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('orderStatusUpdated', { 
                detail: { orderId, status, order } 
            }));
        }

        return order;
    }

    /**
     * Sipariş getir
     * @param {number} orderId - Sipariş ID
     */
    getOrder(orderId) {
        return this.orders.find(o => o.id === orderId);
    }

    /**
     * Sipariş getir (order number ile)
     * @param {string} orderNumber - Sipariş numarası
     */
    getOrderByNumber(orderNumber) {
        return this.orders.find(o => o.orderNumber === orderNumber);
    }

    /**
     * Tüm siparişleri getir
     * @param {Object} filters - Filtreler (opsiyonel)
     */
    getAllOrders(filters = {}) {
        let filtered = [...this.orders];

        if (filters.status) {
            filtered = filtered.filter(o => o.status === filters.status);
        }

        if (filters.startDate) {
            filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(filters.endDate));
        }

        // Tarihe göre sırala (en yeni önce)
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return filtered;
    }

    /**
     * Sipariş ödeme durumunu güncelle
     * @param {number} orderId - Sipariş ID
     * @param {string} paymentStatus - Ödeme durumu
     */
    updatePaymentStatus(orderId, paymentStatus) {
        const order = this.orders.find(o => o.id === orderId);
        
        if (!order) {
            throw new Error('Sipariş bulunamadı');
        }

        const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
        if (!validStatuses.includes(paymentStatus)) {
            throw new Error('Geçersiz ödeme durumu');
        }

        order.paymentStatus = paymentStatus;
        order.updatedAt = new Date().toISOString();
        this.saveOrders();

        return order;
    }

    /**
     * Sipariş iptal et
     * @param {number} orderId - Sipariş ID
     * @param {string} reason - İptal nedeni (opsiyonel)
     */
    cancelOrder(orderId, reason = '') {
        const order = this.orders.find(o => o.id === orderId);
        
        if (!order) {
            throw new Error('Sipariş bulunamadı');
        }

        // Sipariş durumu kontrolü
        if (order.status === 'delivered' || order.status === 'cancelled') {
            throw new Error('Bu sipariş iptal edilemez');
        }

        // Stok geri ekle
        if (window.stockService) {
            order.items.forEach(item => {
                try {
                    window.stockService.increaseStock(item.productId, item.quantity);
                } catch (e) {
                    console.error(`Stok geri ekleme hatası (${item.productId}):`, e);
                }
            });
        }

        order.status = 'cancelled';
        order.cancelledAt = new Date().toISOString();
        order.cancellationReason = reason;
        order.updatedAt = new Date().toISOString();
        this.saveOrders();

        return order;
    }

    /**
     * Sipariş istatistikleri
     */
    getOrderStats() {
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders
            .filter(o => o.paymentStatus === 'paid')
            .reduce((sum, o) => sum + o.total, 0);
        
        const statusCounts = {};
        this.orders.forEach(o => {
            statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
        });

        return {
            totalOrders,
            totalRevenue,
            statusCounts,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        };
    }
}

// Global instance oluştur
window.orderService = new OrderService();

// Global fonksiyonlar
window.createOrder = function(orderData) {
    return window.orderService.createOrder(orderData);
};

window.updateOrderStatus = function(orderId, status) {
    return window.orderService.updateOrderStatus(orderId, status);
};

window.getOrder = function(orderId) {
    return window.orderService.getOrder(orderId);
};

window.getAllOrders = function(filters) {
    return window.orderService.getAllOrders(filters);
};

console.log('✅ Order Service Loaded');

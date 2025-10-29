/**
 * VideoSat Platform - Sipariş Modülü
 * Prosedür: PROCEDURES_WORKFLOW.md - Sipariş Yönetimi Prosedürü
 * 
 * Özellikler:
 * - Sipariş oluşturma
 * - Sipariş durumu yönetimi
 * - Sipariş takibi
 * - Kargo yönetimi
 * - Sipariş onay/red/hazırlama
 */

class OrderModule {
    constructor() {
        this.name = 'Order';
        this.version = '1.0.0';
        this.orders = [];
        this.orderStatuses = [
            'pending',      // Beklemede
            'confirmed',    // Onaylandı
            'preparing',    // Hazırlanıyor
            'ready',        // Hazır
            'shipped',      // Kargoya verildi
            'delivered',    // Teslim edildi
            'cancelled',    // İptal edildi
            'refunded'      // İade edildi
        ];
        this.initialized = false;
    }

    /**
     * Modül başlatma
     */
    init() {
        if (this.initialized) return;
        
        console.log('📦 Order Module Initializing...');
        
        // Verileri yükle
        this.loadData();
        
        // Event listener'ları kur
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('✅ Order Module Initialized');
    }

    /**
     * Event listener'ları kur
     */
    setupEventListeners() {
        if (window.moduleManager) {
            window.moduleManager.on('payment:completed', (e) => {
                // Ödeme tamamlandığında sipariş durumunu güncelle
                this.handlePaymentCompleted(e.detail);
            });
        }
    }

    /**
     * Verileri yükle
     */
    loadData() {
        const saved = localStorage.getItem('orders');
        if (saved) {
            try {
                this.orders = JSON.parse(saved);
            } catch (e) {
                this.orders = [];
            }
        }
    }

    /**
     * Verileri kaydet
     */
    saveData() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    /**
     * Sipariş oluştur
     * Prosedür: PROCEDURES_WORKFLOW.md - Sipariş Süreci
     */
    createOrder(orderData) {
        // Validasyon
        this.validateOrderData(orderData);

        const order = {
            id: this.generateOrderId(),
            orderNumber: this.generateOrderNumber(),
            buyerId: orderData.buyerId,
            buyerRole: orderData.buyerRole,
            buyerName: orderData.buyerName,
            sellerId: orderData.sellerId,
            sellerRole: orderData.sellerRole,
            sellerName: orderData.sellerName,
            items: orderData.items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                unit: item.unit,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                subtotal: item.subtotal,
                discount: item.discount || 0
            })),
            totals: orderData.totals,
            shippingAddress: orderData.shippingAddress,
            billingAddress: orderData.billingAddress || orderData.shippingAddress,
            paymentMethod: orderData.paymentMethod,
            paymentStatus: 'pending',
            paymentTransactionId: null,
            status: 'pending',
            notes: orderData.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            estimatedDelivery: orderData.estimatedDelivery || null,
            trackingNumber: null,
            cargoCompany: null
        };

        this.orders.push(order);
        this.saveData();

        // Event gönder
        if (window.moduleManager) {
            window.moduleManager.emit('order:created', { order });
        }

        console.log('✅ Sipariş oluşturuldu:', order.orderNumber);
        return order;
    }

    /**
     * Sipariş güncelle
     */
    updateOrder(orderId, updateData) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            throw new Error('Sipariş bulunamadı');
        }

        const allowedFields = [
            'status',
            'paymentStatus',
            'paymentTransactionId',
            'trackingNumber',
            'cargoCompany',
            'estimatedDelivery',
            'notes'
        ];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                order[field] = updateData[field];
            }
        }

        order.updatedAt = new Date().toISOString();
        this.saveData();

        // Event gönder
        if (window.moduleManager) {
            window.moduleManager.emit('order:updated', { order });
        }

        return order;
    }

    /**
     * Sipariş durumu güncelle
     */
    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            throw new Error('Sipariş bulunamadı');
        }

        if (!this.orderStatuses.includes(newStatus)) {
            throw new Error('Geçersiz sipariş durumu');
        }

        const oldStatus = order.status;
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        this.saveData();

        // Event gönder
        if (window.moduleManager) {
            window.moduleManager.emit('order:statusChanged', {
                orderId,
                oldStatus,
                newStatus,
                order
            });
        }

        return order;
    }

    /**
     * Sipariş onayla
     */
    confirmOrder(orderId) {
        return this.updateOrderStatus(orderId, 'confirmed');
    }

    /**
     * Sipariş hazırlama
     */
    prepareOrder(orderId) {
        return this.updateOrderStatus(orderId, 'preparing');
    }

    /**
     * Sipariş hazır
     */
    markOrderReady(orderId) {
        return this.updateOrderStatus(orderId, 'ready');
    }

    /**
     * Sipariş kargoya ver
     */
    shipOrder(orderId, trackingNumber, cargoCompany) {
        const order = this.updateOrderStatus(orderId, 'shipped');
        order.trackingNumber = trackingNumber;
        order.cargoCompany = cargoCompany;
        order.updatedAt = new Date().toISOString();
        this.saveData();

        // Event gönder
        if (window.moduleManager) {
            window.moduleManager.emit('order:shipped', {
                orderId,
                trackingNumber,
                cargoCompany,
                order
            });
        }

        return order;
    }

    /**
     * Sipariş teslim edildi
     */
    markOrderDelivered(orderId) {
        return this.updateOrderStatus(orderId, 'delivered');
    }

    /**
     * Sipariş iptal et
     */
    cancelOrder(orderId, reason = '') {
        const order = this.updateOrderStatus(orderId, 'cancelled');
        order.notes = order.notes ? `${order.notes}\nİptal nedeni: ${reason}` : `İptal nedeni: ${reason}`;
        order.updatedAt = new Date().toISOString();
        this.saveData();

        // Event gönder
        if (window.moduleManager) {
            window.moduleManager.emit('order:cancelled', {
                orderId,
                reason,
                order
            });
        }

        return order;
    }

    /**
     * Sipariş getir
     */
    getOrder(orderId) {
        return this.orders.find(o => o.id === orderId);
    }

    /**
     * Siparişleri listele
     */
    getOrders(filters = {}) {
        let filtered = [...this.orders];

        // Durum filtresi
        if (filters.status) {
            filtered = filtered.filter(o => o.status === filters.status);
        }

        // Ödeme durumu filtresi
        if (filters.paymentStatus) {
            filtered = filtered.filter(o => o.paymentStatus === filters.paymentStatus);
        }

        // Alıcı filtresi
        if (filters.buyerId) {
            filtered = filtered.filter(o => o.buyerId === filters.buyerId);
        }

        // Satıcı filtresi
        if (filters.sellerId) {
            filtered = filtered.filter(o => o.sellerId === filters.sellerId);
        }

        // Rol filtresi
        if (filters.buyerRole) {
            filtered = filtered.filter(o => o.buyerRole === filters.buyerRole);
        }
        if (filters.sellerRole) {
            filtered = filtered.filter(o => o.sellerRole === filters.sellerRole);
        }

        // Tarih aralığı
        if (filters.startDate) {
            const start = new Date(filters.startDate);
            filtered = filtered.filter(o => new Date(o.createdAt) >= start);
        }
        if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(o => new Date(o.createdAt) <= end);
        }

        // Sıralama
        if (filters.sortBy) {
            filtered.sort((a, b) => {
                switch (filters.sortBy) {
                    case 'date':
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    case 'total':
                        return b.totals.total - a.totals.total;
                    case 'status':
                        return a.status.localeCompare(b.status);
                    default:
                        return 0;
                }
            });
        }

        return filtered;
    }

    /**
     * Sipariş veri validasyonu
     */
    validateOrderData(data) {
        if (!data.buyerId || !data.buyerRole) {
            throw new Error('Alıcı bilgileri zorunludur');
        }

        if (!data.sellerId || !data.sellerRole) {
            throw new Error('Satıcı bilgileri zorunludur');
        }

        if (!data.items || data.items.length === 0) {
            throw new Error('Sipariş en az bir ürün içermelidir');
        }

        if (!data.totals || !data.totals.total) {
            throw new Error('Sipariş toplam tutarı zorunludur');
        }

        if (!data.shippingAddress) {
            throw new Error('Teslimat adresi zorunludur');
        }

        return true;
    }

    /**
     * Ödeme tamamlandı handler
     */
    handlePaymentCompleted(paymentData) {
        // İlgili siparişi bul ve ödeme durumunu güncelle
        const order = this.orders.find(o => 
            o.paymentTransactionId === paymentData.transactionId ||
            (o.paymentStatus === 'pending' && o.totals.total === paymentData.amount)
        );

        if (order) {
            order.paymentStatus = 'completed';
            order.paymentTransactionId = paymentData.transactionId;
            order.updatedAt = new Date().toISOString();
            this.saveData();

            // Siparişi onayla
            if (order.status === 'pending') {
                this.confirmOrder(order.id);
            }

            console.log('✅ Sipariş ödemesi tamamlandı:', order.orderNumber);
        }
    }

    /**
     * Sipariş istatistikleri
     */
    getStatistics(filters = {}) {
        const orders = this.getOrders(filters);

        const totalOrders = orders.length;
        const totalAmount = orders.reduce((sum, o) => sum + o.totals.total, 0);
        const avgOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

        // Durum bazlı dağılım
        const statusDistribution = {};
        this.orderStatuses.forEach(status => {
            statusDistribution[status] = orders.filter(o => o.status === status).length;
        });

        // Ödeme durumu bazlı dağılım
        const paymentStatusDistribution = {
            pending: orders.filter(o => o.paymentStatus === 'pending').length,
            completed: orders.filter(o => o.paymentStatus === 'completed').length,
            failed: orders.filter(o => o.paymentStatus === 'failed').length,
            refunded: orders.filter(o => o.paymentStatus === 'refunded').length
        };

        return {
            totalOrders,
            totalAmount,
            averageOrderValue: avgOrderValue,
            statusDistribution,
            paymentStatusDistribution
        };
    }

    /**
     * ID üretme fonksiyonları
     */
    generateOrderId() {
        return `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `ORD-${year}${month}${day}-${random}`;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrderModule;
} else {
    window.OrderModule = OrderModule;
}

console.log('✅ Order Module Loaded');



/**
 * Analytics Service - Raporlama ve İstatistik Servisi
 * Satış, sipariş, ürün ve müşteri istatistikleri
 */

class AnalyticsService {
    constructor() {
        this.stats = {
            sales: {
                today: 0,
                week: 0,
                month: 0,
                year: 0,
                total: 0
            },
            orders: {
                today: 0,
                week: 0,
                month: 0,
                year: 0,
                total: 0,
                pending: 0,
                completed: 0,
                cancelled: 0
            },
            products: {
                total: 0,
                lowStock: 0,
                outOfStock: 0
            },
            customers: {
                total: 0,
                active: 0,
                newToday: 0,
                newWeek: 0
            },
            livestream: {
                totalStreams: 0,
                totalViewers: 0,
                averageViewers: 0,
                totalLikes: 0
            }
        };
        
        this.loadData();
    }

    /**
     * Verileri yükle
     */
    loadData() {
        try {
            // LocalStorage'dan yükle
            const savedStats = localStorage.getItem('analyticsStats');
            if (savedStats) {
                this.stats = { ...this.stats, ...JSON.parse(savedStats) };
            }
            
            // Gerçek verileri hesapla
            this.calculateStats();
        } catch (e) {
            console.error('Analytics data load error:', e);
        }
    }

    /**
     * İstatistikleri hesapla
     */
    calculateStats() {
        // Siparişlerden satış hesapla
        this.calculateSalesStats();
        
        // Sipariş istatistikleri
        this.calculateOrderStats();
        
        // Ürün istatistikleri
        this.calculateProductStats();
        
        // Müşteri istatistikleri
        this.calculateCustomerStats();
        
        // Canlı yayın istatistikleri
        this.calculateLivestreamStats();
    }

    /**
     * Satış istatistiklerini hesapla
     */
    calculateSalesStats() {
        try {
            // Order Service'den siparişleri al
            const orderService = window.orderService || null;
            if (!orderService) {
                // Order Module'den al
                if (window.moduleManager && window.moduleManager.getModule('Order')) {
                    const orderModule = window.moduleManager.getModule('Order');
                    const orders = orderModule ? orderModule.orders : [];
                    this.calculateFromOrders(orders);
                }
                return;
            }

            const orders = orderService.getOrders ? orderService.getOrders() : [];
            this.calculateFromOrders(orders);
        } catch (e) {
            console.error('Sales stats calculation error:', e);
        }
    }

    /**
     * Siparişlerden istatistik hesapla
     */
    calculateFromOrders(orders) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

        let todaySales = 0;
        let weekSales = 0;
        let monthSales = 0;
        let yearSales = 0;
        let totalSales = 0;

        orders.forEach(order => {
            if (order.status === 'completed' || order.status === 'delivered') {
                const orderDate = new Date(order.createdAt || order.timestamp);
                const orderTotal = this.getOrderTotal(order);

                totalSales += orderTotal;

                if (orderDate >= today) {
                    todaySales += orderTotal;
                }
                if (orderDate >= weekAgo) {
                    weekSales += orderTotal;
                }
                if (orderDate >= monthAgo) {
                    monthSales += orderTotal;
                }
                if (orderDate >= yearAgo) {
                    yearSales += orderTotal;
                }
            }
        });

        this.stats.sales = {
            today: todaySales,
            week: weekSales,
            month: monthSales,
            year: yearSales,
            total: totalSales
        };
    }

    /**
     * Sipariş toplamını hesapla
     */
    getOrderTotal(order) {
        if (order.total) return parseFloat(order.total);
        if (order.items && Array.isArray(order.items)) {
            return order.items.reduce((sum, item) => {
                return sum + (parseFloat(item.price || 0) * parseFloat(item.quantity || 0));
            }, 0);
        }
        return 0;
    }

    /**
     * Sipariş istatistiklerini hesapla
     */
    calculateOrderStats() {
        try {
            const orderService = window.orderService || null;
            let orders = [];
            
            if (orderService && orderService.getOrders) {
                orders = orderService.getOrders();
            } else if (window.moduleManager) {
                const orderModule = window.moduleManager.getModule('Order');
                orders = orderModule ? orderModule.orders : [];
            }

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

            let todayOrders = 0;
            let weekOrders = 0;
            let monthOrders = 0;
            let yearOrders = 0;
            let totalOrders = orders.length;
            let pending = 0;
            let completed = 0;
            let cancelled = 0;

            orders.forEach(order => {
                const orderDate = new Date(order.createdAt || order.timestamp);
                
                if (orderDate >= today) todayOrders++;
                if (orderDate >= weekAgo) weekOrders++;
                if (orderDate >= monthAgo) monthOrders++;
                if (orderDate >= yearAgo) yearOrders++;

                switch (order.status) {
                    case 'pending':
                    case 'confirmed':
                    case 'preparing':
                        pending++;
                        break;
                    case 'completed':
                    case 'delivered':
                        completed++;
                        break;
                    case 'cancelled':
                        cancelled++;
                        break;
                }
            });

            this.stats.orders = {
                today: todayOrders,
                week: weekOrders,
                month: monthOrders,
                year: yearOrders,
                total: totalOrders,
                pending,
                completed,
                cancelled
            };
        } catch (e) {
            console.error('Order stats calculation error:', e);
        }
    }

    /**
     * Ürün istatistiklerini hesapla
     */
    calculateProductStats() {
        try {
            let products = [];
            
            if (window.moduleManager) {
                const productModule = window.moduleManager.getModule('Product');
                products = productModule ? productModule.products : [];
            } else {
                const productsData = localStorage.getItem('products');
                if (productsData) {
                    products = JSON.parse(productsData);
                }
            }

            let lowStock = 0;
            let outOfStock = 0;

            products.forEach(product => {
                if (product.stock !== undefined) {
                    if (product.stock === 0) {
                        outOfStock++;
                    } else if (product.stock < 10) {
                        lowStock++;
                    }
                }
            });

            this.stats.products = {
                total: products.length,
                lowStock,
                outOfStock
            };
        } catch (e) {
            console.error('Product stats calculation error:', e);
        }
    }

    /**
     * Müşteri istatistiklerini hesapla
     */
    calculateCustomerStats() {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

            let newToday = 0;
            let newWeek = 0;
            let active = 0;

            users.forEach(user => {
                if (user.role === 'musteri' || user.role === 'customer') {
                    const userDate = new Date(user.createdAt || user.timestamp);
                    if (userDate >= today) newToday++;
                    if (userDate >= weekAgo) newWeek++;
                    
                    // Son 30 gün içinde sipariş veren aktif müşteri
                    if (this.isActiveCustomer(user)) {
                        active++;
                    }
                }
            });

            this.stats.customers = {
                total: users.filter(u => u.role === 'musteri' || u.role === 'customer').length,
                active,
                newToday,
                newWeek
            };
        } catch (e) {
            console.error('Customer stats calculation error:', e);
        }
    }

    /**
     * Aktif müşteri kontrolü
     */
    isActiveCustomer(user) {
        // Son 30 gün içinde sipariş vermişse aktif
        try {
            const orderService = window.orderService || null;
            if (!orderService) return false;
            
            const orders = orderService.getOrders ? orderService.getOrders() : [];
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            
            return orders.some(order => {
                return order.buyerEmail === user.email && 
                       new Date(order.createdAt) >= thirtyDaysAgo;
            });
        } catch (e) {
            return false;
        }
    }

    /**
     * Canlı yayın istatistiklerini hesapla
     */
    calculateLivestreamStats() {
        try {
            // LocalStorage'dan canlı yayın verilerini al
            const streams = JSON.parse(localStorage.getItem('livestreams') || '[]');
            
            let totalViewers = 0;
            let totalLikes = 0;

            streams.forEach(stream => {
                totalViewers += stream.viewers || 0;
                totalLikes += stream.likes || 0;
            });

            this.stats.livestream = {
                totalStreams: streams.length,
                totalViewers,
                averageViewers: streams.length > 0 ? Math.round(totalViewers / streams.length) : 0,
                totalLikes
            };
        } catch (e) {
            console.error('Livestream stats calculation error:', e);
        }
    }

    /**
     * İstatistikleri al
     */
    getStats() {
        this.calculateStats();
        return this.stats;
    }

    /**
     * Satış istatistiklerini al
     */
    getSalesStats() {
        this.calculateSalesStats();
        return this.stats.sales;
    }

    /**
     * Sipariş istatistiklerini al
     */
    getOrderStats() {
        this.calculateOrderStats();
        return this.stats.orders;
    }

    /**
     * Ürün istatistiklerini al
     */
    getProductStats() {
        this.calculateProductStats();
        return this.stats.products;
    }

    /**
     * Müşteri istatistiklerini al
     */
    getCustomerStats() {
        this.calculateCustomerStats();
        return this.stats.customers;
    }

    /**
     * Canlı yayın istatistiklerini al
     */
    getLivestreamStats() {
        this.calculateLivestreamStats();
        return this.stats.livestream;
    }

    /**
     * Tarih aralığına göre satış raporu
     */
    getSalesReport(startDate, endDate) {
        try {
            const orderService = window.orderService || null;
            let orders = [];
            
            if (orderService && orderService.getOrders) {
                orders = orderService.getOrders();
            }

            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const filteredOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt || order.timestamp);
                return orderDate >= start && orderDate <= end && 
                       (order.status === 'completed' || order.status === 'delivered');
            });

            const totalSales = filteredOrders.reduce((sum, order) => {
                return sum + this.getOrderTotal(order);
            }, 0);

            return {
                startDate,
                endDate,
                totalOrders: filteredOrders.length,
                totalSales,
                averageOrderValue: filteredOrders.length > 0 ? totalSales / filteredOrders.length : 0
            };
        } catch (e) {
            console.error('Sales report error:', e);
            return null;
        }
    }

    /**
     * En çok satan ürünler
     */
    getTopProducts(limit = 10) {
        try {
            const orderService = window.orderService || null;
            let orders = [];
            
            if (orderService && orderService.getOrders) {
                orders = orderService.getOrders();
            }

            const productSales = {};

            orders.forEach(order => {
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        const productId = item.productId || item.id;
                        if (!productSales[productId]) {
                            productSales[productId] = {
                                productId,
                                productName: item.productName || item.name,
                                quantity: 0,
                                revenue: 0
                            };
                        }
                        productSales[productId].quantity += parseFloat(item.quantity || 0);
                        productSales[productId].revenue += parseFloat(item.price || 0) * parseFloat(item.quantity || 0);
                    });
                }
            });

            return Object.values(productSales)
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, limit);
        } catch (e) {
            console.error('Top products error:', e);
            return [];
        }
    }
}

// Export
const analyticsService = new AnalyticsService();
window.analyticsService = analyticsService;

console.log('✅ Analytics Service initialized');


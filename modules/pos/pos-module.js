/**
 * VideoSat Platform - POS Satış Modülü
 * Prosedür: POS_SYSTEM_WORKFLOW.md
 * 
 * Özellikler:
 * - Satıcı paneli POS satışları
 * - Müşteri paneli alışveriş
 * - Ödeme işlemleri (Nakit, Kart, Online, Taksitli, Kripto)
 * - Sepet yönetimi
 * - İndirim ve kampanya sistemi
 * - Fatura oluşturma
 * - Günlük/Haftalık/Aylık raporlar
 */

class POSModule {
    constructor() {
        this.name = 'POS';
        this.version = '1.0.0';
        this.cart = [];
        this.sales = [];
        this.dailyBalance = {
            openingBalance: 0,
            closingBalance: 0,
            totalSales: 0,
            totalPayments: {
                cash: 0,
                card: 0,
                online: 0,
                installment: 0,
                crypto: 0
            },
            refunds: 0
        };
        this.discounts = [];
        this.initialized = false;
    }

    /**
     * Modül başlatma
     */
    init() {
        if (this.initialized) return;
        
        console.log('🏪 POS Module Initializing...');
        
        // LocalStorage'dan verileri yükle
        this.loadData();
        
        // Event listener'ları kur
        this.setupEventListeners();
        
        // Günlük başlangıç bakiyesini kontrol et
        this.checkDailyOpening();
        
        this.initialized = true;
        console.log('✅ POS Module Initialized');
    }

    /**
     * Event listener'ları kur
     */
    setupEventListeners() {
        // Module Manager event'lerini dinle
        if (window.moduleManager) {
            window.moduleManager.on('payment:completed', (e) => {
                this.handlePaymentCompleted(e.detail);
            });
        }
    }

    /**
     * Verileri yükle
     */
    loadData() {
        // Sepet
        const savedCart = localStorage.getItem('posCart');
        if (savedCart) {
            try {
                this.cart = JSON.parse(savedCart);
            } catch (e) {
                this.cart = [];
            }
        }

        // Satışlar
        const savedSales = localStorage.getItem('posSales');
        if (savedSales) {
            try {
                this.sales = JSON.parse(savedSales);
            } catch (e) {
                this.sales = [];
            }
        }

        // Günlük bakiye
        const savedBalance = localStorage.getItem('posDailyBalance');
        if (savedBalance) {
            try {
                this.dailyBalance = JSON.parse(savedBalance);
            } catch (e) {
                this.dailyBalance = this.getDefaultBalance();
            }
        }

        // İndirimler
        const savedDiscounts = localStorage.getItem('posDiscounts');
        if (savedDiscounts) {
            try {
                this.discounts = JSON.parse(savedDiscounts);
            } catch (e) {
                this.discounts = [];
            }
        }
    }

    /**
     * Verileri kaydet
     */
    saveData() {
        localStorage.setItem('posCart', JSON.stringify(this.cart));
        localStorage.setItem('posSales', JSON.stringify(this.sales));
        localStorage.setItem('posDailyBalance', JSON.stringify(this.dailyBalance));
        localStorage.setItem('posDiscounts', JSON.stringify(this.discounts));
    }

    /**
     * Varsayılan bakiye
     */
    getDefaultBalance() {
        return {
            openingBalance: 0,
            closingBalance: 0,
            totalSales: 0,
            totalPayments: {
                cash: 0,
                card: 0,
                online: 0,
                installment: 0,
                crypto: 0
            },
            refunds: 0
        };
    }

    /**
     * Günlük başlangıç kontrolü
     */
    checkDailyOpening() {
        const today = new Date().toDateString();
        const lastOpening = localStorage.getItem('posLastOpening');
        
        if (lastOpening !== today) {
            // Yeni gün - günlük başlangıç bakiyesi
            this.dailyBalance.openingBalance = 0;
            this.dailyBalance.closingBalance = 0;
            this.dailyBalance.totalSales = 0;
            this.dailyBalance.totalPayments = {
                cash: 0,
                card: 0,
                online: 0,
                installment: 0,
                crypto: 0
            };
            this.dailyBalance.refunds = 0;
            
            localStorage.setItem('posLastOpening', today);
            this.saveData();
        }
    }

    /**
     * Günlük açılış bakiyesi ayarla
     */
    setOpeningBalance(amount) {
        this.dailyBalance.openingBalance = amount;
        this.dailyBalance.closingBalance = amount;
        this.saveData();
        
        if (window.moduleManager) {
            window.moduleManager.emit('pos:dailyOpening', { amount });
        }
    }

    /**
     * Ürün sepete ekle
     * Prosedür: POS_SYSTEM_WORKFLOW.md - Sepet Yönetimi
     */
    addToCart(product, quantity = 1) {
        // Ürün kontrolü
        if (!product || !product.id) {
            throw new Error('Geçersiz ürün');
        }

        // Miktar kontrolü
        if (quantity <= 0) {
            throw new Error('Miktar 0\'dan büyük olmalıdır');
        }

        // Stok kontrolü (ürün modülünden kontrol edilebilir)
        const productModule = window.moduleManager?.get('Product');
        if (productModule) {
            const stockCheck = productModule.checkStock(product.id, quantity);
            if (!stockCheck.available) {
                throw new Error(stockCheck.message || 'Yetersiz stok');
            }
        }

        // Sepette var mı kontrol et
        const existingItem = this.cart.find(item => item.productId === product.id);
        
        if (existingItem) {
            // Miktarı artır
            existingItem.quantity += quantity;
            existingItem.subtotal = this.calculateSubtotal(existingItem);
        } else {
            // Yeni ürün ekle
            const cartItem = {
                id: this.generateCartItemId(),
                productId: product.id,
                productName: product.name,
                unit: product.unit || 'adet',
                unitPrice: product.price || 0,
                quantity: quantity,
                subtotal: (product.price || 0) * quantity,
                discount: 0,
                discountAmount: 0
            };
            
            this.cart.push(cartItem);
        }

        this.saveData();
        
        // Event gönder
        if (window.moduleManager) {
            window.moduleManager.emit('pos:cartUpdated', { cart: this.cart });
        }

        return this.cart;
    }

    /**
     * Sepetten ürün çıkar
     */
    removeFromCart(cartItemId) {
        const index = this.cart.findIndex(item => item.id === cartItemId);
        if (index !== -1) {
            this.cart.splice(index, 1);
            this.saveData();
            
            if (window.moduleManager) {
                window.moduleManager.emit('pos:cartUpdated', { cart: this.cart });
            }
        }
    }

    /**
     * Sepet miktarını güncelle
     */
    updateCartQuantity(cartItemId, quantity) {
        const item = this.cart.find(item => item.id === cartItemId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(cartItemId);
            } else {
                item.quantity = quantity;
                item.subtotal = this.calculateSubtotal(item);
                this.saveData();
                
                if (window.moduleManager) {
                    window.moduleManager.emit('pos:cartUpdated', { cart: this.cart });
                }
            }
        }
    }

    /**
     * Sepeti temizle
     */
    clearCart() {
        this.cart = [];
        this.saveData();
        
        if (window.moduleManager) {
            window.moduleManager.emit('pos:cartUpdated', { cart: this.cart });
        }
    }

    /**
     * Ara toplam hesapla
     */
    calculateSubtotal(item) {
        return (item.unitPrice * item.quantity) - (item.discountAmount || 0);
    }

    /**
     * Toplam tutarı hesapla
     */
    calculateTotal() {
        let subtotal = this.cart.reduce((sum, item) => sum + this.calculateSubtotal(item), 0);
        
        // KDV hesaplama (varsayılan %20)
        const vatRate = 0.20;
        const vatAmount = subtotal * vatRate;
        const total = subtotal + vatAmount;

        return {
            subtotal: subtotal,
            vatRate: vatRate,
            vatAmount: vatAmount,
            discount: this.cart.reduce((sum, item) => sum + (item.discountAmount || 0), 0),
            total: total
        };
    }

    /**
     * İndirim uygula
     * Prosedür: POS_SYSTEM_WORKFLOW.md - İndirim ve Kampanya Sistemi
     */
    applyDiscount(cartItemId, discountType, discountValue) {
        const item = this.cart.find(item => item.id === cartItemId);
        if (!item) return false;

        let discountAmount = 0;

        if (discountType === 'percentage') {
            // Yüzde indirim
            discountAmount = (item.unitPrice * item.quantity) * (discountValue / 100);
        } else if (discountType === 'amount') {
            // Miktar indirimi
            discountAmount = Math.min(discountValue, item.unitPrice * item.quantity);
        }

        item.discount = discountType;
        item.discountValue = discountValue;
        item.discountAmount = discountAmount;
        item.subtotal = this.calculateSubtotal(item);

        this.saveData();
        
        if (window.moduleManager) {
            window.moduleManager.emit('pos:discountApplied', { 
                cartItemId, 
                discountType, 
                discountValue, 
                discountAmount 
            });
        }

        return true;
    }

    /**
     * Otomatik indirim kontrolü
     */
    checkAutomaticDiscounts() {
        const total = this.calculateTotal().total;
        
        // 100₺ üzeri %5 indirim
        if (total >= 100 && total < 250) {
            return { type: 'percentage', value: 5, message: '100₺ üzeri %5 indirim' };
        }
        
        // 250₺ üzeri %10 indirim
        if (total >= 250) {
            return { type: 'percentage', value: 10, message: '250₺ üzeri %10 indirim' };
        }

        return null;
    }

    /**
     * Ödeme işlemi
     * Prosedür: POS_SYSTEM_WORKFLOW.md - Ödeme Sistemi Detayları
     */
    async processPayment(paymentData) {
        const { method, amount, receivedAmount, customerInfo } = paymentData;

        // Toplam tutarı hesapla
        const totals = this.calculateTotal();

        // Tutar kontrolü
        if (amount !== totals.total) {
            throw new Error('Ödeme tutarı sepet tutarı ile eşleşmiyor');
        }

        // Ödeme yöntemine göre işlem
        let paymentResult;

        switch (method) {
            case 'cash':
                paymentResult = await this.processCashPayment(receivedAmount, amount);
                break;
            case 'card':
                paymentResult = await this.processCardPayment(amount);
                break;
            case 'online':
                paymentResult = await this.processOnlinePayment(amount);
                break;
            case 'installment':
                paymentResult = await this.processInstallmentPayment(amount, paymentData.installmentPlan);
                break;
            case 'crypto':
                paymentResult = await this.processCryptoPayment(amount, paymentData.cryptoType);
                break;
            default:
                throw new Error('Geçersiz ödeme yöntemi');
        }

        if (!paymentResult.success) {
            throw new Error(paymentResult.message || 'Ödeme başarısız');
        }

        // Satış kaydı oluştur
        const sale = this.createSaleRecord({
            cart: this.cart,
            totals: totals,
            payment: paymentResult,
            customerInfo: customerInfo || {}
        });

        // Stok güncelleme
        await this.updateStockAfterSale();

        // Günlük bakiye güncelleme
        this.updateDailyBalance(sale);

        // Sepeti temizle
        this.clearCart();

        // Event gönder
        if (window.moduleManager) {
            window.moduleManager.emit('pos:saleCompleted', { sale });
            window.moduleManager.emit('payment:completed', { 
                transactionId: paymentResult.transactionId,
                amount: amount,
                method: method
            });
        }

        return {
            success: true,
            sale: sale,
            receipt: this.generateReceipt(sale)
        };
    }

    /**
     * Nakit ödeme
     */
    async processCashPayment(receivedAmount, totalAmount) {
        if (!receivedAmount || receivedAmount < totalAmount) {
            return {
                success: false,
                message: 'Alınan para tutarı yetersiz'
            };
        }

        const change = receivedAmount - totalAmount;

        return {
            success: true,
            method: 'cash',
            receivedAmount: receivedAmount,
            totalAmount: totalAmount,
            change: change,
            transactionId: this.generateTransactionId()
        };
    }

    /**
     * Kart ödeme
     */
    async processCardPayment(amount) {
        // Payment Service kullan
        const paymentService = window.paymentService || window.moduleManager?.get('Payment');
        
        if (paymentService && paymentService.processPayment) {
            try {
                const result = await paymentService.processPayment({
                    amount: amount,
                    currency: 'TRY',
                    paymentMethod: 'card'
                });

                return {
                    success: result.success,
                    method: 'card',
                    transactionId: result.transactionId,
                    message: result.message
                };
            } catch (error) {
                return {
                    success: false,
                    message: error.message || 'Kart ödemesi başarısız'
                };
            }
        }

        // Mock ödeme
        return {
            success: true,
            method: 'card',
            transactionId: this.generateTransactionId(),
            message: 'Kart ödemesi başarılı'
        };
    }

    /**
     * Online ödeme
     */
    async processOnlinePayment(amount) {
        const paymentService = window.paymentService || window.moduleManager?.get('Payment');
        
        if (paymentService && paymentService.processPayment) {
            try {
                const result = await paymentService.processPayment({
                    amount: amount,
                    currency: 'TRY',
                    paymentMethod: 'online'
                });

                return {
                    success: result.success,
                    method: 'online',
                    transactionId: result.transactionId,
                    message: result.message
                };
            } catch (error) {
                return {
                    success: false,
                    message: error.message || 'Online ödeme başarısız'
                };
            }
        }

        return {
            success: true,
            method: 'online',
            transactionId: this.generateTransactionId(),
            message: 'Online ödeme başarılı'
        };
    }

    /**
     * Taksitli ödeme
     */
    async processInstallmentPayment(amount, installmentPlan) {
        const paymentService = window.paymentService || window.moduleManager?.get('Payment');
        
        if (paymentService && paymentService.processPayment) {
            try {
                const result = await paymentService.processPayment({
                    amount: amount,
                    currency: 'TRY',
                    paymentMethod: 'installment',
                    installmentPlan: installmentPlan || 3
                });

                return {
                    success: result.success,
                    method: 'installment',
                    transactionId: result.transactionId,
                    installmentPlan: installmentPlan,
                    message: result.message
                };
            } catch (error) {
                return {
                    success: false,
                    message: error.message || 'Taksitli ödeme başarısız'
                };
            }
        }

        return {
            success: true,
            method: 'installment',
            transactionId: this.generateTransactionId(),
            installmentPlan: installmentPlan,
            message: 'Taksitli ödeme başarılı'
        };
    }

    /**
     * Kripto ödeme
     */
    async processCryptoPayment(amount, cryptoType) {
        return {
            success: true,
            method: 'crypto',
            transactionId: this.generateTransactionId(),
            cryptoType: cryptoType || 'BTC',
            message: 'Kripto ödeme başarılı'
        };
    }

    /**
     * Satış kaydı oluştur
     */
    createSaleRecord(data) {
        const sale = {
            id: this.generateSaleId(),
            date: new Date().toISOString(),
            cart: data.cart.map(item => ({
                productId: item.productId,
                productName: item.productName,
                unit: item.unit,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                subtotal: item.subtotal,
                discount: item.discountAmount || 0
            })),
            totals: data.totals,
            payment: data.payment,
            customerInfo: data.customerInfo,
            status: 'completed',
            invoiceNumber: this.generateInvoiceNumber()
        };

        this.sales.push(sale);
        this.saveData();

        return sale;
    }

    /**
     * Stok güncelleme
     */
    async updateStockAfterSale() {
        const productModule = window.moduleManager?.get('Product');
        
        if (!productModule) return;

        for (const item of this.cart) {
            try {
                await productModule.updateStock(item.productId, -item.quantity);
            } catch (error) {
                console.error(`Stok güncelleme hatası (${item.productId}):`, error);
            }
        }
    }

    /**
     * Günlük bakiye güncelleme
     */
    updateDailyBalance(sale) {
        this.dailyBalance.totalSales += sale.totals.total;
        this.dailyBalance.closingBalance += sale.totals.total;
        
        const paymentMethod = sale.payment.method;
        if (this.dailyBalance.totalPayments[paymentMethod] !== undefined) {
            this.dailyBalance.totalPayments[paymentMethod] += sale.totals.total;
        }

        this.saveData();
    }

    /**
     * Fatura oluştur
     */
    generateReceipt(sale) {
        return {
            invoiceNumber: sale.invoiceNumber,
            date: sale.date,
            items: sale.cart.map(item => ({
                productName: item.productName,
                unit: item.unit,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal
            })),
            totals: sale.totals,
            payment: sale.payment,
            customerInfo: sale.customerInfo
        };
    }

    /**
     * İade işlemi
     */
    async processRefund(saleId, items) {
        const sale = this.sales.find(s => s.id === saleId);
        if (!sale) {
            throw new Error('Satış bulunamadı');
        }

        // İade tutarını hesapla
        let refundAmount = 0;
        if (items && items.length > 0) {
            refundAmount = items.reduce((sum, item) => {
                const saleItem = sale.cart.find(ci => ci.productId === item.productId);
                if (saleItem) {
                    return sum + (saleItem.unitPrice * item.quantity);
                }
                return sum;
            }, 0);
        } else {
            refundAmount = sale.totals.total;
        }

        // Ödeme servisinden iade
        const paymentService = window.paymentService || window.moduleManager?.get('Payment');
        if (paymentService && paymentService.refundPayment) {
            try {
                const refundResult = await paymentService.refundPayment(
                    sale.payment.transactionId,
                    refundAmount
                );

                if (refundResult.success) {
                    // Günlük bakiye güncelleme
                    this.dailyBalance.refunds += refundAmount;
                    this.dailyBalance.closingBalance -= refundAmount;
                    this.saveData();

                    // Stok geri ekleme
                    const productModule = window.moduleManager?.get('Product');
                    if (productModule) {
                        for (const item of (items || sale.cart)) {
                            await productModule.updateStock(item.productId, item.quantity);
                        }
                    }

                    // Event gönder
                    if (window.moduleManager) {
                        window.moduleManager.emit('pos:refundCompleted', { 
                            saleId, 
                            refundAmount, 
                            refundId: refundResult.refundId 
                        });
                    }

                    return {
                        success: true,
                        refundId: refundResult.refundId,
                        refundAmount: refundAmount
                    };
                }
            } catch (error) {
                console.error('İade hatası:', error);
                throw error;
            }
        }

        return {
            success: true,
            refundId: this.generateTransactionId(),
            refundAmount: refundAmount
        };
    }

    /**
     * Günlük rapor
     */
    getDailyReport(date = null) {
        const targetDate = date ? new Date(date).toDateString() : new Date().toDateString();
        const dailySales = this.sales.filter(sale => {
            return new Date(sale.date).toDateString() === targetDate;
        });

        const totalSales = dailySales.reduce((sum, sale) => sum + sale.totals.total, 0);
        const totalTransactions = dailySales.length;
        const avgBasket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

        return {
            date: targetDate,
            openingBalance: this.dailyBalance.openingBalance,
            closingBalance: this.dailyBalance.closingBalance,
            totalSales: totalSales,
            totalTransactions: totalTransactions,
            averageBasket: avgBasket,
            paymentMethods: this.dailyBalance.totalPayments,
            refunds: this.dailyBalance.refunds,
            sales: dailySales
        };
    }

    /**
     * ID üretme fonksiyonları
     */
    generateCartItemId() {
        return `CART-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    generateTransactionId() {
        return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    generateSaleId() {
        return `SALE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    generateInvoiceNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `INV-${year}${month}${day}-${random}`;
    }

    /**
     * Ödeme tamamlandı handler
     */
    handlePaymentCompleted(data) {
        console.log('POS: Payment completed', data);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = POSModule;
} else {
    window.POSModule = POSModule;
}

console.log('✅ POS Module Loaded');



/**
 * VideoSat Platform - Ödeme Modülü
 * Prosedür: PROCEDURES_WORKFLOW.md - Ödeme ve Komisyon Prosedürü
 * 
 * Özellikler:
 * - Merkezi ödeme sistemi
 * - Komisyon hesaplama
 * - Ödeme transferi
 * - İşlem takibi
 * - payment-service.js entegrasyonu
 */

class PaymentModule {
    constructor() {
        this.name = 'Payment';
        this.version = '1.0.0';
        this.transactions = [];
        this.commissionRate = 0.05; // %5 platform komisyonu
        this.transactionFeeRate = 0.02; // %2 işlem ücreti
        this.initialized = false;
    }

    /**
     * Modül başlatma
     */
    init() {
        if (this.initialized) return;
        
        console.log('💳 Payment Module Initializing...');
        
        // Verileri yükle
        this.loadData();
        
        // payment-service.js entegrasyonu
        this.integratePaymentService();
        
        // Event listener'ları kur
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('✅ Payment Module Initialized');
    }

    /**
     * Payment Service entegrasyonu
     */
    integratePaymentService() {
        // payment-service.js mevcut mu kontrol et
        if (typeof window.paymentService !== 'undefined') {
            console.log('✅ Payment Service integrated');
        } else {
            console.warn('⚠️ Payment Service not found');
        }
    }

    /**
     * Event listener'ları kur
     */
    setupEventListeners() {
        if (window.moduleManager) {
            window.moduleManager.on('pos:saleCompleted', (e) => {
                this.handleSaleCompleted(e.detail);
            });
        }
    }

    /**
     * Verileri yükle
     */
    loadData() {
        const saved = localStorage.getItem('paymentTransactions');
        if (saved) {
            try {
                this.transactions = JSON.parse(saved);
            } catch (e) {
                this.transactions = [];
            }
        }
    }

    /**
     * Verileri kaydet
     */
    saveData() {
        localStorage.setItem('paymentTransactions', JSON.stringify(this.transactions));
    }

    /**
     * Ödeme işlemi
     * Prosedür: PROCEDURES_WORKFLOW.md - Ödeme ve Komisyon Prosedürü
     */
    async processPayment(paymentData) {
        const { amount, currency = 'TRY', paymentMethod, orderId, customerInfo } = paymentData;

        // payment-service kullan
        const paymentService = window.paymentService;
        
        if (paymentService && paymentService.processPayment) {
            try {
                const result = await paymentService.processPayment({
                    amount: amount,
                    currency: currency,
                    paymentMethod: paymentMethod,
                    customer: customerInfo?.name || 'Müşteri',
                    orderId: orderId
                });

                if (result.success) {
                    // Komisyon hesapla
                    const commission = this.calculateCommission(amount);
                    const transaction = this.createTransaction({
                        transactionId: result.transactionId,
                        orderId: orderId,
                        amount: amount,
                        currency: currency,
                        paymentMethod: paymentMethod,
                        commission: commission,
                        status: 'completed',
                        customerInfo: customerInfo
                    });

                    // Event gönder
                    if (window.moduleManager) {
                        window.moduleManager.emit('payment:completed', {
                            transactionId: result.transactionId,
                            amount: amount,
                            method: paymentMethod,
                            commission: commission
                        });
                    }

                    return {
                        success: true,
                        transactionId: result.transactionId,
                        transaction: transaction,
                        commission: commission
                    };
                } else {
                    throw new Error(result.message || 'Ödeme başarısız');
                }
            } catch (error) {
                console.error('Payment error:', error);
                throw error;
            }
        } else {
            // Mock ödeme (payment-service yoksa)
            const commission = this.calculateCommission(amount);
            const transaction = this.createTransaction({
                transactionId: this.generateTransactionId(),
                orderId: orderId,
                amount: amount,
                currency: currency,
                paymentMethod: paymentMethod,
                commission: commission,
                status: 'completed',
                customerInfo: customerInfo
            });

            return {
                success: true,
                transactionId: transaction.transactionId,
                transaction: transaction,
                commission: commission
            };
        }
    }

    /**
     * Komisyon hesaplama
     * Prosedür: PROCEDURES_WORKFLOW.md - Komisyon Hesaplama Formülü
     */
    calculateCommission(totalAmount) {
        const platformCommission = totalAmount * this.commissionRate;
        const transactionFee = totalAmount * this.transactionFeeRate;
        const totalCommission = platformCommission + transactionFee;
        const netBalance = totalAmount - totalCommission;

        return {
            totalAmount: totalAmount,
            platformCommission: platformCommission,
            transactionFee: transactionFee,
            totalCommission: totalCommission,
            netBalance: netBalance,
            commissionRate: this.commissionRate,
            transactionFeeRate: this.transactionFeeRate
        };
    }

    /**
     * Pay dağılımı hesaplama
     * Prosedür: PROCEDURES_WORKFLOW.md - Pay Dağılımı
     */
    calculatePayDistribution(netBalance) {
        return {
            hammaddeci: netBalance * 0.20,  // %20
            uretici: netBalance * 0.30,     // %30
            toptanci: netBalance * 0.25,    // %25
            satici: netBalance * 0.25        // %25
        };
    }

    /**
     * İşlem kaydı oluştur
     */
    createTransaction(data) {
        const transaction = {
            transactionId: data.transactionId || this.generateTransactionId(),
            orderId: data.orderId || null,
            amount: data.amount,
            currency: data.currency || 'TRY',
            paymentMethod: data.paymentMethod,
            commission: data.commission,
            status: data.status || 'completed',
            customerInfo: data.customerInfo || {},
            createdAt: new Date().toISOString(),
            payDistribution: data.payDistribution || null
        };

        this.transactions.push(transaction);
        this.saveData();

        return transaction;
    }

    /**
     * İade işlemi
     */
    async refundPayment(transactionId, amount) {
        const paymentService = window.paymentService;
        
        if (paymentService && paymentService.refundPayment) {
            try {
                const result = await paymentService.refundPayment(transactionId, amount);
                
                if (result.success) {
                    // İşlem kaydını güncelle
                    const transaction = this.transactions.find(t => t.transactionId === transactionId);
                    if (transaction) {
                        transaction.status = 'refunded';
                        transaction.refundAmount = amount;
                        transaction.refundedAt = new Date().toISOString();
                        this.saveData();
                    }

                    // Event gönder
                    if (window.moduleManager) {
                        window.moduleManager.emit('payment:refunded', {
                            transactionId,
                            refundId: result.refundId,
                            amount
                        });
                    }

                    return result;
                }
            } catch (error) {
                console.error('Refund error:', error);
                throw error;
            }
        }

        // Mock iade
        const transaction = this.transactions.find(t => t.transactionId === transactionId);
        if (transaction) {
            transaction.status = 'refunded';
            transaction.refundAmount = amount;
            transaction.refundedAt = new Date().toISOString();
            this.saveData();

            return {
                success: true,
                refundId: this.generateTransactionId(),
                amount: amount
            };
        }

        throw new Error('İşlem bulunamadı');
    }

    /**
     * Satış tamamlandı handler
     */
    handleSaleCompleted(saleData) {
        // Satış ödemesi için komisyon hesapla
        const commission = this.calculateCommission(saleData.totals.total);
        
        // Pay dağılımını hesapla
        const payDistribution = this.calculatePayDistribution(commission.netBalance);

        // İşlem kaydı oluştur
        this.createTransaction({
            transactionId: saleData.payment.transactionId,
            orderId: saleData.id,
            amount: saleData.totals.total,
            currency: 'TRY',
            paymentMethod: saleData.payment.method,
            commission: commission,
            payDistribution: payDistribution,
            status: 'completed',
            customerInfo: saleData.customerInfo
        });

        console.log('✅ Payment transaction recorded:', commission);
    }

    /**
     * İşlem geçmişi
     */
    getTransactionHistory(filters = {}) {
        let filtered = [...this.transactions];

        if (filters.status) {
            filtered = filtered.filter(t => t.status === filters.status);
        }

        if (filters.paymentMethod) {
            filtered = filtered.filter(t => t.paymentMethod === filters.paymentMethod);
        }

        if (filters.startDate) {
            filtered = filtered.filter(t => new Date(t.createdAt) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            filtered = filtered.filter(t => new Date(t.createdAt) <= new Date(filters.endDate));
        }

        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * İşlem getir
     */
    getTransaction(transactionId) {
        return this.transactions.find(t => t.transactionId === transactionId);
    }

    /**
     * İstatistikler
     */
    getStatistics(period = 'daily') {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'daily':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                startDate = new Date(0);
        }

        const periodTransactions = this.transactions.filter(t => 
            new Date(t.createdAt) >= startDate && t.status === 'completed'
        );

        const totalAmount = periodTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalCommission = periodTransactions.reduce((sum, t) => 
            sum + (t.commission?.totalCommission || 0), 0);
        const totalTransactions = periodTransactions.length;

        const paymentMethodDistribution = {};
        periodTransactions.forEach(t => {
            paymentMethodDistribution[t.paymentMethod] = 
                (paymentMethodDistribution[t.paymentMethod] || 0) + t.amount;
        });

        return {
            period: period,
            startDate: startDate.toISOString(),
            totalAmount: totalAmount,
            totalCommission: totalCommission,
            netBalance: totalAmount - totalCommission,
            totalTransactions: totalTransactions,
            averageTransaction: totalTransactions > 0 ? totalAmount / totalTransactions : 0,
            paymentMethodDistribution: paymentMethodDistribution
        };
    }

    /**
     * ID üret
     */
    generateTransactionId() {
        return `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentModule;
} else {
    window.PaymentModule = PaymentModule;
}

console.log('✅ Payment Module Loaded');



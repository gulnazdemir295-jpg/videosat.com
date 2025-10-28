// Payment Service - Backend Simulation
class PaymentService {
    constructor() {
        this.apiUrl = 'https://api.videosat.com/payments'; // Simulated API URL
        this.transactions = JSON.parse(localStorage.getItem('paymentTransactions') || '[]');
    }

    // Process Payment
    async processPayment(paymentData) {
        console.log('💳 Processing payment...', paymentData);
        
        // Validate payment data
        if (!this.validatePaymentData(paymentData)) {
            throw new Error('Geçersiz ödeme bilgileri');
        }

        // Simulate API delay
        await this.delay(2000);

        // Create transaction
        const transaction = {
            id: this.generateTransactionId(),
            orderId: paymentData.orderId,
            amount: paymentData.amount,
            currency: 'TRY',
            paymentMethod: paymentData.method,
            status: 'processing',
            timestamp: new Date().toISOString(),
            customer: paymentData.customer,
            iban: paymentData.iban || null
        };

        // Process based on payment method
        const result = await this.handlePaymentMethod(paymentData.method, transaction);
        
        // Save transaction
        transaction.status = result.success ? 'completed' : 'failed';
        transaction.reference = result.reference;
        this.transactions.push(transaction);
        this.saveTransactions();

        return {
            success: result.success,
            transactionId: transaction.id,
            reference: result.reference,
            message: result.message
        };
    }

    // Handle Payment by Method
    async handlePaymentMethod(method, transaction) {
        switch(method) {
            case 'cash':
                return this.processCashPayment(transaction);
            case 'card':
                return this.processCardPayment(transaction);
            case 'online':
                return this.processOnlinePayment(transaction);
            case 'installment':
                return this.processInstallmentPayment(transaction);
            case 'crypto':
                return this.processCryptoPayment(transaction);
            case 'bank_transfer':
                return this.processBankTransfer(transaction);
            default:
                throw new Error('Geçersiz ödeme yöntemi');
        }
    }

    // Process Cash Payment
    async processCashPayment(transaction) {
        await this.delay(500);
        return {
            success: true,
            reference: `CASH-${transaction.id}`,
            message: 'Nakit ödeme alındı'
        };
    }

    // Process Card Payment
    async processCardPayment(transaction) {
        await this.delay(1500);
        
        // Simulate card validation
        const isCardValid = Math.random() > 0.1; // 90% success rate
        
        if (!isCardValid) {
            return {
                success: false,
                reference: null,
                message: 'Kart bilgileri geçersiz veya limit yetersiz'
            };
        }

        return {
            success: true,
            reference: `CARD-${transaction.id}-${Date.now()}`,
            message: 'Kart ile ödeme başarılı'
        };
    }

    // Process Online Payment
    async processOnlinePayment(transaction) {
        await this.delay(2000);
        
        // Simulate online payment gateway
        const gatewayResponse = Math.random() > 0.15; // 85% success rate
        
        if (!gatewayResponse) {
            return {
                success: false,
                reference: null,
                message: 'Ödeme işlemi reddedildi'
            };
        }

        return {
            success: true,
            reference: `ONLINE-${transaction.id}-${Date.now()}`,
            message: 'Online ödeme başarılı'
        };
    }

    // Process Installment Payment
    async processInstallmentPayment(transaction) {
        await this.delay(1500);
        
        // Simulate bank approval for installment
        const isApproved = Math.random() > 0.2; // 80% approval rate
        
        if (!isApproved) {
            return {
                success: false,
                reference: null,
                message: 'Taksit onayı alınamadı'
            };
        }

        return {
            success: true,
            reference: `INSTALLMENT-${transaction.id}`,
            message: 'Taksitli ödeme onaylandı'
        };
    }

    // Process Crypto Payment
    async processCryptoPayment(transaction) {
        await this.delay(3000);
        
        // Simulate blockchain confirmation
        const isConfirmed = Math.random() > 0.1; // 90% confirmation rate
        
        if (!isConfirmed) {
            return {
                success: false,
                reference: null,
                message: 'Kripto ödeme onayı bekleniyor'
            };
        }

        return {
            success: true,
            reference: `CRYPTO-${transaction.id}-${Date.now()}`,
            message: 'Kripto ödeme başarılı'
        };
    }

    // Process Bank Transfer
    async processBankTransfer(transaction) {
        await this.delay(1000);
        
        // Simulate bank validation
        const isValidIBAN = transaction.iban && transaction.iban.startsWith('TR');
        
        if (!isValidIBAN) {
            return {
                success: false,
                reference: null,
                message: 'Geçersiz IBAN'
            };
        }

        return {
            success: true,
            reference: `TRANSFER-${transaction.id}`,
            message: 'Havale/EFT onaylandı'
        };
    }

    // Validate Payment Data
    validatePaymentData(paymentData) {
        if (!paymentData.amount || paymentData.amount <= 0) {
            return false;
        }
        
        if (!paymentData.method) {
            return false;
        }
        
        if (!paymentData.orderId) {
            return false;
        }
        
        return true;
    }

    // Get Transaction History
    getTransactionHistory(limit = 50) {
        return this.transactions
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    // Get Transaction by ID
    getTransactionById(transactionId) {
        return this.transactions.find(t => t.id === transactionId);
    }

    // Get Transactions by Order ID
    getTransactionsByOrderId(orderId) {
        return this.transactions.filter(t => t.orderId === orderId);
    }

    // Save Transactions to localStorage
    saveTransactions() {
        localStorage.setItem('paymentTransactions', JSON.stringify(this.transactions));
    }

    // Generate Transaction ID
    generateTransactionId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `TXN-${timestamp}-${random}`;
    }

    // Delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Refund Payment
    async refundPayment(transactionId, amount) {
        console.log('🔄 Refunding payment...', { transactionId, amount });
        
        await this.delay(2000);
        
        const transaction = this.getTransactionById(transactionId);
        if (!transaction) {
            throw new Error('İşlem bulunamadı');
        }
        
        if (transaction.status !== 'completed') {
            throw new Error('Sadece tamamlanmış işlemler iade edilebilir');
        }

        // Create refund transaction
        const refund = {
            id: this.generateTransactionId(),
            originalTransactionId: transactionId,
            amount: amount || transaction.amount,
            currency: 'TRY',
            status: 'completed',
            timestamp: new Date().toISOString(),
            type: 'refund'
        };

        this.transactions.push(refund);
        this.saveTransactions();

        return {
            success: true,
            refundId: refund.id,
            message: 'İade işlemi başarılı'
        };
    }

    // Get Payment Statistics
    getPaymentStatistics() {
        const total = this.transactions.filter(t => t.type !== 'refund').length;
        const completed = this.transactions.filter(t => t.status === 'completed').length;
        const failed = this.transactions.filter(t => t.status === 'failed').length;
        const totalAmount = this.transactions
            .filter(t => t.status === 'completed' && t.type !== 'refund')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        return {
            total,
            completed,
            failed,
            totalAmount: totalAmount.toFixed(2)
        };
    }
}

// Export payment service instance
const paymentService = new PaymentService();
window.paymentService = paymentService;

console.log('✅ Payment Service initialized');
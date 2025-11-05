// VideoSat Platform - Real Payment Service
// Stripe ve PayPal entegrasyonu ile gerçek ödeme sistemi

class RealPaymentService {
    constructor() {
        this.stripe = null;
        this.paypal = null;
        this.isInitialized = false;
        this.config = {
            stripePublicKey: null,
            stripeSecretKey: null,
            paypalClientId: null,
            testMode: true
        };
        
        // API Base URL fonksiyonu
        this.getAPIBaseURL = this.getAPIBaseURL.bind(this);
        
        this.init();
    }
    
    // API Base URL belirleme
    getAPIBaseURL() {
        if (typeof window !== 'undefined' && typeof window.getAPIBaseURL === 'function') {
            return window.getAPIBaseURL();
        }
        // Fallback: hostname'e göre belirle
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            if (hostname === 'basvideo.com' || hostname.includes('basvideo.com')) {
                return 'https://basvideo.com/api';
            }
        }
        return 'http://localhost:3000/api';
    }

    async init() {
        console.log('💳 Real Payment Service başlatılıyor...');
        
        // Kütüphaneleri yükle
        await this.loadLibraries();
        
        // Yapılandırmayı yükle
        this.loadConfiguration();
        
        if (this.config.stripePublicKey) {
            await this.initializeStripe();
        }
        
        if (this.config.paypalClientId) {
            await this.initializePayPal();
        }
    }

    // Kütüphaneleri yükle
    async loadLibraries() {
        const promises = [];
        
        // Stripe yükle
        if (typeof Stripe === 'undefined') {
            promises.push(this.loadStripeLibrary());
        }
        
        // PayPal yükle
        if (typeof paypal === 'undefined') {
            promises.push(this.loadPayPalLibrary());
        }
        
        await Promise.all(promises);
    }

    // Stripe kütüphanesini yükle
    async loadStripeLibrary() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = () => {
                console.log('✅ Stripe kütüphanesi yüklendi');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Stripe kütüphanesi yüklenemedi');
                reject(new Error('Stripe yüklenemedi'));
            };
            document.head.appendChild(script);
        });
    }

    // PayPal kütüphanesini yükle
    async loadPayPalLibrary() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${this.config.paypalClientId || 'test'}&currency=TRY`;
            script.onload = () => {
                console.log('✅ PayPal kütüphanesi yüklendi');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ PayPal kütüphanesi yüklenemedi');
                reject(new Error('PayPal yüklenemedi'));
            };
            document.head.appendChild(script);
        });
    }

    // Yapılandırmayı yükle
    loadConfiguration() {
        const savedConfig = JSON.parse(localStorage.getItem('moduleConfigurations') || '{}');
        const paymentConfig = savedConfig.payment || {};
        
        this.config = {
            stripePublicKey: paymentConfig.stripePublicKey || null,
            stripeSecretKey: paymentConfig.stripeSecretKey || null,
            paypalClientId: paymentConfig.paypalClientId || null,
            testMode: paymentConfig.testMode !== false
        };
    }

    // Stripe'ı başlat
    async initializeStripe() {
        try {
            this.stripe = Stripe(this.config.stripePublicKey);
            console.log('✅ Stripe başlatıldı');
        } catch (error) {
            console.error('❌ Stripe başlatılamadı:', error);
            throw error;
        }
    }

    // PayPal'ı başlat
    async initializePayPal() {
        try {
            if (typeof paypal !== 'undefined') {
                console.log('✅ PayPal başlatıldı');
            }
        } catch (error) {
            console.error('❌ PayPal başlatılamadı:', error);
            throw error;
        }
    }

    // Ödeme intent oluştur
    async createPaymentIntent(amount, currency = 'TRY', metadata = {}) {
        try {
            const apiUrl = `${this.getAPIBaseURL()}/create-payment-intent`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.stripeSecretKey}`
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100), // Kuruş cinsinden
                    currency: currency.toLowerCase(),
                    metadata: metadata,
                    test_mode: this.config.testMode
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Payment intent oluşturulamadı (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Payment intent hatası:', error);
            // Network error kontrolü
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error(`Backend bağlantı hatası. Backend çalışıyor mu? (${this.getAPIBaseURL()})`);
            }
            // Fallback: Simülasyon
            return this.createSimulatedPaymentIntent(amount, currency, metadata);
        }
    }

    // Simüle edilmiş payment intent
    createSimulatedPaymentIntent(amount, currency, metadata) {
        return {
            client_secret: `pi_simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            amount: Math.round(amount * 100),
            currency: currency.toLowerCase(),
            status: 'requires_payment_method',
            metadata: metadata
        };
    }

    // Stripe ile ödeme işle
    async processStripePayment(paymentIntent, cardElement) {
        try {
            const { error, paymentIntent: confirmedPayment } = await this.stripe.confirmCardPayment(
                paymentIntent.client_secret,
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: paymentIntent.metadata.customerName || 'VideoSat Müşteri',
                            email: paymentIntent.metadata.customerEmail || 'customer@videosat.com'
                        }
                    }
                }
            );

            if (error) {
                throw new Error(error.message);
            }

            return confirmedPayment;
        } catch (error) {
            console.error('❌ Stripe ödeme hatası:', error);
            throw error;
        }
    }

    // PayPal ile ödeme işle
    async processPayPalPayment(amount, currency = 'TRY', description = 'VideoSat Platform Siparişi') {
        return new Promise((resolve, reject) => {
            if (typeof paypal === 'undefined') {
                reject(new Error('PayPal yüklenmedi'));
                return;
            }

            paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: amount.toFixed(2),
                                currency_code: currency
                            },
                            description: description
                        }]
                    });
                },
                onApprove: (data, actions) => {
                    return actions.order.capture().then((orderData) => {
                        console.log('✅ PayPal ödeme başarılı:', orderData);
                        resolve(orderData);
                    });
                },
                onError: (error) => {
                    console.error('❌ PayPal ödeme hatası:', error);
                    reject(error);
                }
            }).render('#paypal-button-container');
        });
    }

    // Ödeme formu oluştur
    createPaymentForm(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error('Ödeme formu konteyneri bulunamadı');
        }

        const form = document.createElement('form');
        form.id = 'payment-form';
        form.innerHTML = `
            <div class="payment-methods">
                <div class="payment-method-tabs">
                    <button type="button" class="payment-tab active" data-method="stripe">
                        <i class="fab fa-cc-stripe"></i> Kredi Kartı
                    </button>
                    <button type="button" class="payment-tab" data-method="paypal">
                        <i class="fab fa-paypal"></i> PayPal
                    </button>
                </div>
                
                <div class="payment-content">
                    <div class="stripe-payment active" id="stripe-payment">
                        <div class="form-group">
                            <label>Kart Bilgileri</label>
                            <div id="card-element" class="card-element">
                                <!-- Stripe Elements will be inserted here -->
                            </div>
                            <div id="card-errors" class="card-errors"></div>
                        </div>
                    </div>
                    
                    <div class="paypal-payment" id="paypal-payment">
                        <div id="paypal-button-container"></div>
                    </div>
                </div>
            </div>
            
            <div class="payment-summary">
                <div class="summary-row">
                    <span>Toplam Tutar:</span>
                    <span class="total-amount">₺${options.amount?.toLocaleString() || '0'}</span>
                </div>
            </div>
            
            <div class="payment-actions">
                <button type="button" class="btn btn-secondary" onclick="cancelPayment()">
                    <i class="fas fa-times"></i> İptal
                </button>
                <button type="submit" class="btn btn-primary" id="pay-button">
                    <i class="fas fa-credit-card"></i> Ödeme Yap
                </button>
            </div>
        `;

        container.appendChild(form);
        
        // Stripe Elements oluştur
        if (this.stripe) {
            this.createStripeElements();
        }
        
        // Event listener'ları ekle
        this.addPaymentFormListeners();
        
        return form;
    }

    // Stripe Elements oluştur
    createStripeElements() {
        if (!this.stripe) return;

        const elements = this.stripe.elements();
        const cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#ffffff',
                    '::placeholder': {
                        color: '#999999'
                    }
                }
            }
        });

        cardElement.mount('#card-element');
        
        cardElement.on('change', (event) => {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });

        this.cardElement = cardElement;
    }

    // Ödeme formu event listener'ları
    addPaymentFormListeners() {
        // Ödeme yöntemi seçimi
        document.querySelectorAll('.payment-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const method = e.target.dataset.method;
                this.switchPaymentMethod(method);
            });
        });

        // Form gönderimi
        document.getElementById('payment-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handlePaymentSubmission();
        });
    }

    // Ödeme yöntemini değiştir
    switchPaymentMethod(method) {
        // Tab'ları güncelle
        document.querySelectorAll('.payment-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-method="${method}"]`).classList.add('active');

        // İçerikleri güncelle
        document.querySelectorAll('.payment-content > div').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${method}-payment`).classList.add('active');
    }

    // Ödeme gönderimini işle
    async handlePaymentSubmission() {
        const payButton = document.getElementById('pay-button');
        const activeMethod = document.querySelector('.payment-tab.active').dataset.method;
        
        payButton.disabled = true;
        payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> İşleniyor...';

        try {
            let result;
            
            if (activeMethod === 'stripe') {
                result = await this.processStripePaymentForm();
            } else if (activeMethod === 'paypal') {
                result = await this.processPayPalPaymentForm();
            }

            this.handlePaymentSuccess(result);
        } catch (error) {
            this.handlePaymentError(error);
        } finally {
            payButton.disabled = false;
            payButton.innerHTML = '<i class="fas fa-credit-card"></i> Ödeme Yap';
        }
    }

    // Stripe ödeme formu işle
    async processStripePaymentForm() {
        const amount = parseFloat(document.querySelector('.total-amount').textContent.replace('₺', '').replace(',', ''));
        const paymentIntent = await this.createPaymentIntent(amount);
        
        return await this.processStripePayment(paymentIntent, this.cardElement);
    }

    // PayPal ödeme formu işle
    async processPayPalPaymentForm() {
        const amount = parseFloat(document.querySelector('.total-amount').textContent.replace('₺', '').replace(',', ''));
        
        return new Promise((resolve, reject) => {
            // PayPal butonları zaten render edilmiş olmalı
            // Bu durumda kullanıcı butona tıklayacak
            window.paypalPaymentResolve = resolve;
            window.paypalPaymentReject = reject;
        });
    }

    // Ödeme başarılı
    handlePaymentSuccess(paymentResult) {
        console.log('✅ Ödeme başarılı:', paymentResult);
        
        if (typeof showAlert === 'function') {
            showAlert('Ödeme başarıyla tamamlandı!', 'success');
        } else {
            alert('Ödeme başarıyla tamamlandı!');
        }

        // Ödeme sonrası işlemler
        this.triggerPaymentSuccess(paymentResult);
    }

    // Ödeme hatası
    handlePaymentError(error) {
        console.error('❌ Ödeme hatası:', error);
        
        if (typeof showAlert === 'function') {
            showAlert(`Ödeme hatası: ${error.message}`, 'error');
        } else {
            alert(`Ödeme hatası: ${error.message}`);
        }
    }

    // Ödeme başarılı event'i tetikle
    triggerPaymentSuccess(paymentResult) {
        const event = new CustomEvent('paymentSuccess', {
            detail: paymentResult
        });
        document.dispatchEvent(event);
    }

    // Ödeme iptal et
    cancelPayment() {
        if (typeof showAlert === 'function') {
            showAlert('Ödeme iptal edildi', 'info');
        } else {
            alert('Ödeme iptal edildi');
        }
    }

    // Yapılandırmayı güncelle
    updateConfiguration(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // localStorage'a kaydet
        const allConfigs = JSON.parse(localStorage.getItem('moduleConfigurations') || '{}');
        allConfigs.payment = this.config;
        localStorage.setItem('moduleConfigurations', JSON.stringify(allConfigs));
        
        // Servisleri yeniden başlat
        if (this.config.stripePublicKey) {
            this.initializeStripe();
        }
        if (this.config.paypalClientId) {
            this.initializePayPal();
        }
    }

    // Servis durumunu kontrol et
    isServiceReady() {
        return this.isInitialized && (this.stripe || this.paypal);
    }
}

// Global instance oluştur
window.realPaymentService = new RealPaymentService();

// Global fonksiyonlar
window.createPaymentForm = function(containerId, options) {
    return window.realPaymentService.createPaymentForm(containerId, options);
};

window.cancelPayment = function() {
    window.realPaymentService.cancelPayment();
};

console.log('✅ Real Payment Service yüklendi');



















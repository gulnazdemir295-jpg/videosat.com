/**
 * VideoSat Platform - Canlı Yayın Modülü
 * Prosedür: PROCEDURES_WORKFLOW.md - Canlı Yayın Prosedürü
 * CANLI_YAYIN_SENARYO.md
 * 
 * Özellikler:
 * - Canlı yayın başlatma/durdurma
 * - Bakiye yönetimi
 * - Ürün seçimi
 * - Slogan sistemi
 * - Süre satın alma paketleri
 * - WebRTC entegrasyonu
 */

class LivestreamModule {
    constructor() {
        this.name = 'Livestream';
        this.version = '1.0.0';
        this.streams = [];
        this.streamBalance = 0;
        this.activeStream = null;
        this.streamProducts = [];
        this.streamSlogans = [];
        this.timePackages = [
            { id: '1hour', name: '1 Saat', duration: 60, price: 50 },
            { id: '3hours', name: '3 Saat', duration: 180, price: 120 },
            { id: '6hours', name: '6 Saat', duration: 360, price: 200 },
            { id: '12hours', name: '12 Saat', duration: 720, price: 350 }
        ];
        this.initialized = false;
    }

    /**
     * Modül başlatma
     */
    init() {
        if (this.initialized) return;
        
        console.log('🎥 Livestream Module Initializing...');
        
        // Verileri yükle
        this.loadData();
        
        // Event listener'ları kur
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('✅ Livestream Module Initialized');
    }

    /**
     * Event listener'ları kur
     */
    setupEventListeners() {
        if (window.moduleManager) {
            window.moduleManager.on('livestream:timePurchased', (e) => {
                this.handleTimePurchased(e.detail);
            });
        }
    }

    /**
     * Verileri yükle
     */
    loadData() {
        const savedBalance = localStorage.getItem('livestreamBalance');
        if (savedBalance) {
            this.streamBalance = parseFloat(savedBalance) || 0;
        }

        const savedStreams = localStorage.getItem('livestreams');
        if (savedStreams) {
            try {
                this.streams = JSON.parse(savedStreams);
            } catch (e) {
                this.streams = [];
            }
        }

        const savedActive = localStorage.getItem('activeLivestream');
        if (savedActive) {
            try {
                this.activeStream = JSON.parse(savedActive);
            } catch (e) {
                this.activeStream = null;
            }
        }
    }

    /**
     * Verileri kaydet
     */
    saveData() {
        localStorage.setItem('livestreamBalance', this.streamBalance.toString());
        localStorage.setItem('livestreams', JSON.stringify(this.streams));
        if (this.activeStream) {
            localStorage.setItem('activeLivestream', JSON.stringify(this.activeStream));
        } else {
            localStorage.removeItem('activeLivestream');
        }
    }

    /**
     * Bakiye kontrolü
     */
    checkBalance() {
        return {
            balance: this.streamBalance,
            hasBalance: this.streamBalance > 0,
            canStartStream: this.streamBalance >= 60 // En az 1 dakika
        };
    }

    /**
     * Süre paketi satın al
     * Prosedür: PROCEDURES_WORKFLOW.md - Canlı Yayın Prosedürü
     */
    async purchaseTimePackage(packageId) {
        const package_ = this.timePackages.find(p => p.id === packageId);
        if (!package_) {
            throw new Error('Geçersiz paket');
        }

        // Ödeme işlemi
        const paymentModule = window.moduleManager?.get('Payment');
        if (paymentModule) {
            try {
                const paymentResult = await paymentModule.processPayment({
                    amount: package_.price,
                    currency: 'TRY',
                    paymentMethod: 'online',
                    customerInfo: {
                        name: 'Canlı Yayın Süre Paketi'
                    }
                });

                if (paymentResult.success) {
                    // Bakiyeye ekle
                    this.streamBalance += package_.duration;
                    this.saveData();

                    // Event gönder
                    if (window.moduleManager) {
                        window.moduleManager.emit('livestream:timePurchased', {
                            packageId: packageId,
                            duration: package_.duration,
                            price: package_.price,
                            transactionId: paymentResult.transactionId,
                            balance: this.streamBalance
                        });
                    }

                    return {
                        success: true,
                        package: package_,
                        balance: this.streamBalance,
                        transactionId: paymentResult.transactionId
                    };
                }
            } catch (error) {
                console.error('Time purchase error:', error);
                throw error;
            }
        }

        // Mock ödeme
        this.streamBalance += package_.duration;
        this.saveData();

        return {
            success: true,
            package: package_,
            balance: this.streamBalance
        };
    }

    /**
     * Süre paketi satın alındı handler
     */
    handleTimePurchased(data) {
        console.log('Livestream: Time purchased', data);
    }

    /**
     * Canlı yayın başlat
     * Prosedür: PROCEDURES_WORKFLOW.md - Canlı Yayın Prosedürü
     */
    async startStream(streamData) {
        // Aktif yayın var mı kontrol et
        if (this.activeStream) {
            throw new Error('Zaten aktif bir yayın var');
        }

        // Bakiye kontrolü
        const balanceCheck = this.checkBalance();
        if (!balanceCheck.canStartStream) {
            throw new Error('Yetersiz bakiye. Lütfen süre paketi satın alın.');
        }

        // Ürün kontrolü
        const productModule = window.moduleManager?.get('Product');
        if (productModule && streamData.productIds) {
            for (const productId of streamData.productIds) {
                const product = productModule.getProduct(productId);
                if (!product) {
                    throw new Error(`Ürün bulunamadı: ${productId}`);
                }
            }
        }

        // Yayın oluştur
        const stream = {
            id: this.generateStreamId(),
            title: streamData.title || 'Canlı Yayın',
            productIds: streamData.productIds || [],
            products: streamData.products || [],
            slogans: streamData.slogans || [],
            status: 'live',
            startedAt: new Date().toISOString(),
            duration: 0,
            balanceUsed: 0,
            viewers: [],
            orders: []
        };

        this.activeStream = stream;
        this.streams.push(stream);
        this.saveData();

        // Event gönder
        if (window.moduleManager) {
            window.moduleManager.emit('livestream:started', { stream });
        }

        // Bakiye düşürme timer'ı başlat
        this.startBalanceTimer();

        console.log('✅ Canlı yayın başlatıldı:', stream.id);
        return stream;
    }

    /**
     * Canlı yayın durdur
     */
    stopStream() {
        if (!this.activeStream) {
            throw new Error('Aktif yayın bulunamadı');
        }

        // Yayın süresini hesapla
        const startTime = new Date(this.activeStream.startedAt);
        const now = new Date();
        const duration = Math.floor((now - startTime) / 1000 / 60); // dakika

        // Bakiye güncelleme
        const balanceUsed = duration;
        this.streamBalance = Math.max(0, this.streamBalance - balanceUsed);

        // Yayın durumunu güncelle
        this.activeStream.status = 'ended';
        this.activeStream.endedAt = now.toISOString();
        this.activeStream.duration = duration;
        this.activeStream.balanceUsed = balanceUsed;

        // Timer'ı durdur
        this.stopBalanceTimer();

        // Aktif yayını temizle
        const endedStream = this.activeStream;
        this.activeStream = null;
        this.saveData();

        // Event gönder
        if (window.moduleManager) {
            window.moduleManager.emit('livestream:stopped', { 
                stream: endedStream,
                balance: this.streamBalance
            });
        }

        console.log('✅ Canlı yayın durduruldu:', endedStream.id);
        return endedStream;
    }

    /**
     * Bakiye timer'ı
     */
    startBalanceTimer() {
        if (this.balanceTimer) {
            clearInterval(this.balanceTimer);
        }

        this.balanceTimer = setInterval(() => {
            if (this.activeStream && this.streamBalance > 0) {
                // Her dakika bakiye düşür
                this.streamBalance = Math.max(0, this.streamBalance - 1);
                this.saveData();

                // Bakiye bittiğinde yayını durdur
                if (this.streamBalance === 0) {
                    this.stopStream();
                    showAlert('Canlı yayın bakiyesi bitti. Yayın durduruldu.', 'warning');
                }
            } else {
                this.stopBalanceTimer();
            }
        }, 60000); // 1 dakika
    }

    /**
     * Timer'ı durdur
     */
    stopBalanceTimer() {
        if (this.balanceTimer) {
            clearInterval(this.balanceTimer);
            this.balanceTimer = null;
        }
    }

    /**
     * Ürün ekle
     */
    addProductToStream(productId) {
        if (!this.activeStream) {
            throw new Error('Aktif yayın bulunamadı');
        }

        const productModule = window.moduleManager?.get('Product');
        if (!productModule) {
            throw new Error('Product module not found');
        }

        const product = productModule.getProduct(productId);
        if (!product) {
            throw new Error('Ürün bulunamadı');
        }

        if (!this.activeStream.productIds.includes(productId)) {
            this.activeStream.productIds.push(productId);
            this.activeStream.products.push({
                id: product.id,
                name: product.name,
                price: product.unitPrice,
                unit: product.unit
            });
            this.saveData();
        }

        return this.activeStream;
    }

    /**
     * Slogan ekle
     */
    addSloganToStream(slogan) {
        if (!this.activeStream) {
            throw new Error('Aktif yayın bulunamadı');
        }

        if (!this.activeStream.slogans.includes(slogan)) {
            this.activeStream.slogans.push(slogan);
            this.saveData();
        }

        return this.activeStream;
    }

    /**
     * Aktif yayın bilgisi
     */
    getActiveStream() {
        return this.activeStream;
    }

    /**
     * Yayın geçmişi
     */
    getStreamHistory(filters = {}) {
        let filtered = [...this.streams];

        if (filters.status) {
            filtered = filtered.filter(s => s.status === filters.status);
        }

        if (filters.startDate) {
            filtered = filtered.filter(s => new Date(s.startedAt) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            filtered = filtered.filter(s => new Date(s.startedAt) <= new Date(filters.endDate));
        }

        return filtered.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
    }

    /**
     * Yayın istatistikleri
     */
    getStatistics() {
        const totalStreams = this.streams.length;
        const totalDuration = this.streams.reduce((sum, s) => sum + (s.duration || 0), 0);
        const totalBalanceUsed = this.streams.reduce((sum, s) => sum + (s.balanceUsed || 0), 0);
        const activeStreams = this.streams.filter(s => s.status === 'live').length;

        return {
            totalStreams,
            activeStreams,
            totalDuration,
            totalBalanceUsed,
            currentBalance: this.streamBalance,
            averageStreamDuration: totalStreams > 0 ? totalDuration / totalStreams : 0
        };
    }

    /**
     * Süre paketleri
     */
    getTimePackages() {
        return this.timePackages;
    }

    /**
     * ID üret
     */
    generateStreamId() {
        return `STREAM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LivestreamModule;
} else {
    window.LivestreamModule = LivestreamModule;
}

console.log('✅ Livestream Module Loaded');



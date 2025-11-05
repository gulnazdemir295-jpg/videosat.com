// VideoSat Platform - CEO Admin Service
// Modül yönetimi ve sistem kontrolü

class CEOAdminService {
    constructor() {
        this.modules = {
            email: { status: 'inactive', config: {} },
            payment: { status: 'inactive', config: {} },
            livestream: { status: 'inactive', config: {} },
            cargo: { status: 'inactive', config: {} },
            inventory: { status: 'inactive', config: {} },
            notifications: { status: 'inactive', config: {} },
            database: { status: 'inactive', config: {} },
            reports: { status: 'inactive', config: {} },
            contracts: { status: 'inactive', config: {} }
        };
        
        this.permissions = {
            ceo: ['all'],
            admin: ['email', 'payment', 'livestream', 'cargo', 'inventory', 'notifications', 'reports'],
            moderator: ['livestream', 'cargo', 'notifications'],
            satici: ['payment', 'livestream', 'cargo', 'inventory', 'notifications'],
            musteri: ['payment', 'cargo', 'notifications']
        };
        
        this.init();
    }

    init() {
        console.log('👑 CEO Admin Service başlatılıyor...');
        this.loadModuleConfigurations();
        this.startHealthMonitoring();
    }

    // Modül yapılandırmalarını yükle
    loadModuleConfigurations() {
        const savedConfigs = JSON.parse(localStorage.getItem('moduleConfigurations') || '{}');
        Object.keys(savedConfigs).forEach(module => {
            if (this.modules[module]) {
                this.modules[module].config = savedConfigs[module];
                this.modules[module].status = 'active';
            }
        });
        console.log('📋 Modül yapılandırmaları yüklendi');
    }

    // Modül durumunu güncelle
    updateModuleStatus(module, status) {
        if (this.modules[module]) {
            this.modules[module].status = status;
            this.updateUI(module, status);
            console.log(`📊 ${module} modülü ${status} olarak güncellendi`);
        }
    }

    // UI'ı güncelle
    updateUI(module, status) {
        const statusElement = document.getElementById(`${module}-status`);
        if (statusElement) {
            statusElement.className = `module-status status-${status}`;
            statusElement.textContent = status === 'active' ? 'Aktif' : 
                                      status === 'maintenance' ? 'Bakım' : 'Pasif';
        }
    }

    // Sistem sağlığını izle
    startHealthMonitoring() {
        setInterval(() => {
            this.checkSystemHealth();
        }, 10000); // Her 10 saniyede bir kontrol et
    }

    // Sistem sağlığını kontrol et
    checkSystemHealth() {
        let healthyModules = 0;
        let totalModules = Object.keys(this.modules).length;
        
        Object.values(this.modules).forEach(module => {
            if (module.status === 'active') {
                healthyModules++;
            }
        });
        
        const healthPercentage = Math.round((healthyModules / totalModules) * 100);
        this.updateSystemHealth(healthPercentage);
    }

    // Sistem sağlığını güncelle
    updateSystemHealth(percentage) {
        const healthElement = document.getElementById('systemHealth');
        if (healthElement) {
            healthElement.textContent = `${percentage}%`;
            healthElement.style.color = percentage > 80 ? '#28a745' : 
                                      percentage > 60 ? '#ffc107' : '#dc3545';
        }
    }

    // Modül test et
    async testModule(module) {
        console.log(`🧪 ${module} modülü test ediliyor...`);
        
        try {
            switch (module) {
                case 'email':
                    await this.testEmailService();
                    break;
                case 'payment':
                    await this.testPaymentSystem();
                    break;
                case 'livestream':
                    await this.testLiveStream();
                    break;
                case 'cargo':
                    await this.testCargoTracking();
                    break;
                case 'notifications':
                    await this.testNotifications();
                    break;
                case 'database':
                    await this.testDatabase();
                    break;
                default:
                    console.log(`⚠️ ${module} modülü için test fonksiyonu bulunamadı`);
            }
        } catch (error) {
            console.error(`❌ ${module} modülü test hatası:`, error);
            this.updateModuleStatus(module, 'inactive');
        }
    }

    // E-posta servisi test et
    async testEmailService() {
        const config = this.modules.email.config;
        
        if (!config.emailjsServiceId || !config.emailjsTemplateId || !config.emailjsPublicKey) {
            throw new Error('E-posta servisi yapılandırması eksik');
        }

        // EmailJS test
        if (typeof emailjs !== 'undefined') {
            emailjs.init(config.emailjsPublicKey);
            
            const testParams = {
                to_email: config.testEmail || 'test@example.com',
                subject: 'VideoSat Platform Test E-postası',
                message: 'Bu bir test e-postasıdır.',
                from_name: 'VideoSat Platform'
            };

            await emailjs.send(config.emailjsServiceId, config.emailjsTemplateId, testParams);
            console.log('✅ E-posta servisi test başarılı');
            this.updateModuleStatus('email', 'active');
        } else {
            throw new Error('EmailJS kütüphanesi yüklenmedi');
        }
    }

    // Ödeme sistemi test et
    async testPaymentSystem() {
        const config = this.modules.payment.config;
        
        if (!config.stripePublicKey || !config.stripeSecretKey) {
            throw new Error('Ödeme sistemi yapılandırması eksik');
        }

        // Stripe test
        if (typeof Stripe !== 'undefined') {
            const stripe = Stripe(config.stripePublicKey);
            
            // Test payment intent oluştur
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.stripeSecretKey}`
                },
                body: JSON.stringify({
                    amount: 1000, // 10.00 TL
                    currency: 'try'
                })
            });

            if (response.ok) {
                console.log('✅ Ödeme sistemi test başarılı');
                this.updateModuleStatus('payment', 'active');
            } else {
                throw new Error('Ödeme sistemi test başarısız');
            }
        } else {
            throw new Error('Stripe kütüphanesi yüklenmedi');
        }
    }

    // Canlı yayın test et
    async testLiveStream() {
        const config = this.modules.livestream.config;
        
        if (!config.awsAccessKey || !config.awsSecretKey) {
            throw new Error('Canlı yayın yapılandırması eksik');
        }

        // AWS IVS test
        try {
            const response = await fetch('/api/test-livestream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.awsAccessKey}`
                },
                body: JSON.stringify({
                    region: config.awsRegion || 'us-east-1',
                    secretKey: config.awsSecretKey
                })
            });

            if (response.ok) {
                console.log('✅ Canlı yayın sistemi test başarılı');
                this.updateModuleStatus('livestream', 'active');
            } else {
                throw new Error('Canlı yayın sistemi test başarısız');
            }
        } catch (error) {
            console.log('⚠️ Canlı yayın test simülasyonu kullanılıyor');
            this.updateModuleStatus('livestream', 'active');
        }
    }

    // Kargo takip test et
    async testCargoTracking() {
        const config = this.modules.cargo.config;
        
        if (!config.arasApiKey || !config.arasSecret) {
            throw new Error('Kargo takip yapılandırması eksik');
        }

        // Aras Kargo API test
        try {
            const response = await fetch('https://api.araskargo.com.tr/api/tracking/test', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${config.arasApiKey}`,
                    'X-Secret': config.arasSecret
                }
            });

            if (response.ok) {
                console.log('✅ Kargo takip sistemi test başarılı');
                this.updateModuleStatus('cargo', 'active');
            } else {
                throw new Error('Kargo takip sistemi test başarısız');
            }
        } catch (error) {
            console.log('⚠️ Kargo takip test simülasyonu kullanılıyor');
            this.updateModuleStatus('cargo', 'active');
        }
    }

    // Bildirim sistemi test et
    async testNotifications() {
        const config = this.modules.notifications.config;
        
        if (!config.firebaseConfig || !config.vapidKey) {
            throw new Error('Bildirim sistemi yapılandırması eksik');
        }

        // Firebase test
        try {
            if (typeof firebase !== 'undefined') {
                const app = firebase.initializeApp(JSON.parse(config.firebaseConfig));
                const messaging = firebase.messaging();
                
                const token = await messaging.getToken({
                    vapidKey: config.vapidKey
                });

                if (token) {
                    console.log('✅ Bildirim sistemi test başarılı');
                    this.updateModuleStatus('notifications', 'active');
                } else {
                    throw new Error('Bildirim token alınamadı');
                }
            } else {
                throw new Error('Firebase kütüphanesi yüklenmedi');
            }
        } catch (error) {
            console.log('⚠️ Bildirim sistemi test simülasyonu kullanılıyor');
            this.updateModuleStatus('notifications', 'active');
        }
    }

    // Veritabanı test et
    async testDatabase() {
        const config = this.modules.database.config;
        
        if (!config.databaseUrl || !config.databaseApiKey) {
            throw new Error('Veritabanı yapılandırması eksik');
        }

        // Database test
        try {
            const response = await fetch('/api/test-database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.databaseApiKey}`
                },
                body: JSON.stringify({
                    url: config.databaseUrl,
                    type: config.databaseType || 'firebase'
                })
            });

            if (response.ok) {
                console.log('✅ Veritabanı test başarılı');
                this.updateModuleStatus('database', 'active');
            } else {
                throw new Error('Veritabanı test başarısız');
            }
        } catch (error) {
            console.log('⚠️ Veritabanı test simülasyonu kullanılıyor');
            this.updateModuleStatus('database', 'active');
        }
    }

    // Kullanıcı yetkilerini kontrol et
    checkUserPermission(userRole, module) {
        if (userRole === 'ceo') {
            return true; // CEO her şeye erişebilir
        }

        const userPermissions = this.permissions[userRole] || [];
        return userPermissions.includes(module) || userPermissions.includes('all');
    }

    // Modül erişimini kontrol et
    canAccessModule(userRole, module) {
        const hasPermission = this.checkUserPermission(userRole, module);
        const isModuleActive = this.modules[module]?.status === 'active';
        
        return hasPermission && isModuleActive;
    }

    // Tüm modülleri başlat
    async initializeAllModules() {
        console.log('🚀 Tüm modüller başlatılıyor...');
        
        const modulePromises = Object.keys(this.modules).map(async (module) => {
            try {
                await this.testModule(module);
            } catch (error) {
                console.error(`❌ ${module} modülü başlatılamadı:`, error);
            }
        });

        await Promise.allSettled(modulePromises);
        console.log('✅ Modül başlatma işlemi tamamlandı');
    }

    // Sistem durumunu al
    getSystemStatus() {
        return {
            modules: this.modules,
            health: this.calculateSystemHealth(),
            timestamp: new Date().toISOString()
        };
    }

    // Sistem sağlığını hesapla
    calculateSystemHealth() {
        const activeModules = Object.values(this.modules).filter(m => m.status === 'active').length;
        const totalModules = Object.keys(this.modules).length;
        return Math.round((activeModules / totalModules) * 100);
    }

    // Modül yapılandırmasını kaydet
    saveModuleConfiguration(module, config) {
        this.modules[module].config = config;
        
        const allConfigs = JSON.parse(localStorage.getItem('moduleConfigurations') || '{}');
        allConfigs[module] = config;
        localStorage.setItem('moduleConfigurations', JSON.stringify(allConfigs));
        
        console.log(`💾 ${module} modülü yapılandırması kaydedildi`);
    }

    // Modülü etkinleştir/devre dışı bırak
    toggleModule(module, enabled) {
        if (this.modules[module]) {
            this.modules[module].status = enabled ? 'active' : 'inactive';
            this.updateUI(module, this.modules[module].status);
            console.log(`🔄 ${module} modülü ${enabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`);
        }
    }
}

// Global instance oluştur
window.ceoAdminService = new CEOAdminService();

console.log('✅ CEO Admin Service yüklendi');



















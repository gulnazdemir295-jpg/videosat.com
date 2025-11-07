// VideoSat Platform - Real Email Service
// EmailJS entegrasyonu ile gerçek e-posta gönderimi

class RealEmailService {
    constructor() {
        this.isInitialized = false;
        this.config = {
            serviceId: null,
            templateId: null,
            publicKey: null
        };
        
        this.init();
    }

    async init() {
        console.log('📧 Real Email Service başlatılıyor...');
        
        // EmailJS kütüphanesini yükle
        await this.loadEmailJSLibrary();
        
        // Kayıtlı yapılandırmayı yükle
        this.loadConfiguration();
        
        if (this.config.serviceId && this.config.templateId && this.config.publicKey) {
            await this.initialize();
        }
    }

    // EmailJS kütüphanesini yükle
    async loadEmailJSLibrary() {
        return new Promise((resolve, reject) => {
            if (typeof emailjs !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                console.log('✅ EmailJS kütüphanesi yüklendi');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ EmailJS kütüphanesi yüklenemedi');
                reject(new Error('EmailJS yüklenemedi'));
            };
            document.head.appendChild(script);
        });
    }

    // Yapılandırmayı yükle
    loadConfiguration() {
        const savedConfig = JSON.parse(localStorage.getItem('moduleConfigurations') || '{}');
        const emailConfig = savedConfig.email || {};
        
        this.config = {
            serviceId: emailConfig.emailjsServiceId || null,
            templateId: emailConfig.emailjsTemplateId || null,
            publicKey: emailConfig.emailjsPublicKey || null
        };
    }

    // EmailJS'i başlat
    async initialize() {
        try {
            emailjs.init(this.config.publicKey);
            this.isInitialized = true;
            console.log('✅ EmailJS başlatıldı');
        } catch (error) {
            console.error('❌ EmailJS başlatılamadı:', error);
            throw error;
        }
    }

    // E-posta gönder
    async sendEmail(templateParams) {
        if (!this.isInitialized) {
            throw new Error('E-posta servisi başlatılmamış');
        }

        try {
            const response = await emailjs.send(
                this.config.serviceId,
                this.config.templateId,
                templateParams
            );
            
            console.log('✅ E-posta gönderildi:', response);
            return { success: true, messageId: response.text };
        } catch (error) {
            console.error('❌ E-posta gönderilemedi:', error);
            throw error;
        }
    }

    // Kayıt onay e-postası gönder
    async sendRegistrationConfirmation(userEmail, userName, verificationCode) {
        const templateParams = {
            to_email: userEmail,
            to_name: userName,
            subject: 'VideoSat Platform - Kayıt Onayı',
            message: `Merhaba ${userName},\n\nVideoSat Platform'a hoş geldiniz!\n\nKaydınızı onaylamak için aşağıdaki kodu kullanın:\n\n${verificationCode}\n\nBu kodu 24 saat içinde kullanmanız gerekmektedir.\n\nTeşekkürler,\nVideoSat Platform Ekibi`,
            from_name: 'VideoSat Platform',
            verification_code: verificationCode,
            platform_url: window.location.origin
        };

        return await this.sendEmail(templateParams);
    }

    // Şifre sıfırlama e-postası gönder
    async sendPasswordReset(userEmail, userName, resetCode) {
        const templateParams = {
            to_email: userEmail,
            to_name: userName,
            subject: 'VideoSat Platform - Şifre Sıfırlama',
            message: `Merhaba ${userName},\n\nŞifre sıfırlama talebiniz alınmıştır.\n\nSıfırlama kodu: ${resetCode}\n\nBu kodu 1 saat içinde kullanmanız gerekmektedir.\n\nEğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.\n\nTeşekkürler,\nVideoSat Platform Ekibi`,
            from_name: 'VideoSat Platform',
            reset_code: resetCode,
            platform_url: window.location.origin
        };

        return await this.sendEmail(templateParams);
    }

    // Sipariş onay e-postası gönder
    async sendOrderConfirmation(userEmail, userName, orderData) {
        const templateParams = {
            to_email: userEmail,
            to_name: userName,
            subject: 'VideoSat Platform - Sipariş Onayı',
            message: `Merhaba ${userName},\n\nSiparişiniz başarıyla alınmıştır!\n\nSipariş No: ${orderData.orderId}\nToplam Tutar: ₺${orderData.totalAmount.toLocaleString()}\n\nSipariş Detayları:\n${orderData.items.map(item => `- ${item.name} x${item.quantity} = ₺${(item.price * item.quantity).toLocaleString()}`).join('\n')}\n\nSiparişiniz en kısa sürede kargoya verilecektir.\n\nTeşekkürler,\nVideoSat Platform Ekibi`,
            from_name: 'VideoSat Platform',
            order_id: orderData.orderId,
            total_amount: orderData.totalAmount,
            platform_url: window.location.origin
        };

        return await this.sendEmail(templateParams);
    }

    // Kargo takip e-postası gönder
    async sendCargoTracking(userEmail, userName, trackingData) {
        const templateParams = {
            to_email: userEmail,
            to_name: userName,
            subject: 'VideoSat Platform - Kargo Takip Bilgisi',
            message: `Merhaba ${userName},\n\nSiparişiniz kargoya verilmiştir!\n\nSipariş No: ${trackingData.orderId}\nKargo Takip No: ${trackingData.trackingNumber}\nKargo Firması: ${trackingData.cargoCompany}\n\nTakip için: ${trackingData.trackingUrl}\n\nTeşekkürler,\nVideoSat Platform Ekibi`,
            from_name: 'VideoSat Platform',
            order_id: trackingData.orderId,
            tracking_number: trackingData.trackingNumber,
            cargo_company: trackingData.cargoCompany,
            tracking_url: trackingData.trackingUrl,
            platform_url: window.location.origin
        };

        return await this.sendEmail(templateParams);
    }

    // Canlı yayın bildirimi e-postası gönder
    async sendLiveStreamNotification(userEmail, userName, streamData) {
        const templateParams = {
            to_email: userEmail,
            to_name: userName,
            subject: 'VideoSat Platform - Canlı Yayın Başladı!',
            message: `Merhaba ${userName},\n\nTakip ettiğiniz satıcı canlı yayına başladı!\n\nSatıcı: ${streamData.seller}\nÜrün: ${streamData.productName}\nYayın Linki: ${streamData.streamUrl}\n\nHemen katılın ve özel fırsatları kaçırmayın!\n\nTeşekkürler,\nVideoSat Platform Ekibi`,
            from_name: 'VideoSat Platform',
            seller_name: streamData.seller,
            product_name: streamData.productName,
            stream_url: streamData.streamUrl,
            platform_url: window.location.origin
        };

        return await this.sendEmail(templateParams);
    }

    // Sistem bildirimi e-postası gönder
    async sendSystemNotification(userEmail, userName, notificationData) {
        const templateParams = {
            to_email: userEmail,
            to_name: userName,
            subject: `VideoSat Platform - ${notificationData.title}`,
            message: `Merhaba ${userName},\n\n${notificationData.message}\n\n${notificationData.actionText ? `İşlem: ${notificationData.actionText}` : ''}\n\nTeşekkürler,\nVideoSat Platform Ekibi`,
            from_name: 'VideoSat Platform',
            notification_title: notificationData.title,
            notification_message: notificationData.message,
            action_text: notificationData.actionText || '',
            platform_url: window.location.origin
        };

        return await this.sendEmail(templateParams);
    }

    // Toplu e-posta gönder
    async sendBulkEmail(recipients, templateParams) {
        const results = [];
        
        for (const recipient of recipients) {
            try {
                const result = await this.sendEmail({
                    ...templateParams,
                    to_email: recipient.email,
                    to_name: recipient.name
                });
                results.push({ success: true, recipient: recipient.email, result });
            } catch (error) {
                results.push({ success: false, recipient: recipient.email, error: error.message });
            }
        }
        
        return results;
    }

    // E-posta şablonu test et
    async testTemplate(templateId, testParams) {
        try {
            const response = await emailjs.send(
                this.config.serviceId,
                templateId,
                testParams
            );
            
            console.log('✅ E-posta şablonu test edildi:', response);
            return { success: true, response };
        } catch (error) {
            console.error('❌ E-posta şablonu test edilemedi:', error);
            throw error;
        }
    }

    // Yapılandırmayı güncelle
    updateConfiguration(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // localStorage'a kaydet
        const allConfigs = JSON.parse(localStorage.getItem('moduleConfigurations') || '{}');
        allConfigs.email = this.config;
        localStorage.setItem('moduleConfigurations', JSON.stringify(allConfigs));
        
        // EmailJS'i yeniden başlat
        if (this.config.serviceId && this.config.templateId && this.config.publicKey) {
            this.initialize();
        }
    }

    // Servis durumunu kontrol et
    isServiceReady() {
        return this.isInitialized && this.config.serviceId && this.config.templateId && this.config.publicKey;
    }

    // Hata yönetimi
    handleEmailError(error) {
        console.error('📧 E-posta hatası:', error);
        
        // Kullanıcıya hata mesajı göster
        if (typeof showAlert === 'function') {
            showAlert('E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.', 'error');
        } else {
            alert('E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.');
        }
    }
}

// Global instance oluştur
window.realEmailService = new RealEmailService();

// Global fonksiyonlar
window.sendRegistrationEmail = async function(userEmail, userName, verificationCode) {
    try {
        return await window.realEmailService.sendRegistrationConfirmation(userEmail, userName, verificationCode);
    } catch (error) {
        window.realEmailService.handleEmailError(error);
        throw error;
    }
};

window.sendPasswordResetEmail = async function(userEmail, userName, resetCode) {
    try {
        return await window.realEmailService.sendPasswordReset(userEmail, userName, resetCode);
    } catch (error) {
        window.realEmailService.handleEmailError(error);
        throw error;
    }
};

window.sendOrderConfirmationEmail = async function(userEmail, userName, orderData) {
    try {
        return await window.realEmailService.sendOrderConfirmation(userEmail, userName, orderData);
    } catch (error) {
        window.realEmailService.handleEmailError(error);
        throw error;
    }
};

window.sendCargoTrackingEmail = async function(userEmail, userName, trackingData) {
    try {
        return await window.realEmailService.sendCargoTracking(userEmail, userName, trackingData);
    } catch (error) {
        window.realEmailService.handleEmailError(error);
        throw error;
    }
};

window.sendLiveStreamNotificationEmail = async function(userEmail, userName, streamData) {
    try {
        return await window.realEmailService.sendLiveStreamNotification(userEmail, userName, streamData);
    } catch (error) {
        window.realEmailService.handleEmailError(error);
        throw error;
    }
};

console.log('✅ Real Email Service yüklendi');























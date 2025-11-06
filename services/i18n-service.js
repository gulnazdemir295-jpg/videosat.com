/**
 * i18n Service - Çoklu Dil Desteği
 * Internationalization (i18n) servisi
 */

class I18nService {
    constructor() {
        this.currentLanguage = 'tr';
        this.translations = {};
        this.fallbackLanguage = 'tr';
        this.supportedLanguages = ['tr', 'en'];
        
        this.loadTranslations();
        this.loadSavedLanguage();
    }

    /**
     * Çevirileri yükle
     */
    loadTranslations() {
        // Türkçe çeviriler (varsayılan)
        this.translations.tr = {
            // Genel
            'app.name': 'VideoSat',
            'app.welcome': 'Hoş Geldiniz',
            'app.loading': 'Yükleniyor...',
            'app.error': 'Hata',
            'app.success': 'Başarılı',
            'app.cancel': 'İptal',
            'app.save': 'Kaydet',
            'app.delete': 'Sil',
            'app.edit': 'Düzenle',
            'app.add': 'Ekle',
            'app.search': 'Ara',
            'app.filter': 'Filtrele',
            'app.close': 'Kapat',
            
            // Auth
            'auth.login': 'Giriş Yap',
            'auth.logout': 'Çıkış Yap',
            'auth.register': 'Kayıt Ol',
            'auth.email': 'E-posta',
            'auth.password': 'Şifre',
            'auth.forgotPassword': 'Şifremi Unuttum',
            'auth.rememberMe': 'Beni Hatırla',
            
            // Navigation
            'nav.home': 'Ana Sayfa',
            'nav.dashboard': 'Dashboard',
            'nav.products': 'Ürünler',
            'nav.orders': 'Siparişler',
            'nav.messages': 'Mesajlar',
            'nav.settings': 'Ayarlar',
            'nav.liveStream': 'Canlı Yayın',
            
            // Products
            'products.title': 'Ürünler',
            'products.add': 'Yeni Ürün Ekle',
            'products.edit': 'Ürün Düzenle',
            'products.delete': 'Ürün Sil',
            'products.name': 'Ürün Adı',
            'products.price': 'Fiyat',
            'products.stock': 'Stok',
            'products.category': 'Kategori',
            
            // Orders
            'orders.title': 'Siparişler',
            'orders.status': 'Durum',
            'orders.total': 'Toplam',
            'orders.date': 'Tarih',
            'orders.pending': 'Beklemede',
            'orders.completed': 'Tamamlandı',
            'orders.cancelled': 'İptal Edildi',
            
            // Messages
            'messages.title': 'Mesajlar',
            'messages.send': 'Gönder',
            'messages.typeMessage': 'Mesaj yazın...',
            'messages.noMessages': 'Henüz mesaj yok',
            
            // Payments
            'payments.title': 'Ödemeler',
            'payments.method': 'Ödeme Yöntemi',
            'payments.amount': 'Tutar',
            'payments.status': 'Durum',
            'payments.process': 'Ödeme İşle',
            'payments.refund': 'İade Et',
            
            // Analytics
            'analytics.title': 'Analytics',
            'analytics.sales': 'Satışlar',
            'analytics.orders': 'Siparişler',
            'analytics.customers': 'Müşteriler',
            'analytics.products': 'Ürünler',
            
            // Live Stream
            'livestream.start': 'Yayını Başlat',
            'livestream.stop': 'Yayını Durdur',
            'livestream.viewers': 'İzleyiciler',
            'livestream.likes': 'Beğeniler',
            'livestream.chat': 'Sohbet',
            
            // Notifications
            'notifications.title': 'Bildirimler',
            'notifications.new': 'Yeni Bildirim',
            'notifications.markAllRead': 'Tümünü Okundu İşaretle',
            
            // Settings
            'settings.title': 'Ayarlar',
            'settings.language': 'Dil',
            'settings.notifications': 'Bildirimler',
            'settings.privacy': 'Gizlilik',
            'settings.account': 'Hesap',
            
            // Errors
            'error.generic': 'Bir hata oluştu',
            'error.network': 'Ağ hatası',
            'error.unauthorized': 'Yetkisiz erişim',
            'error.notFound': 'Bulunamadı',
            'error.serverError': 'Sunucu hatası'
        };

        // İngilizce çeviriler
        this.translations.en = {
            // General
            'app.name': 'VideoSat',
            'app.welcome': 'Welcome',
            'app.loading': 'Loading...',
            'app.error': 'Error',
            'app.success': 'Success',
            'app.cancel': 'Cancel',
            'app.save': 'Save',
            'app.delete': 'Delete',
            'app.edit': 'Edit',
            'app.add': 'Add',
            'app.search': 'Search',
            'app.filter': 'Filter',
            'app.close': 'Close',
            
            // Auth
            'auth.login': 'Login',
            'auth.logout': 'Logout',
            'auth.register': 'Register',
            'auth.email': 'Email',
            'auth.password': 'Password',
            'auth.forgotPassword': 'Forgot Password',
            'auth.rememberMe': 'Remember Me',
            
            // Navigation
            'nav.home': 'Home',
            'nav.dashboard': 'Dashboard',
            'nav.products': 'Products',
            'nav.orders': 'Orders',
            'nav.messages': 'Messages',
            'nav.settings': 'Settings',
            'nav.liveStream': 'Live Stream',
            
            // Products
            'products.title': 'Products',
            'products.add': 'Add New Product',
            'products.edit': 'Edit Product',
            'products.delete': 'Delete Product',
            'products.name': 'Product Name',
            'products.price': 'Price',
            'products.stock': 'Stock',
            'products.category': 'Category',
            
            // Orders
            'orders.title': 'Orders',
            'orders.status': 'Status',
            'orders.total': 'Total',
            'orders.date': 'Date',
            'orders.pending': 'Pending',
            'orders.completed': 'Completed',
            'orders.cancelled': 'Cancelled',
            
            // Messages
            'messages.title': 'Messages',
            'messages.send': 'Send',
            'messages.typeMessage': 'Type a message...',
            'messages.noMessages': 'No messages yet',
            
            // Payments
            'payments.title': 'Payments',
            'payments.method': 'Payment Method',
            'payments.amount': 'Amount',
            'payments.status': 'Status',
            'payments.process': 'Process Payment',
            'payments.refund': 'Refund',
            
            // Analytics
            'analytics.title': 'Analytics',
            'analytics.sales': 'Sales',
            'analytics.orders': 'Orders',
            'analytics.customers': 'Customers',
            'analytics.products': 'Products',
            
            // Live Stream
            'livestream.start': 'Start Stream',
            'livestream.stop': 'Stop Stream',
            'livestream.viewers': 'Viewers',
            'livestream.likes': 'Likes',
            'livestream.chat': 'Chat',
            
            // Notifications
            'notifications.title': 'Notifications',
            'notifications.new': 'New Notification',
            'notifications.markAllRead': 'Mark All as Read',
            
            // Settings
            'settings.title': 'Settings',
            'settings.language': 'Language',
            'settings.notifications': 'Notifications',
            'settings.privacy': 'Privacy',
            'settings.account': 'Account',
            
            // Errors
            'error.generic': 'An error occurred',
            'error.network': 'Network error',
            'error.unauthorized': 'Unauthorized',
            'error.notFound': 'Not found',
            'error.serverError': 'Server error'
        };
    }

    /**
     * Kaydedilmiş dili yükle
     */
    loadSavedLanguage() {
        try {
            const saved = localStorage.getItem('language');
            if (saved && this.supportedLanguages.includes(saved)) {
                this.currentLanguage = saved;
            }
        } catch (error) {
            console.error('Dil yükleme hatası:', error);
        }
    }

    /**
     * Dili değiştir
     */
    setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Dil desteklenmiyor: ${lang}`);
            return false;
        }

        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        
        // Sayfayı yeniden çevir
        this.translatePage();
        
        // Event fire
        this.notifyListeners('languageChanged', lang);
        
        return true;
    }

    /**
     * Çeviri al
     */
    t(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] 
            || this.translations[this.fallbackLanguage]?.[key] 
            || key;

        // Parametreleri değiştir
        let result = translation;
        Object.keys(params).forEach(param => {
            result = result.replace(`{{${param}}}`, params[param]);
        });

        return result;
    }

    /**
     * Sayfayı çevir
     */
    translatePage() {
        // [data-i18n] attribute'u olan elementleri çevir
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // [data-i18n-title] attribute'u olan elementleri çevir
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        // [data-i18n-aria-label] attribute'u olan elementleri çevir
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            element.setAttribute('aria-label', this.t(key));
        });
    }

    /**
     * Mevcut dili al
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Desteklenen dilleri al
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    /**
     * Dil bilgilerini al
     */
    getLanguageInfo() {
        return {
            current: this.currentLanguage,
            supported: this.supportedLanguages,
            fallback: this.fallbackLanguage
        };
    }

    /**
     * Event listener'lar
     */
    listeners = {};

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    notifyListeners(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Event listener hatası:', error);
                }
            });
        }
    }

    /**
     * Çeviri ekle (dinamik)
     */
    addTranslation(lang, key, value) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        this.translations[lang][key] = value;
    }

    /**
     * Çeviri seti ekle
     */
    addTranslations(lang, translations) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        Object.assign(this.translations[lang], translations);
    }
}

// Export
const i18nService = new I18nService();
window.i18nService = i18nService;

// Global t() fonksiyonu
window.t = (key, params) => i18nService.t(key, params);

// Sayfa yüklendiğinde çevir
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        i18nService.translatePage();
    });
} else {
    i18nService.translatePage();
}

console.log('✅ i18n Service initialized');


/**
 * Push Notification Service - Web Push API
 * Tarayıcı push notification desteği
 */

class PushNotificationService {
    constructor() {
        this.registration = null;
        this.subscription = null;
        this.publicKey = null; // VAPID public key (backend'den alınacak)
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        
        if (this.isSupported) {
            this.init();
        } else {
            console.warn('⚠️ Push Notification desteği yok');
        }
    }

    async init() {
        try {
            // Service Worker'ı kaydet
            this.registration = await navigator.serviceWorker.ready;
            
            // Mevcut subscription'ı kontrol et
            this.subscription = await this.registration.pushManager.getSubscription();
            
            if (this.subscription) {
                console.log('✅ Push Notification: Mevcut subscription bulundu');
            }
        } catch (error) {
            console.error('❌ Push Notification init hatası:', error);
        }
    }

    async requestPermission() {
        if (!this.isSupported) {
            return { granted: false, error: 'Push Notification desteği yok' };
        }

        try {
            const permission = await Notification.requestPermission();
            return { granted: permission === 'granted', permission };
        } catch (error) {
            console.error('❌ Permission request hatası:', error);
            return { granted: false, error: error.message };
        }
    }

    async subscribe(publicKey) {
        if (!this.isSupported || !this.registration) {
            return { success: false, error: 'Service Worker hazır değil' };
        }

        try {
            // Permission kontrolü
            const permissionResult = await this.requestPermission();
            if (!permissionResult.granted) {
                return { success: false, error: 'Notification izni verilmedi' };
            }

            // VAPID public key'i kullanarak subscribe ol
            this.subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(publicKey)
            });

            // Backend'e subscription'ı gönder
            await this.sendSubscriptionToBackend(this.subscription);

            console.log('✅ Push Notification: Subscribe başarılı');
            return { success: true, subscription: this.subscription };
        } catch (error) {
            console.error('❌ Subscribe hatası:', error);
            return { success: false, error: error.message };
        }
    }

    async unsubscribe() {
        if (!this.subscription) {
            return { success: false, error: 'Subscription yok' };
        }

        try {
            const result = await this.subscription.unsubscribe();
            
            if (result) {
                // Backend'e unsubscribe bildir
                await this.removeSubscriptionFromBackend(this.subscription);
                this.subscription = null;
                console.log('✅ Push Notification: Unsubscribe başarılı');
            }

            return { success: result };
        } catch (error) {
            console.error('❌ Unsubscribe hatası:', error);
            return { success: false, error: error.message };
        }
    }

    async sendSubscriptionToBackend(subscription) {
        try {
            const apiBaseURL = this.getAPIBaseURL();
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            
            const response = await fetch(`${apiBaseURL}/push/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    subscription,
                    userId: currentUser.email || currentUser.id
                })
            });

            if (!response.ok) {
                throw new Error('Backend subscription kaydı başarısız');
            }

            console.log('✅ Push Notification: Backend\'e subscription gönderildi');
        } catch (error) {
            console.error('❌ Backend subscription hatası:', error);
        }
    }

    async removeSubscriptionFromBackend(subscription) {
        try {
            const apiBaseURL = this.getAPIBaseURL();
            await fetch(`${apiBaseURL}/push/unsubscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ subscription })
            });
        } catch (error) {
            console.error('❌ Backend unsubscribe hatası:', error);
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    getAPIBaseURL() {
        if (typeof window.getAPIBaseURL === 'function') {
            return window.getAPIBaseURL();
        }
        const hostname = window.location.hostname;
        if (hostname === 'basvideo.com' || hostname.includes('basvideo.com')) {
            return 'https://api.basvideo.com/api';
        }
        const port = window.DEFAULT_BACKEND_PORT || 3000;
        return `http://localhost:${port}/api`;
    }

    async getPublicKey() {
        try {
            const apiBaseURL = this.getAPIBaseURL();
            const response = await fetch(`${apiBaseURL}/push/public-key`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.publicKey = data.publicKey;
                return this.publicKey;
            }
        } catch (error) {
            console.error('❌ Public key alma hatası:', error);
        }
        return null;
    }

    async enable() {
        if (!this.isSupported) {
            return { success: false, error: 'Push Notification desteği yok' };
        }

        try {
            // Public key al
            const publicKey = await this.getPublicKey();
            if (!publicKey) {
                return { success: false, error: 'Public key alınamadı' };
            }

            // Subscribe ol
            return await this.subscribe(publicKey);
        } catch (error) {
            console.error('❌ Enable hatası:', error);
            return { success: false, error: error.message };
        }
    }

    async disable() {
        return await this.unsubscribe();
    }

    isSubscribed() {
        return this.subscription !== null;
    }

    getSubscription() {
        return this.subscription;
    }
}

// Export
const pushNotificationService = new PushNotificationService();
window.pushNotificationService = pushNotificationService;

console.log('✅ Push Notification Service initialized');


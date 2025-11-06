/**
 * PWA Service - Progressive Web App
 * Install prompt, update notifications, offline detection
 */

class PWAService {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.updateAvailable = false;
        this.serviceWorkerRegistration = null;
        
        this.init();
    }

    /**
     * Initialize PWA Service
     */
    async init() {
        // Check if already installed
        this.checkIfInstalled();
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Setup install prompt
        this.setupInstallPrompt();
        
        // Setup online/offline detection
        this.setupOnlineDetection();
        
        // Check for updates
        this.checkForUpdates();
        
        console.log('✅ PWA Service initialized');
    }

    /**
     * Check if app is installed
     */
    checkIfInstalled() {
        // Check if running in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            document.referrer.includes('android-app://')) {
            this.isInstalled = true;
            console.log('✅ PWA is installed');
        }
    }

    /**
     * Register Service Worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });
                
                this.serviceWorkerRegistration = registration;
                console.log('✅ Service Worker registered:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            this.updateAvailable = true;
                            this.showUpdateNotification();
                        }
                    });
                });
                
                // Listen for controller change (update activated)
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('✅ New Service Worker activated');
                    window.location.reload();
                });
                
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        } else {
            console.warn('⚠️ Service Worker not supported');
        }
    }

    /**
     * Setup install prompt
     */
    setupInstallPrompt() {
        // Before install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });
        
        // App installed
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed');
            this.isInstalled = true;
            this.deferredPrompt = null;
            this.hideInstallPrompt();
            this.showInstalledNotification();
        });
    }

    /**
     * Show install prompt
     */
    showInstallPrompt() {
        // Create install banner
        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.className = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="pwa-install-content">
                <div class="pwa-install-icon">
                    <i class="fas fa-mobile-alt"></i>
                </div>
                <div class="pwa-install-text">
                    <strong>VideoSat'i yükle</strong>
                    <p>Hızlı erişim ve offline kullanım için</p>
                </div>
                <div class="pwa-install-buttons">
                    <button class="pwa-install-btn" id="pwa-install-btn">Yükle</button>
                    <button class="pwa-dismiss-btn" id="pwa-dismiss-btn">Daha Sonra</button>
                </div>
            </div>
        `;
        
        // Add styles
        if (!document.getElementById('pwa-install-styles')) {
            const style = document.createElement('style');
            style.id = 'pwa-install-styles';
            style.textContent = `
                .pwa-install-banner {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1a1a1a;
                    border: 2px solid #dc2626;
                    border-radius: 12px;
                    padding: 16px;
                    max-width: 400px;
                    z-index: 10000;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                    animation: slideUp 0.3s ease-out;
                }
                
                @keyframes slideUp {
                    from {
                        transform: translateX(-50%) translateY(100px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                }
                
                .pwa-install-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .pwa-install-icon {
                    font-size: 2rem;
                    color: #dc2626;
                }
                
                .pwa-install-text {
                    flex: 1;
                }
                
                .pwa-install-text strong {
                    display: block;
                    color: #ffffff;
                    margin-bottom: 4px;
                }
                
                .pwa-install-text p {
                    color: #999;
                    font-size: 0.875rem;
                    margin: 0;
                }
                
                .pwa-install-buttons {
                    display: flex;
                    gap: 8px;
                }
                
                .pwa-install-btn,
                .pwa-dismiss-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                
                .pwa-install-btn {
                    background: #dc2626;
                    color: #ffffff;
                }
                
                .pwa-install-btn:hover {
                    background: #b91c1c;
                }
                
                .pwa-dismiss-btn {
                    background: transparent;
                    color: #999;
                    border: 1px solid #404040;
                }
                
                .pwa-dismiss-btn:hover {
                    background: #2a2a2a;
                }
                
                @media (max-width: 768px) {
                    .pwa-install-banner {
                        left: 10px;
                        right: 10px;
                        transform: none;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(banner);
        
        // Install button
        document.getElementById('pwa-install-btn')?.addEventListener('click', () => {
            this.install();
        });
        
        // Dismiss button
        document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
            this.hideInstallPrompt();
            localStorage.setItem('pwa-install-dismissed', 'true');
        });
        
        // Check if previously dismissed
        if (localStorage.getItem('pwa-install-dismissed') === 'true') {
            this.hideInstallPrompt();
        }
    }

    /**
     * Hide install prompt
     */
    hideInstallPrompt() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.style.animation = 'slideDown 0.3s ease-out';
            setTimeout(() => banner.remove(), 300);
        }
    }

    /**
     * Install PWA
     */
    async install() {
        if (!this.deferredPrompt) {
            console.warn('⚠️ Install prompt not available');
            return;
        }
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log(`✅ User ${outcome} the install prompt`);
        
        this.deferredPrompt = null;
        this.hideInstallPrompt();
    }

    /**
     * Show installed notification
     */
    showInstalledNotification() {
        if (window.notificationService) {
            window.notificationService.show('VideoSat başarıyla yüklendi!', 'success');
        } else {
            alert('VideoSat başarıyla yüklendi!');
        }
    }

    /**
     * Setup online/offline detection
     */
    setupOnlineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('✅ Online');
            this.showOnlineNotification();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('⚠️ Offline');
            this.showOfflineNotification();
        });
    }

    /**
     * Show online notification
     */
    showOnlineNotification() {
        if (window.notificationService) {
            window.notificationService.show('İnternet bağlantısı yeniden kuruldu', 'success');
        }
    }

    /**
     * Show offline notification
     */
    showOfflineNotification() {
        if (window.notificationService) {
            window.notificationService.show('İnternet bağlantısı kesildi. Offline mod aktif', 'warning');
        }
    }

    /**
     * Check for updates
     */
    checkForUpdates() {
        if (this.serviceWorkerRegistration) {
            this.serviceWorkerRegistration.update();
        }
    }

    /**
     * Show update notification
     */
    showUpdateNotification() {
        const banner = document.createElement('div');
        banner.id = 'pwa-update-banner';
        banner.className = 'pwa-update-banner';
        banner.innerHTML = `
            <div class="pwa-update-content">
                <i class="fas fa-sync-alt"></i>
                <span>Yeni güncelleme mevcut</span>
                <button class="pwa-update-btn" id="pwa-update-btn">Yenile</button>
            </div>
        `;
        
        // Add styles if not exists
        if (!document.getElementById('pwa-update-styles')) {
            const style = document.createElement('style');
            style.id = 'pwa-update-styles';
            style.textContent = `
                .pwa-update-banner {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #1a1a1a;
                    border: 2px solid #dc2626;
                    border-radius: 8px;
                    padding: 12px 16px;
                    z-index: 10000;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                    animation: slideDown 0.3s ease-out;
                }
                
                @keyframes slideDown {
                    from {
                        transform: translateY(-100px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                .pwa-update-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #ffffff;
                }
                
                .pwa-update-btn {
                    padding: 6px 12px;
                    background: #dc2626;
                    color: #ffffff;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                
                .pwa-update-btn:hover {
                    background: #b91c1c;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(banner);
        
        document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
            if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.waiting) {
                this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            window.location.reload();
        });
    }

    /**
     * Get PWA status
     */
    getStatus() {
        return {
            isInstalled: this.isInstalled,
            isOnline: this.isOnline,
            updateAvailable: this.updateAvailable,
            serviceWorkerSupported: 'serviceWorker' in navigator
        };
    }
}

// Export
const pwaService = new PWAService();
window.pwaService = pwaService;

console.log('✅ PWA Service initialized');


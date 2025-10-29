// VideoSat Platform - Script Loader
// Güvenilir script yükleme ve hata yönetimi

class ScriptLoader {
    constructor() {
        this.loadedScripts = new Set();
        this.failedScripts = new Set();
        this.loadingPromises = new Map();
    }

    // Script yükleme fonksiyonu
    async loadScript(src, options = {}) {
        // Eğer zaten yüklenmişse
        if (this.loadedScripts.has(src)) {
            return Promise.resolve();
        }

        // Eğer yükleniyorsa, aynı promise'i döndür
        if (this.loadingPromises.has(src)) {
            return this.loadingPromises.get(src);
        }

        // Yeni script yükleme promise'i oluştur
        const loadPromise = this._loadScriptInternal(src, options);
        this.loadingPromises.set(src, loadPromise);

        try {
            await loadPromise;
            this.loadedScripts.add(src);
            this.loadingPromises.delete(src);
            console.log(`✅ Script yüklendi: ${src}`);
        } catch (error) {
            this.failedScripts.add(src);
            this.loadingPromises.delete(src);
            console.error(`❌ Script yüklenemedi: ${src}`, error);
            throw error;
        }

        return loadPromise;
    }

    // İç script yükleme fonksiyonu
    _loadScriptInternal(src, options = {}) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = options.async !== false;
            script.defer = options.defer || false;
            
            // Error handling
            script.onerror = (error) => {
                console.error(`Script yükleme hatası: ${src}`, error);
                reject(new Error(`Failed to load script: ${src}`));
            };

            // Success handling
            script.onload = () => {
                console.log(`Script başarıyla yüklendi: ${src}`);
                resolve();
            };

            // Timeout handling
            if (options.timeout) {
                setTimeout(() => {
                    if (!this.loadedScripts.has(src)) {
                        reject(new Error(`Script load timeout: ${src}`));
                    }
                }, options.timeout);
            }

            document.head.appendChild(script);
        });
    }

    // CSS yükleme fonksiyonu
    async loadCSS(href, options = {}) {
        if (this.loadedScripts.has(href)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            
            link.onerror = (error) => {
                console.error(`CSS yükleme hatası: ${href}`, error);
                reject(new Error(`Failed to load CSS: ${href}`));
            };

            link.onload = () => {
                this.loadedScripts.add(href);
                console.log(`✅ CSS yüklendi: ${href}`);
                resolve();
            };

            document.head.appendChild(link);
        });
    }

    // Çoklu script yükleme
    async loadScripts(scripts, options = {}) {
        const promises = scripts.map(script => {
            if (typeof script === 'string') {
                return this.loadScript(script, options);
            } else {
                return this.loadScript(script.src, script);
            }
        });

        try {
            await Promise.all(promises);
            console.log('✅ Tüm scriptler yüklendi');
        } catch (error) {
            console.error('❌ Bazı scriptler yüklenemedi:', error);
            // Kritik olmayan scriptler için devam et
            if (options.continueOnError) {
                console.warn('Hata yönetimi: Kritik olmayan scriptler atlandı');
            } else {
                throw error;
            }
        }
    }

    // Fallback script yükleme
    async loadWithFallback(primarySrc, fallbackSrc, options = {}) {
        try {
            await this.loadScript(primarySrc, options);
        } catch (error) {
            console.warn(`Primary script failed: ${primarySrc}, trying fallback: ${fallbackSrc}`);
            try {
                await this.loadScript(fallbackSrc, options);
            } catch (fallbackError) {
                console.error(`Both primary and fallback scripts failed:`, error, fallbackError);
                throw fallbackError;
            }
        }
    }

    // Script durumunu kontrol et
    isLoaded(src) {
        return this.loadedScripts.has(src);
    }

    // Başarısız scriptleri kontrol et
    getFailedScripts() {
        return Array.from(this.failedScripts);
    }

    // Tüm yüklenen scriptleri listele
    getLoadedScripts() {
        return Array.from(this.loadedScripts);
    }
}

// Global script loader instance
window.scriptLoader = new ScriptLoader();

// Utility fonksiyonları
window.loadScript = (src, options) => window.scriptLoader.loadScript(src, options);
window.loadCSS = (href, options) => window.scriptLoader.loadCSS(href, options);
window.loadScripts = (scripts, options) => window.scriptLoader.loadScripts(scripts, options);

console.log('✅ Script Loader yüklendi');

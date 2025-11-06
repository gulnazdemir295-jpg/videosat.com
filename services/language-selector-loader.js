/**
 * Language Selector Loader
 * Dil seçici komponentini sayfaya yükler
 */

class LanguageSelectorLoader {
    constructor() {
        this.loaded = false;
    }

    /**
     * Dil seçiciyi yükle
     * @param {string} containerId - Container element ID
     * @param {string} position - 'before' | 'after' | 'append' | 'prepend'
     */
    async load(containerId = 'languageSelectorContainer', position = 'append') {
        if (this.loaded) {
            console.log('✅ Dil seçici zaten yüklü');
            return;
        }

        try {
            // Container'ı bul veya oluştur
            let container = document.getElementById(containerId);
            
            if (!container) {
                // Navbar'ı bul
                const navbar = document.querySelector('.navbar') || 
                              document.querySelector('header') || 
                              document.querySelector('nav');
                
                if (navbar) {
                    // Navbar içinde container oluştur
                    container = document.createElement('div');
                    container.id = containerId;
                    container.className = 'language-selector-container';
                    
                    // Navbar'ın sonuna ekle
                    navbar.appendChild(container);
                } else {
                    // Body'ye ekle
                    container = document.createElement('div');
                    container.id = containerId;
                    container.className = 'language-selector-container';
                    document.body.insertBefore(container, document.body.firstChild);
                }
            }

            // Komponenti yükle
            const response = await fetch('components/language-selector.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            
            // HTML'i parse et ve ekle
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Script'leri ayır
            const scripts = tempDiv.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.textContent = script.textContent;
                }
                document.body.appendChild(newScript);
            });

            // Script olmayan içeriği ekle
            const content = tempDiv.cloneNode(true);
            scripts.forEach(script => content.removeChild(script));
            
            if (position === 'prepend') {
                container.insertBefore(content.firstChild, container.firstChild);
            } else if (position === 'after') {
                container.parentNode.insertBefore(content.firstChild, container.nextSibling);
            } else if (position === 'before') {
                container.parentNode.insertBefore(content.firstChild, container);
            } else {
                container.appendChild(content.firstChild);
            }

            this.loaded = true;
            console.log('✅ Dil seçici yüklendi');

            // i18n Service'in yüklenmesini bekle
            this.waitForI18nService();

        } catch (error) {
            console.error('❌ Dil seçici yükleme hatası:', error);
        }
    }

    /**
     * i18n Service'in yüklenmesini bekle
     */
    waitForI18nService() {
        let attempts = 0;
        const maxAttempts = 50; // 5 saniye

        const checkInterval = setInterval(() => {
            attempts++;
            
            if (typeof window.i18nService !== 'undefined') {
                clearInterval(checkInterval);
                
                // Language Selector Controller'ı başlat
                if (document.getElementById('languageSelector')) {
                    if (typeof window.languageSelectorController === 'undefined') {
                        // Controller'ı manuel başlat
                        const controller = new LanguageSelectorController();
                        window.languageSelectorController = controller;
                    }
                }
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.warn('⚠️ i18n Service yüklenemedi');
            }
        }, 100);
    }

    /**
     * Navbar'a otomatik ekle
     */
    async loadToNavbar() {
        // Navbar'ı bul
        const navbar = document.querySelector('.navbar') || 
                      document.querySelector('header') || 
                      document.querySelector('nav');
        
        if (navbar) {
            // Navbar'ın sağ tarafına ekle
            const container = document.createElement('div');
            container.id = 'languageSelectorContainer';
            container.className = 'language-selector-container';
            container.style.marginLeft = 'auto';
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            
            navbar.appendChild(container);
            await this.load('languageSelectorContainer', 'append');
        } else {
            console.warn('⚠️ Navbar bulunamadı, body\'ye eklendi');
            await this.load('languageSelectorContainer', 'prepend');
        }
    }
}

// Export
window.languageSelectorLoader = new LanguageSelectorLoader();

// Otomatik yükle (DOMContentLoaded)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.languageSelectorLoader.loadToNavbar();
    });
} else {
    window.languageSelectorLoader.loadToNavbar();
}

console.log('✅ Language Selector Loader initialized');


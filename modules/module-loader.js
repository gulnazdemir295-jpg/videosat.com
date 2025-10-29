/**
 * VideoSat Platform - Modül Yükleyici
 * Tüm modüllerin otomatik yüklenmesi ve kaydedilmesi
 */

(function() {
    'use strict';

    const MODULE_CONFIG = {
        core: [
            { name: 'ModuleManager', path: 'modules/module-manager.js' }
        ],
        modules: [
            { name: 'Product', path: 'modules/product/product-module.js', class: 'ProductModule', deps: [] },
            { name: 'Order', path: 'modules/order/order-module.js', class: 'OrderModule', deps: ['Product'] },
            { name: 'Payment', path: 'modules/payment/payment-module.js', class: 'PaymentModule', deps: [] },
            { name: 'Livestream', path: 'modules/livestream/livestream-module.js', class: 'LivestreamModule', deps: ['Product', 'Payment'] },
            { name: 'POS', path: 'modules/pos/pos-module.js', class: 'POSModule', deps: ['Product', 'Order'] }
        ]
    };

    /**
     * Path düzeltme (panels dizininden)
     */
    function getModulePath(path) {
        // panels/ dizininde mi kontrol et
        const isInPanels = window.location.pathname.includes('/panels/');
        if (isInPanels) {
            // panels/ dizininden modules/ dizinine git
            return '../' + path;
        }
        return path;
    }

    /**
     * Script yükleme
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Modülleri yükle
     */
    async function loadModules() {
        console.log('📦 Loading modules...');

        try {
            // Core modülleri yükle
            for (const module of MODULE_CONFIG.core) {
                await loadScript(getModulePath(module.path));
            }

            // Ana modüller yüklendikten sonra bekle
            await new Promise(resolve => setTimeout(resolve, 100));

            // Diğer modülleri yükle
            for (const module of MODULE_CONFIG.modules) {
                await loadScript(getModulePath(module.path));
            }

            // Modüller yüklendikten sonra bekle
            await new Promise(resolve => setTimeout(resolve, 100));

            // Modülleri kaydet
            registerModules();

        } catch (error) {
            console.error('❌ Module loading error:', error);
        }
    }

    /**
     * Modülleri kaydet
     */
    function registerModules() {
        if (typeof window.moduleManager === 'undefined') {
            console.error('❌ Module Manager not found');
            return;
        }

        for (const module of MODULE_CONFIG.modules) {
            if (typeof window[module.class] !== 'undefined') {
                const instance = new window[module.class]();
                window.moduleManager.register(module.name, instance, module.deps);
                console.log(`✅ Module registered: ${module.name}`);
            } else {
                console.warn(`⚠️ Module class not found: ${module.class}`);
            }
        }
    }

    // DOM hazır olduğunda modülleri yükle
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadModules);
    } else {
        loadModules();
    }
})();

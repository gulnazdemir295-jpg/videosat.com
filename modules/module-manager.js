/**
 * VideoSat Platform - Modül Yöneticisi
 * Tüm modüllerin merkezi yönetimi ve koordinasyonu
 * Prosedürler: PROCEDURES_WORKFLOW.md, POS_SYSTEM_WORKFLOW.md
 */

class ModuleManager {
    constructor() {
        this.modules = new Map();
        this.initialized = false;
        this.eventBus = new EventTarget();
        this.init();
    }

    /**
     * Modül yöneticisini başlat
     */
    init() {
        if (this.initialized) return;
        
        console.log('📦 Module Manager Initializing...');
        
        // Event listener'ları kur
        this.setupEventListeners();
        
        // Modül kayıtlarını yükle
        this.loadModuleRegistry();
        
        this.initialized = true;
        console.log('✅ Module Manager Initialized');
    }

    /**
     * Modül kayıt
     * @param {string} name - Modül adı
     * @param {Object} module - Modül instance
     * @param {Array} dependencies - Bağımlılıklar
     */
    register(name, module, dependencies = []) {
        // Bağımlılık kontrolü
        const missingDeps = dependencies.filter(dep => !this.modules.has(dep));
        if (missingDeps.length > 0) {
            console.warn(`⚠️ Module ${name} dependencies not met: ${missingDeps.join(', ')}`);
        }

        this.modules.set(name, {
            instance: module,
            name: name,
            dependencies: dependencies,
            initialized: false
        });

        console.log(`✅ Module registered: ${name}`);
        
        // Modül hazırsa başlat
        if (this.canInitialize(name)) {
            this.initializeModule(name);
        }
    }

    /**
     * Modül başlatma kontrolü
     */
    canInitialize(moduleName) {
        const module = this.modules.get(moduleName);
        if (!module || module.initialized) return false;

        return module.dependencies.every(dep => {
            const depModule = this.modules.get(dep);
            return depModule && depModule.initialized;
        });
    }

    /**
     * Modülü başlat
     */
    initializeModule(moduleName) {
        const module = this.modules.get(moduleName);
        if (!module || module.initialized) return;

        try {
            if (module.instance.init) {
                module.instance.init();
            }
            module.initialized = true;
            console.log(`🚀 Module initialized: ${moduleName}`);
            
            // Başlatma eventi gönder
            this.emit('module:initialized', { name: moduleName });
            
            // Diğer modülleri kontrol et
            this.checkPendingModules();
        } catch (error) {
            console.error(`❌ Error initializing module ${moduleName}:`, error);
        }
    }

    /**
     * Bekleyen modülleri kontrol et ve başlat
     */
    checkPendingModules() {
        for (const [name, module] of this.modules.entries()) {
            if (!module.initialized && this.canInitialize(name)) {
                this.initializeModule(name);
            }
        }
    }

    /**
     * Modül getir
     */
    get(name) {
        const module = this.modules.get(name);
        return module ? module.instance : null;
    }

    /**
     * Modül var mı kontrol et
     */
    has(name) {
        return this.modules.has(name);
    }

    /**
     * Event gönder
     */
    emit(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        this.eventBus.dispatchEvent(event);
    }

    /**
     * Event dinle
     */
    on(eventName, callback) {
        this.eventBus.addEventListener(eventName, callback);
    }

    /**
     * Event dinlemeyi kaldır
     */
    off(eventName, callback) {
        this.eventBus.removeEventListener(eventName, callback);
    }

    /**
     * Event listener'ları kur
     */
    setupEventListeners() {
        // Global event'ler
        this.on('module:initialized', (e) => {
            console.log(`📦 Module ${e.detail.name} is ready`);
        });

        // Prosedür uyumluluk kontrolleri
        this.on('procedure:check', (e) => {
            this.validateProcedure(e.detail);
        });
    }

    /**
     * Prosedür doğrulama
     */
    validateProcedure(procedure) {
        // PROCEDURES_WORKFLOW.md ve POS_SYSTEM_WORKFLOW.md prosedürlerine göre kontrol
        const validProcedures = [
            'product:add',
            'product:edit',
            'product:delete',
            'order:create',
            'order:update',
            'order:cancel',
            'payment:process',
            'payment:refund',
            'livestream:start',
            'livestream:stop',
            'pos:sale',
            'pos:refund'
        ];

        if (!validProcedures.includes(procedure.action)) {
            console.warn(`⚠️ Unknown procedure: ${procedure.action}`);
            return false;
        }

        return true;
    }

    /**
     * Modül kayıt defterini yükle
     */
    loadModuleRegistry() {
        // Modül kayıtları localStorage'dan yüklenebilir
        const saved = localStorage.getItem('moduleRegistry');
        if (saved) {
            try {
                const registry = JSON.parse(saved);
                console.log('📋 Module registry loaded:', registry);
            } catch (e) {
                console.error('Error loading module registry:', e);
            }
        }
    }

    /**
     * Modül kayıt defterini kaydet
     */
    saveModuleRegistry() {
        const registry = Array.from(this.modules.entries()).map(([name, module]) => ({
            name: module.name,
            dependencies: module.dependencies,
            initialized: module.initialized
        }));
        
        localStorage.setItem('moduleRegistry', JSON.stringify(registry));
    }

    /**
     * Tüm modülleri listele
     */
    listModules() {
        return Array.from(this.modules.keys());
    }

    /**
     * Modül durumu
     */
    getModuleStatus(name) {
        const module = this.modules.get(name);
        if (!module) return null;

        return {
            name: module.name,
            initialized: module.initialized,
            dependencies: module.dependencies,
            dependenciesMet: module.dependencies.every(dep => {
                const depModule = this.modules.get(dep);
                return depModule && depModule.initialized;
            })
        };
    }

    /**
     * Tüm modül durumları
     */
    getAllModuleStatuses() {
        const statuses = {};
        for (const name of this.modules.keys()) {
            statuses[name] = this.getModuleStatus(name);
        }
        return statuses;
    }
}

// Global Module Manager Instance
window.ModuleManager = ModuleManager;
window.moduleManager = new ModuleManager();

console.log('✅ Module Manager Loaded');



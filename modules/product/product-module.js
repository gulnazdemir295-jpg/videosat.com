/**
 * VideoSat Platform - Ürün Yönetimi Modülü
 * Prosedür: PROCEDURES_WORKFLOW.md - Ürün Ekleme Prosedürü
 * 
 * Özellikler:
 * - Ürün ekleme/düzenleme/silme
 * - Birim yönetimi (kg, m², m³, litre, gram, adet)
 * - Stok yönetimi
 * - Ürün kategorileri
 * - Fiyat yönetimi
 * - Ürün filtreleme ve arama
 */

class ProductModule {
    constructor() {
        this.name = 'Product';
        this.version = '1.0.0';
        this.products = [];
        this.categories = [
            'otomotiv',
            'tekstil',
            'gida',
            'kimya',
            'metal',
            'diger'
        ];
        this.units = [
            { value: 'kg', label: 'Kilogram (kg)', type: 'weight' },
            { value: 'm2', label: 'Metrekare (m²)', type: 'area' },
            { value: 'm3', label: 'Metreküp (m³)', type: 'volume' },
            { value: 'litre', label: 'Litre', type: 'liquid' },
            { value: 'gram', label: 'Gram', type: 'weight' },
            { value: 'adet', label: 'Adet', type: 'count' }
        ];
        this.initialized = false;
    }

    /**
     * Modül başlatma
     */
    init() {
        if (this.initialized) return;
        
        console.log('📦 Product Module Initializing...');
        
        // Verileri yükle
        this.loadData();
        
        // Event listener'ları kur
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('✅ Product Module Initialized');
    }

    /**
     * Event listener'ları kur
     */
    setupEventListeners() {
        if (window.moduleManager) {
            window.moduleManager.on('product:stockUpdated', (e) => {
                this.handleStockUpdate(e.detail);
            });
        }
    }

    /**
     * Verileri yükle
     */
    loadData() {
        const saved = localStorage.getItem('products');
        if (saved) {
            try {
                this.products = JSON.parse(saved);
            } catch (e) {
                this.products = [];
            }
        }

        // Varsayılan ürünler (test için)
        if (this.products.length === 0) {
            this.loadDefaultProducts();
        }
    }

    /**
     * Varsayılan ürünleri yükle
     */
    loadDefaultProducts() {
        // Test ürünleri eklenebilir
        this.saveData();
    }

    /**
     * Verileri kaydet
     */
    saveData() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    /**
     * Ürün ekle
     * Prosedür: PROCEDURES_WORKFLOW.md - Ürün Ekleme Prosedürü
     */
    addProduct(productData) {
        // Validasyon
        this.validateProductData(productData);

        // Ürün oluştur
        const product = {
            id: this.generateProductId(),
            name: productData.name.trim(),
            description: productData.description || '',
            category: productData.category,
            brand: productData.brand || '',
            unit: productData.unit, // KRİTİK: Birim seçimi
            unitPrice: parseFloat(productData.price) || 0,
            stock: parseFloat(productData.stock) || 0,
            minOrder: parseFloat(productData.minOrder) || 1,
            images: productData.images || [],
            status: productData.status || 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            supplierId: productData.supplierId || null,
            supplierRole: productData.supplierRole || null
        };

        // Ürünü ekle
        this.products.push(product);
        this.saveData();

        // Event gönder
        if (window.moduleManager) {
            window.moduleManager.emit('product:added', { product });
        }

        console.log('✅ Ürün eklendi:', product.name);
        return product;
    }

    /**
     * Ürün güncelle
     */
    updateProduct(productId, updateData) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            throw new Error('Ürün bulunamadı');
        }

        // Güncelleme verilerini kontrol et
        const allowedFields = ['name', 'description', 'category', 'brand', 'unit', 'unitPrice', 'stock', 'minOrder', 'images', 'status'];
        const updates = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                updates[field] = updateData[field];
            }
        }

        // Birim değişikliği kontrolü (KRİTİK)
        if (updates.unit && updates.unit !== product.unit) {
            // Birim değişikliği uyarısı
            console.warn(`⚠️ Ürün birimi değiştiriliyor: ${product.unit} → ${updates.unit}`);
        }

        // Ürünü güncelle
        Object.assign(product, updates);
        product.updatedAt = new Date().toISOString();
        this.saveData();

        // Event gönder
        if (window.moduleManager) {
            window.moduleManager.emit('product:updated', { product });
        }

        return product;
    }

    /**
     * Ürün sil
     */
    deleteProduct(productId) {
        const index = this.products.findIndex(p => p.id === productId);
        if (index === -1) {
            throw new Error('Ürün bulunamadı');
        }

        const product = this.products[index];
        this.products.splice(index, 1);
        this.saveData();

        // Event gönder
        if (window.moduleManager) {
            window.moduleManager.emit('product:deleted', { productId, product });
        }

        return true;
    }

    /**
     * Ürün getir
     */
    getProduct(productId) {
        return this.products.find(p => p.id === productId);
    }

    /**
     * Ürünleri listele
     */
    getProducts(filters = {}) {
        let filtered = [...this.products];

        // Kategori filtresi
        if (filters.category) {
            filtered = filtered.filter(p => p.category === filters.category);
        }

        // Birim filtresi
        if (filters.unit) {
            filtered = filtered.filter(p => p.unit === filters.unit);
        }

        // Durum filtresi
        if (filters.status) {
            filtered = filtered.filter(p => p.status === filters.status);
        }

        // Arama
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                (p.brand && p.brand.toLowerCase().includes(searchTerm))
            );
        }

        // Stok kontrolü
        if (filters.inStock === true) {
            filtered = filtered.filter(p => p.stock > 0);
        }

        // Fiyat aralığı
        if (filters.minPrice !== undefined) {
            filtered = filtered.filter(p => p.unitPrice >= filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
            filtered = filtered.filter(p => p.unitPrice <= filters.maxPrice);
        }

        // Sıralama
        if (filters.sortBy) {
            filtered.sort((a, b) => {
                switch (filters.sortBy) {
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'price':
                        return a.unitPrice - b.unitPrice;
                    case 'stock':
                        return a.stock - b.stock;
                    case 'date':
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    default:
                        return 0;
                }
            });

            if (filters.sortOrder === 'desc') {
                filtered.reverse();
            }
        }

        return filtered;
    }

    /**
     * Stok kontrolü
     */
    checkStock(productId, quantity) {
        const product = this.getProduct(productId);
        if (!product) {
            return { available: false, message: 'Ürün bulunamadı' };
        }

        if (product.stock < quantity) {
            return {
                available: false,
                message: `Yetersiz stok. Mevcut stok: ${product.stock} ${product.unit}`,
                availableStock: product.stock
            };
        }

        return {
            available: true,
            availableStock: product.stock,
            requestedQuantity: quantity
        };
    }

    /**
     * Stok güncelle
     */
    updateStock(productId, quantityChange) {
        const product = this.getProduct(productId);
        if (!product) {
            throw new Error('Ürün bulunamadı');
        }

        const newStock = product.stock + quantityChange;
        
        if (newStock < 0) {
            throw new Error('Stok negatif olamaz');
        }

        product.stock = newStock;
        product.updatedAt = new Date().toISOString();
        this.saveData();

        // Event gönder
        if (window.moduleManager) {
            window.moduleManager.emit('product:stockUpdated', {
                productId,
                oldStock: product.stock - quantityChange,
                newStock: product.stock,
                change: quantityChange
            });
        }

        return product;
    }

    /**
     * Ürün veri validasyonu
     */
    validateProductData(data) {
        // Ürün adı kontrolü
        if (!data.name || data.name.trim().length === 0) {
            throw new Error('Ürün adı zorunludur');
        }

        if (data.name.trim().length < 3) {
            throw new Error('Ürün adı en az 3 karakter olmalıdır');
        }

        // Kategori kontrolü
        if (!data.category || !this.categories.includes(data.category)) {
            throw new Error('Geçerli bir kategori seçiniz');
        }

        // Birim kontrolü (KRİTİK - PROCEDURES_WORKFLOW.md)
        if (!data.unit) {
            throw new Error('Birim seçimi zorunludur');
        }

        const validUnits = this.units.map(u => u.value);
        if (!validUnits.includes(data.unit)) {
            throw new Error('Geçerli bir birim seçiniz (kg, m², m³, litre, gram, adet)');
        }

        // Fiyat kontrolü
        if (data.price === undefined || data.price === null) {
            throw new Error('Birim fiyat zorunludur');
        }

        const price = parseFloat(data.price);
        if (isNaN(price) || price < 0) {
            throw new Error('Geçerli bir fiyat giriniz (0 veya daha büyük)');
        }

        // Stok kontrolü
        const stock = parseFloat(data.stock) || 0;
        if (stock < 0) {
            throw new Error('Stok miktarı negatif olamaz');
        }

        return true;
    }

    /**
     * Birim bilgisi getir
     */
    getUnitInfo(unit) {
        return this.units.find(u => u.value === unit);
    }

    /**
     * Tüm birimler
     */
    getAllUnits() {
        return this.units;
    }

    /**
     * Tüm kategoriler
     */
    getAllCategories() {
        return this.categories;
    }

    /**
     * Ürün istatistikleri
     */
    getStatistics() {
        const totalProducts = this.products.length;
        const activeProducts = this.products.filter(p => p.status === 'active').length;
        const totalStock = this.products.reduce((sum, p) => sum + p.stock, 0);
        const totalValue = this.products.reduce((sum, p) => sum + (p.stock * p.unitPrice), 0);

        // Birim bazlı dağılım
        const unitDistribution = {};
        this.units.forEach(unit => {
            unitDistribution[unit.value] = this.products.filter(p => p.unit === unit.value).length;
        });

        // Kategori bazlı dağılım
        const categoryDistribution = {};
        this.categories.forEach(cat => {
            categoryDistribution[cat] = this.products.filter(p => p.category === cat).length;
        });

        return {
            totalProducts,
            activeProducts,
            inactiveProducts: totalProducts - activeProducts,
            totalStock,
            totalValue,
            unitDistribution,
            categoryDistribution
        };
    }

    /**
     * Stok güncelleme handler
     */
    handleStockUpdate(data) {
        console.log('Product: Stock updated', data);
    }

    /**
     * Ürün ID üret
     */
    generateProductId() {
        return `PROD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Toplu ürün ekleme
     */
    bulkAddProducts(productsData) {
        const added = [];
        const errors = [];

        for (const productData of productsData) {
            try {
                const product = this.addProduct(productData);
                added.push(product);
            } catch (error) {
                errors.push({
                    productData,
                    error: error.message
                });
            }
        }

        return {
            success: errors.length === 0,
            added: added.length,
            errors: errors.length,
            details: {
                added,
                errors
            }
        };
    }

    /**
     * Ürün çoğaltma
     */
    duplicateProduct(productId, newName = null) {
        const original = this.getProduct(productId);
        if (!original) {
            throw new Error('Ürün bulunamadı');
        }

        const duplicateData = {
            name: newName || `${original.name} (Kopya)`,
            description: original.description,
            category: original.category,
            brand: original.brand,
            unit: original.unit,
            price: original.unitPrice,
            stock: 0, // Kopya ürün stok 0
            minOrder: original.minOrder,
            images: [...original.images],
            status: 'active'
        };

        return this.addProduct(duplicateData);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductModule;
} else {
    window.ProductModule = ProductModule;
}

console.log('✅ Product Module Loaded');



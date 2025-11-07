(function () {
    'use strict';

    const STORAGE_PREFIX = 'videosat_panel_';

    const ROLE_CONFIG = {
        admin: {
            badgeIcon: 'fa-crown',
            badgeLabel: 'Yönetim',
            title: 'Yönetim POS Merkezi',
            subtitle: 'Tüm departmanlar için canlı performans ve satış görünümü'
        },
        hammaddeci: {
            badgeIcon: 'fa-industry',
            badgeLabel: 'Hammadde',
            title: 'Hammadde POS Alanı',
            subtitle: 'Tedarik, stok ve sipariş operasyonlarını yönetin'
        },
        uretici: {
            badgeIcon: 'fa-factory',
            badgeLabel: 'Üretim',
            title: 'Üretim POS Alanı',
            subtitle: 'Üretim hatları, stok seviyeleri ve canlı satış takibi'
        },
        toptanci: {
            badgeIcon: 'fa-warehouse',
            badgeLabel: 'Toptan',
            title: 'Toptan Satış POS',
            subtitle: 'B2B sipariş akışı, cari ve stok yönetimi'
        },
        satici: {
            badgeIcon: 'fa-store',
            badgeLabel: 'Perakende',
            title: 'Perakende POS',
            subtitle: 'Mağaza içi satış, stok ve canlı yayın dönüşümleri'
        },
        musterihizmetleri: {
            badgeIcon: 'fa-headset',
            badgeLabel: 'Destek',
            title: 'Destek POS Konsolu',
            subtitle: 'Çağrı merkezi satış operasyonlarını takip edin'
        },
        finans: {
            badgeIcon: 'fa-coins',
            badgeLabel: 'Finans',
            title: 'Finans POS Alanı',
            subtitle: 'Tahsilat, ödeme ve kasa yönetimi'
        },
        yonetim: {
            badgeIcon: 'fa-briefcase',
            badgeLabel: 'Yönetim',
            title: 'Yönetim POS Merkezi',
            subtitle: 'Tüm departmanların KPI ve satış performansı'
        },
        operasyon: {
            badgeIcon: 'fa-cogs',
            badgeLabel: 'Operasyon',
            title: 'Operasyon Kontrol Merkezi',
            subtitle: 'Sipariş akışları, kargo ve canlı yayın yönetimi'
        },
        insankaynaklari: {
            badgeIcon: 'fa-users-cog',
            badgeLabel: 'İK',
            title: 'İnsan Kaynakları Paneli',
            subtitle: 'Personel, vardiya ve eğitim yönetimi'
        },
        personelozlukisleri: {
            badgeIcon: 'fa-id-card',
            badgeLabel: 'Özlük',
            title: 'Özlük İşleri Paneli',
            subtitle: 'Personel kartları, izin ve sözleşme takibi'
        },
        reklam: {
            badgeIcon: 'fa-bullhorn',
            badgeLabel: 'Reklam',
            title: 'Reklam & Kampanya Paneli',
            subtitle: 'Kampanya performansı ve bütçe yönetimi'
        },
        isgelistirme: {
            badgeIcon: 'fa-lightbulb',
            badgeLabel: 'İş Geliştirme',
            title: 'İş Geliştirme Paneli',
            subtitle: 'Yeni fırsatlar, iş ortakları ve teklif yönetimi'
        },
        arge: {
            badgeIcon: 'fa-flask',
            badgeLabel: 'AR-GE',
            title: 'AR-GE Operasyon Merkezi',
            subtitle: 'Ürün prototipleri ve test süreçleri'
        },
        yazilimdonanimguvenlik: {
            badgeIcon: 'fa-microchip',
            badgeLabel: 'Teknoloji',
            title: 'Yazılım · Donanım · Güvenlik Paneli',
            subtitle: 'Sistem sağlığı, güvenlik olayları ve deploy takibi'
        },
        default: {
            badgeIcon: 'fa-play-circle',
            badgeLabel: 'Panel',
            title: 'VideoSat POS Alanı',
            subtitle: 'Satış operasyonlarını gerçek zamanlı takip edin'
        }
    };

    const PRODUCT_CATALOG = {
        default: [
            { id: 'prd-sony-a7', name: 'Sony A7 IV Kamera', category: 'Kamera', price: 89990, stock: 18, unit: 'adet' },
            { id: 'prd-tripod-carbon', name: 'Karbon Fiber Tripod', category: 'Aksesuar', price: 6490, stock: 42, unit: 'adet' },
            { id: 'prd-4k-encoder', name: '4K RTMP Encoder', category: 'Canlı Yayın', price: 22990, stock: 15, unit: 'adet' },
            { id: 'prd-led-panel', name: '1200W LED Işık Paneli', category: 'Işık', price: 7890, stock: 30, unit: 'adet' },
            { id: 'prd-wireless-mic', name: 'Kablosuz Mikrofon Seti', category: 'Ses', price: 5690, stock: 28, unit: 'adet' },
            { id: 'prd-vision-mixer', name: 'Vision Mixer Pro', category: 'Canlı Yayın', price: 32990, stock: 8, unit: 'adet' },
            { id: 'prd-greenback', name: '3x6 Yeşil Fon Perdesi', category: 'Stüdyo', price: 1990, stock: 55, unit: 'adet' }
        ],
        hammaddeci: [
            { id: 'raw-cot-01', name: 'Organik Pamuk Balya', category: 'Tekstil', price: 11990, stock: 64, unit: 'balya' },
            { id: 'raw-wool-02', name: 'İşlenmemiş Yün', category: 'Tekstil', price: 15990, stock: 38, unit: 'kg' },
            { id: 'raw-dye-03', name: 'Doğal Boya Seti', category: 'Kimyasal', price: 8990, stock: 24, unit: 'set' }
        ],
        uretici: [
            { id: 'mfg-pack-01', name: 'VideoSat Prodüksiyon Paketi', category: 'Paket', price: 46990, stock: 22, unit: 'adet' },
            { id: 'mfg-fast-02', name: 'Hızlı Kurulum Rig', category: 'Platform', price: 28990, stock: 14, unit: 'adet' }
        ],
        toptanci: [
            { id: 'whl-bundle-01', name: 'Stüdyo Kiti (10lu)', category: 'Bundle', price: 189990, stock: 6, unit: 'paket' },
            { id: 'whl-encoder-20', name: 'Encoder Paket (20li)', category: 'Elektronik', price: 349990, stock: 4, unit: 'paket' }
        ],
        satici: [
            { id: 'ret-camera-01', name: 'VideoSat Pocket Kamera', category: 'Elektronik', price: 11990, stock: 32, unit: 'adet' },
            { id: 'ret-light-02', name: 'Softbox Işık Sistemi', category: 'Işık', price: 4990, stock: 27, unit: 'adet' },
            { id: 'ret-mic-03', name: 'VideoSat Lavalier Mikrofon', category: 'Ses', price: 1490, stock: 74, unit: 'adet' }
        ],
        musterihizmetleri: [
            { id: 'cs-support-01', name: 'Destek Paketi 1', category: 'Destek', price: 1990, stock: 99, unit: 'paket' },
            { id: 'cs-support-02', name: 'Destek Paketi 2', category: 'Destek', price: 3490, stock: 56, unit: 'paket' }
        ],
        finans: [
            { id: 'fn-pos-01', name: 'Fatura Tahsilatı', category: 'Finans', price: 0, stock: 999, unit: 'işlem' },
            { id: 'fn-report-02', name: 'Aylık Rapor Paketi', category: 'Raporlama', price: 990, stock: 120, unit: 'adet' }
        ],
        operasyon: [
            { id: 'op-log-01', name: 'Operasyon Raporu', category: 'Operasyon', price: 0, stock: 999, unit: 'rapor' }
        ],
        insankaynaklari: [
            { id: 'hr-train-01', name: 'Eğitim Modülü', category: 'İK', price: 590, stock: 48, unit: 'paket' }
        ],
        personelozlukisleri: [
            { id: 'hr-doc-01', name: 'Özlük Dosya Paketi', category: 'Özlük', price: 390, stock: 120, unit: 'paket' }
        ],
        reklam: [
            { id: 'ads-kit-01', name: 'Yayın Sponsorluk Paketi', category: 'Pazarlama', price: 14990, stock: 12, unit: 'paket' }
        ],
        isgelistirme: [
            { id: 'biz-proposal-01', name: 'Teklif Paketi', category: 'İş Geliştirme', price: 990, stock: 30, unit: 'paket' }
        ],
        arge: [
            { id: 'rnd-proto-01', name: 'Çıkarılabilir Prototip', category: 'AR-GE', price: 19990, stock: 6, unit: 'adet' }
        ],
        yazilimdonanimguvenlik: [
            { id: 'tech-monitor-01', name: 'Sistem İzleme Paketi', category: 'Teknoloji', price: 2990, stock: 40, unit: 'paket' }
        ]
    };

    const TEAM_MEMBERS = {
        default: [
            { name: 'Ayşe Demir', title: 'Canlı Yayın Operasyonu', status: 'aktif' },
            { name: 'Mert Korkmaz', title: 'Satış Uzmanı', status: 'aktif' },
            { name: 'Elif Yalçın', title: 'Stok Sorumlusu', status: 'müsait' }
        ],
        hammaddeci: [
            { name: 'Seda Kaplan', title: 'Tedarik Uzmanı', status: 'aktif' },
            { name: 'Ahmet Uğur', title: 'Depo Şefi', status: 'sahada' }
        ],
        uretici: [
            { name: 'Cem Arslan', title: 'Üretim Müdürü', status: 'aktif' },
            { name: 'Eren Yıldız', title: 'Kalite Kontrol', status: 'aktif' }
        ],
        toptanci: [
            { name: 'Zeynep Kurt', title: 'B2B Satış', status: 'online' },
            { name: 'Okan Soylu', title: 'Lojistik', status: 'rota üzerinde' }
        ],
        satici: [
            { name: 'Nilay Keser', title: 'Mağaza Müdürü', status: 'aktif' },
            { name: 'Berk Güneş', title: 'Mağaza Satış', status: 'aktif' }
        ],
        operasyon: [
            { name: 'Toprak Şen', title: 'Operasyon Koordinatörü', status: 'aktif' },
            { name: 'Melisa Erol', title: 'Lojistik Uzmanı', status: 'rota üzerinde' }
        ],
        insankaynaklari: [
            { name: 'Gizem Yılmaz', title: 'İK Uzmanı', status: 'aktif' },
            { name: 'Caner Aydın', title: 'Eğitim Koordinatörü', status: 'aktif' }
        ],
        reklam: [
            { name: 'Su Öz', title: 'Kampanya Yöneticisi', status: 'aktif' },
            { name: 'Baran Usta', title: 'Medya Planlama', status: 'planlama' }
        ],
        isgelistirme: [
            { name: 'İrem Dursun', title: 'İş Geliştirme Uzmanı', status: 'aktif' },
            { name: 'Emir Demir', title: 'Ortaklıklar', status: 'toplantıda' }
        ],
        arge: [
            { name: 'Serra Tunç', title: 'AR-GE Lideri', status: 'laboratuvar' },
            { name: 'Koray Güven', title: 'Prototip Mühendisi', status: 'aktif' }
        ],
        yazilimdonanimguvenlik: [
            { name: 'Ayhan Çelik', title: 'Güvenlik Analisti', status: 'aktif' },
            { name: 'Duygu Dinç', title: 'DevOps Mühendisi', status: 'deploy' }
        ]
    };

    const CUSTOMER_QUEUES = {
        default: [
            { name: 'Kuyruk #1024', wait: '2 dk', channel: 'Web POS' },
            { name: 'Kuyruk #1025', wait: '4 dk', channel: 'Canlı Yayın' }
        ],
        musterihizmetleri: [
            { name: 'Çağrı #540', wait: '1 dk', channel: 'Çağrı Merkezi' },
            { name: 'Ticket #1278', wait: '3 dk', channel: 'Destek Talebi' }
        ],
        operasyon: [
            { name: 'Sipariş #432', wait: '2 dk', channel: 'Kargo Hazırlık' },
            { name: 'Yayın #884', wait: '5 dk', channel: 'Canlı Yayın' }
        ]
    };

    const LIVE_SESSION_STATE = {
        default: { online: true, viewers: 128, title: 'Teklif Yayını' },
        hammaddeci: { online: true, viewers: 86, title: 'Hammadde Tedarik Yayını' },
        uretici: { online: false, viewers: 0, title: 'Üretim Stüdyosu' },
        toptanci: { online: true, viewers: 45, title: 'B2B Demo' },
        satici: { online: true, viewers: 210, title: 'Perakende Showroom' },
        operasyon: { online: true, viewers: 64, title: 'Operasyon Takip' },
        yazilimdonanimguvenlik: { online: false, viewers: 0, title: 'Sistem Kontrol' }
    };

    const ORDER_SEED = {
        default: [
            { id: 'ORD-2301', customer: 'Studio One', total: 18990, status: 'tamamlandı', createdAt: daysAgo(1) },
            { id: 'ORD-2302', customer: 'LivePro', total: 32990, status: 'tamamlandı', createdAt: hoursAgo(6) }
        ],
        satici: [
            { id: 'S-1021', customer: 'Mağaza Satışı', total: 7490, status: 'tamamlandı', createdAt: hoursAgo(3) },
            { id: 'S-1022', customer: 'Canlı Yayın', total: 12990, status: 'tamamlandı', createdAt: hoursAgo(5) }
        ],
        finans: [
            { id: 'FN-5001', customer: 'Tahsilat', total: 4590, status: 'beklemede', createdAt: hoursAgo(2) }
        ],
        operasyon: [
            { id: 'OP-431', customer: 'Operasyon', total: 2390, status: 'tamamlandı', createdAt: hoursAgo(4) }
        ],
        reklam: [
            { id: 'AD-902', customer: 'Reklam Kamp.', total: 14990, status: 'tamamlandı', createdAt: hoursAgo(8) }
        ]
    };

    function daysAgo(count) {
        const date = new Date();
        date.setDate(date.getDate() - count);
        return date.toISOString();
    }

    function hoursAgo(count) {
        const date = new Date();
        date.setHours(date.getHours() - count);
        return date.toISOString();
    }

    function clone(data) {
        return JSON.parse(JSON.stringify(data));
    }

    function normalizeRole(value) {
        return (value || 'satici').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    function storageKey(key, role) {
        return `${STORAGE_PREFIX}${key}_${normalizeRole(role)}`;
    }

    function getLocal(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return clone(fallback);
            return JSON.parse(raw);
        } catch (error) {
            console.warn('PanelBackend getLocal error:', error);
            return clone(fallback);
        }
    }

    function setLocal(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('PanelBackend setLocal error:', error);
        }
    }

    function getCurrentUser() {
        try {
            const raw = localStorage.getItem('currentUser');
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.warn('PanelBackend currentUser parse error:', error);
            return null;
        }
    }

    function getActiveRole() {
        const params = new URLSearchParams(window.location.search);
        const urlRole = params.get('role');
        const stored = getCurrentUser();
        return normalizeRole(urlRole || stored?.role || 'satici');
    }

    function ensureSeedData(role) {
        const cleanRole = normalizeRole(role);
        const catalog = PRODUCT_CATALOG[cleanRole] || PRODUCT_CATALOG.default;
        const productKey = storageKey('products', cleanRole);
        if (!localStorage.getItem(productKey)) {
            setLocal(productKey, clone(catalog));
        }

        const orderKey = storageKey('orders', cleanRole);
        if (!localStorage.getItem(orderKey)) {
            const seed = ORDER_SEED[cleanRole] || ORDER_SEED.default || [];
            setLocal(orderKey, clone(seed));
        }

        const cartKey = storageKey('cart', cleanRole);
        if (!localStorage.getItem(cartKey)) {
            setLocal(cartKey, []);
        }
    }

    function getRoleConfig(role) {
        return ROLE_CONFIG[normalizeRole(role)] || ROLE_CONFIG.default;
    }

    function getProducts(role) {
        const cleanRole = normalizeRole(role);
        const key = storageKey('products', cleanRole);
        const fallback = PRODUCT_CATALOG[cleanRole] || PRODUCT_CATALOG.default;
        return clone(getLocal(key, fallback));
    }

    function saveProducts(role, products) {
        const key = storageKey('products', role);
        setLocal(key, products);
    }

    function getCart(role) {
        const key = storageKey('cart', role);
        return clone(getLocal(key, []));
    }

    function saveCart(role, cart) {
        const key = storageKey('cart', role);
        setLocal(key, cart);
    }

    function getOrders(role) {
        const key = storageKey('orders', role);
        return clone(getLocal(key, []));
    }

    function saveOrders(role, orders) {
        const key = storageKey('orders', role);
        setLocal(key, orders);
    }

    function createOrder(role, payload) {
        const cleanRole = normalizeRole(role);
        const orders = getOrders(cleanRole);
        const orderId = `${cleanRole.substring(0, 2).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        const now = new Date().toISOString();
        const order = {
            id: orderId,
            role: cleanRole,
            customer: payload.customer || 'Canlı Yayın Satışı',
            total: payload.total || 0,
            subtotal: payload.subtotal || 0,
            tax: payload.tax || 0,
            items: clone(payload.items || []),
            status: payload.status || 'tamamlandı',
            createdAt: now
        };
        orders.unshift(order);
        saveOrders(cleanRole, orders.slice(0, 50));
        return order;
    }

    function getRecentOrders(role) {
        const orders = getOrders(role);
        return orders.slice(0, 6);
    }

    function getTeam(role) {
        const cleanRole = normalizeRole(role);
        return clone(TEAM_MEMBERS[cleanRole] || TEAM_MEMBERS.default || []);
    }

    function getCustomerQueue(role) {
        const cleanRole = normalizeRole(role);
        return clone(CUSTOMER_QUEUES[cleanRole] || CUSTOMER_QUEUES.default || []);
    }

    function getLiveSession(role) {
        const cleanRole = normalizeRole(role);
        return clone(LIVE_SESSION_STATE[cleanRole] || LIVE_SESSION_STATE.default || { online: false, viewers: 0, title: 'Yayın Yok' });
    }

    function calculateStats(role) {
        const cleanRole = normalizeRole(role);
        const orders = getOrders(cleanRole);
        const products = getProducts(cleanRole);
        const today = new Date().toISOString().slice(0, 10);
        let todayRevenue = 0;
        let activeOrders = 0;

        orders.forEach(order => {
            if ((order.createdAt || '').startsWith(today)) {
                todayRevenue += Number(order.total || 0);
            }
            if ((order.status || '').toLowerCase() === 'beklemede' || (order.status || '').toLowerCase() === 'pending') {
                activeOrders += 1;
            }
        });

        const inventoryValue = products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0), 0);
        return {
            todayRevenue,
            activeOrders,
            inventoryValue
        };
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }).format(value || 0);
    }

    function PanelBackendInit() {
        const role = PanelBackend.getActiveRole();
        ensureSeedData(role);
        return role;
    }

    const PanelBackend = {
        init: PanelBackendInit,
        getCurrentUser,
        getActiveRole,
        getRoleConfig,
        getProducts,
        saveProducts,
        getCart,
        saveCart,
        getRecentOrders,
        createOrder,
        getTeamMembers: getTeam,
        getCustomerQueue,
        getLiveSession,
        getDashboardStats(role) {
            const stats = calculateStats(role);
            return {
                todayRevenue: formatCurrency(stats.todayRevenue),
                rawTodayRevenue: stats.todayRevenue,
                activeOrders: stats.activeOrders,
                inventoryValue: formatCurrency(stats.inventoryValue)
            };
        },
        getOrders,
        formatCurrency
    };

    window.PanelBackend = PanelBackend;
})();

/**
 * POS (Point of Sale) Application JavaScript
 * Satış terminali yönetimi
 */

let posProducts = [];
let posCart = [];
let posDiscount = { type: 'percentage', amount: 0 };
let currentCustomer = null;
let posSales = [];
let totalTodaySales = 0;
let totalTodayTransactions = 0;

// Initialize POS
document.addEventListener('DOMContentLoaded', function() {
    initializePOS();
    loadPOSProducts();
    loadPOSDashboardData();
    loadPOSHistory();
});

// Initialize POS System
function initializePOS() {
    console.log('POS System Initializing...');

    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.role) {
        window.location.href = '../index.html';
        return;
    }

    // Update company info
    const companyName = currentUser.companyName || 'Firma Adı';
    document.getElementById('companyName').textContent = companyName;

    // Setup event listeners
    setupPOSEventListeners();

    console.log('✅ POS System Initialized');
}

// Setup Event Listeners
function setupPOSEventListeners() {
    // Discount input
    const discountInput = document.getElementById('posDiscountAmount');
    const discountType = document.getElementById('posDiscountType');
    
    if (discountInput) {
        discountInput.addEventListener('input', updatePOSDiscount);
    }
    
    if (discountType) {
        discountType.addEventListener('change', updatePOSDiscount);
    }

    // Customer search
    const customerSearch = document.getElementById('posCustomerSearch');
    if (customerSearch) {
        customerSearch.addEventListener('input', searchCustomer);
    }

    // Enter key on product search
    const productSearch = document.getElementById('posProductSearch');
    if (productSearch) {
        productSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }
}

// Load Products for POS
function loadPOSProducts() {
    // Load from localStorage or mock data
    const savedProducts = localStorage.getItem('products');
    
    if (savedProducts) {
        try {
            posProducts = JSON.parse(savedProducts);
        } catch (e) {
            console.error('Error loading products:', e);
            posProducts = getMockProducts();
        }
    } else {
        posProducts = getMockProducts();
    }

    // Update products array
    window.products = posProducts;
    
    renderPOSProducts();
}

// Get Mock Products
function getMockProducts() {
    return [
        {
            id: 1,
            name: 'Demir Çelik',
            category: 'metal',
            unit: 'kg',
            stock: 1000,
            price: 15.50,
            status: 'active',
            description: 'Yüksek kaliteli demir çelik'
        },
        {
            id: 2,
            name: 'Alüminyum Levha',
            category: 'metal',
            unit: 'm2',
            stock: 500,
            price: 25.00,
            status: 'active',
            description: 'Standart alüminyum levha'
        },
        {
            id: 3,
            name: 'PVC Granül',
            category: 'plastik',
            unit: 'kg',
            stock: 2000,
            price: 8.75,
            status: 'active',
            description: 'Kaliteli PVC granül'
        },
        {
            id: 4,
            name: 'Krom Kaplama',
            category: 'metal',
            unit: 'm2',
            stock: 150,
            price: 45.00,
            status: 'active',
            description: 'Premium krom kaplama'
        },
        {
            id: 5,
            name: 'Paslanmaz Çelik',
            category: 'metal',
            unit: 'kg',
            stock: 800,
            price: 28.50,
            status: 'active',
            description: '304 kalite paslanmaz çelik'
        }
    ];
}

// Render Products
function renderPOSProducts(filteredProducts = null) {
    const productsGrid = document.getElementById('posProducts');
    if (!productsGrid) return;

    const products = filteredProducts || posProducts;

    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-box" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>Ürün bulunamadı</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="pos-product-card ${product.stock === 0 ? 'out-of-stock' : ''}" 
             onclick="${product.stock > 0 ? `addToPOSCart(${product.id})` : ''}">
            <div class="pos-product-image">
                <i class="fas fa-box"></i>
            </div>
            <div class="pos-product-name">${product.name}</div>
            <div class="pos-product-price">₺${product.price.toFixed(2)}</div>
            <div class="pos-product-stock">
                ${product.stock > 0 ? `Stok: ${product.stock} ${getUnitSymbol(product.unit)}` : 'Stokta Yok'}
            </div>
        </div>
    `).join('');
}

// Get Unit Symbol
function getUnitSymbol(unit) {
    const symbols = {
        'kg': 'kg',
        'm2': 'm²',
        'm3': 'm³',
        'litre': 'L',
        'gram': 'g',
        'adet': 'adet'
    };
    return symbols[unit] || unit;
}

// Search Products
function searchProducts() {
    const searchTerm = document.getElementById('posProductSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('posCategoryFilter').value;

    let filtered = posProducts.filter(product => {
        const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    renderPOSProducts(filtered);
}

// Filter Products by Category
function filterProducts() {
    searchProducts();
}

// Add to Cart
function addToPOSCart(productId) {
    const product = posProducts.find(p => p.id === productId);
    
    if (!product) {
        showAlert('Ürün bulunamadı.', 'error');
        return;
    }

    if (product.stock === 0) {
        showAlert('Ürün stokta yok.', 'warning');
        return;
    }

    // Check if product already in cart
    const existingItem = posCart.find(item => item.productId === productId);

    if (existingItem) {
        // Check stock availability
        if (product.stock < existingItem.quantity + 1) {
            showAlert(`Yetersiz stok. Mevcut stok: ${product.stock}`, 'warning');
            return;
        }
        existingItem.quantity++;
    } else {
        posCart.push({
            id: Date.now(),
            productId: product.id,
            productName: product.name,
            price: product.price,
            unit: product.unit,
            quantity: 1
        });
    }

    renderPOSCart();
    playBeepSound(); // Success sound
}

// Render Cart
function renderPOSCart() {
    const cartItems = document.getElementById('posCartItems');
    const itemCount = document.getElementById('cartItemCount');
    
    if (!cartItems) return;

    // Update item count
    if (itemCount) {
        const totalItems = posCart.reduce((sum, item) => sum + item.quantity, 0);
        itemCount.textContent = `${totalItems} ürün`;
    }

    if (posCart.length === 0) {
        cartItems.innerHTML = `
            <div class="pos-cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Sepet boş</p>
                <p style="font-size: 12px;">Ürünleri seçerek sepete ekleyin</p>
            </div>
        `;
        updatePOSCartTotal();
        return;
    }

    cartItems.innerHTML = posCart.map(item => {
        const subtotal = item.price * item.quantity;
        const product = posProducts.find(p => p.id === item.productId);
        const availableStock = product ? product.stock : 0;

        return `
            <div class="pos-cart-item">
                <div class="pos-cart-item-info">
                    <div class="pos-cart-item-name">${item.productName}</div>
                    <div style="font-size: 11px; color: #999;">₺${item.price.toFixed(2)} x ${item.quantity}</div>
                    <div class="pos-cart-item-quantity">
                        <button onclick="decreasePOSQuantity(${item.id})" title="Azalt">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span style="min-width: 30px; text-align: center; display: inline-block;">${item.quantity}</span>
                        <button onclick="increasePOSQuantity(${item.id})" ${item.quantity >= availableStock ? 'disabled' : ''} title="Artır">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button onclick="removePOSCartItem(${item.id})" style="margin-left: 10px;" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="pos-cart-item-price">
                    ₺${subtotal.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');

    updatePOSCartTotal();
}

// Increase Quantity
function increasePOSQuantity(cartItemId) {
    const item = posCart.find(i => i.id === cartItemId);
    if (!item) return;

    const product = posProducts.find(p => p.id === item.productId);
    if (!product) return;

    if (product.stock <= item.quantity) {
        showAlert(`Yetersiz stok. Mevcut stok: ${product.stock}`, 'warning');
        return;
    }

    item.quantity++;
    renderPOSCart();
}

// Decrease Quantity
function decreasePOSQuantity(cartItemId) {
    const item = posCart.find(i => i.id === cartItemId);
    if (!item) return;

    if (item.quantity > 1) {
        item.quantity--;
    } else {
        removePOSCartItem(cartItemId);
    }
    renderPOSCart();
}

// Remove from Cart
function removePOSCartItem(cartItemId) {
    posCart = posCart.filter(item => item.id !== cartItemId);
    renderPOSCart();
}

// Clear Cart
function clearPosCart() {
    if (posCart.length === 0) {
        showAlert('Sepet zaten boş.', 'info');
        return;
    }

    if (confirm('Sepeti temizlemek istediğinize emin misiniz?')) {
        posCart = [];
        posDiscount = { type: 'percentage', amount: 0 };
        document.getElementById('posDiscountAmount').value = '';
        renderPOSCart();
        showAlert('Sepet temizlendi.', 'success');
    }
}

// Update Cart Total
function updatePOSCartTotal() {
    const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let discountAmount = 0;
    if (posDiscount.amount > 0) {
        if (posDiscount.type === 'percentage') {
            discountAmount = (subtotal * posDiscount.amount) / 100;
        } else {
            discountAmount = Math.min(posDiscount.amount, subtotal);
        }
    }

    const total = subtotal - discountAmount;

    document.getElementById('cartSubtotal').textContent = `₺${subtotal.toFixed(2)}`;
    document.getElementById('cartDiscount').textContent = `-₺${discountAmount.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `₺${total.toFixed(2)}`;
}

// Update Discount
function updatePOSDiscount() {
    const amount = parseFloat(document.getElementById('posDiscountAmount').value) || 0;
    const type = document.getElementById('posDiscountType').value;

    posDiscount = { type, amount };
    updatePOSCartTotal();
}

// Search Customer
function searchCustomer() {
    const searchTerm = document.getElementById('posCustomerSearch').value;
    // TODO: Implement customer search
    if (searchTerm.length >= 2) {
        console.log('Searching customer:', searchTerm);
        // Show customer suggestions
    }
}

// Complete Sale
function completePosSale() {
    if (posCart.length === 0) {
        showAlert('Sepet boş. Lütfen ürün ekleyin.', 'warning');
        return;
    }

    const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discountAmount = 0;
    if (posDiscount.amount > 0) {
        if (posDiscount.type === 'percentage') {
            discountAmount = (subtotal * posDiscount.amount) / 100;
        } else {
            discountAmount = Math.min(posDiscount.amount, subtotal);
        }
    }
    const total = subtotal - discountAmount;
    const paymentMethod = document.getElementById('posPaymentMethod').value;

    if (confirm(`${posCart.length} ürün, Toplam: ₺${total.toFixed(2)} - Ödeme Yöntemi: ${getPaymentMethodName(paymentMethod)}. Onaylıyor musunuz?`)) {
        // Create POS sale record
        const sale = {
            id: Date.now(),
            items: posCart.map(item => ({ ...item })),
            subtotal: subtotal,
            discount: discountAmount,
            total: total,
            paymentMethod: paymentMethod,
            customer: currentCustomer,
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        posSales.push(sale);
        localStorage.setItem('posSales', JSON.stringify(posSales));

        // Update stats
        totalTodaySales += total;
        totalTodayTransactions++;

        // Update stock
        posCart.forEach(item => {
            const product = posProducts.find(p => p.id === item.productId);
            if (product && product.stock >= item.quantity) {
                product.stock -= item.quantity;
            }
        });

        // Save updated products
        localStorage.setItem('products', JSON.stringify(posProducts));
        window.products = posProducts;

        // Update order service if available
        if (window.orderService) {
            try {
                const order = window.orderService.createOrder({
                    items: posCart.map(item => ({
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        price: item.price,
                        unit: item.unit
                    })),
                    subtotal: subtotal,
                    total: total,
                    customerInfo: currentCustomer || {},
                    paymentMethod: paymentMethod
                });
                console.log('Order created:', order);
            } catch (e) {
                console.error('Error creating order:', e);
            }
        }

        // Clear cart
        posCart = [];
        posDiscount = { type: 'percentage', amount: 0 };
        document.getElementById('posDiscountAmount').value = '';
        document.getElementById('posCustomerSearch').value = '';

        renderPOSCart();
        renderPOSProducts();

        // Show success
        showAlert(`Satış tamamlandı! Toplam: ₺${total.toFixed(2)}`, 'success');

        // Play success sound
        playSuccessSound();

        // Update dashboard
        loadPOSDashboardData();
    }
}

// Get Payment Method Name
function getPaymentMethodName(method) {
    const methods = {
        'cash': '💰 Nakit',
        'credit_card': '💳 Kredi Kartı',
        'bank_transfer': '🏦 Banka Transferi',
        'mixed': '🔀 Karışık'
    };
    return methods[method] || method;
}

// Play Beep Sound
function playBeepSound() {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Play Success Sound
function playSuccessSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 1200;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Load Dashboard Data
function loadPOSDashboardData() {
    // Load today's sales
    const today = new Date().toISOString().split('T')[0];
    const todaySales = posSales.filter(sale => {
        const saleDate = sale.createdAt.split('T')[0];
        return saleDate === today;
    });

    totalTodaySales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    totalTodayTransactions = todaySales.length;

    // Update top bar
    document.getElementById('topBarSales').textContent = `₺${totalTodaySales.toFixed(2)}`;
    document.getElementById('topBarTransactions').textContent = totalTodayTransactions;

    // Update dashboard
    document.getElementById('todaySales').textContent = `₺${totalTodaySales.toFixed(2)}`;

    // Calculate week and month sales (mock for now)
    const weekSales = totalTodaySales * 7;
    const monthSales = totalTodaySales * 30;
    document.getElementById('weekSales').textContent = `₺${weekSales.toFixed(2)}`;
    document.getElementById('monthSales').textContent = `₺${monthSales.toFixed(2)}`;

    // Load stock warnings
    loadStockWarnings();

    // Load live stream status
    loadLiveStreamStatus();

    // Load recent orders
    loadRecentOrders();
}

// Load Stock Warnings
function loadStockWarnings() {
    const stockWarnings = document.getElementById('stockWarnings');
    if (!stockWarnings) return;

    const lowStockProducts = posProducts.filter(p => p.stock <= 10 && p.stock > 0);

    if (lowStockProducts.length === 0) {
        stockWarnings.innerHTML = '<p style="color: #999; font-size: 12px;">Düşük stok yok</p>';
        return;
    }

    stockWarnings.innerHTML = lowStockProducts.map(product => `
        <div class="stat-row">
            <span style="font-size: 12px;">${product.name}</span>
            <strong style="color: #dc2626;">${product.stock}</strong>
        </div>
    `).join('');
}

// Load Live Stream Status
function loadLiveStreamStatus() {
    const activeStream = localStorage.getItem('activeLivestream');
    const statusElement = document.getElementById('liveStreamStatus');
    const viewersElement = document.getElementById('liveStreamViewers');
    const productsElement = document.getElementById('liveStreamProducts');

    if (activeStream) {
        try {
            const stream = JSON.parse(activeStream);
            if (stream.status === 'live' && statusElement) {
                statusElement.textContent = 'Aktif';
                statusElement.style.color = '#dc2626';
            }
            
            // Mock data for now
            if (viewersElement) viewersElement.textContent = '15';
            if (productsElement) productsElement.textContent = '3';
        } catch (e) {
            console.error('Error loading live stream:', e);
        }
    } else {
        if (statusElement) statusElement.textContent = 'Pasif';
    }
}

// Load Recent Orders
function loadRecentOrders() {
    const recentOrders = document.getElementById('recentOrders');
    if (!recentOrders) return;

    const recent = posSales.slice(-5).reverse();

    if (recent.length === 0) {
        recentOrders.innerHTML = '<p style="color: #999; font-size: 12px;">Henüz satış yok</p>';
        return;
    }

    recentOrders.innerHTML = recent.map(sale => `
        <div class="stat-row" style="font-size: 12px;">
            <span>Satış #${sale.id.toString().slice(-6)}</span>
            <strong style="color: #dc2626;">₺${sale.total.toFixed(2)}</strong>
        </div>
    `).join('');
}

// Load POS History
function loadPOSHistory() {
    const savedSales = localStorage.getItem('posSales');
    if (savedSales) {
        try {
            posSales = JSON.parse(savedSales);
            
            // Calculate today's stats
            const today = new Date().toISOString().split('T')[0];
            const todaySales = posSales.filter(sale => {
                const saleDate = sale.createdAt.split('T')[0];
                return saleDate === today;
            });

            totalTodaySales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
            totalTodayTransactions = todaySales.length;
        } catch (e) {
            console.error('Error loading POS history:', e);
        }
    }
}

// Global exports
window.searchProducts = searchProducts;
window.filterProducts = filterProducts;
window.addToPOSCart = addToPOSCart;
window.increasePOSQuantity = increasePOSQuantity;
window.decreasePOSQuantity = decreasePOSQuantity;
window.removePOSCartItem = removePOSCartItem;
window.clearPosCart = clearPosCart;
window.completePosSale = completePosSale;

console.log('✅ POS Application Loaded');


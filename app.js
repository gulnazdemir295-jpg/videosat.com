// AWS WebRTC ve Canlı Yayın Platformu JavaScript Kodu

// Global değişkenler
let currentUser = null;
let currentStream = null;
let peerConnection = null;
let dataChannel = null;
let isStreaming = false;
let viewerCount = 0;
let chatMessages = [];
let streamProducts = [];
let userProducts = [];
let selectedProducts = [];
let liveStreamBalance = 0; // Dakika cinsinden
let streamSettings = {
    slogans: [],
    selectedProducts: []
};

// AWS Konfigürasyonu (Gerçek projede environment variables kullanın)
const AWS_CONFIG = {
    region: 'us-east-1',
    accessKeyId: 'YOUR_ACCESS_KEY', // Gerçek projede güvenli şekilde saklayın
    secretAccessKey: 'YOUR_SECRET_KEY', // Gerçek projede güvenli şekilde saklayın
    signalingEndpoint: 'wss://your-signaling-endpoint.amazonaws.com'
};

// WebRTC Konfigürasyonu
const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// Sayfa geçişleri
function showPage(pageId) {
    // Tüm sayfaları gizle
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Seçilen sayfayı göster
    document.getElementById(pageId).classList.add('active');
    
    // Sayfa özel işlemler
    if (pageId === 'dashboardPage') {
        loadDashboard();
    } else if (pageId === 'liveStreamPage') {
        initializeStream();
    } else if (pageId === 'viewerPage') {
        initializeViewer();
    } else if (pageId === 'liveStreamSetupPage') {
        loadLiveStreamSetup();
    } else if (pageId === 'productManagementPage') {
        loadUserProducts();
        loadProductsList();
    } else if (pageId === 'posSalesPage') {
        loadPOSSales();
    } else if (pageId === 'reportingPage') {
        loadReporting();
    } else if (pageId === 'buyTimePage') {
        // Süre satın alma sayfası için özel işlem yok
    } else if (pageId === 'producerCommunicationPage') {
        loadProducers();
    } else if (pageId === 'offerFormsPage') {
        loadOffers();
    } else if (pageId === 'orderTrackingPage') {
        loadOrderTracking();
    } else if (pageId === 'supplierCommunicationPage') {
        loadSuppliers();
    } else if (pageId === 'wholesalerCommunicationPage') {
        loadWholesalers();
    } else if (pageId === 'producerOrderManagementPage') {
        loadProducerOrderManagement();
    } else if (pageId === 'wholesalerProducerCommunicationPage') {
        loadWholesalerProducers();
    } else if (pageId === 'wholesalerSellerCommunicationPage') {
        loadWholesalerSellers();
    } else if (pageId === 'wholesalerOrderManagementPage') {
        loadWholesalerOrderManagement();
    }
}

// Kullanıcı kayıt sistemi
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        role: document.getElementById('regRole').value,
        id: Date.now().toString()
    };
    
    // localStorage'a kullanıcı kaydet (gerçek projede veritabanı kullanın)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification('Kayıt başarılı! Giriş yapabilirsiniz.', 'success');
    showPage('loginPage');
});

// Kullanıcı giriş sistemi
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('userRole').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password && u.role === role);
    
    if (user) {
        currentUser = user;
        document.getElementById('userInfo').textContent = `${user.name} (${user.role})`;
        showPage('dashboardPage');
        showNotification('Giriş başarılı!', 'success');
    } else {
        showNotification('Geçersiz bilgiler!', 'error');
    }
});

// Çıkış işlemi
function logout() {
    currentUser = null;
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    showPage('homePage');
    showNotification('Çıkış yapıldı.', 'success');
}

// Dashboard yükleme
function loadDashboard() {
    if (!currentUser) {
        showPage('loginPage');
        return;
    }
    
    // Kullanıcı bilgilerini göster
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        userInfo.innerHTML = `
            <div class="user-info">
                <h3>Hoş geldiniz, ${currentUser.name}!</h3>
                <p>Rol: ${getRoleDisplayName(currentUser.role)}</p>
                <p>Email: ${currentUser.email}</p>
            </div>
        `;
    }
    
    // Kullanıcı rolüne göre dashboard özelleştirme
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    dashboardCards.forEach(card => {
        const button = card.querySelector('button');
        if (currentUser.role === 'musteri') {
            // Müşteriler sadece yayınları izleyebilir
            if (button.textContent.includes('Yayın Başlat')) {
                card.style.display = 'none';
            }
        }
    });
    
    // Canlı yayın bakiyesini güncelle
    updateLiveStreamBalance();
    
    // Rol bazlı panelleri yükle
    loadRoleSpecificPanels();
    
    // Kullanıcı ürünlerini yükle
    loadUserProducts();
}

// Canlı yayın bakiyesini güncelle
function updateLiveStreamBalance() {
    const balanceTime = document.getElementById('balanceTime');
    if (balanceTime) {
        const hours = Math.floor(liveStreamBalance / 60);
        const minutes = liveStreamBalance % 60;
        const seconds = 0; // Gerçek uygulamada saniye sayacı olabilir
        
        balanceTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Rol bazlı panelleri yükle
function loadRoleSpecificPanels() {
    const rolePanels = document.getElementById('roleSpecificPanels');
    if (!rolePanels) return;
    
    let panelHTML = '';
    
    switch (currentUser.role) {
        case 'hammadeci':
            panelHTML = `
                <h3><i class="fas fa-industry"></i> Hammadeci Paneli</h3>
                <div class="role-features">
                    <div class="feature-item">
                        <i class="fas fa-users"></i>
                        <span>Üreticilerle İletişim</span>
                        <button class="btn btn-secondary" onclick="showPage('producerCommunicationPage')">İletişim</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-file-contract"></i>
                        <span>Teklif Formları</span>
                        <button class="btn btn-secondary" onclick="showPage('offerFormsPage')">Formlar</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-shipping-fast"></i>
                        <span>Sipariş Takibi</span>
                        <button class="btn btn-secondary" onclick="showPage('orderTrackingPage')">Takip</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-cash-register"></i>
                        <span>POS Satış Yap</span>
                        <button class="btn btn-primary" onclick="showPage('posSalesPage')">POS Satış</button>
                    </div>
                </div>
            `;
            break;
            
        case 'uretici':
            panelHTML = `
                <h3><i class="fas fa-cogs"></i> Üretici Paneli</h3>
                <div class="role-features">
                    <div class="feature-item">
                        <i class="fas fa-industry"></i>
                        <span>Hammadecilerle İletişim</span>
                        <button class="btn btn-secondary" onclick="showPage('supplierCommunicationPage')">İletişim</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-store"></i>
                        <span>Toptancılarla İletişim</span>
                        <button class="btn btn-secondary" onclick="showPage('wholesalerCommunicationPage')">İletişim</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-file-contract"></i>
                        <span>Teklif Formları</span>
                        <button class="btn btn-secondary" onclick="showPage('offerFormsPage')">Formlar</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-cash-register"></i>
                        <span>POS Satış Yap</span>
                        <button class="btn btn-primary" onclick="showPage('posSalesPage')">POS Satış</button>
                    </div>
                </div>
            `;
            break;
            
        case 'toptanci':
            panelHTML = `
                <h3><i class="fas fa-warehouse"></i> Toptancı Paneli</h3>
                <div class="role-features">
                    <div class="feature-item">
                        <i class="fas fa-cogs"></i>
                        <span>Üreticilerle İletişim</span>
                        <button class="btn btn-secondary" onclick="showPage('producerCommunicationPage')">İletişim</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-store"></i>
                        <span>Satıcılarla İletişim</span>
                        <button class="btn btn-secondary" onclick="showPage('sellerCommunicationPage')">İletişim</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-chart-line"></i>
                        <span>Satış Raporları</span>
                        <button class="btn btn-secondary" onclick="showPage('salesReportsPage')">Raporlar</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-cash-register"></i>
                        <span>POS Satış Yap</span>
                        <button class="btn btn-primary" onclick="showPage('posSalesPage')">POS Satış</button>
                    </div>
                </div>
            `;
            break;
            
        case 'satici':
            panelHTML = `
                <h3><i class="fas fa-store"></i> Satıcı Paneli</h3>
                <div class="role-features">
                    <div class="feature-item">
                        <i class="fas fa-warehouse"></i>
                        <span>Toptancılarla İletişim</span>
                        <button class="btn btn-secondary" onclick="showPage('wholesalerCommunicationPage')">İletişim</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-users"></i>
                        <span>Müşterilerle İletişim</span>
                        <button class="btn btn-secondary" onclick="showPage('customerCommunicationPage')">İletişim</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-cash-register"></i>
                        <span>POS Satışları</span>
                        <button class="btn btn-secondary" onclick="showPage('posSalesPage')">POS</button>
                    </div>
                </div>
            `;
            break;
            
        case 'musteri':
            panelHTML = `
                <h3><i class="fas fa-shopping-cart"></i> Müşteri Paneli</h3>
                <div class="role-features">
                    <div class="feature-item">
                        <i class="fas fa-store"></i>
                        <span>Satıcılarla İletişim</span>
                        <button class="btn btn-secondary" onclick="showPage('sellerCommunicationPage')">İletişim</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-shopping-bag"></i>
                        <span>Sipariş Takibi</span>
                        <button class="btn btn-secondary" onclick="showPage('orderTrackingPage')">Takip</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-receipt"></i>
                        <span>Fatura İşlemleri</span>
                        <button class="btn btn-secondary" onclick="showPage('invoicePage')">Faturalar</button>
                    </div>
                </div>
            `;
            break;
            
        case 'admin':
            panelHTML = `
                <h3><i class="fas fa-crown"></i> Admin Paneli</h3>
                <div class="role-features">
                    <div class="feature-item">
                        <i class="fas fa-users"></i>
                        <span>Kullanıcı Yönetimi</span>
                        <button class="btn btn-secondary" onclick="showPage('adminUsersPage')">Kullanıcılar</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-file-contract"></i>
                        <span>Teklif Yönetimi</span>
                        <button class="btn btn-secondary" onclick="showPage('adminOffersPage')">Teklifler</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-shipping-fast"></i>
                        <span>Sipariş Yönetimi</span>
                        <button class="btn btn-secondary" onclick="showPage('adminOrdersPage')">Siparişler</button>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-chart-bar"></i>
                        <span>Raporlama</span>
                        <button class="btn btn-secondary" onclick="showPage('reportingPage')">Raporlar</button>
                    </div>
                </div>
            `;
            break;
    }
    
    rolePanels.innerHTML = panelHTML;
}

// Kullanıcı ürünlerini yükle
function loadUserProducts() {
    const products = JSON.parse(localStorage.getItem(`products_${currentUser.id}`) || '[]');
    userProducts = products;
}

// Ürün ekleme formunu göster
function showAddProductForm() {
    const form = document.getElementById('addProductForm');
    if (form) {
        form.classList.remove('hidden');
    }
}

// Ürün ekleme formunu gizle
function hideAddProductForm() {
    const form = document.getElementById('addProductForm');
    if (form) {
        form.classList.add('hidden');
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.reset();
        }
    }
}

// Ürün ekleme formu submit
document.addEventListener('DOMContentLoaded', function() {
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const product = {
                id: Date.now().toString(),
                name: document.getElementById('productName').value,
                price: parseFloat(document.getElementById('productPrice').value),
                unit: document.getElementById('productUnit').value,
                stock: parseInt(document.getElementById('productStock').value),
                description: document.getElementById('productDescription').value,
                userId: currentUser.id,
                createdAt: new Date().toISOString()
            };
            
            userProducts.push(product);
            localStorage.setItem(`products_${currentUser.id}`, JSON.stringify(userProducts));
            
            showNotification('Ürün başarıyla eklendi!', 'success');
            hideAddProductForm();
            loadProductsList();
        });
    }
});

// Ürün listesini yükle
function loadProductsList() {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;
    
    productsList.innerHTML = '';
    
    userProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <h4>${product.name}</h4>
            <div class="product-price">₺${product.price.toFixed(2)}</div>
            <div class="product-unit">Birim: ${product.unit}</div>
            <div class="product-stock">Stok: ${product.stock}</div>
            <p>${product.description}</p>
            <div class="product-actions">
                <button class="btn btn-secondary btn-small" onclick="editProduct('${product.id}')">Düzenle</button>
                <button class="btn btn-danger btn-small" onclick="deleteProduct('${product.id}')">Sil</button>
            </div>
        `;
        productsList.appendChild(productCard);
    });
}

// Ürün düzenleme
function editProduct(productId) {
    const product = userProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Form alanlarını doldur
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productUnit').value = product.unit;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productDescription').value = product.description;
    
    showAddProductForm();
    
    // Form submit'ini güncelle
    const form = document.getElementById('productForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        product.name = document.getElementById('productName').value;
        product.price = parseFloat(document.getElementById('productPrice').value);
        product.unit = document.getElementById('productUnit').value;
        product.stock = parseInt(document.getElementById('productStock').value);
        product.description = document.getElementById('productDescription').value;
        
        localStorage.setItem(`products_${currentUser.id}`, JSON.stringify(userProducts));
        showNotification('Ürün başarıyla güncellendi!', 'success');
        hideAddProductForm();
        loadProductsList();
    };
}

// Ürün silme
function deleteProduct(productId) {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        userProducts = userProducts.filter(p => p.id !== productId);
        localStorage.setItem(`products_${currentUser.id}`, JSON.stringify(userProducts));
        showNotification('Ürün başarıyla silindi!', 'success');
        loadProductsList();
    }
}

// POS Satış Sistemi Fonksiyonları
let currentSaleType = '';
let cartItems = [];
let salesHistory = [];

// POS Satış sayfasını yükle
function loadPOSSales() {
    loadUserProducts();
    loadSalesHistory();
    updateProductSelect();
}

// Satış türü seçimi
function selectSaleType(type) {
    currentSaleType = type;
    
    // Tüm butonları normal hale getir
    document.querySelectorAll('.sale-type-buttons .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Seçilen butonu aktif hale getir
    event.target.classList.add('active');
    
    // Satış formunu göster
    document.getElementById('saleForm').classList.remove('hidden');
}

// Ürün seçimini güncelle
function updateProductSelect() {
    const productSelect = document.getElementById('saleProduct');
    if (!productSelect) return;
    
    productSelect.innerHTML = '<option value="">Ürün seçin...</option>';
    
    userProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - ₺${product.price.toFixed(2)} (${product.unit})`;
        productSelect.appendChild(option);
    });
}

// Sepete ekle
function addToCart() {
    const productId = document.getElementById('saleProduct').value;
    const quantity = parseInt(document.getElementById('saleQuantity').value);
    const price = parseFloat(document.getElementById('salePrice').value);
    
    if (!productId || !quantity || !price) {
        showNotification('Lütfen tüm alanları doldurun!', 'error');
        return;
    }
    
    const product = userProducts.find(p => p.id === productId);
    if (!product) return;
    
    const cartItem = {
        id: Date.now().toString(),
        productId: productId,
        productName: product.name,
        quantity: quantity,
        unitPrice: price,
        totalPrice: quantity * price,
        unit: product.unit
    };
    
    cartItems.push(cartItem);
    updateCartDisplay();
    updateCartTotal();
    
    // Formu temizle
    document.getElementById('saleProduct').value = '';
    document.getElementById('saleQuantity').value = '';
    document.getElementById('salePrice').value = '';
    
    showNotification('Ürün sepete eklendi!', 'success');
}

// Sepet görünümünü güncelle
function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cartItems');
    if (!cartItemsDiv) return;
    
    cartItemsDiv.innerHTML = '';
    
    cartItems.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <div>
                <strong>${item.productName}</strong><br>
                <small>${item.quantity} ${item.unit} × ₺${item.unitPrice.toFixed(2)}</small>
            </div>
            <div>
                <strong>₺${item.totalPrice.toFixed(2)}</strong>
                <button class="btn btn-danger btn-small" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItemsDiv.appendChild(cartItemDiv);
    });
    
    // Sepet bölümünü göster
    document.getElementById('cartSection').classList.remove('hidden');
}

// Sepetten çıkar
function removeFromCart(itemId) {
    cartItems = cartItems.filter(item => item.id !== itemId);
    updateCartDisplay();
    updateCartTotal();
}

// Sepet toplamını güncelle
function updateCartTotal() {
    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const cartTotal = document.getElementById('cartTotal');
    if (cartTotal) {
        cartTotal.textContent = `₺${total.toFixed(2)}`;
    }
}

// Satışı tamamla
function completeSale() {
    if (cartItems.length === 0) {
        showNotification('Sepetiniz boş!', 'error');
        return;
    }
    
    if (!currentSaleType) {
        showNotification('Lütfen satış türünü seçin!', 'error');
        return;
    }
    
    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    const sale = {
        id: Date.now().toString(),
        type: currentSaleType,
        items: [...cartItems],
        total: total,
        date: new Date().toISOString(),
        userId: currentUser.id
    };
    
    salesHistory.push(sale);
    localStorage.setItem(`sales_${currentUser.id}`, JSON.stringify(salesHistory));
    
    // Stok güncelle
    cartItems.forEach(cartItem => {
        const product = userProducts.find(p => p.id === cartItem.productId);
        if (product) {
            product.stock -= cartItem.quantity;
        }
    });
    
    localStorage.setItem(`products_${currentUser.id}`, JSON.stringify(userProducts));
    
    // Sepeti temizle
    cartItems = [];
    updateCartDisplay();
    updateCartTotal();
    document.getElementById('saleForm').classList.add('hidden');
    
    showNotification('Satış başarıyla tamamlandı!', 'success');
    loadSalesHistory();
}

// Satış geçmişini yükle
function loadSalesHistory() {
    const sales = JSON.parse(localStorage.getItem(`sales_${currentUser.id}`) || '[]');
    salesHistory = sales;
    
    const salesHistoryDiv = document.getElementById('salesHistory');
    if (!salesHistoryDiv) return;
    
    salesHistoryDiv.innerHTML = '';
    
    sales.slice(-10).reverse().forEach(sale => {
        const saleDiv = document.createElement('div');
        saleDiv.className = 'sale-item';
        saleDiv.innerHTML = `
            <div>
                <strong>${getSaleTypeName(sale.type)}</strong><br>
                <small>${new Date(sale.date).toLocaleDateString('tr-TR')}</small>
            </div>
            <div>
                <strong>₺${sale.total.toFixed(2)}</strong><br>
                <small>${sale.items.length} ürün</small>
            </div>
        `;
        salesHistoryDiv.appendChild(saleDiv);
    });
}

// Satış türü adını al
function getSaleTypeName(type) {
    switch (type) {
        case 'reel': return 'Reel Satış';
        case 'online': return 'Site Satışı';
        case 'live': return 'Canlı Yayın Satışı';
        default: return 'Bilinmeyen';
    }
}

// Yeni satış başlat
function startNewSale() {
    cartItems = [];
    currentSaleType = '';
    document.getElementById('saleForm').classList.add('hidden');
    document.getElementById('cartSection').classList.add('hidden');
    
    // Tüm satış türü butonlarını normal hale getir
    document.querySelectorAll('.sale-type-buttons .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    showNotification('Yeni satış başlatıldı!', 'success');
}

// Satış raporu göster
function showSalesReport() {
    showPage('reportingPage');
}

// Raporlama Sistemi Fonksiyonları
function loadReporting() {
    loadSalesHistory();
    generateReport();
}

// Rapor oluştur
function generateReport() {
    const totalSales = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
    const totalQuantity = salesHistory.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    const averageOrder = salesHistory.length > 0 ? totalSales / salesHistory.length : 0;
    
    // En çok satan ürün
    const productSales = {};
    salesHistory.forEach(sale => {
        sale.items.forEach(item => {
            if (!productSales[item.productName]) {
                productSales[item.productName] = 0;
            }
            productSales[item.productName] += item.quantity;
        });
    });
    
    const topProduct = Object.keys(productSales).reduce((a, b) => 
        productSales[a] > productSales[b] ? a : b, '-');
    
    // Özet bilgileri güncelle
    document.getElementById('totalSales').textContent = `₺${totalSales.toFixed(2)}`;
    document.getElementById('totalQuantity').textContent = totalQuantity.toString();
    document.getElementById('averageOrder').textContent = `₺${averageOrder.toFixed(2)}`;
    document.getElementById('topProduct').textContent = topProduct;
    
    // Detaylı rapor tablosu
    generateReportTable();
}

// Rapor tablosu oluştur
function generateReportTable() {
    const reportTable = document.getElementById('reportTable');
    if (!reportTable) return;
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Tarih</th>
                    <th>Satış Türü</th>
                    <th>Ürün Sayısı</th>
                    <th>Toplam</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    salesHistory.slice(-20).reverse().forEach(sale => {
        tableHTML += `
            <tr>
                <td>${new Date(sale.date).toLocaleDateString('tr-TR')}</td>
                <td>${getSaleTypeName(sale.type)}</td>
                <td>${sale.items.length}</td>
                <td>₺${sale.total.toFixed(2)}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    reportTable.innerHTML = tableHTML;
}

// Günlük rapor
function generateDailyReport() {
    const today = new Date().toDateString();
    const todaySales = salesHistory.filter(sale => 
        new Date(sale.date).toDateString() === today
    );
    
    showNotification(`Bugün ${todaySales.length} satış yapıldı!`, 'success');
}

// Aylık rapor
function generateMonthlyReport() {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlySales = salesHistory.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear;
    });
    
    showNotification(`Bu ay ${monthlySales.length} satış yapıldı!`, 'success');
}

// Ürün raporu
function generateProductReport() {
    const productSales = {};
    salesHistory.forEach(sale => {
        sale.items.forEach(item => {
            if (!productSales[item.productName]) {
                productSales[item.productName] = { quantity: 0, revenue: 0 };
            }
            productSales[item.productName].quantity += item.quantity;
            productSales[item.productName].revenue += item.totalPrice;
        });
    });
    
    showNotification(`Toplam ${Object.keys(productSales).length} farklı ürün satıldı!`, 'success');
}

// Filtreleri uygula
function applyFilters() {
    generateReport();
    showNotification('Filtreler uygulandı!', 'success');
}

// ========================================
// HAMMADECİLER PROSEDÜRÜ
// ========================================

// Üretici arama
function searchProducers() {
    const searchTerm = document.getElementById('producerSearch').value.toLowerCase();
    const producers = getAllProducers();
    const filteredProducers = producers.filter(producer => 
        producer.name.toLowerCase().includes(searchTerm) ||
        producer.email.toLowerCase().includes(searchTerm)
    );
    displayProducers(filteredProducers);
}

// Tüm üreticileri getir
function getAllProducers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter(user => user.role === 'uretici');
}

// Üreticileri göster
function displayProducers(producers) {
    const producersList = document.getElementById('producersList');
    if (!producersList) return;
    
    producersList.innerHTML = '';
    
    producers.forEach(producer => {
        const producerCard = document.createElement('div');
        producerCard.className = 'producer-card';
        producerCard.innerHTML = `
            <div class="producer-info">
                <h4>${producer.name}</h4>
                <p>Email: ${producer.email}</p>
                <p>Kayıt Tarihi: ${new Date(producer.registrationDate).toLocaleDateString('tr-TR')}</p>
            </div>
            <div class="producer-actions">
                <button class="btn btn-primary btn-small" onclick="sendMessage('${producer.id}')">
                    <i class="fas fa-envelope"></i> Mesaj Gönder
                </button>
                <button class="btn btn-secondary btn-small" onclick="inviteToLiveStream('${producer.id}')">
                    <i class="fas fa-video"></i> Canlı Yayına Davet Et
                </button>
                <button class="btn btn-success btn-small" onclick="sendOffer('${producer.id}')">
                    <i class="fas fa-file-contract"></i> Teklif Gönder
                </button>
            </div>
        `;
        producersList.appendChild(producerCard);
    });
}

// Mesaj gönder
function sendMessage(producerId) {
    const message = prompt('Mesajınızı yazın:');
    if (message) {
        const messageData = {
            id: Date.now().toString(),
            from: currentUser.id,
            to: producerId,
            message: message,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(messageData);
        localStorage.setItem('messages', JSON.stringify(messages));
        
        showNotification('Mesaj başarıyla gönderildi!', 'success');
    }
}

// Canlı yayına davet et
function inviteToLiveStream(producerId) {
    const invitation = {
        id: Date.now().toString(),
        from: currentUser.id,
        to: producerId,
        type: 'live_stream_invitation',
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
    invitations.push(invitation);
    localStorage.setItem('invitations', JSON.stringify(invitations));
    
    showNotification('Canlı yayın daveti gönderildi!', 'success');
}

// Teklif gönder
function sendOffer(producerId) {
    const offerData = {
        id: Date.now().toString(),
        from: currentUser.id,
        to: producerId,
        products: [],
        totalAmount: 0,
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    
    const offers = JSON.parse(localStorage.getItem('offers') || '[]');
    offers.push(offerData);
    localStorage.setItem('offers', JSON.stringify(offers));
    
    showNotification('Teklif başarıyla gönderildi!', 'success');
}

// Teklifleri yükle
function loadOffers() {
    const offers = JSON.parse(localStorage.getItem('offers') || '[]');
    const userOffers = offers.filter(offer => 
        offer.from === currentUser.id || offer.to === currentUser.id
    );
    
    displayOffers(userOffers);
}

// Teklifleri göster
function displayOffers(offers) {
    const offersList = document.getElementById('offersList');
    if (!offersList) return;
    
    offersList.innerHTML = '';
    
    offers.forEach(offer => {
        const offerCard = document.createElement('div');
        offerCard.className = 'offer-card';
        offerCard.innerHTML = `
            <div class="offer-info">
                <h4>Teklif #${offer.id.substring(0, 8)}</h4>
                <p>Durum: ${getOfferStatusText(offer.status)}</p>
                <p>Tutar: ₺${offer.totalAmount.toFixed(2)}</p>
                <p>Tarih: ${new Date(offer.timestamp).toLocaleDateString('tr-TR')}</p>
            </div>
            <div class="offer-actions">
                <button class="btn btn-primary btn-small" onclick="viewOffer('${offer.id}')">
                    <i class="fas fa-eye"></i> Görüntüle
                </button>
                ${offer.status === 'pending' && offer.to === currentUser.id ? `
                    <button class="btn btn-success btn-small" onclick="acceptOffer('${offer.id}')">
                        <i class="fas fa-check"></i> Kabul Et
                    </button>
                    <button class="btn btn-danger btn-small" onclick="rejectOffer('${offer.id}')">
                        <i class="fas fa-times"></i> Reddet
                    </button>
                ` : ''}
                ${offer.status === 'pending' && offer.from === currentUser.id ? `
                    <button class="btn btn-warning btn-small" onclick="cancelOffer('${offer.id}')">
                        <i class="fas fa-ban"></i> İptal Et
                    </button>
                ` : ''}
            </div>
        `;
        offersList.appendChild(offerCard);
    });
}

// Teklif durumu metni
function getOfferStatusText(status) {
    switch (status) {
        case 'pending': return 'Beklemede';
        case 'accepted': return 'Kabul Edildi';
        case 'rejected': return 'Reddedildi';
        case 'cancelled': return 'İptal Edildi';
        default: return 'Bilinmeyen';
    }
}

// Teklif kabul et
function acceptOffer(offerId) {
    const offers = JSON.parse(localStorage.getItem('offers') || '[]');
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
        offer.status = 'accepted';
        localStorage.setItem('offers', JSON.stringify(offers));
        
        // Admin paneline kopya gönder
        const adminCopy = { ...offer, adminCopy: true };
        const adminOffers = JSON.parse(localStorage.getItem('adminOffers') || '[]');
        adminOffers.push(adminCopy);
        localStorage.setItem('adminOffers', JSON.stringify(adminOffers));
        
        showNotification('Teklif kabul edildi!', 'success');
        loadOffers();
    }
}

// Teklif reddet
function rejectOffer(offerId) {
    const offers = JSON.parse(localStorage.getItem('offers') || '[]');
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
        offer.status = 'rejected';
        localStorage.setItem('offers', JSON.stringify(offers));
        showNotification('Teklif reddedildi!', 'success');
        loadOffers();
    }
}

// Teklif iptal et
function cancelOffer(offerId) {
    const offers = JSON.parse(localStorage.getItem('offers') || '[]');
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
        offer.status = 'cancelled';
        localStorage.setItem('offers', JSON.stringify(offers));
        showNotification('Teklif iptal edildi!', 'success');
        loadOffers();
    }
}

// Teklif görüntüle
function viewOffer(offerId) {
    const offers = JSON.parse(localStorage.getItem('offers') || '[]');
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
        alert(`Teklif Detayları:\n\nID: ${offer.id}\nDurum: ${getOfferStatusText(offer.status)}\nTutar: ₺${offer.totalAmount.toFixed(2)}\nTarih: ${new Date(offer.timestamp).toLocaleDateString('tr-TR')}`);
    }
}

// Sipariş takibini yükle
function loadOrderTracking() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = orders.filter(order => 
        order.from === currentUser.id || order.to === currentUser.id
    );
    
    updateOrderSummary(userOrders);
    displayOrders(userOrders);
}

// Sipariş özetini güncelle
function updateOrderSummary(orders) {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
}

// Siparişleri göster
function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-info">
                <h4>Sipariş #${order.id.substring(0, 8)}</h4>
                <p>Durum: ${getOrderStatusText(order.status)}</p>
                <p>Tutar: ₺${order.totalAmount.toFixed(2)}</p>
                <p>Tarih: ${new Date(order.timestamp).toLocaleDateString('tr-TR')}</p>
            </div>
            <div class="order-actions">
                <button class="btn btn-primary btn-small" onclick="viewOrder('${order.id}')">
                    <i class="fas fa-eye"></i> Görüntüle
                </button>
                <button class="btn btn-secondary btn-small" onclick="trackOrder('${order.id}')">
                    <i class="fas fa-shipping-fast"></i> Takip Et
                </button>
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

// Sipariş durumu metni
function getOrderStatusText(status) {
    switch (status) {
        case 'pending': return 'Beklemede';
        case 'confirmed': return 'Onaylandı';
        case 'preparing': return 'Hazırlanıyor';
        case 'shipped': return 'Kargoya Verildi';
        case 'delivered': return 'Teslim Edildi';
        case 'completed': return 'Tamamlandı';
        case 'cancelled': return 'İptal Edildi';
        default: return 'Bilinmeyen';
    }
}

// Sipariş görüntüle
function viewOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (order) {
        alert(`Sipariş Detayları:\n\nID: ${order.id}\nDurum: ${getOrderStatusText(order.status)}\nTutar: ₺${order.totalAmount.toFixed(2)}\nTarih: ${new Date(order.timestamp).toLocaleDateString('tr-TR')}`);
    }
}

// Sipariş takip et
function trackOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (order) {
        alert(`Kargo Takip Bilgileri:\n\nSipariş ID: ${order.id}\nDurum: ${getOrderStatusText(order.status)}\nKargo Kodu: ${order.trackingCode || 'Henüz atanmadı'}\nTahmini Teslimat: ${order.estimatedDelivery || 'Belirtilmedi'}`);
    }
}

// Üreticileri yükle
function loadProducers() {
    const producers = getAllProducers();
    displayProducers(producers);
}

// Teklif formu yükle
function loadOfferForm() {
    // Teklif formu sayfasına yönlendir
    showPage('offerFormsPage');
}

// ========================================
// ÜRETİCİLER PROSEDÜRÜ
// ========================================

// Hammadeci arama
function searchSuppliers() {
    const searchTerm = document.getElementById('supplierSearch').value.toLowerCase();
    const suppliers = getAllSuppliers();
    const filteredSuppliers = suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(searchTerm) ||
        supplier.email.toLowerCase().includes(searchTerm)
    );
    displaySuppliers(filteredSuppliers);
}

// Tüm hammadecileri getir
function getAllSuppliers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter(user => user.role === 'hammadeci');
}

// Hammadecileri göster
function displaySuppliers(suppliers) {
    const suppliersList = document.getElementById('suppliersList');
    if (!suppliersList) return;
    
    suppliersList.innerHTML = '';
    
    suppliers.forEach(supplier => {
        const supplierCard = document.createElement('div');
        supplierCard.className = 'supplier-card';
        supplierCard.innerHTML = `
            <div class="supplier-info">
                <h4>${supplier.name}</h4>
                <p>Email: ${supplier.email}</p>
                <p>Kayıt Tarihi: ${new Date(supplier.registrationDate).toLocaleDateString('tr-TR')}</p>
            </div>
            <div class="supplier-actions">
                <button class="btn btn-primary btn-small" onclick="sendMessageToSupplier('${supplier.id}')">
                    <i class="fas fa-envelope"></i> Mesaj Gönder
                </button>
                <button class="btn btn-secondary btn-small" onclick="inviteSupplierToLiveStream('${supplier.id}')">
                    <i class="fas fa-video"></i> Canlı Yayına Davet Et
                </button>
                <button class="btn btn-success btn-small" onclick="sendOfferToSupplier('${supplier.id}')">
                    <i class="fas fa-file-contract"></i> Teklif Gönder
                </button>
            </div>
        `;
        suppliersList.appendChild(supplierCard);
    });
}

// Hammadeciye mesaj gönder
function sendMessageToSupplier(supplierId) {
    const message = prompt('Mesajınızı yazın:');
    if (message) {
        const messageData = {
            id: Date.now().toString(),
            from: currentUser.id,
            to: supplierId,
            message: message,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(messageData);
        localStorage.setItem('messages', JSON.stringify(messages));
        
        showNotification('Mesaj başarıyla gönderildi!', 'success');
    }
}

// Hammadeciyi canlı yayına davet et
function inviteSupplierToLiveStream(supplierId) {
    const invitation = {
        id: Date.now().toString(),
        from: currentUser.id,
        to: supplierId,
        type: 'live_stream_invitation',
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
    invitations.push(invitation);
    localStorage.setItem('invitations', JSON.stringify(invitations));
    
    showNotification('Canlı yayın daveti gönderildi!', 'success');
}

// Hammadeciye teklif gönder
function sendOfferToSupplier(supplierId) {
    const offerData = {
        id: Date.now().toString(),
        from: currentUser.id,
        to: supplierId,
        products: [],
        totalAmount: 0,
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    
    const offers = JSON.parse(localStorage.getItem('offers') || '[]');
    offers.push(offerData);
    localStorage.setItem('offers', JSON.stringify(offers));
    
    showNotification('Teklif başarıyla gönderildi!', 'success');
}

// Toptancı arama
function searchWholesalers() {
    const searchTerm = document.getElementById('wholesalerSearch').value.toLowerCase();
    const wholesalers = getAllWholesalers();
    const filteredWholesalers = wholesalers.filter(wholesaler => 
        wholesaler.name.toLowerCase().includes(searchTerm) ||
        wholesaler.email.toLowerCase().includes(searchTerm)
    );
    displayWholesalers(filteredWholesalers);
}

// Tüm toptancıları getir
function getAllWholesalers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter(user => user.role === 'toptanci');
}

// Toptancıları göster
function displayWholesalers(wholesalers) {
    const wholesalersList = document.getElementById('wholesalersList');
    if (!wholesalersList) return;
    
    wholesalersList.innerHTML = '';
    
    wholesalers.forEach(wholesaler => {
        const wholesalerCard = document.createElement('div');
        wholesalerCard.className = 'wholesaler-card';
        wholesalerCard.innerHTML = `
            <div class="wholesaler-info">
                <h4>${wholesaler.name}</h4>
                <p>Email: ${wholesaler.email}</p>
                <p>Kayıt Tarihi: ${new Date(wholesaler.registrationDate).toLocaleDateString('tr-TR')}</p>
            </div>
            <div class="wholesaler-actions">
                <button class="btn btn-primary btn-small" onclick="sendMessageToWholesaler('${wholesaler.id}')">
                    <i class="fas fa-envelope"></i> Mesaj Gönder
                </button>
                <button class="btn btn-secondary btn-small" onclick="inviteWholesalerToLiveStream('${wholesaler.id}')">
                    <i class="fas fa-video"></i> Canlı Yayına Davet Et
                </button>
                <button class="btn btn-success btn-small" onclick="sendOfferToWholesaler('${wholesaler.id}')">
                    <i class="fas fa-file-contract"></i> Teklif Gönder
                </button>
            </div>
        `;
        wholesalersList.appendChild(wholesalerCard);
    });
}

// Toptancıya mesaj gönder
function sendMessageToWholesaler(wholesalerId) {
    const message = prompt('Mesajınızı yazın:');
    if (message) {
        const messageData = {
            id: Date.now().toString(),
            from: currentUser.id,
            to: wholesalerId,
            message: message,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(messageData);
        localStorage.setItem('messages', JSON.stringify(messages));
        
        showNotification('Mesaj başarıyla gönderildi!', 'success');
    }
}

// Toptancıyı canlı yayına davet et
function inviteWholesalerToLiveStream(wholesalerId) {
    const invitation = {
        id: Date.now().toString(),
        from: currentUser.id,
        to: wholesalerId,
        type: 'live_stream_invitation',
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
    invitations.push(invitation);
    localStorage.setItem('invitations', JSON.stringify(invitations));
    
    showNotification('Canlı yayın daveti gönderildi!', 'success');
}

// Toptancıya teklif gönder
function sendOfferToWholesaler(wholesalerId) {
    const offerData = {
        id: Date.now().toString(),
        from: currentUser.id,
        to: wholesalerId,
        products: [],
        totalAmount: 0,
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    
    const offers = JSON.parse(localStorage.getItem('offers') || '[]');
    offers.push(offerData);
    localStorage.setItem('offers', JSON.stringify(offers));
    
    showNotification('Teklif başarıyla gönderildi!', 'success');
}

// Üretici sipariş yönetimi
function loadProducerOrderManagement() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = orders.filter(order => 
        order.from === currentUser.id || order.to === currentUser.id
    );
    
    updateProducerOrderSummary(userOrders);
    displayProducerOrders(userOrders);
}

// Üretici sipariş özetini güncelle
function updateProducerOrderSummary(orders) {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
}

// Üretici siparişlerini göster
function displayProducerOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-info">
                <h4>Sipariş #${order.id.substring(0, 8)}</h4>
                <p>Durum: ${getOrderStatusText(order.status)}</p>
                <p>Tutar: ₺${order.totalAmount.toFixed(2)}</p>
                <p>Tarih: ${new Date(order.timestamp).toLocaleDateString('tr-TR')}</p>
            </div>
            <div class="order-actions">
                <button class="btn btn-primary btn-small" onclick="viewOrder('${order.id}')">
                    <i class="fas fa-eye"></i> Görüntüle
                </button>
                ${order.status === 'pending' ? `
                    <button class="btn btn-success btn-small" onclick="acceptOrder('${order.id}')">
                        <i class="fas fa-check"></i> Kabul Et
                    </button>
                    <button class="btn btn-danger btn-small" onclick="rejectOrder('${order.id}')">
                        <i class="fas fa-times"></i> Reddet
                    </button>
                ` : ''}
                ${order.status === 'confirmed' ? `
                    <button class="btn btn-warning btn-small" onclick="processOrder('${order.id}')">
                        <i class="fas fa-cogs"></i> Hazırla
                    </button>
                ` : ''}
                ${order.status === 'preparing' ? `
                    <button class="btn btn-info btn-small" onclick="shipOrder('${order.id}')">
                        <i class="fas fa-shipping-fast"></i> Kargoya Ver
                    </button>
                ` : ''}
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

// Sipariş kabul et
function acceptOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'confirmed';
        localStorage.setItem('orders', JSON.stringify(orders));
        showNotification('Sipariş kabul edildi!', 'success');
        loadProducerOrderManagement();
    }
}

// Sipariş reddet
function rejectOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'cancelled';
        localStorage.setItem('orders', JSON.stringify(orders));
        showNotification('Sipariş reddedildi!', 'success');
        loadProducerOrderManagement();
    }
}

// Sipariş hazırla
function processOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'preparing';
        localStorage.setItem('orders', JSON.stringify(orders));
        showNotification('Sipariş hazırlanıyor!', 'success');
        loadProducerOrderManagement();
    }
}

// Sipariş kargoya ver
function shipOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'shipped';
        order.trackingCode = 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
        order.shippingDate = new Date().toISOString();
        localStorage.setItem('orders', JSON.stringify(orders));
        showNotification('Sipariş kargoya verildi!', 'success');
        loadProducerOrderManagement();
    }
}

// Hammadecileri yükle
function loadSuppliers() {
    const suppliers = getAllSuppliers();
    displaySuppliers(suppliers);
}

// Toptancıları yükle
function loadWholesalers() {
    const wholesalers = getAllWholesalers();
    displayWholesalers(wholesalers);
}

// ========================================
// TOPTANCILAR PROSEDÜRÜ
// ========================================

// Toptancı üretici arama
function searchWholesalerProducers() {
    const searchTerm = document.getElementById('wholesalerProducerSearch').value.toLowerCase();
    const producers = getAllProducers();
    const filteredProducers = producers.filter(producer => 
        producer.name.toLowerCase().includes(searchTerm) ||
        producer.email.toLowerCase().includes(searchTerm)
    );
    displayWholesalerProducers(filteredProducers);
}

// Toptancı üreticileri göster
function displayWholesalerProducers(producers) {
    const producersList = document.getElementById('wholesalerProducersList');
    if (!producersList) return;
    
    producersList.innerHTML = '';
    
    producers.forEach(producer => {
        const producerCard = document.createElement('div');
        producerCard.className = 'producer-card';
        producerCard.innerHTML = `
            <div class="producer-info">
                <h4>${producer.name}</h4>
                <p>Email: ${producer.email}</p>
                <p>Kayıt Tarihi: ${new Date(producer.registrationDate).toLocaleDateString('tr-TR')}</p>
            </div>
            <div class="producer-actions">
                <button class="btn btn-primary btn-small" onclick="sendMessageToProducer('${producer.id}')">
                    <i class="fas fa-envelope"></i> Mesaj Gönder
                </button>
                <button class="btn btn-secondary btn-small" onclick="inviteProducerToLiveStream('${producer.id}')">
                    <i class="fas fa-video"></i> Canlı Yayına Davet Et
                </button>
                <button class="btn btn-success btn-small" onclick="sendOfferToProducer('${producer.id}')">
                    <i class="fas fa-file-contract"></i> Teklif Gönder
                </button>
            </div>
        `;
        producersList.appendChild(producerCard);
    });
}

// Üreticiye mesaj gönder
function sendMessageToProducer(producerId) {
    const message = prompt('Mesajınızı yazın:');
    if (message) {
        const messageData = {
            id: Date.now().toString(),
            from: currentUser.id,
            to: producerId,
            message: message,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(messageData);
        localStorage.setItem('messages', JSON.stringify(messages));
        
        showNotification('Mesaj başarıyla gönderildi!', 'success');
    }
}

// Üreticiyi canlı yayına davet et
function inviteProducerToLiveStream(producerId) {
    const invitation = {
        id: Date.now().toString(),
        from: currentUser.id,
        to: producerId,
        type: 'live_stream_invitation',
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
    invitations.push(invitation);
    localStorage.setItem('invitations', JSON.stringify(invitations));
    
    showNotification('Canlı yayın daveti gönderildi!', 'success');
}

// Üreticiye teklif gönder
function sendOfferToProducer(producerId) {
    const offerData = {
        id: Date.now().toString(),
        from: currentUser.id,
        to: producerId,
        products: [],
        totalAmount: 0,
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    
    const offers = JSON.parse(localStorage.getItem('offers') || '[]');
    offers.push(offerData);
    localStorage.setItem('offers', JSON.stringify(offers));
    
    showNotification('Teklif başarıyla gönderildi!', 'success');
}

// Toptancı satıcı arama
function searchWholesalerSellers() {
    const searchTerm = document.getElementById('wholesalerSellerSearch').value.toLowerCase();
    const sellers = getAllSellers();
    const filteredSellers = sellers.filter(seller => 
        seller.name.toLowerCase().includes(searchTerm) ||
        seller.email.toLowerCase().includes(searchTerm)
    );
    displayWholesalerSellers(filteredSellers);
}

// Tüm satıcıları getir
function getAllSellers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter(user => user.role === 'satici');
}

// Toptancı satıcıları göster
function displayWholesalerSellers(sellers) {
    const sellersList = document.getElementById('wholesalerSellersList');
    if (!sellersList) return;
    
    sellersList.innerHTML = '';
    
    sellers.forEach(seller => {
        const sellerCard = document.createElement('div');
        sellerCard.className = 'seller-card';
        sellerCard.innerHTML = `
            <div class="seller-info">
                <h4>${seller.name}</h4>
                <p>Email: ${seller.email}</p>
                <p>Kayıt Tarihi: ${new Date(seller.registrationDate).toLocaleDateString('tr-TR')}</p>
            </div>
            <div class="seller-actions">
                <button class="btn btn-primary btn-small" onclick="sendMessageToSeller('${seller.id}')">
                    <i class="fas fa-envelope"></i> Mesaj Gönder
                </button>
                <button class="btn btn-secondary btn-small" onclick="inviteSellerToLiveStream('${seller.id}')">
                    <i class="fas fa-video"></i> Canlı Yayına Davet Et
                </button>
                <button class="btn btn-success btn-small" onclick="sendOfferToSeller('${seller.id}')">
                    <i class="fas fa-file-contract"></i> Teklif Gönder
                </button>
            </div>
        `;
        sellersList.appendChild(sellerCard);
    });
}

// Satıcıya mesaj gönder
function sendMessageToSeller(sellerId) {
    const message = prompt('Mesajınızı yazın:');
    if (message) {
        const messageData = {
            id: Date.now().toString(),
            from: currentUser.id,
            to: sellerId,
            message: message,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(messageData);
        localStorage.setItem('messages', JSON.stringify(messages));
        
        showNotification('Mesaj başarıyla gönderildi!', 'success');
    }
}

// Satıcıyı canlı yayına davet et
function inviteSellerToLiveStream(sellerId) {
    const invitation = {
        id: Date.now().toString(),
        from: currentUser.id,
        to: sellerId,
        type: 'live_stream_invitation',
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
    invitations.push(invitation);
    localStorage.setItem('invitations', JSON.stringify(invitations));
    
    showNotification('Canlı yayın daveti gönderildi!', 'success');
}

// Satıcıya teklif gönder
function sendOfferToSeller(sellerId) {
    const offerData = {
        id: Date.now().toString(),
        from: currentUser.id,
        to: sellerId,
        products: [],
        totalAmount: 0,
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    
    const offers = JSON.parse(localStorage.getItem('offers') || '[]');
    offers.push(offerData);
    localStorage.setItem('offers', JSON.stringify(offers));
    
    showNotification('Teklif başarıyla gönderildi!', 'success');
}

// Toptancı sipariş yönetimi
function loadWholesalerOrderManagement() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = orders.filter(order => 
        order.from === currentUser.id || order.to === currentUser.id
    );
    
    updateWholesalerOrderSummary(userOrders);
    displayWholesalerOrders(userOrders);
}

// Toptancı sipariş özetini güncelle
function updateWholesalerOrderSummary(orders) {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
}

// Toptancı siparişlerini göster
function displayWholesalerOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-info">
                <h4>Sipariş #${order.id.substring(0, 8)}</h4>
                <p>Durum: ${getOrderStatusText(order.status)}</p>
                <p>Tutar: ₺${order.totalAmount.toFixed(2)}</p>
                <p>Tarih: ${new Date(order.timestamp).toLocaleDateString('tr-TR')}</p>
            </div>
            <div class="order-actions">
                <button class="btn btn-primary btn-small" onclick="viewOrder('${order.id}')">
                    <i class="fas fa-eye"></i> Görüntüle
                </button>
                ${order.status === 'pending' ? `
                    <button class="btn btn-success btn-small" onclick="acceptOrder('${order.id}')">
                        <i class="fas fa-check"></i> Kabul Et
                    </button>
                    <button class="btn btn-danger btn-small" onclick="rejectOrder('${order.id}')">
                        <i class="fas fa-times"></i> Reddet
                    </button>
                ` : ''}
                ${order.status === 'confirmed' ? `
                    <button class="btn btn-warning btn-small" onclick="processOrder('${order.id}')">
                        <i class="fas fa-cogs"></i> Hazırla
                    </button>
                ` : ''}
                ${order.status === 'preparing' ? `
                    <button class="btn btn-info btn-small" onclick="shipOrder('${order.id}')">
                        <i class="fas fa-shipping-fast"></i> Kargoya Ver
                    </button>
                ` : ''}
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

// Toptancı üreticileri yükle
function loadWholesalerProducers() {
    const producers = getAllProducers();
    displayWholesalerProducers(producers);
}

// Toptancı satıcıları yükle
function loadWholesalerSellers() {
    const sellers = getAllSellers();
    displayWholesalerSellers(sellers);
}

// Canlı yayın kurulum sayfasını yükle
function loadLiveStreamSetup() {
    const productList = document.getElementById('productList');
    if (!productList) return;
    
    productList.innerHTML = '';
    
    userProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <input type="checkbox" class="product-checkbox" data-product-id="${product.id}">
            <div class="product-info">
                <strong>${product.name}</strong>
                <div>₺${product.price.toFixed(2)} / ${product.unit}</div>
                <div>Stok: ${product.stock}</div>
            </div>
        `;
        
        productItem.addEventListener('click', function(e) {
            if (e.target.type !== 'checkbox') {
                const checkbox = this.querySelector('.product-checkbox');
                checkbox.checked = !checkbox.checked;
                toggleProductSelection(product.id, checkbox.checked);
            }
        });
        
        productList.appendChild(productItem);
    });
}

// Ürün seçimini değiştir
function toggleProductSelection(productId, isSelected) {
    const product = userProducts.find(p => p.id === productId);
    if (!product) return;
    
    if (isSelected) {
        if (!selectedProducts.find(p => p.id === productId)) {
            selectedProducts.push(product);
        }
    } else {
        selectedProducts = selectedProducts.filter(p => p.id !== productId);
    }
    
    updateSelectedProductsList();
}

// Seçilen ürünler listesini güncelle
function updateSelectedProductsList() {
    const selectedProductsList = document.getElementById('selectedProductsList');
    if (!selectedProductsList) return;
    
    selectedProductsList.innerHTML = '';
    
    selectedProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'selected-product-item';
        productItem.innerHTML = `
            <span>${product.name} - ₺${product.price.toFixed(2)}</span>
            <button class="btn btn-danger btn-small" onclick="removeSelectedProduct('${product.id}')">Kaldır</button>
        `;
        selectedProductsList.appendChild(productItem);
    });
}

// Seçilen üründen kaldır
function removeSelectedProduct(productId) {
    selectedProducts = selectedProducts.filter(p => p.id !== productId);
    
    // Checkbox'ı da kaldır
    const checkbox = document.querySelector(`[data-product-id="${productId}"]`);
    if (checkbox) {
        checkbox.checked = false;
    }
    
    updateSelectedProductsList();
}

// Ayarlarla canlı yayın başlat
function startLiveStreamWithSettings() {
    if (selectedProducts.length === 0) {
        showNotification('Lütfen en az bir ürün seçin!', 'error');
        return;
    }
    
    // Sloganları al
    const slogans = [
        document.getElementById('slogan1').value,
        document.getElementById('slogan2').value,
        document.getElementById('slogan3').value
    ].filter(slogan => slogan.trim() !== '');
    
    if (slogans.length === 0) {
        showNotification('Lütfen en az bir slogan girin!', 'error');
        return;
    }
    
    // Ayarları kaydet
    streamSettings = {
        slogans: slogans,
        selectedProducts: selectedProducts
    };
    
    // Canlı yayın bakiyesi kontrolü
    if (liveStreamBalance <= 0) {
        showNotification('Canlı yayın bakiyeniz yok! Lütfen süre satın alın.', 'error');
        showPage('buyTimePage');
        return;
    }
    
    // Canlı yayını başlat
    startLiveStream();
}

// Süre paketi satın al
function buyTimePackage(hours, price) {
    if (confirm(`${hours} saatlik paketi ₺${price} karşılığında satın almak istediğinizden emin misiniz?`)) {
        // Gerçek uygulamada ödeme işlemi burada yapılır
        liveStreamBalance += hours * 60; // Dakikaya çevir
        updateLiveStreamBalance();
        showNotification(`${hours} saatlik paket başarıyla satın alındı!`, 'success');
        showPage('dashboardPage');
    }
}

// Satın alma adımını atla
function skipPurchase() {
    // Demo için 1 saat ücretsiz ver
    liveStreamBalance = 60;
    updateLiveStreamBalance();
    showNotification('Demo için 1 saat ücretsiz süre verildi!', 'success');
    showPage('dashboardPage');
}

// ==================== HAMMADECİLER PROSEDÜRÜ ====================

// Üretici arama
function searchProducers() {
    const searchTerm = document.getElementById('producerSearch').value.toLowerCase();
    const cityFilter = document.getElementById('cityFilter').value;
    const productTypeFilter = document.getElementById('productTypeFilter').value;
    
    const producers = getAllProducers();
    let filteredProducers = producers;
    
    // Arama terimi ile filtrele
    if (searchTerm) {
        filteredProducers = filteredProducers.filter(producer => 
            producer.name.toLowerCase().includes(searchTerm) ||
            producer.city.toLowerCase().includes(searchTerm) ||
            producer.productTypes.some(type => type.toLowerCase().includes(searchTerm))
        );
    }
    
    // Şehir filtresi
    if (cityFilter) {
        filteredProducers = filteredProducers.filter(producer => 
            producer.city.toLowerCase() === cityFilter.toLowerCase()
        );
    }
    
    // Ürün türü filtresi
    if (productTypeFilter) {
        filteredProducers = filteredProducers.filter(producer => 
            producer.productTypes.includes(productTypeFilter)
        );
    }
    
    displayProducers(filteredProducers);
}

// Tüm üreticileri al
function getAllProducers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter(user => user.role === 'uretici');
}

// Üreticileri göster
function displayProducers(producers) {
    const producersList = document.getElementById('producersList');
    if (!producersList) return;
    
    producersList.innerHTML = '';
    
    producers.forEach(producer => {
        const producerCard = document.createElement('div');
        producerCard.className = 'producer-card';
        producerCard.innerHTML = `
            <h4>${producer.name}</h4>
            <div class="producer-info">
                <p><i class="fas fa-map-marker-alt"></i> ${producer.city || 'Şehir belirtilmemiş'}</p>
                <p><i class="fas fa-envelope"></i> ${producer.email}</p>
                <p><i class="fas fa-industry"></i> ${producer.productTypes ? producer.productTypes.join(', ') : 'Ürün türü belirtilmemiş'}</p>
            </div>
            <div class="producer-actions">
                <button class="btn btn-primary btn-small" onclick="sendMessage('${producer.id}')">
                    <i class="fas fa-envelope"></i> Mesaj Gönder
                </button>
                <button class="btn btn-secondary btn-small" onclick="inviteToLiveStream('${producer.id}')">
                    <i class="fas fa-video"></i> Canlı Yayın Daveti
                </button>
                <button class="btn btn-secondary btn-small" onclick="sendOffer('${producer.id}')">
                    <i class="fas fa-file-contract"></i> Teklif Gönder
                </button>
            </div>
        `;
        producersList.appendChild(producerCard);
    });
}

// Mesaj gönder
function sendMessage(producerId) {
    const message = prompt('Mesajınızı yazın:');
    if (message) {
        const messageData = {
            id: Date.now().toString(),
            from: currentUser.id,
            to: producerId,
            message: message,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(messageData);
        localStorage.setItem('messages', JSON.stringify(messages));
        
        showNotification('Mesaj başarıyla gönderildi!', 'success');
    }
}

// Canlı yayın daveti gönder
function inviteToLiveStream(producerId) {
    if (confirm('Bu üreticiyi canlı yayınına davet etmek istediğinizden emin misiniz?')) {
        const invitation = {
            id: Date.now().toString(),
            from: currentUser.id,
            to: producerId,
            type: 'live_stream_invitation',
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
        invitations.push(invitation);
        localStorage.setItem('invitations', JSON.stringify(invitations));
        
        showNotification('Canlı yayın daveti gönderildi!', 'success');
    }
}

// Teklif gönder
function sendOffer(producerId) {
    showPage('offerFormsPage');
    // Teklif formunda üretici seçimini otomatik yap
    setTimeout(() => {
        const offerToSelect = document.getElementById('offerTo');
        if (offerToSelect) {
            offerToSelect.value = producerId;
        }
    }, 100);
}

// Teklif formu submit
document.addEventListener('DOMContentLoaded', function() {
    const offerForm = document.getElementById('offerForm');
    if (offerForm) {
        offerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const offer = {
                id: Date.now().toString(),
                from: currentUser.id,
                to: document.getElementById('offerTo').value,
                type: document.getElementById('offerType').value,
                title: document.getElementById('offerTitle').value,
                description: document.getElementById('offerDescription').value,
                price: parseFloat(document.getElementById('offerPrice').value),
                quantity: parseInt(document.getElementById('offerQuantity').value),
                validUntil: document.getElementById('offerValidUntil').value,
                paymentTerms: document.getElementById('offerPaymentTerms').value,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            const offers = JSON.parse(localStorage.getItem('offers') || '[]');
            offers.push(offer);
            localStorage.setItem('offers', JSON.stringify(offers));
            
            showNotification('Teklif başarıyla gönderildi!', 'success');
            offerForm.reset();
            loadOffers();
        });
    }
});

// Teklifleri yükle
function loadOffers() {
    loadSentOffers();
    loadReceivedOffers();
}

// Gönderilen teklifleri yükle
function loadSentOffers() {
    const sentOffersList = document.getElementById('sentOffersList');
    if (!sentOffersList) return;
    
    const offers = JSON.parse(localStorage.getItem('offers') || '[]');
    const sentOffers = offers.filter(offer => offer.from === currentUser.id);
    
    sentOffersList.innerHTML = '';
    
    sentOffers.forEach(offer => {
        const offerCard = document.createElement('div');
        offerCard.className = 'offer-card';
        offerCard.innerHTML = `
            <div class="offer-header">
                <div class="offer-title">${offer.title}</div>
                <div class="offer-status ${offer.status}">${getOfferStatusText(offer.status)}</div>
            </div>
            <div class="offer-details">
                <p><strong>Alıcı:</strong> ${getUserNameById(offer.to)}</p>
                <p><strong>Fiyat:</strong> ₺${offer.price.toFixed(2)}</p>
                <p><strong>Miktar:</strong> ${offer.quantity}</p>
                <p><strong>Geçerlilik:</strong> ${new Date(offer.validUntil).toLocaleDateString('tr-TR')}</p>
            </div>
            <div class="offer-actions">
                <button class="btn btn-secondary btn-small" onclick="viewOffer('${offer.id}')">Görüntüle</button>
                ${offer.status === 'pending' ? `<button class="btn btn-danger btn-small" onclick="cancelOffer('${offer.id}')">İptal Et</button>` : ''}
            </div>
        `;
        sentOffersList.appendChild(offerCard);
    });
}

// Gelen teklifleri yükle
function loadReceivedOffers() {
    const receivedOffersList = document.getElementById('receivedOffersList');
    if (!receivedOffersList) return;
    
    const offers = JSON.parse(localStorage.getItem('offers') || '[]');
    const receivedOffers = offers.filter(offer => offer.to === currentUser.id);
    
    receivedOffersList.innerHTML = '';
    
    receivedOffers.forEach(offer => {
        const offerCard = document.createElement('div');
        offerCard.className = 'offer-card';
        offerCard.innerHTML = `
            <div class="offer-header">
                <div class="offer-title">${offer.title}</div>
                <div class="offer-status ${offer.status}">${getOfferStatusText(offer.status)}</div>
            </div>
            <div class="offer-details">
                <p><strong>Gönderen:</strong> ${getUserNameById(offer.from)}</p>
                <p><strong>Fiyat:</strong> ₺${offer.price.toFixed(2)}</p>
                <p><strong>Miktar:</strong> ${offer.quantity}</p>
                <p><strong>Geçerlilik:</strong> ${new Date(offer.validUntil).toLocaleDateString('tr-TR')}</p>
            </div>
            <div class="offer-actions">
                <button class="btn btn-secondary btn-small" onclick="viewOffer('${offer.id}')">Görüntüle</button>
                ${offer.status === 'pending' ? `
                    <button class="btn btn-success btn-small" onclick="acceptOffer('${offer.id}')">Kabul Et</button>
                    <button class="btn btn-danger btn-small" onclick="rejectOffer('${offer.id}')">Reddet</button>
                ` : ''}
            </div>
        `;
        receivedOffersList.appendChild(offerCard);
    });
}

// Teklif durumu metni
function getOfferStatusText(status) {
    const statusTexts = {
        'pending': 'Bekliyor',
        'accepted': 'Kabul Edildi',
        'rejected': 'Reddedildi',
        'cancelled': 'İptal Edildi'
    };
    return statusTexts[status] || status;
}

// Kullanıcı adını ID'den al
function getUserNameById(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Bilinmeyen Kullanıcı';
}

// Teklif kabul et
function acceptOffer(offerId) {
    if (confirm('Bu teklifi kabul etmek istediğinizden emin misiniz?')) {
        const offers = JSON.parse(localStorage.getItem('offers') || '[]');
        const offer = offers.find(o => o.id === offerId);
        
        if (offer) {
            offer.status = 'accepted';
            offer.acceptedAt = new Date().toISOString();
            
            // Admin paneline sipariş olarak ekle
            const order = {
                id: Date.now().toString(),
                offerId: offerId,
                from: offer.from,
                to: offer.to,
                products: offer.products || [],
                totalAmount: offer.price * offer.quantity,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));
            
            localStorage.setItem('offers', JSON.stringify(offers));
            showNotification('Teklif kabul edildi ve sipariş oluşturuldu!', 'success');
            loadOffers();
        }
    }
}

// Teklif reddet
function rejectOffer(offerId) {
    if (confirm('Bu teklifi reddetmek istediğinizden emin misiniz?')) {
        const offers = JSON.parse(localStorage.getItem('offers') || '[]');
        const offer = offers.find(o => o.id === offerId);
        
        if (offer) {
            offer.status = 'rejected';
            offer.rejectedAt = new Date().toISOString();
            localStorage.setItem('offers', JSON.stringify(offers));
            showNotification('Teklif reddedildi!', 'success');
            loadOffers();
        }
    }
}

// Teklif iptal et
function cancelOffer(offerId) {
    if (confirm('Bu teklifi iptal etmek istediğinizden emin misiniz?')) {
        const offers = JSON.parse(localStorage.getItem('offers') || '[]');
        const offer = offers.find(o => o.id === offerId);
        
        if (offer) {
            offer.status = 'cancelled';
            offer.cancelledAt = new Date().toISOString();
            localStorage.setItem('offers', JSON.stringify(offers));
            showNotification('Teklif iptal edildi!', 'success');
            loadOffers();
        }
    }
}

// Sipariş takibi
function loadOrderTracking() {
    updateOrderSummary();
    loadOrders();
}

// Sipariş özetini güncelle
function updateOrderSummary() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = orders.filter(order => 
        order.from === currentUser.id || order.to === currentUser.id
    );
    
    const summary = {
        pending: userOrders.filter(o => o.status === 'pending').length,
        processing: userOrders.filter(o => o.status === 'processing').length,
        shipped: userOrders.filter(o => o.status === 'shipped').length,
        delivered: userOrders.filter(o => o.status === 'delivered').length
    };
    
    document.getElementById('pendingOrders').textContent = summary.pending;
    document.getElementById('processingOrders').textContent = summary.processing;
    document.getElementById('shippedOrders').textContent = summary.shipped;
    document.getElementById('deliveredOrders').textContent = summary.delivered;
}

// Siparişleri yükle
function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = orders.filter(order => 
        order.from === currentUser.id || order.to === currentUser.id
    );
    
    ordersList.innerHTML = '';
    
    userOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-number">Sipariş #${order.id}</div>
                <div class="order-date">${new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
            </div>
            <div class="order-details">
                <div class="order-detail">
                    <strong>Durum:</strong> ${getOrderStatusText(order.status)}
                </div>
                <div class="order-detail">
                    <strong>Tutar:</strong> ₺${order.totalAmount.toFixed(2)}
                </div>
                <div class="order-detail">
                    <strong>${order.from === currentUser.id ? 'Alıcı' : 'Gönderen'}:</strong> ${getUserNameById(order.from === currentUser.id ? order.to : order.from)}
                </div>
            </div>
            <div class="order-actions">
                <button class="btn btn-secondary btn-small" onclick="viewOrder('${order.id}')">Görüntüle</button>
                ${order.status === 'shipped' ? `<button class="btn btn-primary btn-small" onclick="trackOrder('${order.id}')">Kargo Takip</button>` : ''}
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

// Sipariş durumu metni
function getOrderStatusText(status) {
    const statusTexts = {
        'pending': 'Bekleyen',
        'processing': 'Hazırlanan',
        'shipped': 'Kargoya Verilen',
        'delivered': 'Teslim Edilen',
        'cancelled': 'İptal Edilen'
    };
    return statusTexts[status] || status;
}

// Kargo takip
function trackShipment() {
    const trackingNumber = document.getElementById('trackingNumber').value;
    if (!trackingNumber) {
        showNotification('Lütfen kargo takip numarası girin!', 'error');
        return;
    }
    
    // Demo için mock takip sonucu
    const trackingResult = document.getElementById('trackingResult');
    trackingResult.innerHTML = `
        <h4>Kargo Takip Sonucu</h4>
        <p><strong>Takip No:</strong> ${trackingNumber}</p>
        <p><strong>Durum:</strong> Kargoya verildi</p>
        <p><strong>Son Konum:</strong> İstanbul Dağıtım Merkezi</p>
        <p><strong>Tahmini Teslimat:</strong> ${new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR')}</p>
    `;
}

// Üreticileri yükle
function loadProducers() {
    const producers = getAllProducers();
    displayProducers(producers);
}

// Teklif formunu yükle
function loadOfferForm() {
    const offerToSelect = document.getElementById('offerTo');
    if (offerToSelect) {
        const producers = getAllProducers();
        offerToSelect.innerHTML = '<option value="">Üretici Seçin</option>';
        
        producers.forEach(producer => {
            const option = document.createElement('option');
            option.value = producer.id;
            option.textContent = producer.name;
            offerToSelect.appendChild(option);
        });
    }
    
    loadOffers();
}

// Teklif görüntüle
function viewOffer(offerId) {
    const offers = JSON.parse(localStorage.getItem('offers') || '[]');
    const offer = offers.find(o => o.id === offerId);
    
    if (offer) {
        alert(`Teklif Detayları:\n\nBaşlık: ${offer.title}\nAçıklama: ${offer.description}\nFiyat: ₺${offer.price}\nMiktar: ${offer.quantity}\nGeçerlilik: ${new Date(offer.validUntil).toLocaleDateString('tr-TR')}\nÖdeme Koşulları: ${offer.paymentTerms}`);
    }
}

// Sipariş görüntüle
function viewOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        alert(`Sipariş Detayları:\n\nSipariş No: ${order.id}\nTutar: ₺${order.totalAmount.toFixed(2)}\nDurum: ${getOrderStatusText(order.status)}\nTarih: ${new Date(order.createdAt).toLocaleDateString('tr-TR')}`);
    }
}

// Sipariş takip
function trackOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        const trackingNumber = `TRK${orderId.substring(0, 8).toUpperCase()}`;
        document.getElementById('trackingNumber').value = trackingNumber;
        trackShipment();
    }
}

// Siparişleri filtrele
function filterOrders() {
    const statusFilter = document.getElementById('orderStatusFilter').value;
    const dateFrom = document.getElementById('orderDateFrom').value;
    const dateTo = document.getElementById('orderDateTo').value;
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    let filteredOrders = orders.filter(order => 
        order.from === currentUser.id || order.to === currentUser.id
    );
    
    if (statusFilter) {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    if (dateFrom) {
        filteredOrders = filteredOrders.filter(order => 
            new Date(order.createdAt) >= new Date(dateFrom)
        );
    }
    
    if (dateTo) {
        filteredOrders = filteredOrders.filter(order => 
            new Date(order.createdAt) <= new Date(dateTo)
        );
    }
    
    displayFilteredOrders(filteredOrders);
}

// Filtrelenmiş siparişleri göster
function displayFilteredOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-number">Sipariş #${order.id}</div>
                <div class="order-date">${new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
            </div>
            <div class="order-details">
                <div class="order-detail">
                    <strong>Durum:</strong> ${getOrderStatusText(order.status)}
                </div>
                <div class="order-detail">
                    <strong>Tutar:</strong> ₺${order.totalAmount.toFixed(2)}
                </div>
                <div class="order-detail">
                    <strong>${order.from === currentUser.id ? 'Alıcı' : 'Gönderen'}:</strong> ${getUserNameById(order.from === currentUser.id ? order.to : order.from)}
                </div>
            </div>
            <div class="order-actions">
                <button class="btn btn-secondary btn-small" onclick="viewOrder('${order.id}')">Görüntüle</button>
                ${order.status === 'shipped' ? `<button class="btn btn-primary btn-small" onclick="trackOrder('${order.id}')">Kargo Takip</button>` : ''}
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

// ==================== ÜRETİCİLER PROSEDÜRÜ ====================

// Hammadeci arama
function searchSuppliers() {
    const searchTerm = document.getElementById('supplierSearch').value.toLowerCase();
    const cityFilter = document.getElementById('supplierCityFilter').value;
    const productTypeFilter = document.getElementById('supplierProductTypeFilter').value;
    
    const suppliers = getAllSuppliers();
    let filteredSuppliers = suppliers;
    
    // Arama terimi ile filtrele
    if (searchTerm) {
        filteredSuppliers = filteredSuppliers.filter(supplier => 
            supplier.name.toLowerCase().includes(searchTerm) ||
            supplier.city.toLowerCase().includes(searchTerm) ||
            supplier.productTypes.some(type => type.toLowerCase().includes(searchTerm))
        );
    }
    
    // Şehir filtresi
    if (cityFilter) {
        filteredSuppliers = filteredSuppliers.filter(supplier => 
            supplier.city.toLowerCase() === cityFilter.toLowerCase()
        );
    }
    
    // Ürün türü filtresi
    if (productTypeFilter) {
        filteredSuppliers = filteredSuppliers.filter(supplier => 
            supplier.productTypes.includes(productTypeFilter)
        );
    }
    
    displaySuppliers(filteredSuppliers);
}

// Tüm hammadecileri al
function getAllSuppliers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter(user => user.role === 'hammadeci');
}

// Hammadecileri göster
function displaySuppliers(suppliers) {
    const suppliersList = document.getElementById('suppliersList');
    if (!suppliersList) return;
    
    suppliersList.innerHTML = '';
    
    suppliers.forEach(supplier => {
        const supplierCard = document.createElement('div');
        supplierCard.className = 'supplier-card';
        supplierCard.innerHTML = `
            <h4>${supplier.name}</h4>
            <div class="supplier-info">
                <p><i class="fas fa-map-marker-alt"></i> ${supplier.city || 'Şehir belirtilmemiş'}</p>
                <p><i class="fas fa-envelope"></i> ${supplier.email}</p>
                <p><i class="fas fa-industry"></i> ${supplier.productTypes ? supplier.productTypes.join(', ') : 'Ürün türü belirtilmemiş'}</p>
            </div>
            <div class="supplier-actions">
                <button class="btn btn-primary btn-small" onclick="sendMessageToSupplier('${supplier.id}')">
                    <i class="fas fa-envelope"></i> Mesaj Gönder
                </button>
                <button class="btn btn-secondary btn-small" onclick="inviteSupplierToLiveStream('${supplier.id}')">
                    <i class="fas fa-video"></i> Canlı Yayın Daveti
                </button>
                <button class="btn btn-secondary btn-small" onclick="sendOfferToSupplier('${supplier.id}')">
                    <i class="fas fa-file-contract"></i> Teklif Gönder
                </button>
            </div>
        `;
        suppliersList.appendChild(supplierCard);
    });
}

// Toptancı arama
function searchWholesalers() {
    const searchTerm = document.getElementById('wholesalerSearch').value.toLowerCase();
    const cityFilter = document.getElementById('wholesalerCityFilter').value;
    const productTypeFilter = document.getElementById('wholesalerProductTypeFilter').value;
    
    const wholesalers = getAllWholesalers();
    let filteredWholesalers = wholesalers;
    
    // Arama terimi ile filtrele
    if (searchTerm) {
        filteredWholesalers = filteredWholesalers.filter(wholesaler => 
            wholesaler.name.toLowerCase().includes(searchTerm) ||
            wholesaler.city.toLowerCase().includes(searchTerm) ||
            wholesaler.productTypes.some(type => type.toLowerCase().includes(searchTerm))
        );
    }
    
    // Şehir filtresi
    if (cityFilter) {
        filteredWholesalers = filteredWholesalers.filter(wholesaler => 
            wholesaler.city.toLowerCase() === cityFilter.toLowerCase()
        );
    }
    
    // Ürün türü filtresi
    if (productTypeFilter) {
        filteredWholesalers = filteredWholesalers.filter(wholesaler => 
            wholesaler.productTypes.includes(productTypeFilter)
        );
    }
    
    displayWholesalers(filteredWholesalers);
}

// Tüm toptancıları al
function getAllWholesalers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter(user => user.role === 'toptanci');
}

// Toptancıları göster
function displayWholesalers(wholesalers) {
    const wholesalersList = document.getElementById('wholesalersList');
    if (!wholesalersList) return;
    
    wholesalersList.innerHTML = '';
    
    wholesalers.forEach(wholesaler => {
        const wholesalerCard = document.createElement('div');
        wholesalerCard.className = 'wholesaler-card';
        wholesalerCard.innerHTML = `
            <h4>${wholesaler.name}</h4>
            <div class="wholesaler-info">
                <p><i class="fas fa-map-marker-alt"></i> ${wholesaler.city || 'Şehir belirtilmemiş'}</p>
                <p><i class="fas fa-envelope"></i> ${wholesaler.email}</p>
                <p><i class="fas fa-industry"></i> ${wholesaler.productTypes ? wholesaler.productTypes.join(', ') : 'Ürün türü belirtilmemiş'}</p>
            </div>
            <div class="wholesaler-actions">
                <button class="btn btn-primary btn-small" onclick="sendMessageToWholesaler('${wholesaler.id}')">
                    <i class="fas fa-envelope"></i> Mesaj Gönder
                </button>
                <button class="btn btn-secondary btn-small" onclick="inviteWholesalerToLiveStream('${wholesaler.id}')">
                    <i class="fas fa-video"></i> Canlı Yayın Daveti
                </button>
                <button class="btn btn-secondary btn-small" onclick="sendOfferToWholesaler('${wholesaler.id}')">
                    <i class="fas fa-file-contract"></i> Teklif Gönder
                </button>
            </div>
        `;
        wholesalersList.appendChild(wholesalerCard);
    });
}

// Hammadeciye mesaj gönder
function sendMessageToSupplier(supplierId) {
    const message = prompt('Mesajınızı yazın:');
    if (message) {
        const messageData = {
            id: Date.now().toString(),
            from: currentUser.id,
            to: supplierId,
            message: message,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(messageData);
        localStorage.setItem('messages', JSON.stringify(messages));
        
        showNotification('Mesaj başarıyla gönderildi!', 'success');
    }
}

// Toptancıya mesaj gönder
function sendMessageToWholesaler(wholesalerId) {
    const message = prompt('Mesajınızı yazın:');
    if (message) {
        const messageData = {
            id: Date.now().toString(),
            from: currentUser.id,
            to: wholesalerId,
            message: message,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(messageData);
        localStorage.setItem('messages', JSON.stringify(messages));
        
        showNotification('Mesaj başarıyla gönderildi!', 'success');
    }
}

// Hammadeciye canlı yayın daveti gönder
function inviteSupplierToLiveStream(supplierId) {
    if (confirm('Bu hammadeciyi canlı yayınına davet etmek istediğinizden emin misiniz?')) {
        const invitation = {
            id: Date.now().toString(),
            from: currentUser.id,
            to: supplierId,
            type: 'live_stream_invitation',
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
        invitations.push(invitation);
        localStorage.setItem('invitations', JSON.stringify(invitations));
        
        showNotification('Canlı yayın daveti gönderildi!', 'success');
    }
}

// Toptancıya canlı yayın daveti gönder
function inviteWholesalerToLiveStream(wholesalerId) {
    if (confirm('Bu toptancıyı canlı yayınına davet etmek istediğinizden emin misiniz?')) {
        const invitation = {
            id: Date.now().toString(),
            from: currentUser.id,
            to: wholesalerId,
            type: 'live_stream_invitation',
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
        invitations.push(invitation);
        localStorage.setItem('invitations', JSON.stringify(invitations));
        
        showNotification('Canlı yayın daveti gönderildi!', 'success');
    }
}

// Hammadeciye teklif gönder
function sendOfferToSupplier(supplierId) {
    showPage('supplierOfferFormsPage');
    // Teklif formunda hammadeci seçimini otomatik yap
    setTimeout(() => {
        const offerToSelect = document.getElementById('supplierOfferTo');
        if (offerToSelect) {
            offerToSelect.value = supplierId;
        }
    }, 100);
}

// Toptancıya teklif gönder
function sendOfferToWholesaler(wholesalerId) {
    showPage('wholesalerOfferFormsPage');
    // Teklif formunda toptancı seçimini otomatik yap
    setTimeout(() => {
        const offerToSelect = document.getElementById('wholesalerOfferTo');
        if (offerToSelect) {
            offerToSelect.value = wholesalerId;
        }
    }, 100);
}

// Üretici sipariş yönetimi
function loadProducerOrderManagement() {
    updateProducerOrderSummary();
    loadProducerOrders();
}

// Üretici sipariş özetini güncelle
function updateProducerOrderSummary() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const receivedOrders = orders.filter(order => order.to === currentUser.id);
    const sentOrders = orders.filter(order => order.from === currentUser.id);
    
    const receivedSummary = {
        pending: receivedOrders.filter(o => o.status === 'pending').length,
        processing: receivedOrders.filter(o => o.status === 'processing').length,
        shipped: receivedOrders.filter(o => o.status === 'shipped').length,
        delivered: receivedOrders.filter(o => o.status === 'delivered').length
    };
    
    document.getElementById('producerPendingOrders').textContent = receivedSummary.pending;
    document.getElementById('producerProcessingOrders').textContent = receivedSummary.processing;
    document.getElementById('producerShippedOrders').textContent = receivedSummary.shipped;
    document.getElementById('producerDeliveredOrders').textContent = receivedSummary.delivered;
}

// Üretici siparişlerini yükle
function loadProducerOrders() {
    loadReceivedOrders();
    loadSentOrders();
}

// Gelen siparişleri yükle
function loadReceivedOrders() {
    const receivedOrdersList = document.getElementById('receivedOrdersList');
    if (!receivedOrdersList) return;
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const receivedOrders = orders.filter(order => order.to === currentUser.id);
    
    receivedOrdersList.innerHTML = '';
    
    receivedOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-number">Sipariş #${order.id}</div>
                <div class="order-date">${new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
            </div>
            <div class="order-details">
                <div class="order-detail">
                    <strong>Durum:</strong> ${getOrderStatusText(order.status)}
                </div>
                <div class="order-detail">
                    <strong>Tutar:</strong> ₺${order.totalAmount.toFixed(2)}
                </div>
                <div class="order-detail">
                    <strong>Gönderen:</strong> ${getUserNameById(order.from)}
                </div>
            </div>
            <div class="order-actions">
                <button class="btn btn-secondary btn-small" onclick="viewOrder('${order.id}')">Görüntüle</button>
                ${order.status === 'pending' ? `<button class="btn btn-success btn-small" onclick="acceptOrder('${order.id}')">Kabul Et</button>` : ''}
                ${order.status === 'pending' ? `<button class="btn btn-danger btn-small" onclick="rejectOrder('${order.id}')">Reddet</button>` : ''}
                ${order.status === 'accepted' ? `<button class="btn btn-primary btn-small" onclick="processOrder('${order.id}')">Hazırla</button>` : ''}
                ${order.status === 'processing' ? `<button class="btn btn-primary btn-small" onclick="shipOrder('${order.id}')">Kargoya Ver</button>` : ''}
            </div>
        `;
        receivedOrdersList.appendChild(orderCard);
    });
}

// Verdiğim siparişleri yükle
function loadSentOrders() {
    const sentOrdersList = document.getElementById('sentOrdersList');
    if (!sentOrdersList) return;
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const sentOrders = orders.filter(order => order.from === currentUser.id);
    
    sentOrdersList.innerHTML = '';
    
    sentOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-number">Sipariş #${order.id}</div>
                <div class="order-date">${new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
            </div>
            <div class="order-details">
                <div class="order-detail">
                    <strong>Durum:</strong> ${getOrderStatusText(order.status)}
                </div>
                <div class="order-detail">
                    <strong>Tutar:</strong> ₺${order.totalAmount.toFixed(2)}
                </div>
                <div class="order-detail">
                    <strong>Alıcı:</strong> ${getUserNameById(order.to)}
                </div>
            </div>
            <div class="order-actions">
                <button class="btn btn-secondary btn-small" onclick="viewOrder('${order.id}')">Görüntüle</button>
                ${order.status === 'shipped' ? `<button class="btn btn-primary btn-small" onclick="trackOrder('${order.id}')">Kargo Takip</button>` : ''}
            </div>
        `;
        sentOrdersList.appendChild(orderCard);
    });
}

// Sipariş türü göster
function showOrderType(type) {
    // Tab butonlarını güncelle
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Tab içeriklerini göster/gizle
    document.querySelectorAll('.order-tab').forEach(tab => tab.classList.remove('active'));
    
    if (type === 'received') {
        document.getElementById('receivedOrdersTab').classList.add('active');
    } else if (type === 'sent') {
        document.getElementById('sentOrdersTab').classList.add('active');
    }
}

// Sipariş kabul et
function acceptOrder(orderId) {
    if (confirm('Bu siparişi kabul etmek istediğinizden emin misiniz?')) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
            order.status = 'accepted';
            order.acceptedAt = new Date().toISOString();
            localStorage.setItem('orders', JSON.stringify(orders));
            showNotification('Sipariş kabul edildi!', 'success');
            loadProducerOrders();
        }
    }
}

// Sipariş reddet
function rejectOrder(orderId) {
    if (confirm('Bu siparişi reddetmek istediğinizden emin misiniz?')) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
            order.status = 'rejected';
            order.rejectedAt = new Date().toISOString();
            localStorage.setItem('orders', JSON.stringify(orders));
            showNotification('Sipariş reddedildi!', 'success');
            loadProducerOrders();
        }
    }
}

// Sipariş hazırla
function processOrder(orderId) {
    if (confirm('Bu siparişi hazırlamaya başlamak istediğinizden emin misiniz?')) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
            order.status = 'processing';
            order.processingAt = new Date().toISOString();
            localStorage.setItem('orders', JSON.stringify(orders));
            showNotification('Sipariş hazırlanmaya başlandı!', 'success');
            loadProducerOrders();
        }
    }
}

// Sipariş kargoya ver
function shipOrder(orderId) {
    if (confirm('Bu siparişi kargoya vermek istediğinizden emin misiniz?')) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
            order.status = 'shipped';
            order.shippedAt = new Date().toISOString();
            order.trackingNumber = `TRK${orderId.substring(0, 8).toUpperCase()}`;
            localStorage.setItem('orders', JSON.stringify(orders));
            showNotification('Sipariş kargoya verildi!', 'success');
            loadProducerOrders();
        }
    }
}

// Hammadecileri yükle
function loadSuppliers() {
    const suppliers = getAllSuppliers();
    displaySuppliers(suppliers);
}

// Toptancıları yükle
function loadWholesalers() {
    const wholesalers = getAllWholesalers();
    displayWholesalers(wholesalers);
}

// ==================== TOPTANCILAR PROSEDÜRÜ ====================

// Toptancılar için üretici arama
function searchWholesalerProducers() {
    const searchTerm = document.getElementById('wholesalerProducerSearch').value.toLowerCase();
    const cityFilter = document.getElementById('wholesalerProducerCityFilter').value;
    const productTypeFilter = document.getElementById('wholesalerProducerProductTypeFilter').value;
    
    const producers = getAllProducers();
    let filteredProducers = producers;
    
    // Arama terimi ile filtrele
    if (searchTerm) {
        filteredProducers = filteredProducers.filter(producer => 
            producer.name.toLowerCase().includes(searchTerm) ||
            producer.city.toLowerCase().includes(searchTerm) ||
            producer.productTypes.some(type => type.toLowerCase().includes(searchTerm))
        );
    }
    
    // Şehir filtresi
    if (cityFilter) {
        filteredProducers = filteredProducers.filter(producer => 
            producer.city.toLowerCase() === cityFilter.toLowerCase()
        );
    }
    
    // Ürün türü filtresi
    if (productTypeFilter) {
        filteredProducers = filteredProducers.filter(producer => 
            producer.productTypes.includes(productTypeFilter)
        );
    }
    
    displayWholesalerProducers(filteredProducers);
}

// Toptancılar için üreticileri göster
function displayWholesalerProducers(producers) {
    const producersList = document.getElementById('wholesalerProducersList');
    if (!producersList) return;
    
    producersList.innerHTML = '';
    
    producers.forEach(producer => {
        const producerCard = document.createElement('div');
        producerCard.className = 'producer-card';
        producerCard.innerHTML = `
            <h4>${producer.name}</h4>
            <div class="producer-info">
                <p><i class="fas fa-map-marker-alt"></i> ${producer.city || 'Şehir belirtilmemiş'}</p>
                <p><i class="fas fa-envelope"></i> ${producer.email}</p>
                <p><i class="fas fa-industry"></i> ${producer.productTypes ? producer.productTypes.join(', ') : 'Ürün türü belirtilmemiş'}</p>
            </div>
            <div class="producer-actions">
                <button class="btn btn-primary btn-small" onclick="sendMessageToProducer('${producer.id}')">
                    <i class="fas fa-envelope"></i> Mesaj Gönder
                </button>
                <button class="btn btn-secondary btn-small" onclick="inviteProducerToLiveStream('${producer.id}')">
                    <i class="fas fa-video"></i> Canlı Yayın Daveti
                </button>
                <button class="btn btn-secondary btn-small" onclick="sendOfferToProducer('${producer.id}')">
                    <i class="fas fa-file-contract"></i> Teklif Gönder
                </button>
            </div>
        `;
        producersList.appendChild(producerCard);
    });
}

// Toptancılar için satıcı arama
function searchWholesalerSellers() {
    const searchTerm = document.getElementById('wholesalerSellerSearch').value.toLowerCase();
    const cityFilter = document.getElementById('wholesalerSellerCityFilter').value;
    const productTypeFilter = document.getElementById('wholesalerSellerProductTypeFilter').value;
    
    const sellers = getAllSellers();
    let filteredSellers = sellers;
    
    // Arama terimi ile filtrele
    if (searchTerm) {
        filteredSellers = filteredSellers.filter(seller => 
            seller.name.toLowerCase().includes(searchTerm) ||
            seller.city.toLowerCase().includes(searchTerm) ||
            seller.productTypes.some(type => type.toLowerCase().includes(searchTerm))
        );
    }
    
    // Şehir filtresi
    if (cityFilter) {
        filteredSellers = filteredSellers.filter(seller => 
            seller.city.toLowerCase() === cityFilter.toLowerCase()
        );
    }
    
    // Ürün türü filtresi
    if (productTypeFilter) {
        filteredSellers = filteredSellers.filter(seller => 
            seller.productTypes.includes(productTypeFilter)
        );
    }
    
    displayWholesalerSellers(filteredSellers);
}

// Tüm satıcıları al
function getAllSellers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter(user => user.role === 'satici');
}

// Toptancılar için satıcıları göster
function displayWholesalerSellers(sellers) {
    const sellersList = document.getElementById('wholesalerSellersList');
    if (!sellersList) return;
    
    sellersList.innerHTML = '';
    
    sellers.forEach(seller => {
        const sellerCard = document.createElement('div');
        sellerCard.className = 'seller-card';
        sellerCard.innerHTML = `
            <h4>${seller.name}</h4>
            <div class="seller-info">
                <p><i class="fas fa-map-marker-alt"></i> ${seller.city || 'Şehir belirtilmemiş'}</p>
                <p><i class="fas fa-envelope"></i> ${seller.email}</p>
                <p><i class="fas fa-industry"></i> ${seller.productTypes ? seller.productTypes.join(', ') : 'Ürün türü belirtilmemiş'}</p>
            </div>
            <div class="seller-actions">
                <button class="btn btn-primary btn-small" onclick="sendMessageToSeller('${seller.id}')">
                    <i class="fas fa-envelope"></i> Mesaj Gönder
                </button>
                <button class="btn btn-secondary btn-small" onclick="inviteSellerToLiveStream('${seller.id}')">
                    <i class="fas fa-video"></i> Canlı Yayın Daveti
                </button>
                <button class="btn btn-secondary btn-small" onclick="sendOfferToSeller('${seller.id}')">
                    <i class="fas fa-file-contract"></i> Teklif Gönder
                </button>
            </div>
        `;
        sellersList.appendChild(sellerCard);
    });
}

// Üreticiye mesaj gönder
function sendMessageToProducer(producerId) {
    const message = prompt('Mesajınızı yazın:');
    if (message) {
        const messageData = {
            id: Date.now().toString(),
            from: currentUser.id,
            to: producerId,
            message: message,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(messageData);
        localStorage.setItem('messages', JSON.stringify(messages));
        
        showNotification('Mesaj başarıyla gönderildi!', 'success');
    }
}

// Satıcıya mesaj gönder
function sendMessageToSeller(sellerId) {
    const message = prompt('Mesajınızı yazın:');
    if (message) {
        const messageData = {
            id: Date.now().toString(),
            from: currentUser.id,
            to: sellerId,
            message: message,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(messageData);
        localStorage.setItem('messages', JSON.stringify(messages));
        
        showNotification('Mesaj başarıyla gönderildi!', 'success');
    }
}

// Üreticiye canlı yayın daveti gönder
function inviteProducerToLiveStream(producerId) {
    if (confirm('Bu üreticiyi canlı yayınına davet etmek istediğinizden emin misiniz?')) {
        const invitation = {
            id: Date.now().toString(),
            from: currentUser.id,
            to: producerId,
            type: 'live_stream_invitation',
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
        invitations.push(invitation);
        localStorage.setItem('invitations', JSON.stringify(invitations));
        
        showNotification('Canlı yayın daveti gönderildi!', 'success');
    }
}

// Satıcıya canlı yayın daveti gönder
function inviteSellerToLiveStream(sellerId) {
    if (confirm('Bu satıcıyı canlı yayınına davet etmek istediğinizden emin misiniz?')) {
        const invitation = {
            id: Date.now().toString(),
            from: currentUser.id,
            to: sellerId,
            type: 'live_stream_invitation',
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
        invitations.push(invitation);
        localStorage.setItem('invitations', JSON.stringify(invitations));
        
        showNotification('Canlı yayın daveti gönderildi!', 'success');
    }
}

// Üreticiye teklif gönder
function sendOfferToProducer(producerId) {
    showPage('wholesalerProducerOfferFormsPage');
    // Teklif formunda üretici seçimini otomatik yap
    setTimeout(() => {
        const offerToSelect = document.getElementById('wholesalerProducerOfferTo');
        if (offerToSelect) {
            offerToSelect.value = producerId;
        }
    }, 100);
}

// Satıcıya teklif gönder
function sendOfferToSeller(sellerId) {
    showPage('wholesalerSellerOfferFormsPage');
    // Teklif formunda satıcı seçimini otomatik yap
    setTimeout(() => {
        const offerToSelect = document.getElementById('wholesalerSellerOfferTo');
        if (offerToSelect) {
            offerToSelect.value = sellerId;
        }
    }, 100);
}

// Toptancı sipariş yönetimi
function loadWholesalerOrderManagement() {
    updateWholesalerOrderSummary();
    loadWholesalerOrders();
}

// Toptancı sipariş özetini güncelle
function updateWholesalerOrderSummary() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const receivedOrders = orders.filter(order => order.to === currentUser.id);
    const sentOrders = orders.filter(order => order.from === currentUser.id);
    
    const receivedSummary = {
        pending: receivedOrders.filter(o => o.status === 'pending').length,
        processing: receivedOrders.filter(o => o.status === 'processing').length,
        shipped: receivedOrders.filter(o => o.status === 'shipped').length,
        delivered: receivedOrders.filter(o => o.status === 'delivered').length
    };
    
    document.getElementById('wholesalerPendingOrders').textContent = receivedSummary.pending;
    document.getElementById('wholesalerProcessingOrders').textContent = receivedSummary.processing;
    document.getElementById('wholesalerShippedOrders').textContent = receivedSummary.shipped;
    document.getElementById('wholesalerDeliveredOrders').textContent = receivedSummary.delivered;
}

// Toptancı siparişlerini yükle
function loadWholesalerOrders() {
    loadWholesalerReceivedOrders();
    loadWholesalerSentOrders();
}

// Toptancı gelen siparişleri yükle
function loadWholesalerReceivedOrders() {
    const receivedOrdersList = document.getElementById('wholesalerReceivedOrdersList');
    if (!receivedOrdersList) return;
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const receivedOrders = orders.filter(order => order.to === currentUser.id);
    
    receivedOrdersList.innerHTML = '';
    
    receivedOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-number">Sipariş #${order.id}</div>
                <div class="order-date">${new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
            </div>
            <div class="order-details">
                <div class="order-detail">
                    <strong>Durum:</strong> ${getOrderStatusText(order.status)}
                </div>
                <div class="order-detail">
                    <strong>Tutar:</strong> ₺${order.totalAmount.toFixed(2)}
                </div>
                <div class="order-detail">
                    <strong>Gönderen:</strong> ${getUserNameById(order.from)}
                </div>
            </div>
            <div class="order-actions">
                <button class="btn btn-secondary btn-small" onclick="viewOrder('${order.id}')">Görüntüle</button>
                ${order.status === 'pending' ? `<button class="btn btn-success btn-small" onclick="acceptOrder('${order.id}')">Kabul Et</button>` : ''}
                ${order.status === 'pending' ? `<button class="btn btn-danger btn-small" onclick="rejectOrder('${order.id}')">Reddet</button>` : ''}
                ${order.status === 'accepted' ? `<button class="btn btn-primary btn-small" onclick="processOrder('${order.id}')">Hazırla</button>` : ''}
                ${order.status === 'processing' ? `<button class="btn btn-primary btn-small" onclick="shipOrder('${order.id}')">Kargoya Ver</button>` : ''}
            </div>
        `;
        receivedOrdersList.appendChild(orderCard);
    });
}

// Toptancı verdiğim siparişleri yükle
function loadWholesalerSentOrders() {
    const sentOrdersList = document.getElementById('wholesalerSentOrdersList');
    if (!sentOrdersList) return;
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const sentOrders = orders.filter(order => order.from === currentUser.id);
    
    sentOrdersList.innerHTML = '';
    
    sentOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-number">Sipariş #${order.id}</div>
                <div class="order-date">${new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
            </div>
            <div class="order-details">
                <div class="order-detail">
                    <strong>Durum:</strong> ${getOrderStatusText(order.status)}
                </div>
                <div class="order-detail">
                    <strong>Tutar:</strong> ₺${order.totalAmount.toFixed(2)}
                </div>
                <div class="order-detail">
                    <strong>Alıcı:</strong> ${getUserNameById(order.to)}
                </div>
            </div>
            <div class="order-actions">
                <button class="btn btn-secondary btn-small" onclick="viewOrder('${order.id}')">Görüntüle</button>
                ${order.status === 'shipped' ? `<button class="btn btn-primary btn-small" onclick="trackOrder('${order.id}')">Kargo Takip</button>` : ''}
            </div>
        `;
        sentOrdersList.appendChild(orderCard);
    });
}

// Toptancı sipariş türü göster
function showWholesalerOrderType(type) {
    // Tab butonlarını güncelle
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Tab içeriklerini göster/gizle
    document.querySelectorAll('.order-tab').forEach(tab => tab.classList.remove('active'));
    
    if (type === 'received') {
        document.getElementById('wholesalerReceivedOrdersTab').classList.add('active');
    } else if (type === 'sent') {
        document.getElementById('wholesalerSentOrdersTab').classList.add('active');
    }
}

// Toptancılar için üreticileri yükle
function loadWholesalerProducers() {
    const producers = getAllProducers();
    displayWholesalerProducers(producers);
}

// Toptancılar için satıcıları yükle
function loadWholesalerSellers() {
    const sellers = getAllSellers();
    displayWholesalerSellers(sellers);
}

// Canlı yayın başlatma
async function startLiveStream() {
    if (!currentUser) {
        showNotification('Önce giriş yapmalısınız!', 'error');
        return;
    }
    
    try {
        // Kamera ve mikrofon erişimi
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        // Yerel video elementini ayarla
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = currentStream;
        
        // WebRTC bağlantısını başlat
        await initializeWebRTC();
        
        // Yayın bilgilerini ayarla
        document.getElementById('streamTitle').textContent = `${currentUser.name} - Canlı Yayın`;
        
        showPage('liveStreamPage');
        isStreaming = true;
        
        // Yayın durumunu güncelle
        updateStreamStatus(true);
        
        showNotification('Canlı yayın başlatıldı!', 'success');
        
    } catch (error) {
        console.error('Yayın başlatma hatası:', error);
        showNotification('Kamera/mikrofon erişimi reddedildi!', 'error');
    }
}

// WebRTC başlatma
async function initializeWebRTC() {
    peerConnection = new RTCPeerConnection(RTC_CONFIG);
    
    // Yerel stream'i peer connection'a ekle
    currentStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, currentStream);
    });
    
    // Data channel oluştur (chat için)
    dataChannel = peerConnection.createDataChannel('chat');
    dataChannel.onopen = () => {
        console.log('Data channel açıldı');
    };
    
    dataChannel.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'chat') {
            addChatMessage(message.sender, message.text, message.timestamp);
        } else if (message.type === 'viewer_count') {
            updateViewerCount(message.count);
        }
    };
    
    // ICE candidate handling
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            // Gerçek projede signaling server'a gönder
            console.log('ICE candidate:', event.candidate);
        }
    };
    
    // Remote stream handling
    peerConnection.ontrack = (event) => {
        const remoteVideo = document.getElementById('remoteVideo');
        remoteVideo.srcObject = event.streams[0];
    };
}

// Yayın sonlandırma
function endStream() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    isStreaming = false;
    updateStreamStatus(false);
    
    showPage('dashboardPage');
    showNotification('Yayın sonlandırıldı.', 'success');
}

// Kamera kontrolü
function toggleCamera() {
    if (currentStream) {
        const videoTrack = currentStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            const button = document.getElementById('toggleCamera');
            button.classList.toggle('active', !videoTrack.enabled);
        }
    }
}

// Mikrofon kontrolü
function toggleMicrophone() {
    if (currentStream) {
        const audioTrack = currentStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            const button = document.getElementById('toggleMic');
            button.classList.toggle('active', !audioTrack.enabled);
        }
    }
}

// Ekran paylaşımı
async function toggleScreenShare() {
    try {
        if (currentStream && currentStream.getVideoTracks()[0].label.includes('screen')) {
            // Normal kameraya geri dön
            const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            replaceVideoTrack(newStream.getVideoTracks()[0]);
        } else {
            // Ekran paylaşımı başlat
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            replaceVideoTrack(screenStream.getVideoTracks()[0]);
        }
    } catch (error) {
        console.error('Ekran paylaşımı hatası:', error);
        showNotification('Ekran paylaşımı başarısız!', 'error');
    }
}

// Video track değiştirme
function replaceVideoTrack(newTrack) {
    if (currentStream && peerConnection) {
        const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
            sender.replaceTrack(newTrack);
        }
        
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = currentStream;
    }
}

// Chat mesajı gönderme
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message && dataChannel && dataChannel.readyState === 'open') {
        const messageData = {
            type: 'chat',
            sender: currentUser.name,
            text: message,
            timestamp: new Date().toISOString()
        };
        
        dataChannel.send(JSON.stringify(messageData));
        addChatMessage(currentUser.name, message, new Date().toISOString());
        input.value = '';
    }
}

// Chat mesajı ekleme
function addChatMessage(sender, text, timestamp) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    
    const time = new Date(timestamp).toLocaleTimeString('tr-TR');
    
    messageDiv.innerHTML = `
        <div class="sender">${sender}</div>
        <div class="text">${text}</div>
        <div class="time">${time}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// İzleyici sayısı güncelleme
function updateViewerCount(count) {
    viewerCount = count;
    document.getElementById('viewerCount').textContent = `İzleyici: ${count}`;
}

// Yayın durumu güncelleme
function updateStreamStatus(isLive) {
    const streams = JSON.parse(localStorage.getItem('liveStreams') || '[]');
    const streamIndex = streams.findIndex(s => s.userId === currentUser.id);
    
    if (isLive) {
        const streamData = {
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            title: `${currentUser.name} - Canlı Yayın`,
            startTime: new Date().toISOString(),
            viewerCount: 0,
            isActive: true
        };
        
        if (streamIndex >= 0) {
            streams[streamIndex] = streamData;
        } else {
            streams.push(streamData);
        }
    } else {
        if (streamIndex >= 0) {
            streams.splice(streamIndex, 1);
        }
    }
    
    localStorage.setItem('liveStreams', JSON.stringify(streams));
    loadLiveStreams();
}

// Canlı yayınları yükleme
function loadLiveStreams() {
    const streams = JSON.parse(localStorage.getItem('liveStreams') || '[]');
    const streamsGrid = document.getElementById('liveStreamsGrid');
    
    streamsGrid.innerHTML = '';
    
    streams.forEach(stream => {
        const streamCard = document.createElement('div');
        streamCard.className = 'stream-card';
        
        streamCard.innerHTML = `
            <div class="stream-preview">
                <i class="fas fa-video"></i>
            </div>
            <div class="stream-info">
                <div class="stream-title">${stream.title}</div>
                <div class="stream-meta">
                    <i class="fas fa-user"></i> ${stream.userName} (${stream.userRole})<br>
                    <i class="fas fa-eye"></i> ${stream.viewerCount} izleyici<br>
                    <i class="fas fa-clock"></i> ${new Date(stream.startTime).toLocaleTimeString('tr-TR')}
                </div>
                <button class="stream-btn" onclick="joinStream('${stream.userId}')">
                    <i class="fas fa-play"></i> Yayını İzle
                </button>
            </div>
        `;
        
        streamsGrid.appendChild(streamCard);
    });
}

// Yayına katılma
function joinStream(streamUserId) {
    if (!currentUser) {
        showNotification('Önce giriş yapmalısınız!', 'error');
        return;
    }
    
    // Gerçek projede WebRTC ile bağlantı kurulacak
    showPage('viewerPage');
    showNotification('Yayına katıldınız!', 'success');
}

// İzleyici sayfası başlatma
function initializeViewer() {
    // Gerçek projede remote stream alınacak
    const remoteVideo = document.getElementById('remoteVideo');
    // Mock video stream
    remoteVideo.srcObject = null;
}

// İzleyici chat mesajı gönderme
function sendViewerMessage() {
    const input = document.getElementById('viewerChatInput');
    const message = input.value.trim();
    
    if (message) {
        // Gerçek projede data channel üzerinden gönderilecek
        addViewerChatMessage(currentUser.name, message);
        input.value = '';
    }
}

// İzleyici chat mesajı ekleme
function addViewerChatMessage(sender, text) {
    const chatMessages = document.getElementById('viewerChatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    
    const time = new Date().toLocaleTimeString('tr-TR');
    
    messageDiv.innerHTML = `
        <div class="sender">${sender}</div>
        <div class="text">${text}</div>
        <div class="time">${time}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Ürün yönetimi
function manageProducts() {
    showNotification('Ürün yönetimi özelliği geliştiriliyor...', 'warning');
}

// İstatistikleri gösterme
function showStats() {
    showNotification('İstatistikler özelliği geliştiriliyor...', 'warning');
}

// Canlı yayınları gösterme
function showLiveStreams() {
    loadLiveStreams();
    showPage('homePage');
}

// Bildirim gösterme
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Enter tuşu ile chat gönderme
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    const viewerChatInput = document.getElementById('viewerChatInput');
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    if (viewerChatInput) {
        viewerChatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendViewerMessage();
            }
        });
    }
    
    // Sayfa yüklendiğinde canlı yayınları yükle
    loadLiveStreams();
});

// AWS Kinesis Video Streams entegrasyonu (gelecek geliştirme için)
class AWSStreamManager {
    constructor() {
        this.kvsClient = null;
        this.streamName = null;
    }
    
    async initialize(streamName) {
        try {
            // AWS SDK'yı yapılandır
            AWS.config.update({
                region: AWS_CONFIG.region,
                accessKeyId: AWS_CONFIG.accessKeyId,
                secretAccessKey: AWS_CONFIG.secretAccessKey
            });
            
            this.kvsClient = new AWS.KinesisVideo();
            this.streamName = streamName;
            
            return true;
        } catch (error) {
            console.error('AWS KVS başlatma hatası:', error);
            return false;
        }
    }
    
    async createStream(streamName) {
        try {
            const params = {
                StreamName: streamName,
                DataRetentionInHours: 24
            };
            
            const result = await this.kvsClient.createStream(params).promise();
            return result;
        } catch (error) {
            console.error('Stream oluşturma hatası:', error);
            throw error;
        }
    }
    
    async getStreamEndpoint(streamName) {
        try {
            const params = {
                StreamName: streamName,
                APIName: 'PUT_MEDIA'
            };
            
            const result = await this.kvsClient.getDataEndpoint(params).promise();
            return result.DataEndpoint;
        } catch (error) {
            console.error('Stream endpoint alma hatası:', error);
            throw error;
        }
    }
}

// WebSocket bağlantısı (gerçek zamanlı iletişim için)
class SignalingManager {
    constructor() {
        this.ws = null;
        this.isConnected = false;
    }
    
    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(AWS_CONFIG.signalingEndpoint);
                
                this.ws.onopen = () => {
                    this.isConnected = true;
                    console.log('Signaling bağlantısı kuruldu');
                    resolve();
                };
                
                this.ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    this.handleSignalingMessage(message);
                };
                
                this.ws.onclose = () => {
                    this.isConnected = false;
                    console.log('Signaling bağlantısı kapandı');
                };
                
                this.ws.onerror = (error) => {
                    console.error('Signaling hatası:', error);
                    reject(error);
                };
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    sendMessage(message) {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify(message));
        }
    }
    
    handleSignalingMessage(message) {
        switch (message.type) {
            case 'offer':
                this.handleOffer(message.offer);
                break;
            case 'answer':
                this.handleAnswer(message.answer);
                break;
            case 'ice-candidate':
                this.handleIceCandidate(message.candidate);
                break;
            case 'viewer-joined':
                this.handleViewerJoined(message);
                break;
            case 'viewer-left':
                this.handleViewerLeft(message);
                break;
        }
    }
    
    async handleOffer(offer) {
        if (peerConnection) {
            await peerConnection.setRemoteDescription(offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            this.sendMessage({
                type: 'answer',
                answer: answer
            });
        }
    }
    
    async handleAnswer(answer) {
        if (peerConnection) {
            await peerConnection.setRemoteDescription(answer);
        }
    }
    
    async handleIceCandidate(candidate) {
        if (peerConnection) {
            await peerConnection.addIceCandidate(candidate);
        }
    }
    
    handleViewerJoined(data) {
        updateViewerCount(data.viewerCount);
        showNotification('Yeni izleyici katıldı!', 'success');
    }
    
    handleViewerLeft(data) {
        updateViewerCount(data.viewerCount);
    }
}

// Global signaling manager
const signalingManager = new SignalingManager();

// Sayfa kapatılırken temizlik
window.addEventListener('beforeunload', function() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
        peerConnection.close();
    }
    if (signalingManager.ws) {
        signalingManager.ws.close();
    }
});

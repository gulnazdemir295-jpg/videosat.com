// Panel Application JavaScript
let currentUser = null;
let userRole = null;
let products = [];
let producers = [];
let orders = [];
let messages = [];
let isStreaming = false;
let streamBalance = 0;

// Initialize Panel
document.addEventListener('DOMContentLoaded', function() {
    initializePanel();
    loadUserData();
    loadPanelData();
    setupPanelEventListeners();
});

// Initialize Panel Application
function initializePanel() {
    console.log('Panel Application Initialized');
    
    // Check authentication
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        window.location.href = '../index.html';
        return;
    }
    
    currentUser = JSON.parse(savedUser);
    userRole = currentUser.role;
    
    // Update UI with user data
    updateUserInfo();
    
    // Show appropriate section based on role
    showSection('dashboard');
}

// Load User Data
function loadUserData() {
    if (currentUser) {
        document.getElementById('userCompanyName').textContent = currentUser.companyName;
        
        // Load user-specific data
        loadProducts();
        loadProducers();
        loadOrders();
        loadMessages();
        loadStreamBalance();
    }
}

// Update User Info
function updateUserInfo() {
    if (currentUser) {
        document.getElementById('userCompanyName').textContent = currentUser.companyName;
    }
}

// Setup Panel Event Listeners
function setupPanelEventListeners() {
    // Navigation links
    document.querySelectorAll('.panel-nav-menu .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            showTab(tab);
        });
    });
    
    // Add Product Form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }
    
    // Stream Setup Form
    const streamSetupForm = document.getElementById('streamSetupForm');
    if (streamSetupForm) {
        streamSetupForm.addEventListener('submit', handleStreamSetup);
    }
    
    // Filters
    setupFilters();
    
    // Message input
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Stream chat input
    const streamChatInput = document.getElementById('streamChatInput');
    if (streamChatInput) {
        streamChatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendStreamMessage();
            }
        });
    }
}

// Show Section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.panel-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from nav links
    document.querySelectorAll('.panel-nav-menu .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to nav link
    const navLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
    
    // Load section-specific data
    loadSectionData(sectionId);
}

// Load Section Data
function loadSectionData(sectionId) {
    switch (sectionId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'products':
            loadProducts();
            break;
        case 'producers':
            loadProducers();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'live-stream':
            loadStreamData();
            break;
        case 'messages':
            loadMessages();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// Dashboard Data
function loadDashboardData() {
    // Update stats
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.filter(o => o.status === 'pending').length;
    document.getElementById('totalProducers').textContent = producers.length;
    document.getElementById('liveStreamBalance').textContent = streamBalance;
    
    // Load recent activity
    loadRecentActivity();
}

// Load Recent Activity
function loadRecentActivity() {
    const activities = [
        {
            type: 'success',
            icon: 'fas fa-plus',
            title: 'Yeni ürün eklendi',
            description: 'Demir çelik ürünü sisteme eklendi',
            time: '2 saat önce'
        },
        {
            type: 'info',
            icon: 'fas fa-envelope',
            title: 'Yeni mesaj',
            description: 'ABC Üretim A.Ş. tarafından mesaj gönderildi',
            time: '4 saat önce'
        },
        {
            type: 'warning',
            icon: 'fas fa-shopping-cart',
            title: 'Yeni sipariş',
            description: 'XYZ Metal Ltd. tarafından sipariş verildi',
            time: '6 saat önce'
        }
    ];
    
    const activityList = document.getElementById('recentActivityList');
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `).join('');
}

// Products Management
function loadProducts() {
    // Mock products data
    products = [
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
        }
    ];
    
    renderProductsTable();
}

// Render Products Table
function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${getUnitName(product.unit)}</td>
            <td>${product.stock}</td>
            <td>₺${product.price.toFixed(2)}</td>
            <td><span class="status-badge ${product.status}">${getStatusName(product.status)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                        Düzenle
                    </button>
                    <button class="action-btn delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                        Sil
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get Category Name
function getCategoryName(category) {
    const categories = {
        'metal': 'Metal',
        'plastik': 'Plastik',
        'kimyasal': 'Kimyasal',
        'tekstil': 'Tekstil',
        'gida': 'Gıda',
        'diger': 'Diğer'
    };
    return categories[category] || category;
}

// Get Unit Name
function getUnitName(unit) {
    const units = {
        'kg': 'Kilogram',
        'm2': 'Metrekare',
        'm3': 'Metreküp',
        'litre': 'Litre',
        'gram': 'Gram',
        'adet': 'Adet'
    };
    return units[unit] || unit;
}

// Get Status Name
function getStatusName(status) {
    const statuses = {
        'active': 'Aktif',
        'inactive': 'Pasif',
        'pending': 'Beklemede',
        'completed': 'Tamamlandı'
    };
    return statuses[status] || status;
}

// Show Add Product Modal
function showAddProductModal() {
    document.getElementById('addProductModal').style.display = 'block';
}

// Handle Add Product
function handleAddProduct(e) {
    e.preventDefault();
    
    const productData = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        unit: document.getElementById('productUnit').value,
        stock: parseFloat(document.getElementById('productStock').value),
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        status: 'active'
    };
    
    products.push(productData);
    renderProductsTable();
    closeModal('addProductModal');
    
    // Reset form
    e.target.reset();
    
    showAlert('Ürün başarıyla eklendi!', 'success');
}

// Edit Product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        // Pre-fill form with product data
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productUnit').value = product.unit;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description;
        
        showAddProductModal();
    }
}

// Delete Product
function deleteProduct(productId) {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        products = products.filter(p => p.id !== productId);
        renderProductsTable();
        showAlert('Ürün başarıyla silindi!', 'success');
    }
}

// Setup Filters
function setupFilters() {
    // Product filters
    const productCategoryFilter = document.getElementById('productCategoryFilter');
    const productUnitFilter = document.getElementById('productUnitFilter');
    const productSearch = document.getElementById('productSearch');
    
    if (productCategoryFilter) {
        productCategoryFilter.addEventListener('change', filterProducts);
    }
    if (productUnitFilter) {
        productUnitFilter.addEventListener('change', filterProducts);
    }
    if (productSearch) {
        productSearch.addEventListener('input', filterProducts);
    }
    
    // Producer filters
    const producerCityFilter = document.getElementById('producerCityFilter');
    const producerSectorFilter = document.getElementById('producerSectorFilter');
    const producerSearch = document.getElementById('producerSearch');
    
    if (producerCityFilter) {
        producerCityFilter.addEventListener('change', filterProducers);
    }
    if (producerSectorFilter) {
        producerSectorFilter.addEventListener('change', filterProducers);
    }
    if (producerSearch) {
        producerSearch.addEventListener('input', filterProducers);
    }
}

// Filter Products
function filterProducts() {
    const categoryFilter = document.getElementById('productCategoryFilter').value;
    const unitFilter = document.getElementById('productUnitFilter').value;
    const searchFilter = document.getElementById('productSearch').value.toLowerCase();
    
    const filteredProducts = products.filter(product => {
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const matchesUnit = !unitFilter || product.unit === unitFilter;
        const matchesSearch = !searchFilter || product.name.toLowerCase().includes(searchFilter);
        
        return matchesCategory && matchesUnit && matchesSearch;
    });
    
    renderFilteredProductsTable(filteredProducts);
}

// Render Filtered Products Table
function renderFilteredProductsTable(filteredProducts) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = filteredProducts.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${getUnitName(product.unit)}</td>
            <td>${product.stock}</td>
            <td>₺${product.price.toFixed(2)}</td>
            <td><span class="status-badge ${product.status}">${getStatusName(product.status)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                        Düzenle
                    </button>
                    <button class="action-btn delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                        Sil
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Producers Management
function loadProducers() {
    // Mock producers data
    producers = [
        {
            id: 1,
            name: 'ABC Üretim A.Ş.',
            city: 'istanbul',
            sector: 'otomotiv',
            phone: '+90 212 555 0101',
            email: 'info@abcuretim.com',
            products: ['Otomotiv parçaları', 'Metal işleme'],
            status: 'active'
        },
        {
            id: 2,
            name: 'XYZ Metal Ltd.',
            city: 'ankara',
            sector: 'metal',
            phone: '+90 312 555 0202',
            email: 'info@xyzmetal.com',
            products: ['Metal levha', 'Çelik profiller'],
            status: 'active'
        },
        {
            id: 3,
            name: 'DEF Plastik San.',
            city: 'izmir',
            sector: 'kimya',
            phone: '+90 232 555 0303',
            email: 'info@defplastik.com',
            products: ['Plastik enjeksiyon', 'PVC ürünler'],
            status: 'active'
        }
    ];
    
    renderProducersGrid();
}

// Render Producers Grid
function renderProducersGrid() {
    const grid = document.getElementById('producersGrid');
    grid.innerHTML = producers.map(producer => `
        <div class="producer-card">
            <div class="producer-header">
                <div class="producer-avatar">
                    ${producer.name.charAt(0)}
                </div>
                <div class="producer-info">
                    <h3>${producer.name}</h3>
                    <p>${getCityName(producer.city)} • ${getSectorName(producer.sector)}</p>
                </div>
            </div>
            <div class="producer-details">
                <p><i class="fas fa-phone"></i> ${producer.phone}</p>
                <p><i class="fas fa-envelope"></i> ${producer.email}</p>
                <p><i class="fas fa-box"></i> ${producer.products.join(', ')}</p>
            </div>
            <div class="producer-actions">
                <button class="btn btn-outline btn-small" onclick="sendMessageToProducer(${producer.id})">
                    <i class="fas fa-envelope"></i>
                    Mesaj
                </button>
                <button class="btn btn-primary btn-small" onclick="inviteToLiveStream(${producer.id})">
                    <i class="fas fa-broadcast-tower"></i>
                    Davet Et
                </button>
                <button class="btn btn-outline btn-small" onclick="sendOfferForm(${producer.id})">
                    <i class="fas fa-file-contract"></i>
                    Teklif
                </button>
            </div>
        </div>
    `).join('');
}

// Get City Name
function getCityName(city) {
    const cities = {
        'istanbul': 'İstanbul',
        'ankara': 'Ankara',
        'izmir': 'İzmir',
        'bursa': 'Bursa',
        'antalya': 'Antalya'
    };
    return cities[city] || city;
}

// Get Sector Name
function getSectorName(sector) {
    const sectors = {
        'otomotiv': 'Otomotiv',
        'tekstil': 'Tekstil',
        'gida': 'Gıda',
        'kimya': 'Kimya',
        'metal': 'Metal'
    };
    return sectors[sector] || sector;
}

// Filter Producers
function filterProducers() {
    const cityFilter = document.getElementById('producerCityFilter').value;
    const sectorFilter = document.getElementById('producerSectorFilter').value;
    const searchFilter = document.getElementById('producerSearch').value.toLowerCase();
    
    const filteredProducers = producers.filter(producer => {
        const matchesCity = !cityFilter || producer.city === cityFilter;
        const matchesSector = !sectorFilter || producer.sector === sectorFilter;
        const matchesSearch = !searchFilter || producer.name.toLowerCase().includes(searchFilter);
        
        return matchesCity && matchesSector && matchesSearch;
    });
    
    renderFilteredProducersGrid(filteredProducers);
}

// Render Filtered Producers Grid
function renderFilteredProducersGrid(filteredProducers) {
    const grid = document.getElementById('producersGrid');
    grid.innerHTML = filteredProducers.map(producer => `
        <div class="producer-card">
            <div class="producer-header">
                <div class="producer-avatar">
                    ${producer.name.charAt(0)}
                </div>
                <div class="producer-info">
                    <h3>${producer.name}</h3>
                    <p>${getCityName(producer.city)} • ${getSectorName(producer.sector)}</p>
                </div>
            </div>
            <div class="producer-details">
                <p><i class="fas fa-phone"></i> ${producer.phone}</p>
                <p><i class="fas fa-envelope"></i> ${producer.email}</p>
                <p><i class="fas fa-box"></i> ${producer.products.join(', ')}</p>
            </div>
            <div class="producer-actions">
                <button class="btn btn-outline btn-small" onclick="sendMessageToProducer(${producer.id})">
                    <i class="fas fa-envelope"></i>
                    Mesaj
                </button>
                <button class="btn btn-primary btn-small" onclick="inviteToLiveStream(${producer.id})">
                    <i class="fas fa-broadcast-tower"></i>
                    Davet Et
                </button>
                <button class="btn btn-outline btn-small" onclick="sendOfferForm(${producer.id})">
                    <i class="fas fa-file-contract"></i>
                    Teklif
                </button>
            </div>
        </div>
    `).join('');
}

// Send Message to Producer
function sendMessageToProducer(producerId) {
    const producer = producers.find(p => p.id === producerId);
    if (producer) {
        showSection('messages');
        // Select the producer in messages
        selectMessageContact(producer);
    }
}

// Invite to Live Stream
function inviteToLiveStream(producerId) {
    const producer = producers.find(p => p.id === producerId);
    if (producer) {
        showAlert(`${producer.name} canlı yayına davet edildi!`, 'success');
    }
}

// Send Offer Form
function sendOfferForm(producerId) {
    const producer = producers.find(p => p.id === producerId);
    if (producer) {
        showAlert(`${producer.name} için teklif formu gönderildi!`, 'success');
    }
}

// Orders Management
function loadOrders() {
    // Mock orders data
    orders = [
        {
            id: 1,
            orderNumber: 'ORD-001',
            producer: 'ABC Üretim A.Ş.',
            product: 'Demir Çelik',
            quantity: 100,
            unit: 'kg',
            amount: 1550.00,
            date: '2024-01-15',
            status: 'pending',
            type: 'incoming'
        },
        {
            id: 2,
            orderNumber: 'ORD-002',
            producer: 'XYZ Metal Ltd.',
            product: 'Alüminyum Levha',
            quantity: 50,
            unit: 'm2',
            amount: 1250.00,
            date: '2024-01-14',
            status: 'completed',
            type: 'incoming'
        }
    ];
    
    renderOrdersTables();
}

// Render Orders Tables
function renderOrdersTables() {
    const incomingOrdersBody = document.getElementById('incomingOrdersBody');
    const outgoingOrdersBody = document.getElementById('outgoingOrdersBody');
    
    const incomingOrders = orders.filter(o => o.type === 'incoming');
    const outgoingOrders = orders.filter(o => o.type === 'outgoing');
    
    incomingOrdersBody.innerHTML = incomingOrders.map(order => `
        <tr>
            <td>${order.orderNumber}</td>
            <td>${order.producer}</td>
            <td>${order.product}</td>
            <td>${order.quantity} ${getUnitName(order.unit)}</td>
            <td>₺${order.amount.toFixed(2)}</td>
            <td>${order.date}</td>
            <td><span class="status-badge ${order.status}">${getStatusName(order.status)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewOrder(${order.id})">
                        <i class="fas fa-eye"></i>
                        Görüntüle
                    </button>
                    <button class="action-btn edit" onclick="updateOrderStatus(${order.id})">
                        <i class="fas fa-edit"></i>
                        Güncelle
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    outgoingOrdersBody.innerHTML = outgoingOrders.map(order => `
        <tr>
            <td>${order.orderNumber}</td>
            <td>${order.producer}</td>
            <td>${order.product}</td>
            <td>${order.quantity} ${getUnitName(order.unit)}</td>
            <td>₺${order.amount.toFixed(2)}</td>
            <td>${order.date}</td>
            <td><span class="status-badge ${order.status}">${getStatusName(order.status)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewOrder(${order.id})">
                        <i class="fas fa-eye"></i>
                        Görüntüle
                    </button>
                    <button class="action-btn edit" onclick="trackOrder(${order.id})">
                        <i class="fas fa-truck"></i>
                        Takip Et
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Show Tab
function showTab(tabId) {
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab button
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // Show selected tab content
    document.getElementById(`${tabId}Orders`).classList.add('active');
}

// View Order
function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        showAlert(`Sipariş ${order.orderNumber} görüntüleniyor...`, 'info');
    }
}

// Update Order Status
function updateOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const newStatus = order.status === 'pending' ? 'completed' : 'pending';
        order.status = newStatus;
        renderOrdersTables();
        showAlert(`Sipariş durumu güncellendi!`, 'success');
    }
}

// Track Order
function trackOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        showAlert(`Sipariş ${order.orderNumber} kargo takibi başlatıldı!`, 'info');
    }
}

// Stream Management
function loadStreamData() {
    loadStreamBalance();
    loadStreamProducts();
}

// Load Stream Balance
function loadStreamBalance() {
    streamBalance = 5; // Mock data
    document.getElementById('streamBalanceHours').textContent = streamBalance;
}

// Load Stream Products
function loadStreamProducts() {
    const productSelection = document.getElementById('streamProductSelection');
    productSelection.innerHTML = products.map(product => `
        <div class="product-item" onclick="toggleProductSelection(${product.id})">
            <input type="checkbox" id="product-${product.id}" value="${product.id}">
            <label for="product-${product.id}">${product.name} (${product.stock} ${getUnitName(product.unit)})</label>
        </div>
    `).join('');
}

// Toggle Product Selection
function toggleProductSelection(productId) {
    const productItem = document.querySelector(`[onclick="toggleProductSelection(${productId})"]`);
    productItem.classList.toggle('selected');
}

// Show Buy Stream Time Modal
function showBuyStreamTimeModal() {
    document.getElementById('buyStreamTimeModal').style.display = 'block';
}

// Buy Stream Time
function buyStreamTime(hours, price) {
    streamBalance += hours;
    document.getElementById('streamBalanceHours').textContent = streamBalance;
    closeModal('buyStreamTimeModal');
    showAlert(`${hours} saat canlı yayın süresi satın alındı!`, 'success');
}

// Skip Purchase
function skipPurchase() {
    closeModal('buyStreamTimeModal');
    showAlert('Canlı yayın satın alma adımı atlandı.', 'info');
}

// Handle Stream Setup
function handleStreamSetup(e) {
    e.preventDefault();
    
    const selectedProducts = Array.from(document.querySelectorAll('#streamProductSelection input:checked'))
        .map(input => parseInt(input.value));
    
    const slogans = document.getElementById('streamSlogans').value;
    const title = document.getElementById('streamTitle').value;
    
    if (selectedProducts.length === 0) {
        showAlert('Lütfen en az bir ürün seçin!', 'error');
        return;
    }
    
    if (!title.trim()) {
        showAlert('Lütfen yayın başlığı girin!', 'error');
        return;
    }
    
    if (streamBalance <= 0) {
        showAlert('Canlı yayın bakiyeniz yetersiz!', 'error');
        return;
    }
    
    startLiveStream(selectedProducts, slogans, title);
}

// Start Live Stream
async function startLiveStream(selectedProducts, slogans, title) {
    try {
        // Initialize camera
        const stream = await webRTCManager.initializeCamera();
        
        // Set up video element
        const videoElement = document.getElementById('localVideo');
        videoElement.srcObject = stream;
        
        // Update stream info
        document.getElementById('currentStreamTitle').textContent = title;
        document.getElementById('currentStreamSlogan').textContent = slogans.split('\n')[0] || 'Slogan yok';
        
        // Show active stream
        document.getElementById('activeStream').classList.remove('hidden');
        
        // Update stream products
        const streamProductsList = document.getElementById('streamProductsList');
        streamProductsList.innerHTML = selectedProducts.map(productId => {
            const product = products.find(p => p.id === productId);
            return `<div class="stream-product">${product.name}</div>`;
        }).join('');
        
        // Start streaming
        isStreaming = true;
        streamBalance -= 1; // Deduct 1 hour
        document.getElementById('streamBalanceHours').textContent = streamBalance;
        
        showAlert('Canlı yayın başlatıldı!', 'success');
        
    } catch (error) {
        showAlert('Canlı yayın başlatılamadı: ' + error.message, 'error');
    }
}

// Stop Stream
function stopStream() {
    if (isStreaming) {
        webRTCManager.stopStreaming();
        document.getElementById('activeStream').classList.add('hidden');
        isStreaming = false;
        showAlert('Canlı yayın durduruldu!', 'success');
    }
}

// Preview Stream
function previewStream() {
    showAlert('Canlı yayın önizlemesi gösteriliyor...', 'info');
}

// Send Stream Message
function sendStreamMessage() {
    const input = document.getElementById('streamChatInput');
    const message = input.value.trim();
    
    if (message) {
        const chatMessages = document.getElementById('streamChatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.textContent = `${currentUser.companyName}: ${message}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        input.value = '';
    }
}

// Messages Management
function loadMessages() {
    // Mock messages data
    messages = [
        {
            id: 1,
            contactId: 1,
            contactName: 'ABC Üretim A.Ş.',
            lastMessage: 'Demir çelik fiyatları hakkında bilgi alabilir miyim?',
            timestamp: '2024-01-15 14:30',
            unread: true
        },
        {
            id: 2,
            contactId: 2,
            contactName: 'XYZ Metal Ltd.',
            lastMessage: 'Alüminyum levha siparişi için teşekkürler.',
            timestamp: '2024-01-14 16:45',
            unread: false
        }
    ];
    
    renderMessagesList();
}

// Render Messages List
function renderMessagesList() {
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = messages.map(message => `
        <div class="message-item ${message.unread ? 'unread' : ''}" onclick="selectMessageContact(${message.contactId})">
            <div class="message-header">
                <div class="message-avatar">
                    ${message.contactName.charAt(0)}
                </div>
                <div class="message-info">
                    <h4>${message.contactName}</h4>
                    <p>${message.timestamp}</p>
                </div>
            </div>
            <div class="message-preview">
                ${message.lastMessage}
            </div>
        </div>
    `).join('');
}

// Select Message Contact
function selectMessageContact(contactId) {
    const contact = producers.find(p => p.id === contactId);
    if (contact) {
        document.getElementById('selectedContactName').textContent = contact.name;
        document.getElementById('selectedContactStatus').textContent = 'Çevrimiçi';
        
        // Enable message input
        const messageInput = document.getElementById('messageInput');
        const sendButton = messageInput.nextElementSibling;
        messageInput.disabled = false;
        sendButton.disabled = false;
        
        // Mark as read
        const message = messages.find(m => m.contactId === contactId);
        if (message) {
            message.unread = false;
            renderMessagesList();
        }
    }
}

// Send Message
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (message) {
        const messageMessages = document.getElementById('messageMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message-sent';
        messageElement.innerHTML = `
            <div class="message-bubble">
                <p>${message}</p>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        messageMessages.appendChild(messageElement);
        messageMessages.scrollTop = messageMessages.scrollHeight;
        
        input.value = '';
        
        showAlert('Mesaj gönderildi!', 'success');
    }
}

// Show Offer Form
function showOfferForm() {
    showAlert('Teklif formu gösteriliyor...', 'info');
}

// Reports Management
function loadReports() {
    // Mock reports data - charts would be implemented with Chart.js or similar
    const charts = ['salesChart', 'productChart', 'customerChart', 'streamChart'];
    charts.forEach(chartId => {
        const chartElement = document.getElementById(chartId);
        chartElement.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6b7280;">
                <div style="text-align: center;">
                    <i class="fas fa-chart-bar" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Grafik verisi yükleniyor...</p>
                </div>
            </div>
        `;
    });
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Show Alert
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${getAlertIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(alert);
    
    // Position alert
    alert.style.position = 'fixed';
    alert.style.top = '100px';
    alert.style.right = '20px';
    alert.style.zIndex = '3000';
    alert.style.maxWidth = '400px';
    alert.style.boxShadow = 'var(--shadow-lg)';
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Get Alert Icon
function getAlertIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

// Export functions for global access
window.showSection = showSection;
window.showAddProductModal = showAddProductModal;
window.closeModal = closeModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.sendMessageToProducer = sendMessageToProducer;
window.inviteToLiveStream = inviteToLiveStream;
window.sendOfferForm = sendOfferForm;
window.viewOrder = viewOrder;
window.updateOrderStatus = updateOrderStatus;
window.trackOrder = trackOrder;
window.showBuyStreamTimeModal = showBuyStreamTimeModal;
window.buyStreamTime = buyStreamTime;
window.skipPurchase = skipPurchase;
window.toggleProductSelection = toggleProductSelection;
window.previewStream = previewStream;
window.stopStream = stopStream;
window.sendStreamMessage = sendStreamMessage;
window.selectMessageContact = selectMessageContact;
window.sendMessage = sendMessage;
window.showOfferForm = showOfferForm;
window.logout = logout;

console.log('Panel Application JavaScript Loaded Successfully');

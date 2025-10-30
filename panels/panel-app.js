// Panel Application JavaScript
let currentUser = null;
let userRole = null;
let products = [];
window.products = products; // Global erişim için
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
    checkIncomingInvitations();
    setupInvitationAutoCheck();
    initializeCartSystem();
    initializeStockSystem();
});

// Initialize Panel Application
function initializePanel() {
    console.log('Panel Application Initialized');
    
    // Check authentication
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        // Ana sayfaya yönlendir
        window.location.href = '../index.html';
        return;
    }
    
    try {
        const user = JSON.parse(savedUser);
        // Eğer user geçersizse yönlendir
        if (!user || !user.role) {
            window.location.href = '../index.html';
            return;
        }
    } catch (e) {
        // JSON parse hatası - ana sayfaya yönlendir
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
        return;
    }
    
    currentUser = JSON.parse(savedUser);
    userRole = currentUser.role;
    
    // Update UI with user data
    updateUserInfo();
    
    // Show appropriate section based on role
    showSection('dashboard');
    
    // Setup modal close listeners
    setupModalCloseListeners();
    
    // Panel logo'yu tıklanabilir yap - anasayfaya yönlendir
    setupPanelLogoClick();
}

// Panel logo'ya tıklama fonksiyonu
function setupPanelLogoClick() {
    const panelLogo = document.querySelector('.panel-logo');
    if (panelLogo) {
        // Eğer zaten bir link değilse, tıklama olayı ekle
        if (!panelLogo.querySelector('a')) {
            panelLogo.style.cursor = 'pointer';
            panelLogo.addEventListener('click', function() {
                window.location.href = '../index.html';
            });
        }
    }
}

// Setup Modal Close Listeners
function setupModalCloseListeners() {
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                const modalId = modal.id || modal.getAttribute('id');
                if (modalId) {
                    closeModal(modalId);
                } else {
                    modal.style.display = 'none';
                }
            }
        });
    });
}

// Generate Member Number
function generateMemberNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${timestamp}-${random}`;
}

// Load User Data
function loadUserData() {
    if (currentUser) {
        // Set company name
        const companyNameElement = document.getElementById('userCompanyName');
        if (companyNameElement) {
            companyNameElement.textContent = currentUser.companyName;
        }
        
        // Set admin name if exists
        const adminNameElement = document.getElementById('adminName');
        if (adminNameElement && currentUser.companyName) {
            adminNameElement.textContent = currentUser.companyName;
        }
        
        // Generate and set member number if not exists
        if (!currentUser.memberNumber) {
            currentUser.memberNumber = generateMemberNumber();
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        // Set member number
        const memberNumberElement = document.getElementById('userMemberNumber');
        if (memberNumberElement) {
            memberNumberElement.textContent = `Üye No: ${currentUser.memberNumber}`;
        }
        
        // Set admin member number
        const adminMemberNumber = document.getElementById('adminMemberNumber');
        if (adminMemberNumber && currentUser.memberNumber) {
            adminMemberNumber.textContent = `Admin ID: ${currentUser.memberNumber}`;
        }
        
        // Load user-specific data
        loadProducts();
        loadProducers();
        loadOrders();
        loadMessages();
        loadStreamBalance();
        
        // Load invitations if user is uretici
        if (currentUser.role === 'uretici') {
            loadInvitations();
        }
    }
}

// Update User Info
function updateUserInfo() {
    if (currentUser) {
        // Safely update company name if element exists
        const companyNameElement = document.getElementById('userCompanyName');
        if (companyNameElement) {
            companyNameElement.textContent = currentUser.companyName;
        }
        
        // Update member number if exists
        const memberNumberElement = document.getElementById('userMemberNumber');
        if (memberNumberElement && currentUser.memberNumber) {
            memberNumberElement.textContent = `Üye No: ${currentUser.memberNumber}`;
        }
        
        // Update admin name if exists
        const adminNameElement = document.getElementById('adminName');
        if (adminNameElement && currentUser.companyName) {
            adminNameElement.textContent = currentUser.companyName;
        }
        
        // Update admin member number if exists
        const adminMemberNumber = document.getElementById('adminMemberNumber');
        if (adminMemberNumber && currentUser.memberNumber) {
            adminMemberNumber.textContent = `Admin ID: ${currentUser.memberNumber}`;
        }
    }
}

// Setup Panel Event Listeners
function setupPanelEventListeners() {
    // Navigation links - hem href hem data-section ile çalışır
    document.querySelectorAll('.panel-nav-menu .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Önce data-section, sonra href'ten section id'sini al
            let section = this.getAttribute('data-section');
            if (!section && this.getAttribute('href')) {
                const href = this.getAttribute('href');
                if (href.startsWith('#')) {
                    section = href.substring(1);
                }
            }
            
            if (section) {
                showSection(section);
            }
        });
    });
    
    // Action card butonları - showSectionDirect ile çalışan butonlar
    document.querySelectorAll('.action-card[onclick*="showSectionDirect"]').forEach(button => {
        button.addEventListener('click', function(e) {
            // Eğer onclick zaten tanımlıysa çalıştır, değilse parse et
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                const match = onclick.match(/showSectionDirect\(['"]([^'"]+)['"]\)/);
                if (match && typeof showSection === 'function') {
                    e.preventDefault();
                    e.stopPropagation();
                    showSection(match[1]);
                }
            }
        });
    });
    
    // Tab buttons - hem onclick hem data-tab attribute'unu destekle
    document.querySelectorAll('.tab-btn').forEach(btn => {
        // Eğer zaten onclick varsa, onu override etme - sadece data-tab varsa ekle
        if (!btn.onclick || btn.getAttribute('onclick')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Önce data-tab attribute'unu kontrol et
                let tabId = this.getAttribute('data-tab');
                
                // Eğer yoksa, onclick'ten parse et
                if (!tabId && this.getAttribute('onclick')) {
                    const onclickContent = this.getAttribute('onclick');
                    const match = onclickContent.match(/showTab\(['"]([^'"]+)['"]\)/);
                    if (match) {
                        tabId = match[1];
                    }
                }
                
                if (tabId) {
                    showTab(tabId);
                }
            });
        }
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
    try {
        console.log('Showing section:', sectionId);
        
        // Hide all sections with smooth transition
        document.querySelectorAll('.panel-section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(10px)';
            setTimeout(() => {
                section.classList.remove('active');
                section.style.display = 'none';
            }, 150);
        });
        
        // Remove active class from nav links
        document.querySelectorAll('.panel-nav-menu .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Show selected section with animation
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.style.opacity = '0';
            targetSection.style.transform = 'translateY(10px)';
            
            // Force reflow
            targetSection.offsetHeight;
            
            // Add active class and animate in
            targetSection.classList.add('active');
            setTimeout(() => {
                targetSection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                targetSection.style.opacity = '1';
                targetSection.style.transform = 'translateY(0)';
            }, 50);
            
            console.log('Section activated:', sectionId);
        } else {
            console.error('Section not found:', sectionId);
            // Hata mesajı göster ama sayfa çökmesin
            if (typeof showAlert === 'function') {
                showAlert('Bölüm bulunamadı: ' + sectionId, 'error');
            } else {
                console.warn('Bölüm bulunamadı:', sectionId);
            }
            return;
        }
        
        // Add active class to nav link
        const navLink = document.querySelector(`[data-section="${sectionId}"]`) ||
                       document.querySelector(`[href="#${sectionId}"]`);
        if (navLink) {
            navLink.classList.add('active');
        }
        
        // Scroll to top of section
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Load section-specific data
        loadSectionData(sectionId);
    } catch (error) {
        console.error('Error in showSection:', error);
        if (typeof showAlert === 'function') {
            showAlert('Bir hata oluştu: ' + error.message, 'error');
        } else {
            console.error('Bir hata oluştu:', error.message);
        }
    }
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
        case 'sellers':
            loadSellers(); // For customer panel - load sellers
            break;
        case 'suppliers':
            loadSuppliersGrid();
            break;
        case 'wholesalers':
            loadWholesalers(); // Load toptanci list with follow buttons
            break;
        case 'followers':
            loadFollowers();
            break;
        case 'live-streams':
            if (userRole === 'musteri') {
                loadCustomerLiveStreams();
            }
            break;
        case 'following':
            if (userRole === 'musteri') {
                loadCustomerFollowing();
            }
            break;
        case 'cart':
            loadCartSection();
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
        case 'hr':
            loadApprovedUsers();
            break;
        case 'invitations':
            loadInvitations();
            break;
        case 'departments':
        case 'finance':
        case 'operations':
        case 'payments':
        case 'customer-service':
        case 'marketing':
        case 'rd':
        case 'security':
        case 'settings':
            // Admin-specific sections
            break;
    }
}

// Dashboard Data
function loadDashboardData() {
    // Update stats
    const totalProductsEl = document.getElementById('totalProducts');
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalProducersEl = document.getElementById('totalProducers');
    const totalSuppliersEl = document.getElementById('totalSuppliers');
    const totalWholesalersEl = document.getElementById('totalWholesalers');
    const liveStreamBalanceEl = document.getElementById('liveStreamBalance');
    
    if (totalProductsEl) totalProductsEl.textContent = products.length;
    if (totalOrdersEl) totalOrdersEl.textContent = orders.filter(o => o.status === 'pending').length;
    if (totalProducersEl) totalProducersEl.textContent = producers.length;
    if (totalSuppliersEl) totalSuppliersEl.textContent = 0;
    if (totalWholesalersEl) totalWholesalersEl.textContent = 0;
    if (liveStreamBalanceEl) liveStreamBalanceEl.textContent = streamBalance;
    
    // Show invitation alert for uretici
    if (currentUser && currentUser.role === 'uretici') {
        showInvitationAlert();
    }
    
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
    // Mock products data - Kullanıcı rolüne göre farklı ürünler
    if (currentUser && currentUser.role === 'satici') {
        // Satıcı ürünleri
        products = [
            {
                id: 1,
                name: 'Samsung Galaxy S24',
                category: 'elektronik',
                unit: 'adet',
                stock: 50,
                price: 25000.00,
                status: 'active',
                description: 'Yeni nesil akıllı telefon',
                seller: currentUser.companyName,
                sellerEmail: currentUser.email
            },
            {
                id: 2,
                name: 'iPhone 15 Pro',
                category: 'elektronik',
                unit: 'adet',
                stock: 30,
                price: 35000.00,
                status: 'active',
                description: 'Apple\'ın en yeni telefonu',
                seller: currentUser.companyName,
                sellerEmail: currentUser.email
            },
            {
                id: 3,
                name: 'MacBook Air M2',
                category: 'elektronik',
                unit: 'adet',
                stock: 20,
                price: 45000.00,
                status: 'active',
                description: 'Güçlü ve hafif laptop',
                seller: currentUser.companyName,
                sellerEmail: currentUser.email
            },
            {
                id: 4,
                name: 'Nike Air Max 270',
                category: 'giyim',
                unit: 'adet',
                stock: 100,
                price: 1200.00,
                status: 'active',
                description: 'Rahat spor ayakkabı',
                seller: currentUser.companyName,
                sellerEmail: currentUser.email
            },
            {
                id: 5,
                name: 'Adidas Ultraboost 22',
                category: 'giyim',
                unit: 'adet',
                stock: 80,
                price: 1500.00,
                status: 'active',
                description: 'Yüksek performanslı koşu ayakkabısı',
                seller: currentUser.companyName,
                sellerEmail: currentUser.email
            },
            {
                id: 6,
                name: 'Samsung 55" 4K TV',
                category: 'elektronik',
                unit: 'adet',
                stock: 25,
                price: 18000.00,
                status: 'active',
                description: '4K Ultra HD Smart TV',
                seller: currentUser.companyName,
                sellerEmail: currentUser.email
            },
            {
                id: 7,
                name: 'Dyson V15 Detect',
                category: 'ev',
                unit: 'adet',
                stock: 40,
                price: 8500.00,
                status: 'active',
                description: 'Güçlü elektrikli süpürge',
                seller: currentUser.companyName,
                sellerEmail: currentUser.email
            },
            {
                id: 8,
                name: 'KitchenAid Stand Mixer',
                category: 'ev',
                unit: 'adet',
                stock: 15,
                price: 12000.00,
                status: 'active',
                description: 'Profesyonel mutfak mikseri',
                seller: currentUser.companyName,
                sellerEmail: currentUser.email
            }
        ];
    } else if (currentUser && currentUser.role === 'satici1@videosat.com') {
        // Elektronik Satıcısı ürünleri
        products = [
            {
                id: 11,
                name: 'Sony WH-1000XM5',
                category: 'elektronik',
                unit: 'adet',
                stock: 60,
                price: 8500.00,
                status: 'active',
                description: 'Gürültü önleyici kablosuz kulaklık',
                seller: 'Elektronik Satıcısı',
                sellerEmail: 'satici1@videosat.com'
            },
            {
                id: 12,
                name: 'Canon EOS R6 Mark II',
                category: 'elektronik',
                unit: 'adet',
                stock: 35,
                price: 65000.00,
                status: 'active',
                description: 'Profesyonel fotoğraf makinesi',
                seller: 'Elektronik Satıcısı',
                sellerEmail: 'satici1@videosat.com'
            },
            {
                id: 13,
                name: 'iPad Pro 12.9"',
                category: 'elektronik',
                unit: 'adet',
                stock: 45,
                price: 28000.00,
                status: 'active',
                description: 'Güçlü tablet bilgisayar',
                seller: 'Elektronik Satıcısı',
                sellerEmail: 'satici1@videosat.com'
            }
        ];
    } else if (currentUser && currentUser.role === 'satici2@videosat.com') {
        // Giyim Satıcısı ürünleri
        products = [
            {
                id: 21,
                name: 'Zara Kış Montu',
                category: 'giyim',
                unit: 'adet',
                stock: 120,
                price: 800.00,
                status: 'active',
                description: 'Şık kış montu',
                seller: 'Giyim Satıcısı',
                sellerEmail: 'satici2@videosat.com'
            },
            {
                id: 22,
                name: 'H&M Gömlek',
                category: 'giyim',
                unit: 'adet',
                stock: 200,
                price: 150.00,
                status: 'active',
                description: 'Klasik erkek gömleği',
                seller: 'Giyim Satıcısı',
                sellerEmail: 'satici2@videosat.com'
            },
            {
                id: 23,
                name: 'LC Waikiki Jean',
                category: 'giyim',
                unit: 'adet',
                stock: 300,
                price: 250.00,
                status: 'active',
                description: 'Rahat denim pantolon',
                seller: 'Giyim Satıcısı',
                sellerEmail: 'satici2@videosat.com'
            }
        ];
    } else if (currentUser && currentUser.role === 'satici3@videosat.com') {
        // Ev Eşyası Satıcısı ürünleri
        products = [
            {
                id: 31,
                name: 'IKEA Yatak Odası Seti',
                category: 'ev',
                unit: 'set',
                stock: 20,
                price: 15000.00,
                status: 'active',
                description: 'Modern yatak odası takımı',
                seller: 'Ev Eşyası Satıcısı',
                sellerEmail: 'satici3@videosat.com'
            },
            {
                id: 32,
                name: 'Bosch Buzdolabı',
                category: 'ev',
                unit: 'adet',
                stock: 30,
                price: 25000.00,
                status: 'active',
                description: 'A+++ enerji verimli buzdolabı',
                seller: 'Ev Eşyası Satıcısı',
                sellerEmail: 'satici3@videosat.com'
            },
            {
                id: 33,
                name: 'Siemens Çamaşır Makinesi',
                category: 'ev',
                unit: 'adet',
                stock: 25,
                price: 18000.00,
                status: 'active',
                description: '9 kg yıkama kapasiteli',
                seller: 'Ev Eşyası Satıcısı',
                sellerEmail: 'satici3@videosat.com'
            }
        ];
    } else {
        // Varsayılan ürünler (diğer roller için)
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
    }
    
    window.products = products; // Global erişim için güncelle
    renderProductsTable();
}

// Render Products Table
function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    // Products'ı localStorage'a kaydet (stock service için)
    if (window.stockService) {
        try {
            localStorage.setItem('products', JSON.stringify(products));
        } catch (e) {
            console.error('Error saving products:', e);
        }
    }
    
    tbody.innerHTML = products.map(product => {
        const isOwner = currentUser && (
            currentUser.role === 'hammaddeci' || 
            currentUser.role === 'uretici' || 
            currentUser.role === 'toptanci' || 
            currentUser.role === 'satici'
        );
        
        return `
        <tr>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${getUnitName(product.unit)}</td>
            <td><strong>${formatStock(product.stock, product.unit)}</strong></td>
            <td>₺${product.price.toFixed(2)}</td>
            <td><span class="status-badge ${product.status}">${getStatusName(product.status)}</span></td>
            <td>
                <div class="action-buttons">
                    ${isOwner ? `
                    <button class="action-btn edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                        Düzenle
                    </button>
                    <button class="action-btn delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                        Sil
                    </button>
                    ` : ''}
                    <button class="action-btn view" onclick="viewProductDetails(${product.id})">
                        <i class="fas fa-eye"></i>
                        Detay
                    </button>
                </div>
            </td>
            <td>
                ${!isOwner && product.stock > 0 ? `
                <button class="action-btn add-to-cart" onclick="addProductToCart(${product.id})" title="Sepete Ekle">
                    <i class="fas fa-cart-plus"></i>
                    Sepete Ekle
                </button>
                ` : product.stock === 0 ? `
                <span class="text-muted">Stokta Yok</span>
                ` : ''}
            </td>
        </tr>
    `;
    }).join('');
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

// Format Stock with Unit
function formatStock(stock, unit) {
    const formattedStock = parseFloat(stock).toLocaleString('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
    
    const unitSymbols = {
        'kg': 'kg',
        'm2': 'm²',
        'm3': 'm³',
        'litre': 'L',
        'gram': 'g',
        'adet': 'adet'
    };
    
    return `${formattedStock} ${unitSymbols[unit] || unit}`;
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

// Close Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show Add Product Modal
function showAddProductModal() {
    document.getElementById('addProductModal').style.display = 'block';
}

// Handle Add Product
function handleAddProduct(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const unit = document.getElementById('productUnit').value;
    const stock = parseFloat(document.getElementById('productStock').value);
    const price = parseFloat(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value.trim();
    
    // Validation
    if (!name || !category || !unit) {
        showAlert('Lütfen tüm zorunlu alanları doldurun.', 'error');
        return;
    }
    
    if (isNaN(stock) || stock < 0) {
        showAlert('Geçerli bir stok miktarı girin (0 veya daha büyük).', 'error');
        return;
    }
    
    if (isNaN(price) || price < 0) {
        showAlert('Geçerli bir fiyat girin (0 veya daha büyük).', 'error');
        return;
    }
    
    const productData = {
        id: Date.now(),
        name: name,
        category: category,
        unit: unit,
        stock: stock,
        price: price,
        description: description,
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
        document.getElementById('productDescription').value = product.description || '';
        
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
    console.log('Loading producers...');
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
        },
        {
            id: 4,
            name: 'Test Üretici Firması',
            city: 'istanbul',
            sector: 'metal',
            phone: '+90 555 123 4567',
            email: 'uretici@videosat.com',
            products: ['Test ürün', 'Demo malzeme'],
            status: 'active'
        }
    ];
    
    console.log('Producers loaded:', producers.length);
    renderProducersGrid();
}

// Render Producers Grid
function renderProducersGrid() {
    const grid = document.getElementById('producersGrid');
    if (!grid) return;
    
    // Check if we need to add follow buttons (for toptanci role)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userRole = currentUser.role;
    const needsFollowButtons = (userRole === 'toptanci');
    
    // Get following list if needed
    let following = [];
    if (needsFollowButtons && window.followService) {
        following = window.followService.getFollowing(currentUser.id);
    }
    
    grid.innerHTML = producers.map(producer => {
        // Check if already following
        const isFollowing = needsFollowButtons && following.some(f => f.id === producer.id);
        
        return `
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
                ${needsFollowButtons ? `
                    ${isFollowing ? `
                        <button class="btn btn-success btn-small" onclick="unfollowProducer('${producer.id}')">
                            <i class="fas fa-check"></i>
                            Takip Ediliyor
                        </button>
                    ` : `
                        <button class="btn btn-primary btn-small" onclick="followProducer('${producer.id}')">
                            <i class="fas fa-star"></i>
                            Takip Et
                        </button>
                    `}
                ` : `
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
                `}
            </div>
        </div>
    `;
    }).join('');
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
    if (!grid) return;
    
    // Check if we need to add follow buttons (for toptanci role)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userRole = currentUser.role;
    const needsFollowButtons = (userRole === 'toptanci');
    
    // Get following list if needed
    let following = [];
    if (needsFollowButtons && window.followService) {
        following = window.followService.getFollowing(currentUser.id);
    }
    
    grid.innerHTML = filteredProducers.map(producer => {
        // Check if already following
        const isFollowing = needsFollowButtons && following.some(f => f.id === producer.id);
        
        return `
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
                ${needsFollowButtons ? `
                    ${isFollowing ? `
                        <button class="btn btn-success btn-small" onclick="unfollowProducer('${producer.id}')">
                            <i class="fas fa-check"></i>
                            Takip Ediliyor
                        </button>
                    ` : `
                        <button class="btn btn-primary btn-small" onclick="followProducer('${producer.id}')">
                            <i class="fas fa-star"></i>
                            Takip Et
                        </button>
                    `}
                ` : `
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
                `}
            </div>
        </div>
    `;
    }).join('');
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
        // Show confirmation modal
        showInviteModal(producer);
    }
}

// Show Invite Modal
function showInviteModal(producer) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'inviteModal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2><i class="fas fa-broadcast-tower"></i> Canlı Yayın Daveti</h2>
            <div style="padding: 20px;">
                <p style="margin-bottom: 20px;">
                    <strong>${producer.name}</strong> kullanıcısını canlı yayınıza davet etmek istiyor musunuz?
                </p>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="sendInviteToProducer(${producer.id})" style="flex: 1;">
                        <i class="fas fa-paper-plane"></i> Davet Gönder
                    </button>
                    <button class="btn btn-outline" onclick="this.closest('.modal').remove()" style="flex: 1;">
                        İptal
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Send Invite to Producer
function sendInviteToProducer(producerId) {
    const producer = producers.find(p => p.id === producerId);
    if (producer) {
        const currentUserEmail = getCurrentUserEmail();
        const currentUserName = getCurrentUserName();
        
        // Check if invitation already exists
        const existingInvitations = JSON.parse(localStorage.getItem('liveStreamInvitations') || '[]');
        const existingInv = existingInvitations.find(inv => 
            inv.from === currentUserEmail && 
            inv.to === producer.email && 
            inv.status === 'pending'
        );
        
        if (existingInv) {
            showAlert(`${producer.name} için zaten bekleyen bir davet var.`, 'warning');
            document.getElementById('inviteModal')?.remove();
            return;
        }
        
        // Save invitation to localStorage
        const invitation = {
            id: Date.now(),
            from: currentUserEmail,
            fromName: currentUserName,
            to: producer.email,
            toName: producer.name,
            producerId: producerId,
            timestamp: new Date().toISOString(),
            status: 'pending',
            streamUrl: '../live-stream.html?from=streamer'
        };
        existingInvitations.push(invitation);
        localStorage.setItem('liveStreamInvitations', JSON.stringify(existingInvitations));
        
        // Close modal
        document.getElementById('inviteModal')?.remove();
        
        // Show success
        showAlert(`${producer.name} canlı yayına davet edildi!`, 'success');
        
        // Optionally redirect to live stream page
        setTimeout(() => {
            if (confirm('Canlı yayına geçmek ister misiniz?')) {
                window.location.href = '../live-stream.html?from=streamer';
            }
        }, 1000);
    }
}

// Get Current User Email
function getCurrentUserEmail() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.email || 'unknown@videosat.com';
}

// Get Current User Name
function getCurrentUserName() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.companyName || 'Unknown Company';
}

// Check for incoming invitations (call this on page load for receivers)
function checkIncomingInvitations() {
    const invitations = JSON.parse(localStorage.getItem('liveStreamInvitations') || '[]');
    const currentUserEmail = getCurrentUserEmail();
    
    const myInvitations = invitations.filter(inv => 
        inv.to === currentUserEmail && inv.status === 'pending'
    );
    
    if (myInvitations.length > 0) {
        // Show notification for the first pending invitation
        const firstInv = myInvitations[0];
        showInvitationAlert(firstInv);
    }
}

// Auto-check invitations every 5 seconds
function setupInvitationAutoCheck() {
    setInterval(() => {
        checkIncomingInvitations();
    }, 5000);
}

// Show Invitation Alert
function showInvitationAlert(invitation) {
    // Check if we already showed this invitation
    const shownInvitations = JSON.parse(sessionStorage.getItem('shownInvitations') || '[]');
    if (shownInvitations.includes(invitation.id)) {
        return; // Already shown
    }
    
    // Mark as shown
    shownInvitations.push(invitation.id);
    sessionStorage.setItem('shownInvitations', JSON.stringify(shownInvitations));
    
    // Create a better modal instead of confirm
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'invitationAlertModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2><i class="fas fa-broadcast-tower"></i> Canlı Yayın Daveti</h2>
            <div style="padding: 20px;">
                <p style="margin-bottom: 20px; font-size: 16px;">
                    <strong>${invitation.fromName}</strong> sizi canlı yayına davet ediyor.
                </p>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="acceptInvitationAlert(${invitation.id})" style="flex: 1;">
                        <i class="fas fa-check"></i> Kabul Et
                    </button>
                    <button class="btn btn-outline" onclick="declineInvitationAlert(${invitation.id})" style="flex: 1;">
                        <i class="fas fa-times"></i> Reddet
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Accept Invitation from Alert
function acceptInvitationAlert(invitationId) {
    const invitations = JSON.parse(localStorage.getItem('liveStreamInvitations') || '[]');
    const invitation = invitations.find(i => i.id == invitationId);
    
    if (invitation) {
        invitation.status = 'accepted';
        invitation.acceptedAt = new Date().toISOString();
        localStorage.setItem('liveStreamInvitations', JSON.stringify(invitations));
        
        document.getElementById('invitationAlertModal')?.remove();
        
        showAlert('Davet kabul edildi! Canlı yayına yönlendiriliyorsunuz...', 'success');
        
        // Redirect to live stream
        setTimeout(() => {
            window.location.href = `${invitation.streamUrl}&invitation=${invitationId}`;
        }, 1500);
    }
}

// Decline Invitation from Alert
function declineInvitationAlert(invitationId) {
    const invitations = JSON.parse(localStorage.getItem('liveStreamInvitations') || '[]');
    const invitation = invitations.find(i => i.id == invitationId);
    
    if (invitation) {
        invitation.status = 'declined';
        invitation.declinedAt = new Date().toISOString();
        localStorage.setItem('liveStreamInvitations', JSON.stringify(invitations));
        
        document.getElementById('invitationAlertModal')?.remove();
        
        showAlert('Davet reddedildi.', 'info');
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
    try {
        console.log('Showing tab:', tabId);
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        
        // Add active class to selected tab button (öncelik: data-tab, sonra onclick içinde tabId)
        const tabButton = document.querySelector(`[data-tab="${tabId}"]`) || 
                          document.querySelector(`button[onclick*="showTab('${tabId}')"]`) ||
                          document.querySelector(`button[onclick*='showTab("${tabId}")']`);
        
        if (tabButton) {
            tabButton.classList.add('active');
        }
        
        // Show selected tab content - farklı formatları destekle
        const tabContentIds = [
            `${tabId}-tab`,
            `${tabId}Tab`,
            `${tabId}_tab`,
            `${tabId}Orders`,
            `tab-${tabId}`,
            tabId
        ];
        
        let tabContentFound = false;
        for (const contentId of tabContentIds) {
            const tabContent = document.getElementById(contentId) || 
                              document.querySelector(`[data-tab-content="${tabId}"]`);
            if (tabContent) {
                tabContent.classList.add('active');
                tabContent.style.display = 'block';
                tabContentFound = true;
                console.log('Tab content activated:', contentId);
                break;
            }
        }
        
        if (!tabContentFound) {
            console.warn('Tab content not found for:', tabId);
        }
        
        // Scroll to top of tab content if exists (smooth scroll)
        setTimeout(() => {
            const activeTabContent = document.querySelector('.tab-content.active');
            if (activeTabContent) {
                // Tab content'in üstüne scroll yap (tab-nav varsa onu atla)
                const tabNav = activeTabContent.previousElementSibling;
                if (tabNav && tabNav.classList.contains('tab-nav')) {
                    tabNav.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    activeTabContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        }, 100);
        
    } catch (error) {
        console.error('Error in showTab:', error);
    }
}

// View Order
function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        showAlert(`Sipariş ${order.orderNumber} görüntüleniyor...`, 'info');
    }
}

// Update Order Status
async function updateOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    try {
        // Use order service if available
        if (window.orderService) {
            const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
            const currentIndex = statuses.indexOf(order.status);
            const nextStatus = currentIndex < statuses.length - 1 ? statuses[currentIndex + 1] : 'completed';
            
            await window.orderService.updateOrderStatus(orderId, nextStatus, 'Durum güncellendi');
            
            order.status = nextStatus;
            if (nextStatus === 'shipped' && window.orderService) {
                const updatedOrder = window.orderService.getOrderById(orderId);
                order.trackingNumber = updatedOrder.trackingNumber;
            }
            
            renderOrdersTables();
            showAlert(`Sipariş durumu "${getStatusName(nextStatus)}" olarak güncellendi!`, 'success');
        } else {
            // Fallback
            const newStatus = order.status === 'pending' ? 'completed' : 'pending';
            order.status = newStatus;
            renderOrdersTables();
            showAlert(`Sipariş durumu güncellendi!`, 'success');
        }
    } catch (error) {
        showAlert('Sipariş durumu güncellenemedi: ' + error.message, 'error');
    }
}

// Track Order
function trackOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    try {
        // Use order service if available
        if (window.orderService && order.trackingNumber) {
            const tracking = window.orderService.getTrackingByNumber(order.trackingNumber);
            
            if (tracking) {
                const timeline = tracking.timeline.map(item => 
                    `${new Date(item.date).toLocaleDateString('tr-TR')}\n${item.location}\n${item.description}`
                ).join('\n\n');
                
                alert(`📦 KARGO TAKİP BİLGİLERİ\n\n` +
                    `Sipariş No: ${order.orderNumber}\n` +
                    `Takip No: ${tracking.trackingNumber}\n` +
                    `Mevcut Konum: ${tracking.currentLocation}\n` +
                    `Hedef: ${tracking.destination}\n` +
                    `Tahmini Teslimat: ${tracking.estimatedDelivery}\n\n` +
                    `📋 KARGO GÜNCELMELERİ:\n\n${timeline}`);
            } else {
                alert(`📦 KARGO TAKİP\n\n` +
                    `Sipariş No: ${order.orderNumber}\n` +
                    `Takip No: ${order.trackingNumber}\n` +
                    `Durum: ${getStatusName(order.status)}`);
            }
        } else {
            // Fallback
            const trackingInfo = `Sipariş No: ${order.orderNumber}\n` +
                `Kargo Takip No: ${order.trackingNumber || 'Henüz atanmadı'}\n` +
                `Durum: ${getStatusName(order.status)}\n` +
                `Tahmini Teslimat: ${order.deliveryDate || 'Belirlenmedi'}`;
            
            alert(`📦 KARGO TAKİP BİLGİLERİ\n\n${trackingInfo}`);
        }
    } catch (error) {
        showAlert('Kargo bilgisi alınamadı: ' + error.message, 'error');
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
    
    if (!message) return;
    
    const selectedContact = document.getElementById('selectedContactName')?.textContent;
    if (!selectedContact || selectedContact === 'Bir konuşma seçin') {
        showAlert('Lütfen önce bir konuşma seçin!', 'warning');
        return;
    }
    
    const messageMessages = document.getElementById('messageMessages');
    const noMessage = messageMessages?.querySelector('.no-message');
    if (noMessage) noMessage.remove();
    
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
    
    // Save message to localStorage
    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    allMessages.push({
        id: Date.now(),
        from: getCurrentUserEmail(),
        to: selectedContact,
        message: message,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('messages', JSON.stringify(allMessages));
    
    input.value = '';
    showAlert('Mesaj gönderildi!', 'success');
}

// Select Message Contact
function selectMessageContact(contact) {
    const nameElement = document.getElementById('selectedContactName');
    const statusElement = document.getElementById('selectedContactStatus');
    
    if (nameElement) nameElement.textContent = contact.name || contact.email || contact;
    if (statusElement) statusElement.textContent = 'Çevrimiçi';
    
    // Enable message input
    const messageInput = document.getElementById('messageInput');
    if (messageInput) messageInput.disabled = false;
    
    // Clear messages and load from localStorage
    const messageMessages = document.getElementById('messageMessages');
    if (messageMessages) {
        const noMessage = messageMessages.querySelector('.no-message');
        if (noMessage) noMessage.remove();
        
        messageMessages.innerHTML = '';
        
        // Load messages
        const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
        const contactEmail = typeof contact === 'string' ? contact : contact.email;
        const contactMessages = allMessages.filter(m => 
            (m.from === getCurrentUserEmail() && m.to === contactEmail) ||
            (m.to === getCurrentUserEmail() && m.from === contactEmail)
        );
        
        contactMessages.forEach(msg => {
            const isSent = msg.from === getCurrentUserEmail();
            const messageElement = document.createElement('div');
            messageElement.className = isSent ? 'message-sent' : 'message-received';
            messageElement.innerHTML = `
                <div class="message-bubble">
                    <p>${msg.message}</p>
                    <span class="message-time">${new Date(msg.timestamp).toLocaleTimeString('tr-TR')}</span>
                </div>
            `;
            messageMessages.appendChild(messageElement);
        });
        
        messageMessages.scrollTop = messageMessages.scrollHeight;
    }
}

// Show Offer Form
function showOfferForm() {
    const selectedContact = document.getElementById('selectedContactName')?.textContent;
    if (!selectedContact || selectedContact === 'Bir konuşma seçin') {
        showAlert('Lütfen önce bir konuşma seçin!', 'warning');
        return;
    }
    
    // Create offer form modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2><i class="fas fa-file-contract"></i> Teklif Formu</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <form id="offerForm" onsubmit="handleOfferForm(event)" style="padding: 20px;">
                <div class="form-group">
                    <label>Alıcı:</label>
                    <input type="text" id="offerRecipient" value="${selectedContact}" readonly>
                </div>
                <div class="form-group">
                    <label>Ürün *</label>
                    <select id="offerProduct" required>
                        <option value="">Seçiniz...</option>
                        ${products.map(p => `<option value="${p.id}">${p.name} (${p.stock} ${getUnitName(p.unit)})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Miktar *</label>
                    <input type="number" id="offerQuantity" min="1" required>
                </div>
                <div class="form-group">
                    <label>Birim Fiyat (₺) *</label>
                    <input type="number" id="offerPrice" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label>Mesaj</label>
                    <textarea id="offerMessage" rows="4" placeholder="Teklif notlarınızı buraya yazın..."></textarea>
                </div>
                <div class="form-group">
                    <label>Teslimat Tarihi</label>
                    <input type="date" id="offerDeliveryDate">
                </div>
                <div style="display: flex; gap: 10px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">
                        <i class="fas fa-paper-plane"></i> Teklif Gönder
                    </button>
                    <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()" style="flex: 1;">
                        İptal
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

// Handle Offer Form
function handleOfferForm(e) {
    e.preventDefault();
    
    const recipient = document.getElementById('offerRecipient').value;
    const productId = document.getElementById('offerProduct').value;
    const quantity = document.getElementById('offerQuantity').value;
    const price = document.getElementById('offerPrice').value;
    const message = document.getElementById('offerMessage').value;
    const deliveryDate = document.getElementById('offerDeliveryDate').value;
    
    if (!productId || !quantity || !price) {
        showAlert('Lütfen zorunlu alanları doldurun!', 'error');
        return;
    }
    
    const product = products.find(p => p.id == productId);
    const totalAmount = parseFloat(quantity) * parseFloat(price);
    
    // Save offer to localStorage (simulated)
    const offers = JSON.parse(localStorage.getItem('offers') || '[]');
    const newOffer = {
        id: Date.now(),
        from: getCurrentUserEmail(),
        fromName: getCurrentUserName(),
        to: recipient,
        product: product.name,
        quantity: quantity,
        unit: product.unit,
        price: price,
        totalAmount: totalAmount,
        message: message,
        deliveryDate: deliveryDate,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    offers.push(newOffer);
    localStorage.setItem('offers', JSON.stringify(offers));
    
    // Close modal
    e.target.closest('.modal').remove();
    
    showAlert(`${recipient} için teklif formu başarıyla gönderildi!`, 'success');
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
    // Clear user data immediately
    currentUser = null;
    isLoggedIn = false;
    userRole = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('liveStreamInvitations');
    
    // Show success message
    if (typeof showAlert === 'function') {
        showAlert('Başarıyla çıkış yaptınız.', 'success');
    } else {
        // Fallback alert if showAlert is not available
        alert('Başarıyla çıkış yaptınız.');
    }
    
    // Redirect to home page after a short delay to show message
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1000);
}

// Load Approved Users (Admin Only)
function loadApprovedUsers() {
    // Get all users from localStorage (in real app, this would be from database)
    const approvedUsers = [];
    
    // Create mock users for demonstration
    const mockUsers = [
        {
            id: 1,
            companyName: 'ABC Hammaddeler A.Ş.',
            email: 'hammaddeci@videosat.com',
            phone: '+90 555 123 4567',
            role: 'hammaddeci',
            memberNumber: 'HM20240115ABC',
            createdAt: '2024-01-15',
            status: 'active'
        },
        {
            id: 2,
            companyName: 'Test Üretici Firması',
            email: 'uretici@videosat.com',
            phone: '+90 555 987 6543',
            role: 'uretici',
            memberNumber: 'UR20240120XYZ',
            createdAt: '2024-01-20',
            status: 'active'
        },
        {
            id: 3,
            companyName: 'DEMİR Metal Sanayi',
            email: 'demir@metal.com',
            phone: '+90 212 555 3344',
            role: 'uretici',
            memberNumber: 'UR20240122DEM',
            createdAt: '2024-01-22',
            status: 'active'
        },
        {
            id: 4,
            companyName: 'ÇELİK Toptan Ltd.',
            email: 'info@celiktop.com',
            phone: '+90 312 555 7788',
            role: 'toptanci',
            memberNumber: 'TP20240201CEL',
            createdAt: '2024-02-01',
            status: 'pending'
        },
        {
            id: 5,
            companyName: 'Tekstil Ürünleri Satış',
            email: 'satis@tekstil.com',
            phone: '+90 232 555 4455',
            role: 'satici',
            memberNumber: 'ST20240205TEK',
            createdAt: '2024-02-05',
            status: 'active'
        }
    ];
    
    // Get current user from localStorage
    const localUser = localStorage.getItem('currentUser');
    if (localUser) {
        const user = JSON.parse(localUser);
        if (user.memberNumber) {
            mockUsers.push(user);
        }
    }
    
    // Filter by selected filters
    const roleFilter = document.getElementById('userRoleFilter')?.value || '';
    const statusFilter = document.getElementById('userStatusFilter')?.value || '';
    const searchFilter = document.getElementById('userSearch')?.value.toLowerCase() || '';
    
    const filteredUsers = mockUsers.filter(user => {
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = !statusFilter || user.status === statusFilter;
        const matchesSearch = !searchFilter || 
            user.companyName.toLowerCase().includes(searchFilter) ||
            user.email.toLowerCase().includes(searchFilter) ||
            user.memberNumber.toLowerCase().includes(searchFilter);
        
        return matchesRole && matchesStatus && matchesSearch;
    });
    
    // Update statistics
    document.getElementById('totalApprovedUsers').textContent = mockUsers.length;
    document.getElementById('activeUsers').textContent = mockUsers.filter(u => u.status === 'active').length;
    document.getElementById('pendingApprovals').textContent = mockUsers.filter(u => u.status === 'pending').length;
    document.getElementById('inactiveUsers').textContent = mockUsers.filter(u => u.status === 'inactive').length;
    
    // Render users table
    renderApprovedUsersTable(filteredUsers);
}

// Render Approved Users Table
function renderApprovedUsersTable(users) {
    const tbody = document.getElementById('approvedUsersBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td><strong class="member-number">${user.memberNumber}</strong></td>
            <td>${user.companyName}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td><span class="role-badge ${user.role}">${getRoleName(user.role)}</span></td>
            <td>${formatDate(user.createdAt)}</td>
            <td><span class="status-badge ${user.status}">${getStatusName(user.status)}</span></td>
            <td>
                <button class="btn btn-small btn-outline" onclick="viewUserDetails(${user.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-small btn-primary" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Get Role Name
function getRoleName(role) {
    const roles = {
        'hammaddeci': 'Hammaddeci',
        'uretici': 'Üretici',
        'toptanci': 'Toptancı',
        'satici': 'Satıcı',
        'musteri': 'Müşteri',
        'admin': 'Admin'
    };
    return roles[role] || role;
}

// Format Date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
}

// View User Details
function viewUserDetails(userId) {
    alert(`Kullanıcı detayları gösterilecek: ${userId}`);
}

// Edit User
function editUser(userId) {
    alert(`Kullanıcı düzenlenecek: ${userId}`);
}

// ==================== INVITATIONS MANAGEMENT ====================

let invitations = [];

// Load Invitations (for Üretici)
function loadInvitations() {
    console.log('Loading invitations...');
    
    // Check localStorage for incoming invitations
    const savedInvitations = localStorage.getItem('liveStreamInvitations');
    
    if (savedInvitations) {
        invitations = JSON.parse(savedInvitations);
        console.log('Found invitations:', invitations.length);
    } else {
        // If no invitations exist, create empty array
        invitations = [];
        console.log('No invitations found');
    }
    
    // Update statistics
    updateInvitationStats();
    
    // Render invitations
    renderInvitations();
    
    // Show dashboard alert if there are pending invitations
    showInvitationAlert();
}

// Update Invitation Statistics
function updateInvitationStats() {
    const total = invitations.length;
    const pending = invitations.filter(i => i.status === 'pending').length;
    const accepted = invitations.filter(i => i.status === 'accepted').length;
    
    const totalEl = document.getElementById('totalInvitations');
    const pendingEl = document.getElementById('pendingInvitations');
    const acceptedEl = document.getElementById('acceptedInvitations');
    
    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (acceptedEl) acceptedEl.textContent = accepted;
}

// Render Invitations
function renderInvitations() {
    const pending = invitations.filter(i => i.status === 'pending');
    const accepted = invitations.filter(i => i.status === 'accepted');
    const declined = invitations.filter(i => i.status === 'declined');
    
    renderPendingInvitations(pending);
    renderAcceptedInvitations(accepted);
    renderDeclinedInvitations(declined);
}

// Render Pending Invitations
function renderPendingInvitations(pendingInvitations) {
    const container = document.getElementById('pendingInvitationsList');
    if (!container) return;
    
    if (pendingInvitations.length === 0) {
        container.innerHTML = `
            <div class="no-invitations">
                <i class="fas fa-bell-slash"></i>
                <p>Bekleyen davetiniz yok</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pendingInvitations.map(invitation => `
        <div class="invitation-card pending">
            <div class="invitation-header">
                <div class="invitation-sender">
                    <div class="invitation-avatar">
                        ${invitation.senderName.charAt(0)}
                    </div>
                    <div class="invitation-info">
                        <h3>${invitation.senderName}</h3>
                        <p>Hammaddeci</p>
                    </div>
                </div>
                <div class="invitation-time">
                    <i class="fas fa-clock"></i>
                    ${formatTime(invitation.timestamp)}
                </div>
            </div>
            <div class="invitation-body">
                <p><strong>Canlı yayına davet ediliyorsunuz!</strong></p>
                <p>${invitation.message || 'Canlı yayına katılmak ister misiniz?'}</p>
                ${invitation.products && invitation.products.length > 0 ? `
                    <div class="invitation-products">
                        ${invitation.products.map(product => `
                            <span class="product-tag">${product}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="invitation-actions">
                <button class="btn btn-outline" onclick="declineInvitation('${invitation.id}')">
                    <i class="fas fa-times"></i>
                    Reddet
                </button>
                <button class="btn btn-primary" onclick="acceptInvitation('${invitation.id}')">
                    <i class="fas fa-check"></i>
                    Kabul Et ve Katıl
                </button>
            </div>
        </div>
    `).join('');
}

// Render Accepted Invitations
function renderAcceptedInvitations(acceptedInvitations) {
    const container = document.getElementById('acceptedInvitationsList');
    if (!container) return;
    
    if (acceptedInvitations.length === 0) {
        container.innerHTML = `
            <div class="no-invitations">
                <i class="fas fa-check-circle"></i>
                <p>Henüz kabul edilen davet yok</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = acceptedInvitations.map(invitation => `
        <div class="invitation-card accepted">
            <div class="invitation-header">
                <div class="invitation-sender">
                    <div class="invitation-avatar">
                        ${invitation.senderName.charAt(0)}
                    </div>
                    <div class="invitation-info">
                        <h3>${invitation.senderName}</h3>
                        <p>Hammaddeci</p>
                    </div>
                </div>
                <div class="invitation-time">
                    <i class="fas fa-check-circle"></i>
                    Kabul edildi - ${formatTime(invitation.acceptedAt)}
                </div>
            </div>
        </div>
    `).join('');
}

// Render Declined Invitations
function renderDeclinedInvitations(declinedInvitations) {
    const container = document.getElementById('declinedInvitationsList');
    if (!container) return;
    
    if (declinedInvitations.length === 0) {
        container.innerHTML = `
            <div class="no-invitations">
                <i class="fas fa-ban"></i>
                <p>Reddedilen davet yok</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = declinedInvitations.map(invitation => `
        <div class="invitation-card declined">
            <div class="invitation-header">
                <div class="invitation-sender">
                    <div class="invitation-avatar">
                        ${invitation.senderName.charAt(0)}
                    </div>
                    <div class="invitation-info">
                        <h3>${invitation.senderName}</h3>
                        <p>Hammaddeci</p>
                    </div>
                </div>
                <div class="invitation-time">
                    <i class="fas fa-times-circle"></i>
                    Reddedildi - ${formatTime(invitation.declinedAt)}
                </div>
            </div>
        </div>
    `).join('');
}

// Accept Invitation
function acceptInvitation(invitationId) {
    const invitation = invitations.find(i => i.id === invitationId);
    
    if (!invitation) {
        showAlert('Davet bulunamadı!', 'error');
        return;
    }
    
    // Update invitation status
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('liveStreamInvitations', JSON.stringify(invitations));
    
    // Update UI
    updateInvitationStats();
    renderInvitations();
    showInvitationAlert();
    
    // Show success message
    showAlert('Davet kabul edildi! Canlı yayına yönlendiriliyorsunuz...', 'success');
    
    // Redirect to live stream page
    setTimeout(() => {
        window.location.href = '../live-stream.html';
    }, 1500);
}

// Decline Invitation
function declineInvitation(invitationId) {
    const invitation = invitations.find(i => i.id === invitationId);
    
    if (!invitation) {
        showAlert('Davet bulunamadı!', 'error');
        return;
    }
    
    if (confirm('Bu daveti reddetmek istediğinize emin misiniz?')) {
        // Update invitation status
        invitation.status = 'declined';
        invitation.declinedAt = new Date().toISOString();
        
        // Save to localStorage
        localStorage.setItem('liveStreamInvitations', JSON.stringify(invitations));
        
        // Update UI
        updateInvitationStats();
        renderInvitations();
        showInvitationAlert();
        
        showAlert('Davet reddedildi.', 'info');
    }
}

// Show Invitation Alert on Dashboard
function showInvitationAlert() {
    const alertElement = document.getElementById('invitationsAlert');
    const countElement = document.getElementById('invitationCount');
    const pendingCount = invitations.filter(i => i.status === 'pending').length;
    
    if (alertElement && pendingCount > 0) {
        countElement.textContent = pendingCount;
        alertElement.style.display = 'block';
    } else if (alertElement) {
        alertElement.style.display = 'none';
    }
}

// Format Time
function formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} saat önce`;
    return `${Math.floor(minutes / 1440)} gün önce`;
}

// Export functions for global access
// Global functions - diğer sayfalar için erişilebilir yap
window.showSection = showSection;
window.showTab = showTab;

// showSectionDirect için fallback - bazı sayfalarda kullanılıyor
window.showSectionDirect = function(sectionId) {
    showSection(sectionId);
};
window.showAddProductModal = showAddProductModal;
window.closeModal = closeModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.sendMessageToProducer = sendMessageToProducer;
window.handleOfferForm = handleOfferForm;
window.selectMessageContact = selectMessageContact;
window.showOfferForm = showOfferForm;
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
window.loadApprovedUsers = loadApprovedUsers;
window.viewUserDetails = viewUserDetails;
window.editUser = editUser;
window.loadInvitations = loadInvitations;
window.acceptInvitation = acceptInvitation;
window.declineInvitation = declineInvitation;
window.acceptInvitationAlert = acceptInvitationAlert;
window.declineInvitationAlert = declineInvitationAlert;
window.updateCommissionRates = updateCommissionRates;
window.showPaymentModal = showPaymentModal;

// ==================== CART SYSTEM ====================

// Initialize Cart System
function initializeCartSystem() {
    if (!window.cartService) {
        console.warn('Cart Service not loaded');
        return;
    }

    // Cart değişikliklerini dinle
    window.cartService.onCartChange((cart, total, itemCount) => {
        updateCartUI(cart, total, itemCount);
    });

    // Başlangıç sepet UI'ını güncelle
    const cart = window.cartService.getCart();
    const total = window.cartService.calculateTotal();
    const itemCount = window.cartService.getTotalItems();
    updateCartUI(cart, total, itemCount);
}

// Update Cart UI (Navbar'da mini sepet)
function updateCartUI(cart, total, itemCount) {
    // Navbar'da sepet iconunu güncelle
    const cartIcon = document.querySelector('.cart-icon, [data-cart-icon]');
    if (cartIcon) {
        const badge = cartIcon.querySelector('.cart-badge') || document.createElement('span');
        if (!badge.classList.contains('cart-badge')) {
            badge.className = 'cart-badge';
            badge.style.cssText = 'position: absolute; top: -8px; right: -8px; background: #dc2626; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;';
            cartIcon.style.position = 'relative';
            cartIcon.appendChild(badge);
        }
        badge.textContent = itemCount > 0 ? itemCount : '';
        badge.style.display = itemCount > 0 ? 'flex' : 'none';
    }
}

// Add Product to Cart
function addProductToCart(productId) {
    if (!window.cartService) {
        showAlert('Sepet sistemi yüklenemedi.', 'error');
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
        showAlert('Ürün bulunamadı.', 'error');
        return;
    }

    // Stok kontrolü
    const stockCheck = window.stockService ? 
        window.stockService.checkStock(productId, 1) : 
        { available: product.stock > 0 };

    if (!stockCheck.available) {
        showAlert(`Ürün stokta yok veya yetersiz stok. Mevcut stok: ${stockCheck.stock || 0}`, 'warning');
        return;
    }

    try {
        window.cartService.addToCart(product, 1);
        showAlert(`${product.name} sepete eklendi!`, 'success');
        
        // Ürün tablosunu güncelle (stok görünümü için)
        renderProductsTable();
    } catch (error) {
        showAlert(error.message || 'Sepete eklenirken hata oluştu.', 'error');
    }
}

// View Product Details
function viewProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showAlert('Ürün bulunamadı.', 'error');
        return;
    }

    // Ürün detay modalı oluştur
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'productDetailsModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2><i class="fas fa-box"></i> ${product.name}</h2>
            <div style="padding: 20px;">
                <div style="margin-bottom: 20px;">
                    <p><strong>Kategori:</strong> ${getCategoryName(product.category)}</p>
                    <p><strong>Birim:</strong> ${getUnitName(product.unit)}</p>
                    <p><strong>Stok:</strong> ${formatStock(product.stock, product.unit)}</p>
                    <p><strong>Fiyat:</strong> ₺${product.price.toFixed(2)}</p>
                    <p><strong>Durum:</strong> <span class="status-badge ${product.status}">${getStatusName(product.status)}</span></p>
                </div>
                ${product.description ? `<div style="margin-bottom: 20px;"><p><strong>Açıklama:</strong></p><p>${product.description}</p></div>` : ''}
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    ${product.stock > 0 && (!currentUser || (currentUser.role !== 'hammaddeci' && currentUser.role !== 'uretici' && currentUser.role !== 'toptanci' && currentUser.role !== 'satici')) ? `
                    <button class="btn btn-primary" onclick="addProductToCart(${product.id}); this.closest('.modal').remove();" style="flex: 1;">
                        <i class="fas fa-cart-plus"></i> Sepete Ekle
                    </button>
                    ` : ''}
                    <button class="btn btn-outline" onclick="this.closest('.modal').remove()" style="flex: 1;">
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Initialize Stock System
function initializeStockSystem() {
    if (!window.stockService) {
        console.warn('Stock Service not loaded');
        return;
    }

    // Düşük stok uyarılarını dinle
    window.addEventListener('lowStockWarning', (e) => {
        const { product } = e.detail;
        console.warn(`Düşük stok uyarısı: ${product.name} - ${product.stock}`);
    });

    window.addEventListener('stockOut', (e) => {
        const { product } = e.detail;
        console.error(`Stok tükendi: ${product.name}`);
    });
}

// Load Cart Section
function loadCartSection() {
    if (!window.cartService) {
        showAlert('Sepet sistemi yüklenemedi.', 'error');
        return;
    }

    const cart = window.cartService.getCart();
    const total = window.cartService.calculateTotal();
    const itemCount = window.cartService.getTotalItems();
    
    const cartContent = document.getElementById('cartContent');
    if (!cartContent) return;

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-shopping-cart" style="font-size: 64px; color: #666; margin-bottom: 20px;"></i>
                <h3 style="color: #999; margin-bottom: 10px;">Sepetiniz boş</h3>
                <p style="color: #666;">Sepetinize ürün eklemek için ürün listesini ziyaret edin.</p>
                <button class="btn btn-primary" onclick="showSection('products')" style="margin-top: 20px;">
                    <i class="fas fa-box"></i> Ürünlere Git
                </button>
            </div>
        `;
        return;
    }

    cartContent.innerHTML = `
        <div class="cart-items">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Ürün</th>
                        <th>Fiyat</th>
                        <th>Miktar</th>
                        <th>Toplam</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    ${cart.map(item => `
                        <tr>
                            <td>
                                <strong>${item.productName}</strong><br>
                                <small style="color: #999;">${getUnitName(item.unit)}</small>
                            </td>
                            <td>₺${item.price.toFixed(2)}</td>
                            <td>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <button class="btn btn-small btn-outline" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <span>${item.quantity}</span>
                                    <button class="btn btn-small btn-outline" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </td>
                            <td><strong>₺${(item.price * item.quantity).toFixed(2)}</strong></td>
                            <td>
                                <button class="action-btn delete" onclick="removeCartItem(${item.id})">
                                    <i class="fas fa-trash"></i> Sil
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align: right;"><strong>Toplam:</strong></td>
                        <td colspan="2"><strong style="font-size: 18px; color: #dc2626;">₺${total.toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: flex-end;">
                <button class="btn btn-outline" onclick="clearCart()">
                    <i class="fas fa-trash"></i> Sepeti Temizle
                </button>
                <button class="btn btn-primary" onclick="proceedToCheckout()">
                    <i class="fas fa-credit-card"></i> Siparişi Tamamla
                </button>
            </div>
        </div>
    `;
}

// Update Cart Item Quantity
function updateCartItemQuantity(cartItemId, newQuantity) {
    if (!window.cartService) {
        showAlert('Sepet sistemi yüklenemedi.', 'error');
        return;
    }

    const cartItem = window.cartService.getCartItem(cartItemId);
    if (!cartItem) {
        showAlert('Sepet öğesi bulunamadı.', 'error');
        return;
    }

    // Product bul
    const product = products.find(p => p.id === cartItem.productId);
    
    try {
        if (newQuantity <= 0) {
            removeCartItem(cartItemId);
        } else {
            window.cartService.updateCartItem(cartItemId, newQuantity, product);
            loadCartSection();
            showAlert('Sepet güncellendi.', 'success');
        }
    } catch (error) {
        showAlert(error.message || 'Sepet güncellenirken hata oluştu.', 'error');
    }
}

// Remove Cart Item
function removeCartItem(cartItemId) {
    if (!window.cartService) {
        showAlert('Sepet sistemi yüklenemedi.', 'error');
        return;
    }

    if (confirm('Bu ürünü sepetten çıkarmak istediğinize emin misiniz?')) {
        window.cartService.removeFromCart(cartItemId);
        loadCartSection();
        showAlert('Ürün sepetten çıkarıldı.', 'success');
    }
}

// Clear Cart
function clearCart() {
    if (!window.cartService) {
        showAlert('Sepet sistemi yüklenemedi.', 'error');
        return;
    }

    if (confirm('Sepeti tamamen temizlemek istediğinize emin misiniz?')) {
        window.cartService.clearCart();
        loadCartSection();
        showAlert('Sepet temizlendi.', 'success');
    }
}

// Proceed to Checkout
function proceedToCheckout() {
    if (!window.cartService || !window.orderService) {
        showAlert('Sipariş sistemi yüklenemedi.', 'error');
        return;
    }

    const cart = window.cartService.getCart();
    if (cart.length === 0) {
        showAlert('Sepetiniz boş.', 'warning');
        return;
    }

    const total = window.cartService.calculateTotal();
    
    // Checkout modalı göster
    showCheckoutModal(cart, total);
}

// Show Checkout Modal
function showCheckoutModal(cart, total) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'checkoutModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2><i class="fas fa-shopping-bag"></i> Sipariş Özeti</h2>
            <div style="padding: 20px;">
                <div style="margin-bottom: 20px;">
                    <h3>Sipariş Detayları</h3>
                    <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        ${cart.map(item => `
                            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #404040;">
                                <div>
                                    <strong>${item.productName}</strong><br>
                                    <small style="color: #999;">${item.quantity} x ₺${item.price.toFixed(2)}</small>
                                </div>
                                <strong>₺${(item.price * item.quantity).toFixed(2)}</strong>
                            </div>
                        `).join('')}
                        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-top: 2px solid #dc2626; margin-top: 10px;">
                            <strong>Toplam:</strong>
                            <strong style="font-size: 20px; color: #dc2626;">₺${total.toFixed(2)}</strong>
                        </div>
                    </div>
                </div>

                <form id="checkoutForm" onsubmit="handleCheckout(event)">
                    <h3>Teslimat Bilgileri</h3>
                    <div style="margin-bottom: 15px;">
                        <label>Ad Soyad / Firma Adı *</label>
                        <input type="text" id="checkoutName" class="form-control" required>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label>Telefon *</label>
                        <input type="tel" id="checkoutPhone" class="form-control" required>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label>Email</label>
                        <input type="email" id="checkoutEmail" class="form-control" value="${currentUser?.email || ''}">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label>Adres *</label>
                        <textarea id="checkoutAddress" class="form-control" rows="3" required></textarea>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label>Şehir *</label>
                        <select id="checkoutCity" class="form-control" required>
                            <option value="">Seçiniz</option>
                            <option value="istanbul">İstanbul</option>
                            <option value="ankara">Ankara</option>
                            <option value="izmir">İzmir</option>
                            <option value="bursa">Bursa</option>
                            <option value="antalya">Antalya</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label>Ödeme Yöntemi *</label>
                        <select id="checkoutPaymentMethod" class="form-control" required>
                            <option value="cash">Nakit</option>
                            <option value="credit_card">Kredi Kartı</option>
                            <option value="bank_transfer">Banka Transferi</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label>Notlar (Opsiyonel)</label>
                        <textarea id="checkoutNotes" class="form-control" rows="2"></textarea>
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()" style="flex: 1;">
                            İptal
                        </button>
                        <button type="submit" class="btn btn-primary" style="flex: 1;">
                            <i class="fas fa-check"></i> Siparişi Onayla
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Handle Checkout
function handleCheckout(e) {
    e.preventDefault();
    
    if (!window.cartService || !window.orderService) {
        showAlert('Sipariş sistemi yüklenemedi.', 'error');
        return;
    }

    const cart = window.cartService.getCart();
    if (cart.length === 0) {
        showAlert('Sepetiniz boş.', 'warning');
        return;
    }

    const orderData = {
        items: cart.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            unit: item.unit
        })),
        subtotal: window.cartService.calculateTotal(),
        shippingCost: 0, // TODO: Kargo hesaplama
        total: window.cartService.calculateTotal(),
        customerInfo: {
            name: document.getElementById('checkoutName').value,
            phone: document.getElementById('checkoutPhone').value,
            email: document.getElementById('checkoutEmail').value || currentUser?.email
        },
        shippingAddress: {
            address: document.getElementById('checkoutAddress').value,
            city: document.getElementById('checkoutCity').value
        },
        paymentMethod: document.getElementById('checkoutPaymentMethod').value,
        notes: document.getElementById('checkoutNotes').value
    };

    try {
        const order = window.orderService.createOrder(orderData);
        
        // Sepeti temizle
        window.cartService.clearCart();
        
        // Modal'ı kapat
        document.getElementById('checkoutModal')?.remove();
        
        // Başarı mesajı
        showAlert(`Siparişiniz başarıyla oluşturuldu! Sipariş No: ${order.orderNumber}`, 'success');
        
        // Sepet bölümünü güncelle
        loadCartSection();
        
        // Siparişler bölümüne yönlendir
        setTimeout(() => {
            showSection('orders');
        }, 2000);
        
    } catch (error) {
        showAlert(error.message || 'Sipariş oluşturulurken hata oluştu.', 'error');
    }
}

// Export cart functions globally
window.addProductToCart = addProductToCart;
window.viewProductDetails = viewProductDetails;
window.updateCartUI = updateCartUI;
window.initializeCartSystem = initializeCartSystem;
window.initializeStockSystem = initializeStockSystem;
window.loadCartSection = loadCartSection;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeCartItem = removeCartItem;
window.clearCart = clearCart;
window.proceedToCheckout = proceedToCheckout;
window.handleCheckout = handleCheckout;

// Commission Management
function updateCommissionRates() {
    const hammaddeciCommission = document.getElementById('hammaddeciCommission').value;
    const ureticiCommission = document.getElementById('ureticiCommission').value;
    const toptanciCommission = document.getElementById('toptanciCommission').value;
    const saticiCommission = document.getElementById('saticiCommission').value;
    
    console.log('Komisyon oranları güncellendi:', {
        hammaddeci: hammaddeciCommission + '%',
        uretici: ureticiCommission + '%',
        toptanci: toptanciCommission + '%',
        satici: saticiCommission + '%'
    });
    
    showAlert('Komisyon oranları başarıyla güncellendi!', 'success');
}

// Show Payment Modal
function showPaymentModal() {
    alert('Toplu ödeme modalı açılacak.\n\nBu işlem gerçek ödeme için:\n1. Backend API entegrasyonu\n2. IBAN doğrulama\n3. Banka entegrasyonu\n4. Güvenlik onayı\ngerektirir.');
}

// ============================================
// FOLLOW SYSTEM
// ============================================

// Load Followers (for sales panels)
function loadFollowers() {
    if (!window.followService) {
        console.warn('Follow service not available');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const companyId = currentUser.id;
    const userRole = currentUser.role;

    if (!companyId) return;

    const followers = window.followService.getFollowers(companyId);
    
    // Filter followers based on role (müşteri hierarchy)
    let validFollowers = followers;
    if (userRole === 'hammaddeci') {
        // Hammaddeci's customers are only üretici
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        validFollowers = followers.filter(f => {
            const user = users.find(u => u.id === f.id);
            return user && user.role === 'uretici';
        });
    } else if (userRole === 'uretici') {
        // Üretici's customers are only toptanci
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        validFollowers = followers.filter(f => {
            const user = users.find(u => u.id === f.id);
            return user && user.role === 'toptanci';
        });
    } else if (userRole === 'toptanci') {
        // Toptancı's customers are only satici
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        validFollowers = followers.filter(f => {
            const user = users.find(u => u.id === f.id);
            return user && user.role === 'satici';
        });
    } else if (userRole === 'satici') {
        // Satıcı's customers are only musteri
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        validFollowers = followers.filter(f => {
            const user = users.find(u => u.id === f.id);
            return user && user.role === 'musteri';
        });
    }
    
    const followersList = document.getElementById('followersList');
    const totalFollowersCount = document.getElementById('totalFollowersCount');

    if (totalFollowersCount) {
        totalFollowersCount.textContent = validFollowers.length;
    }

    if (!followersList) return;

    if (validFollowers.length === 0) {
        let roleSpecificMessage = 'Müşteriler sizi takip ettiğinde burada görünecek';
        if (userRole === 'hammaddeci') {
            roleSpecificMessage = 'Üreticiler sizi takip ettiğinde burada görünecek';
        } else if (userRole === 'uretici') {
            roleSpecificMessage = 'Toptancılar sizi takip ettiğinde burada görünecek';
        } else if (userRole === 'toptanci') {
            roleSpecificMessage = 'Satıcılar sizi takip ettiğinde burada görünecek';
        } else if (userRole === 'satici') {
            roleSpecificMessage = 'Müşteriler sizi takip ettiğinde burada görünecek';
        }
        
        followersList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-user-friends" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                <p>Henüz takipçiniz yok</p>
                <p style="font-size: 14px;">${roleSpecificMessage}</p>
            </div>
        `;
        return;
    }

    followersList.innerHTML = validFollowers.map(follower => `
        <div class="action-card" style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin: 0 0 5px 0; color: #ffffff;">${follower.name}</h3>
                    <p style="margin: 0; color: #999; font-size: 14px;">
                        <i class="fas fa-envelope"></i> ${follower.email}
                    </p>
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
                        Takip: ${new Date(follower.followedAt).toLocaleDateString('tr-TR')}
                    </p>
                </div>
                <button class="btn btn-primary btn-small" onclick="inviteFollowerToLivestream('${follower.id}', '${follower.name}')">
                    <i class="fas fa-broadcast-tower"></i>
                    Yayına Davet Et
                </button>
            </div>
        </div>
    `).join('');

    // Setup search
    const followersSearch = document.getElementById('followersSearch');
    if (followersSearch) {
        followersSearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const cards = followersList.querySelectorAll('.action-card');
            
            cards.forEach(card => {
                const name = card.querySelector('h3').textContent.toLowerCase();
                if (name.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// Invite follower to livestream
function inviteFollowerToLivestream(followerId, followerName) {
    // Check if company is streaming
    const activeStream = localStorage.getItem('activeLivestream');
    if (!activeStream) {
        showAlert('Canlı yayın başlatmanız gerekiyor', 'warning');
        return;
    }

    const stream = JSON.parse(activeStream);
    if (stream.status !== 'live') {
        showAlert('Aktif canlı yayın bulunmuyor', 'warning');
        return;
    }

    if (confirm(`${followerName} kullanıcısını canlı yayına davet etmek istiyor musunuz?`)) {
        // Send invitation
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        const invitation = {
            id: Date.now(),
            streamId: stream.id,
            fromCompanyId: currentUser.id,
            fromCompanyName: currentUser.companyName || currentUser.name,
            toUserId: followerId,
            toUserName: followerName,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Save invitation
        const invitations = JSON.parse(localStorage.getItem('liveStreamInvitations') || '[]');
        invitations.push(invitation);
        localStorage.setItem('liveStreamInvitations', JSON.stringify(invitations));

        showAlert(`${followerName} kullanıcısına davet gönderildi`, 'success');
    }
}

// ============================================
// CUSTOMER - LIVESTREAMS AND FOLLOWING
// ============================================

// Load Live Streams (for customer)
function loadCustomerLiveStreams() {
    if (!window.followService) {
        console.warn('Follow service not available');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = currentUser.id;

    if (!userId) return;

    const streams = window.followService.getFollowedLiveStreams(userId);
    const streamsList = document.getElementById('liveStreamsList');

    if (!streamsList) return;

    if (streams.length === 0) {
        streamsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-broadcast-tower" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                <p>Henüz canlı yayın bulunmuyor</p>
                <p style="font-size: 14px;">Takip ettiğiniz firmalardan biri canlı yayın başlattığında burada görünecek</p>
            </div>
        `;
        return;
    }

    streamsList.innerHTML = streams.map(stream => `
        <div class="action-card" style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 5px 0; color: #dc2626; display: flex; align-items: center; gap: 10px;">
                        <span class="badge badge-danger" style="animation: pulse 2s infinite;">🔴 CANLI</span>
                        ${stream.title || 'Canlı Yayın'}
                    </h3>
                    <p style="margin: 0 0 10px 0; color: #ffffff;">
                        <i class="fas fa-building"></i> ${stream.companyName}
                    </p>
                    <p style="margin: 0; color: #999; font-size: 14px;">
                        <i class="fas fa-users"></i> ${stream.viewers || 0} İzleyici
                    </p>
                </div>
                <button class="btn btn-primary" onclick="joinCustomerLivestream('${stream.id}')">
                    <i class="fas fa-play"></i>
                    Yayına Katıl
                </button>
            </div>
        </div>
    `).join('');
}

// Load Following list (for customer)
function loadCustomerFollowing() {
    if (!window.followService) {
        console.warn('Follow service not available');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = currentUser.id;

    if (!userId) return;

    const following = window.followService.getFollowing(userId);
    const followingList = document.getElementById('followingList');

    if (!followingList) return;

    if (following.length === 0) {
        followingList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-star" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                <p>Henüz firma takip etmiyorsunuz</p>
                <p style="font-size: 14px;">Firmaları takip ederek onların canlı yayınlarını izleyebilirsiniz</p>
            </div>
        `;
        return;
    }

    followingList.innerHTML = following.map(company => `
        <div class="action-card" style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 5px 0; color: #ffffff;">${company.name}</h3>
                    <p style="margin: 0; color: #999; font-size: 14px;">
                        <span class="role-badge">${company.role}</span>
                    </p>
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
                        Takip: ${new Date(company.followedAt).toLocaleDateString('tr-TR')}
                    </p>
                </div>
                <button class="btn btn-outline btn-small" onclick="unfollowCompany('${company.id}')">
                    <i class="fas fa-star"></i>
                    Takipten Çık
                </button>
            </div>
        </div>
    `).join('');

    // Setup search
    const followingSearch = document.getElementById('followingSearch');
    if (followingSearch) {
        followingSearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const cards = followingList.querySelectorAll('.action-card');
            
            cards.forEach(card => {
                const name = card.querySelector('h3').textContent.toLowerCase();
                if (name.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// Unfollow Company
function unfollowCompany(companyId) {
    if (!window.followService) {
        console.warn('Follow service not available');
        return;
    }

    if (confirm('Bu firmayı takipten çıkmak istediğinize emin misiniz?')) {
        try {
            window.followService.unfollowCompany(companyId);
            showAlert('Firma takipten çıkarıldı', 'success');
            loadCustomerFollowing();
        } catch (e) {
            console.error('Error unfollowing company:', e);
            showAlert('Hata oluştu', 'error');
        }
    }
}

// Join customer livestream
function joinCustomerLivestream(streamId) {
    window.location.href = `../live-stream.html?id=${streamId}`;
}

// Export functions
window.loadFollowers = loadFollowers;
window.inviteFollowerToLivestream = inviteFollowerToLivestream;
window.loadCustomerLiveStreams = loadCustomerLiveStreams;
window.loadCustomerFollowing = loadCustomerFollowing;
window.unfollowCompany = unfollowCompany;
window.joinCustomerLivestream = joinCustomerLivestream;

// ============================================
// ADDITIONAL FOLLOW FUNCTIONS FOR ALL ROLES
// ============================================

// Follow a hammaddeci (for Üretici role)
function followHammaddeci(supplierId) {
    if (!window.followService) {
        console.warn('Follow service not available');
        showAlert('Takip sistemi kullanılamıyor', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const supplier = users.find(u => u.id === supplierId && u.role === 'hammaddeci');
    
    if (!supplier) {
        showAlert('Hammaddeci bulunamadı', 'error');
        return;
    }

    try {
        const followed = window.followService.followCompany(
            supplier.id,
            supplier.companyName || supplier.name,
            supplier.role
        );

        if (followed) {
            showAlert(`${supplier.companyName || supplier.name} takip edildi`, 'success');
            loadSuppliersGrid(); // Reload grid
        } else {
            showAlert('Zaten takip ediliyor', 'info');
        }
    } catch (e) {
        console.error('Error following hammaddeci:', e);
        showAlert('Hata oluştu', 'error');
    }
}

// Unfollow a hammaddeci (for Üretici role)
function unfollowHammaddeci(supplierId) {
    if (!window.followService) {
        console.warn('Follow service not available');
        return;
    }

    if (confirm('Takipten çıkmak istediğinize emin misiniz?')) {
        try {
            window.followService.unfollowCompany(supplierId);
            showAlert('Takipten çıkarıldı', 'success');
            loadSuppliersGrid();
        } catch (e) {
            console.error('Error unfollowing:', e);
            showAlert('Hata oluştu', 'error');
        }
    }
}

// Follow a producer (for Toptancı role)
function followProducer(producerId) {
    if (!window.followService) {
        console.warn('Follow service not available');
        showAlert('Takip sistemi kullanılamıyor', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const producer = users.find(u => u.id === producerId && u.role === 'uretici');
    
    if (!producer) {
        showAlert('Üretici bulunamadı', 'error');
        return;
    }

    try {
        const followed = window.followService.followCompany(
            producer.id,
            producer.companyName || producer.name,
            producer.role
        );

        if (followed) {
            showAlert(`${producer.companyName || producer.name} takip edildi`, 'success');
            loadProducers(); // Reload producers list
        } else {
            showAlert('Zaten takip ediliyor', 'info');
        }
    } catch (e) {
        console.error('Error following producer:', e);
        showAlert('Hata oluştu', 'error');
    }
}

// Unfollow a producer (for Toptancı role)
function unfollowProducer(producerId) {
    if (!window.followService) {
        console.warn('Follow service not available');
        return;
    }

    if (confirm('Takipten çıkmak istediğinize emin misiniz?')) {
        try {
            window.followService.unfollowCompany(producerId);
            showAlert('Takipten çıkarıldı', 'success');
            loadProducers();
        } catch (e) {
            console.error('Error unfollowing:', e);
            showAlert('Hata oluştu', 'error');
        }
    }
}

// Load Suppliers Grid with Follow Buttons
function loadSuppliersGrid() {
    if (!window.followService) {
        console.warn('Follow service not available');
        return;
    }

    const grid = document.getElementById('suppliersGrid');
    if (!grid) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const suppliers = users.filter(u => u.role === 'hammaddeci');
    
    if (suppliers.length === 0) {
        grid.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-box" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                <p>Henüz hammaddeci yok</p>
            </div>
        `;
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const following = window.followService.getFollowing(currentUser.id);

    grid.innerHTML = suppliers.map(supplier => {
        const isFollowing = following.some(f => f.id === supplier.id);
        
        return `
        <div class="producer-card">
            <div class="producer-header">
                <div class="producer-avatar">
                    ${(supplier.companyName || supplier.name).charAt(0)}
                </div>
                <div class="producer-info">
                    <h3>${supplier.companyName || supplier.name}</h3>
                    <p>Hammaddeci</p>
                </div>
            </div>
            <div class="producer-details">
                <p><i class="fas fa-envelope"></i> ${supplier.email}</p>
                <p><i class="fas fa-phone"></i> ${supplier.phone || '-'}</p>
            </div>
            <div class="producer-actions">
                ${isFollowing ? `
                    <button class="btn btn-success btn-small" onclick="unfollowHammaddeci('${supplier.id}')">
                        <i class="fas fa-check"></i>
                        Takip Ediliyor
                    </button>
                ` : `
                    <button class="btn btn-primary btn-small" onclick="followHammaddeci('${supplier.id}')">
                        <i class="fas fa-star"></i>
                        Takip Et
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

// Follow a wholesaler (for Satıcı role)
function followWholesaler(wholesalerId) {
    if (!window.followService) {
        console.warn('Follow service not available');
        showAlert('Takip sistemi kullanılamıyor', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const wholesaler = users.find(u => u.id === wholesalerId && u.role === 'toptanci');
    
    if (!wholesaler) {
        showAlert('Toptancı bulunamadı', 'error');
        return;
    }

    try {
        const followed = window.followService.followCompany(
            wholesaler.id,
            wholesaler.companyName || wholesaler.name,
            wholesaler.role
        );

        if (followed) {
            showAlert(`${wholesaler.companyName || wholesaler.name} takip edildi`, 'success');
            loadWholesalers();
        } else {
            showAlert('Zaten takip ediliyor', 'info');
        }
    } catch (e) {
        console.error('Error following wholesaler:', e);
        showAlert('Hata oluştu', 'error');
    }
}

// Unfollow a wholesaler
function unfollowWholesaler(wholesalerId) {
    if (!window.followService) {
        console.warn('Follow service not available');
        return;
    }

    if (confirm('Takipten çıkmak istediğinize emin misiniz?')) {
        try {
            window.followService.unfollowCompany(wholesalerId);
            showAlert('Takipten çıkarıldı', 'success');
            loadWholesalers();
        } catch (e) {
            console.error('Error unfollowing:', e);
            showAlert('Hata oluştu', 'error');
        }
    }
}

// Follow a seller (for Müşteri role)
function followSeller(sellerId) {
    if (!window.followService) {
        console.warn('Follow service not available');
        showAlert('Takip sistemi kullanılamıyor', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const seller = users.find(u => u.id === sellerId && u.role === 'satici');
    
    if (!seller) {
        showAlert('Satıcı bulunamadı', 'error');
        return;
    }

    try {
        const followed = window.followService.followCompany(
            seller.id,
            seller.companyName || seller.name,
            seller.role
        );

        if (followed) {
            showAlert(`${seller.companyName || seller.name} takip edildi`, 'success');
            loadSellers();
        } else {
            showAlert('Zaten takip ediliyor', 'info');
        }
    } catch (e) {
        console.error('Error following seller:', e);
        showAlert('Hata oluştu', 'error');
    }
}

// Unfollow a seller
function unfollowSeller(sellerId) {
    if (!window.followService) {
        console.warn('Follow service not available');
        return;
    }

    if (confirm('Takipten çıkmak istediğinize emin misiniz?')) {
        try {
            window.followService.unfollowCompany(sellerId);
            showAlert('Takipten çıkarıldı', 'success');
            loadSellers();
        } catch (e) {
            console.error('Error unfollowing:', e);
            showAlert('Hata oluştu', 'error');
        }
    }
}

// Load Sellers for Customer Panel
function loadSellers() {
    const grid = document.getElementById('sellersGrid');
    if (!grid) return;

    // Test satıcıları
    const sellers = [
        {
            id: 'satici1',
            email: 'satici1@videosat.com',
            companyName: 'Elektronik Satıcısı',
            firstName: 'Ahmet',
            lastName: 'Yılmaz',
            phone: '+90 555 111 1111',
            city: 'İstanbul',
            category: 'elektronik',
            productCount: 3,
            description: 'Elektronik ürünlerde uzman satıcı'
        },
        {
            id: 'satici2',
            email: 'satici2@videosat.com',
            companyName: 'Giyim Satıcısı',
            firstName: 'Ayşe',
            lastName: 'Demir',
            phone: '+90 555 222 2222',
            city: 'Ankara',
            category: 'giyim',
            productCount: 3,
            description: 'Moda ve giyim ürünleri'
        },
        {
            id: 'satici3',
            email: 'satici3@videosat.com',
            companyName: 'Ev Eşyası Satıcısı',
            firstName: 'Mehmet',
            lastName: 'Kaya',
            phone: '+90 555 333 3333',
            city: 'İzmir',
            category: 'ev',
            productCount: 3,
            description: 'Ev ve yaşam ürünleri'
        }
    ];
    
    if (sellers.length === 0) {
        grid.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-store" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                <p>Henüz satıcı yok</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = sellers.map(seller => {
        return `
        <div class="seller-card" style="background: #1a1a1a; border: 1px solid #404040; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
            <div class="seller-header" style="display: flex; align-items: center; margin-bottom: 15px;">
                <div class="seller-avatar" style="width: 60px; height: 60px; background: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; margin-right: 15px;">
                    ${seller.companyName.charAt(0)}
                </div>
                <div class="seller-info">
                    <h3 style="color: #ffffff; margin: 0 0 5px 0;">${seller.companyName}</h3>
                    <p style="color: #999; margin: 0;">${seller.firstName} ${seller.lastName}</p>
                </div>
            </div>
            <div class="seller-details" style="margin-bottom: 15px;">
                <p style="color: #ccc; margin: 5px 0;"><i class="fas fa-envelope" style="margin-right: 8px; color: #dc2626;"></i> ${seller.email}</p>
                <p style="color: #ccc; margin: 5px 0;"><i class="fas fa-phone" style="margin-right: 8px; color: #dc2626;"></i> ${seller.phone}</p>
                <p style="color: #ccc; margin: 5px 0;"><i class="fas fa-map-marker-alt" style="margin-right: 8px; color: #dc2626;"></i> ${seller.city}</p>
                <p style="color: #ccc; margin: 5px 0;"><i class="fas fa-tag" style="margin-right: 8px; color: #dc2626;"></i> ${seller.category}</p>
                <p style="color: #ccc; margin: 5px 0;"><i class="fas fa-box" style="margin-right: 8px; color: #dc2626;"></i> ${seller.productCount} ürün</p>
            </div>
            <div class="seller-description" style="margin-bottom: 15px;">
                <p style="color: #999; font-style: italic;">${seller.description}</p>
            </div>
            <div class="seller-actions" style="display: flex; gap: 10px;">
                <button class="btn btn-primary" onclick="viewSellerProducts('${seller.email}')" style="flex: 1;">
                    <i class="fas fa-eye"></i> Ürünleri Gör
                </button>
                <button class="btn btn-outline" onclick="followSeller('${seller.id}')" style="flex: 1;">
                    <i class="fas fa-star"></i> Takip Et
                </button>
            </div>
        </div>
        `;
    }).join('');

    // Filtreleme event listener'ları ekle
    setupSellerFilters();
}

// Satıcı filtreleme
function setupSellerFilters() {
    const categoryFilter = document.getElementById('sellerCategoryFilter');
    const priceFilter = document.getElementById('sellerPriceFilter');
    const searchInput = document.getElementById('sellerSearch');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterSellers);
    }
    if (priceFilter) {
        priceFilter.addEventListener('change', filterSellers);
    }
    if (searchInput) {
        searchInput.addEventListener('input', filterSellers);
    }
}

// Satıcıları filtrele
function filterSellers() {
    // Bu fonksiyon daha sonra geliştirilecek
    console.log('Satıcı filtreleme aktif');
}

// Satıcı ürünlerini görüntüle
function viewSellerProducts(sellerEmail) {
    console.log('Satıcı ürünleri görüntüleniyor:', sellerEmail);
    
    // Satıcı email'ine göre ürünleri yükle
    const allProducts = getAllSellerProducts();
    const sellerProducts = allProducts.filter(p => p.sellerEmail === sellerEmail);
    
    if (sellerProducts.length === 0) {
        alert('Bu satıcının henüz ürünü yok.');
        return;
    }
    
    // Ürünleri göster
    showSellerProductsModal(sellerProducts, sellerEmail);
}

// Tüm satıcı ürünlerini al
function getAllSellerProducts() {
    const allProducts = [];
    
    // Test satıcı ürünleri
    const sellers = [
        {
            email: 'satici1@videosat.com',
            companyName: 'Elektronik Satıcısı',
            products: [
                {
                    id: 11,
                    name: 'Sony WH-1000XM5',
                    category: 'elektronik',
                    unit: 'adet',
                    stock: 60,
                    price: 8500.00,
                    status: 'active',
                    description: 'Gürültü önleyici kablosuz kulaklık',
                    seller: 'Elektronik Satıcısı',
                    sellerEmail: 'satici1@videosat.com'
                },
                {
                    id: 12,
                    name: 'Canon EOS R6 Mark II',
                    category: 'elektronik',
                    unit: 'adet',
                    stock: 35,
                    price: 65000.00,
                    status: 'active',
                    description: 'Profesyonel fotoğraf makinesi',
                    seller: 'Elektronik Satıcısı',
                    sellerEmail: 'satici1@videosat.com'
                },
                {
                    id: 13,
                    name: 'iPad Pro 12.9"',
                    category: 'elektronik',
                    unit: 'adet',
                    stock: 45,
                    price: 28000.00,
                    status: 'active',
                    description: 'Güçlü tablet bilgisayar',
                    seller: 'Elektronik Satıcısı',
                    sellerEmail: 'satici1@videosat.com'
                }
            ]
        },
        {
            email: 'satici2@videosat.com',
            companyName: 'Giyim Satıcısı',
            products: [
                {
                    id: 21,
                    name: 'Zara Kış Montu',
                    category: 'giyim',
                    unit: 'adet',
                    stock: 120,
                    price: 800.00,
                    status: 'active',
                    description: 'Şık kış montu',
                    seller: 'Giyim Satıcısı',
                    sellerEmail: 'satici2@videosat.com'
                },
                {
                    id: 22,
                    name: 'H&M Gömlek',
                    category: 'giyim',
                    unit: 'adet',
                    stock: 200,
                    price: 150.00,
                    status: 'active',
                    description: 'Klasik erkek gömleği',
                    seller: 'Giyim Satıcısı',
                    sellerEmail: 'satici2@videosat.com'
                },
                {
                    id: 23,
                    name: 'LC Waikiki Jean',
                    category: 'giyim',
                    unit: 'adet',
                    stock: 300,
                    price: 250.00,
                    status: 'active',
                    description: 'Rahat denim pantolon',
                    seller: 'Giyim Satıcısı',
                    sellerEmail: 'satici2@videosat.com'
                }
            ]
        },
        {
            email: 'satici3@videosat.com',
            companyName: 'Ev Eşyası Satıcısı',
            products: [
                {
                    id: 31,
                    name: 'IKEA Yatak Odası Seti',
                    category: 'ev',
                    unit: 'set',
                    stock: 20,
                    price: 15000.00,
                    status: 'active',
                    description: 'Modern yatak odası takımı',
                    seller: 'Ev Eşyası Satıcısı',
                    sellerEmail: 'satici3@videosat.com'
                },
                {
                    id: 32,
                    name: 'Bosch Buzdolabı',
                    category: 'ev',
                    unit: 'adet',
                    stock: 30,
                    price: 25000.00,
                    status: 'active',
                    description: 'A+++ enerji verimli buzdolabı',
                    seller: 'Ev Eşyası Satıcısı',
                    sellerEmail: 'satici3@videosat.com'
                },
                {
                    id: 33,
                    name: 'Siemens Çamaşır Makinesi',
                    category: 'ev',
                    unit: 'adet',
                    stock: 25,
                    price: 18000.00,
                    status: 'active',
                    description: '9 kg yıkama kapasiteli',
                    seller: 'Ev Eşyası Satıcısı',
                    sellerEmail: 'satici3@videosat.com'
                }
            ]
        }
    ];
    
    sellers.forEach(seller => {
        allProducts.push(...seller.products);
    });
    
    return allProducts;
}

// Satıcı ürünlerini modal'da göster
function showSellerProductsModal(products, sellerEmail) {
    const seller = products[0]?.seller || 'Satıcı';
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: #1a1a1a; border-radius: 15px; padding: 30px; max-width: 800px; width: 100%; max-height: 80vh; overflow-y: auto; border: 1px solid #404040;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #ffffff; margin: 0;">${seller} - Ürünleri</h2>
                <button onclick="this.closest('.modal').remove()" style="background: none; border: none; color: #999; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            <div class="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
                ${products.map(product => `
                    <div style="background: #2a2a2a; border: 1px solid #404040; border-radius: 10px; padding: 15px;">
                        <h3 style="color: #ffffff; margin: 0 0 10px 0; font-size: 16px;">${product.name}</h3>
                        <p style="color: #999; margin: 0 0 10px 0; font-size: 14px;">${product.description}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="color: #dc2626; font-weight: bold; font-size: 18px;">₺${product.price.toLocaleString()}</span>
                            <span style="color: #999; font-size: 14px;">Stok: ${product.stock}</span>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="addToCart(${product.id})" style="flex: 1; background: #dc2626; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">
                                <i class="fas fa-cart-plus"></i> Sepete Ekle
                            </button>
                            <button onclick="buyNow(${product.id})" style="flex: 1; background: #28a745; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">
                                <i class="fas fa-shopping-bag"></i> Hemen Al
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    modal.className = 'modal';
    document.body.appendChild(modal);
}

// Sepete ekle
function addToCart(productId) {
    console.log('Ürün sepete eklendi:', productId);
    alert('Ürün sepete eklendi!');
}

// Hemen al
function buyNow(productId) {
    console.log('Ürün satın alındı:', productId);
    alert('Ürün satın alındı!');
}

// Satıcıyı takip et
function followSeller(sellerId) {
    console.log('Satıcı takip edildi:', sellerId);
    alert('Satıcı takip edildi!');
}
                ` : `
                    <button class="btn btn-primary btn-small" onclick="followSeller('${seller.id}')">
                        <i class="fas fa-star"></i>
                        Takip Et
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

// Load Wholesalers for Satıcı Panel
function loadWholesalers() {
    if (!window.followService) {
        console.warn('Follow service not available');
        return;
    }

    const grid = document.getElementById('producersGrid'); // Reuse producers grid
    if (!grid) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const wholesalers = users.filter(u => u.role === 'toptanci');
    
    if (wholesalers.length === 0) {
        grid.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-warehouse" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                <p>Henüz toptancı yok</p>
            </div>
        `;
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const following = window.followService.getFollowing(currentUser.id);

    grid.innerHTML = wholesalers.map(wholesaler => {
        const isFollowing = following.some(f => f.id === wholesaler.id);
        
        return `
        <div class="producer-card">
            <div class="producer-header">
                <div class="producer-avatar">
                    ${(wholesaler.companyName || wholesaler.name).charAt(0)}
                </div>
                <div class="producer-info">
                    <h3>${wholesaler.companyName || wholesaler.name}</h3>
                    <p>Toptancı</p>
                </div>
            </div>
            <div class="producer-details">
                <p><i class="fas fa-envelope"></i> ${wholesaler.email}</p>
                <p><i class="fas fa-phone"></i> ${wholesaler.phone || '-'}</p>
            </div>
            <div class="producer-actions">
                ${isFollowing ? `
                    <button class="btn btn-success btn-small" onclick="unfollowWholesaler('${wholesaler.id}')">
                        <i class="fas fa-check"></i>
                        Takip Ediliyor
                    </button>
                ` : `
                    <button class="btn btn-primary btn-small" onclick="followWholesaler('${wholesaler.id}')">
                        <i class="fas fa-star"></i>
                        Takip Et
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

// Export additional functions
window.followHammaddeci = followHammaddeci;
window.unfollowHammaddeci = unfollowHammaddeci;
window.followProducer = followProducer;
window.unfollowProducer = unfollowProducer;
window.followWholesaler = followWholesaler;
window.unfollowWholesaler = unfollowWholesaler;
window.followSeller = followSeller;
window.unfollowSeller = unfollowSeller;
window.loadSuppliersGrid = loadSuppliersGrid;
window.loadSellers = loadSellers;
window.loadWholesalers = loadWholesalers;

// ============================================
// BROWSER-BASED STREAMING (AWS IVS)
// ============================================

// Yayın başlat (Tarayıcıdan)
async function startBrowserStream() {
    const btn = document.getElementById('startStreamBtn');
    const status = document.getElementById('streamStatus');
    const preview = document.getElementById('browserVideoPreview');
    
    try {
        // Butonu devre dışı bırak
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Başlatılıyor...';
        
        // AWS IVS Service'i kontrol et
        if (!window.awsIVSService) {
            throw new Error('AWS IVS Service yüklü değil');
        }
        
        // Stream başlat
        const stream = await window.awsIVSService.startBrowserStream();
        
        // Video preview'i göster
        if (preview && stream) {
            preview.srcObject = stream;
            preview.style.display = 'block';
        }
        
        // UI güncelle
        btn.style.display = 'none';
        if (status) {
            status.style.display = 'block';
        }
        
        showAlert('✅ Yayın başladı! Müşterileriniz şimdi izleyebilir. 🎉', 'success');
        
    } catch (e) {
        console.error('Stream başlatma hatası:', e);
        showAlert('❌ Hata: ' + e.message, 'error');
        
        // Butonu geri getir
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-video"></i> Yayını Başlat';
    }
}

// Yayını durdur
function stopBrowserStream() {
    const btn = document.getElementById('startStreamBtn');
    const status = document.getElementById('streamStatus');
    const preview = document.getElementById('browserVideoPreview');
    
    // Stream'i durdur
    if (window.awsIVSService) {
        window.awsIVSService.stopStream();
    }
    
    // UI güncelle
    if (btn) {
        btn.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-video"></i> Yayını Başlat';
    }
    if (status) {
        status.style.display = 'none';
    }
    if (preview) {
        preview.style.display = 'none';
        preview.srcObject = null;
    }
    
    showAlert('⏹️ Yayın durduruldu', 'info');
}

// Export to window
window.startBrowserStream = startBrowserStream;
window.stopBrowserStream = stopBrowserStream;

console.log('Panel Application JavaScript Loaded Successfully');

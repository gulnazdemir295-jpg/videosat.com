(function () {
    'use strict';

    const TEMPLATE_URL = 'panel-app/templates/pos.html';
    const TAX_RATE = 0.18;

    const state = {
        role: 'satici',
        user: null,
        products: [],
        filteredProducts: [],
        cart: [],
        stats: null
    };

    const elements = {};

    document.addEventListener('DOMContentLoaded', initPanel);

    async function initPanel() {
        try {
            state.role = PanelBackend.init();
            state.user = PanelBackend.getCurrentUser();

            const templateMarkup = await loadTemplate();
            const root = document.getElementById('panelRoot');
            if (!root) {
                throw new Error('Panel kök elemanı bulunamadı.');
            }
            root.innerHTML = templateMarkup;
            mapElements();

            hydrateState();
            renderAll();
            attachEventListeners();
        } catch (error) {
            console.error('Panel yüklenirken hata oluştu:', error);
            showFallback(error);
        }
    }

    async function loadTemplate() {
        const response = await fetch(TEMPLATE_URL, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`Şablon yüklenemedi (${response.status})`);
        }
        return response.text();
    }

    function mapElements() {
        elements.sidebarTitle = document.getElementById('panelSidebarTitle');
        elements.sidebarSubtitle = document.getElementById('panelSidebarSubtitle');
        elements.roleBadge = document.getElementById('panelRoleBadge');
        elements.headerTitle = document.getElementById('panelHeaderTitle');
        elements.headerSubtitle = document.getElementById('panelHeaderSubtitle');
        elements.userChip = document.getElementById('panelUserChip');
        elements.userName = document.getElementById('panelUserName');
        elements.statTodayRevenue = document.getElementById('statTodayRevenue');
        elements.statActiveOrders = document.getElementById('statActiveOrders');
        elements.statInventoryValue = document.getElementById('statInventoryValue');
        elements.statLiveViewers = document.getElementById('statLiveViewers');
        elements.productList = document.getElementById('productList');
        elements.recentOrdersList = document.getElementById('recentOrdersList');
        elements.teamList = document.getElementById('teamList');
        elements.customerQueueList = document.getElementById('customerQueueList');
        elements.liveStatus = document.getElementById('panelLiveStatus');
        elements.liveStatusLabel = document.getElementById('panelLiveStatusLabel');
        elements.productSearchInput = document.getElementById('productSearchInput');
        elements.categoryFilter = document.getElementById('categoryFilter');
        elements.cartItems = document.getElementById('cartItems');
        elements.cartSubtotal = document.getElementById('cartSubtotal');
        elements.cartTax = document.getElementById('cartTax');
        elements.cartTotal = document.getElementById('cartTotal');
        elements.checkoutButton = document.getElementById('checkoutButton');
        elements.toast = document.getElementById('panelToast');
        elements.toastMessage = document.getElementById('panelToastMessage');
    }

    function hydrateState() {
        state.products = PanelBackend.getProducts(state.role) || [];
        state.filteredProducts = state.products.slice();
        state.cart = PanelBackend.getCart(state.role) || [];
        state.stats = PanelBackend.getDashboardStats(state.role);
    }

    function renderAll() {
        renderRoleHeader();
        renderStats();
        renderCategoryFilter();
        renderProducts();
        renderCart();
        renderRecentOrders();
        renderTeam();
        renderCustomerQueue();
        renderLiveStatus();
    }

    function renderRoleHeader() {
        const config = PanelBackend.getRoleConfig(state.role);
        const badgeIcon = config.badgeIcon || 'fa-store';
        const badgeLabel = config.badgeLabel || 'Panel';
        const headerTitle = config.title || 'VideoSat Paneli';
        const headerSubtitle = config.subtitle || 'Operasyon görünümü';

        if (elements.sidebarTitle) elements.sidebarTitle.textContent = headerTitle;
        if (elements.sidebarSubtitle) elements.sidebarSubtitle.textContent = headerSubtitle;
        if (elements.roleBadge) {
            elements.roleBadge.innerHTML = `<i class="fas ${badgeIcon}"></i> ${badgeLabel}`;
        }
        if (elements.headerTitle) elements.headerTitle.textContent = headerTitle;
        if (elements.headerSubtitle) elements.headerSubtitle.textContent = headerSubtitle;

        const displayName = state.user?.companyName || state.user?.firstName || state.user?.email || 'Kullanıcı';
        if (elements.userName) elements.userName.textContent = displayName;
    }

    function renderStats() {
        if (!state.stats) return;
        if (elements.statTodayRevenue) elements.statTodayRevenue.textContent = state.stats.todayRevenue;
        if (elements.statActiveOrders) elements.statActiveOrders.textContent = `${state.stats.activeOrders}`;
        if (elements.statInventoryValue) elements.statInventoryValue.textContent = state.stats.inventoryValue;

        const liveInfo = PanelBackend.getLiveSession(state.role);
        if (elements.statLiveViewers) {
            elements.statLiveViewers.textContent = liveInfo?.viewers != null ? `${liveInfo.viewers}` : '0';
        }
    }

    function renderCategoryFilter() {
        if (!elements.categoryFilter) return;
        const categories = Array.from(new Set(state.products.map((product) => product.category || '-')));
        const options = ['<option value="">Tüm kategoriler</option>'];
        categories.sort().forEach((category) => {
            options.push(`<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`);
        });
        elements.categoryFilter.innerHTML = options.join('');
    }

    function renderProducts() {
        if (!elements.productList) return;
        if (!state.filteredProducts.length) {
            elements.productList.innerHTML = '<div class="panel-empty-state">Arama kriterlerine uygun ürün bulunamadı.</div>';
            return;
        }

        elements.productList.innerHTML = state.filteredProducts
            .map((product) => {
                const priceLabel = PanelBackend.formatCurrency(product.price || 0);
                const stockLabel = `${product.stock || 0} ${product.unit || 'adet'}`;
                return `
                    <article class="product-card" data-product-id="${product.id}">
                        <h3>${escapeHtml(product.name)}</h3>
                        <p>${escapeHtml(product.category || 'Genel')}</p>
                        <span class="product-stock"><i class="fas fa-cubes"></i> ${escapeHtml(stockLabel)}</span>
                        <span class="product-price">${priceLabel}</span>
                    </article>
                `;
            })
            .join('');

        elements.productList.querySelectorAll('.product-card').forEach((card) => {
            card.addEventListener('click', () => {
                const productId = card.getAttribute('data-product-id');
                if (productId) {
                    handleAddToCart(productId);
                }
            });
        });
    }

    function renderCart() {
        if (!elements.cartItems) return;
        if (!state.cart.length) {
            elements.cartItems.innerHTML = '<div class="panel-empty-state">Sepetiniz boş. Ürün kartına tıklayarak ürün ekleyin.</div>';
        } else {
            elements.cartItems.innerHTML = state.cart
                .map((item) => {
                    const total = PanelBackend.formatCurrency(item.price * item.quantity);
                    return `
                        <div class="cart-item" data-item-id="${item.id}">
                            <div>
                                <h4>${escapeHtml(item.name)}</h4>
                                <span>${item.quantity} × ${PanelBackend.formatCurrency(item.price)}</span>
                            </div>
                            <div class="cart-item-controls">
                                <button type="button" data-action="decrease"><i class="fas fa-minus"></i></button>
                                <span>${item.quantity}</span>
                                <button type="button" data-action="increase"><i class="fas fa-plus"></i></button>
                                <button type="button" data-action="remove" title="Kaldır"><i class="fas fa-times"></i></button>
                            </div>
                        </div>
                    `;
                })
                .join('');
        }

        bindCartButtons();
        updateCartTotals();
    }

    function renderRecentOrders() {
        if (!elements.recentOrdersList) return;
        const orders = PanelBackend.getRecentOrders(state.role) || [];
        if (!orders.length) {
            elements.recentOrdersList.innerHTML = '<li class="panel-sidebar-item panel-empty-state">Henüz sipariş yok</li>';
            return;
        }

        elements.recentOrdersList.innerHTML = orders
            .map((order) => {
                const label = PanelBackend.formatCurrency(order.total || 0);
                const date = formatRelative(order.createdAt);
                const status = (order.status || '').toLowerCase();
                return `
                    <li class="panel-sidebar-item">
                        <strong>${escapeHtml(order.customer || order.id)}</strong>
                        <span>${escapeHtml(order.id || '')} · ${label}</span>
                        <span>${date} · ${status.toUpperCase()}</span>
                    </li>
                `;
            })
            .join('');
    }

    function renderTeam() {
        if (!elements.teamList) return;
        const members = PanelBackend.getTeamMembers(state.role) || [];
        if (!members.length) {
            elements.teamList.innerHTML = '<li class="panel-sidebar-item panel-empty-state">Takım ataması yapılmadı</li>';
            return;
        }
        elements.teamList.innerHTML = members
            .map((member) => `
                <li class="panel-sidebar-item">
                    <strong>${escapeHtml(member.name)}</strong>
                    <span>${escapeHtml(member.title || '')}</span>
                    <span>${escapeHtml((member.status || '').toUpperCase())}</span>
                </li>
            `)
            .join('');
    }

    function renderCustomerQueue() {
        if (!elements.customerQueueList) return;
        const queue = PanelBackend.getCustomerQueue(state.role) || [];
        if (!queue.length) {
            elements.customerQueueList.innerHTML = '<li class="panel-sidebar-item panel-empty-state">Bekleyen müşteri yok</li>';
            return;
        }
        elements.customerQueueList.innerHTML = queue
            .map((item) => `
                <li class="panel-sidebar-item">
                    <strong>${escapeHtml(item.name)}</strong>
                    <span>${escapeHtml(item.channel || '-')}</span>
                    <span>Bekleme: ${escapeHtml(item.wait || '-')}</span>
                </li>
            `)
            .join('');
    }

    function renderLiveStatus() {
        if (!elements.liveStatus || !elements.liveStatusLabel) return;
        const liveInfo = PanelBackend.getLiveSession(state.role) || {};
        const isOnline = Boolean(liveInfo.online);
        elements.liveStatusLabel.textContent = isOnline ? `Aktif · ${liveInfo.viewers || 0} izleyici` : 'Yayın Kapalı';
        elements.liveStatus.setAttribute('data-online', String(isOnline));
    }

    function attachEventListeners() {
        if (elements.productSearchInput) {
            elements.productSearchInput.addEventListener('input', applyFilters);
        }
        if (elements.categoryFilter) {
            elements.categoryFilter.addEventListener('change', applyFilters);
        }
        if (elements.checkoutButton) {
            elements.checkoutButton.addEventListener('click', handleCheckout);
        }
    }

    function bindCartButtons() {
        if (!elements.cartItems) return;
        elements.cartItems.querySelectorAll('.cart-item button').forEach((button) => {
            const action = button.getAttribute('data-action');
            const parent = button.closest('.cart-item');
            if (!action || !parent) return;
            const itemId = parent.getAttribute('data-item-id');
            button.addEventListener('click', () => handleCartAction(itemId, action));
        });
    }

    function handleAddToCart(productId) {
        const product = state.products.find((item) => item.id === productId);
        if (!product) {
            showToast('Ürün bulunamadı.', 'error');
            return;
        }

        const existing = state.cart.find((item) => item.id === productId);
        if (existing) {
            existing.quantity += 1;
        } else {
            state.cart.push({
                id: product.id,
                name: product.name,
                price: Number(product.price || 0),
                quantity: 1
            });
        }
        persistCart();
        renderCart();
        showToast(`${product.name} sepete eklendi.`);
    }

    function handleCartAction(itemId, action) {
        if (!itemId) return;
        const item = state.cart.find((entry) => entry.id === itemId);
        if (!item) return;

        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease') {
            item.quantity = Math.max(1, item.quantity - 1);
        } else if (action === 'remove') {
            state.cart = state.cart.filter((entry) => entry.id !== itemId);
        }
        persistCart();
        renderCart();
    }

    function updateCartTotals() {
        const totals = state.cart.reduce(
            (acc, item) => {
                const lineTotal = item.price * item.quantity;
                acc.subtotal += lineTotal;
                return acc;
            },
            { subtotal: 0 }
        );
        totals.tax = totals.subtotal * TAX_RATE;
        totals.total = totals.subtotal + totals.tax;

        if (elements.cartSubtotal) elements.cartSubtotal.textContent = PanelBackend.formatCurrency(totals.subtotal);
        if (elements.cartTax) elements.cartTax.textContent = PanelBackend.formatCurrency(totals.tax);
        if (elements.cartTotal) elements.cartTotal.textContent = PanelBackend.formatCurrency(totals.total);

        state.cartTotals = totals;
    }

    function persistCart() {
        PanelBackend.saveCart(state.role, state.cart);
    }

    function applyFilters() {
        const search = (elements.productSearchInput?.value || '').trim().toLowerCase();
        const category = elements.categoryFilter?.value || '';

        state.filteredProducts = state.products.filter((product) => {
            const matchesSearch = !search || `${product.name} ${product.category} ${product.id}`.toLowerCase().includes(search);
            const matchesCategory = !category || (product.category || '').toLowerCase() === category.toLowerCase();
            return matchesSearch && matchesCategory;
        });

        renderProducts();
    }

    function handleCheckout() {
        if (!state.cart.length) {
            showToast('Sepet boş. Satış tamamlanamadı.', 'error');
            return;
        }
        updateCartTotals();
        const totals = state.cartTotals || { subtotal: 0, tax: 0, total: 0 };
        const order = PanelBackend.createOrder(state.role, {
            subtotal: totals.subtotal,
            tax: totals.tax,
            total: totals.total,
            items: state.cart,
            status: 'tamamlandı',
            customer: state.user?.companyName || state.user?.email || 'VideoSat Müşterisi'
        });

        state.cart = [];
        persistCart();
        renderCart();
        state.stats = PanelBackend.getDashboardStats(state.role);
        renderStats();
        renderRecentOrders();
        showToast(`Satış tamamlandı (#${order.id}).`);
    }

    function showToast(message, type = 'success') {
        if (!elements.toast || !elements.toastMessage) {
            alert(message);
            return;
        }
        elements.toastMessage.textContent = message;
        elements.toast.setAttribute('data-visible', 'true');
        elements.toast.dataset.type = type;
        clearTimeout(elements.toast._timeout);
        elements.toast._timeout = setTimeout(() => {
            elements.toast.setAttribute('data-visible', 'false');
        }, 2600);
    }

    function showFallback(error) {
        const root = document.getElementById('panelRoot');
        if (!root) return;
        root.innerHTML = `
            <div class="panel-noscript" role="alert">
                <h1>Panel yüklenemedi</h1>
                <p>${escapeHtml(error.message || 'Bilinmeyen hata')}</p>
                <p>Lütfen sayfayı yenileyin veya teknik destek ile iletişime geçin.</p>
            </div>
        `;
    }

    function formatRelative(value) {
        if (!value) return '';
        const date = new Date(value);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.round(diffMs / 60000);
        if (diffMinutes < 1) return 'Az önce';
        if (diffMinutes < 60) return `${diffMinutes} dk önce`;
        const diffHours = Math.round(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} saat önce`;
        const diffDays = Math.round(diffHours / 24);
        if (diffDays < 7) return `${diffDays} gün önce`;
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long' });
    }

    function escapeHtml(value) {
        return (value == null ? '' : String(value))
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();

// Product data
const products = [
    { id: 1, name: "Tuğla (1000 Adet)", price: 850, stock: 500, unit: "paket", icon: "🧱" },
    { id: 2, name: "Çimento (50kg)", price: 450, stock: 200, unit: "çuval", icon: "🏗️" },
    { id: 3, name: "Kum (1 Ton)", price: 650, stock: 150, unit: "ton", icon: "🏖️" },
    { id: 4, name: "Demir (12mm)", price: 5200, stock: 80, unit: "ton", icon: "⚙️" },
    { id: 5, name: "PVC Pencere", price: 1250, stock: 45, unit: "adet", icon: "🪟" },
    { id: 6, name: "Çelik Kapı", price: 3200, stock: 30, unit: "adet", icon: "🚪" },
    { id: 7, name: "Fayans (m²)", price: 85, stock: 300, unit: "m²", icon: "🧩" },
    { id: 8, name: "Seramik (m²)", price: 120, stock: 250, unit: "m²", icon: "🔷" },
    { id: 9, name: "Laminat Parke (m²)", price: 180, stock: 180, unit: "m²", icon: "🟨" },
    { id: 10, name: "Boyalar (20L)", price: 750, stock: 120, unit: "kutu", icon: "🎨" },
    { id: 11, name: "Çatı Kiremiti", price: 8, stock: 5000, unit: "adet", icon: "🏠" },
    { id: 12, name: "İzolasyon (m²)", price: 45, stock: 400, unit: "m²", icon: "🔲" }
];

let cart = [];
let selectedPaymentMethod = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateTime();
    setInterval(updateTime, 1000);
});

// Update time
function updateTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = 
        now.toLocaleTimeString('tr-TR');
    document.getElementById('currentDate').textContent = 
        now.toLocaleDateString('tr-TR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
}

// Load products
function loadProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = products.map(product => `
        <div class="product-card" onclick="addToCart(${product.id})">
            <div class="product-img">${product.icon}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">${product.price.toFixed(2)} ₺/${product.unit}</div>
            <div class="product-stock">Stok: ${product.stock} ${product.unit}</div>
        </div>
    `).join('');

    // Search functionality
    document.getElementById('searchBar').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const cards = grid.querySelectorAll('.product-card');
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    });
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            icon: product.icon,
            quantity: 1
        });
    }

    updateCart();
    showNotification('Ürün sepete eklendi!');
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, item.quantity + change);
        updateCart();
    }
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Sepetiniz boş</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.icon} ${item.name}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <input type="number" class="qty-input" value="${item.quantity}" 
                               onchange="setQuantity(${item.id}, this.value)" min="1">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <span style="margin-left: 10px; color: #666;">${item.unit}</span>
                    </div>
                </div>
                <div class="cart-item-price">${(item.price * item.quantity).toFixed(2)} ₺</div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    updateSummary();
}

// Set quantity
function setQuantity(productId, value) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, parseInt(value) || 1);
        updateCart();
    }
}

// Update summary
function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal * 0.10; // 10% discount
    const total = subtotal - discount;

    document.getElementById('subtotal').textContent = subtotal.toFixed(2) + ' ₺';
    document.getElementById('discount').textContent = '-' + discount.toFixed(2) + ' ₺';
    document.getElementById('total').textContent = total.toFixed(2) + ' ₺';
}

// Show payment modal
function showPaymentModal(method) {
    if (cart.length === 0) {
        showNotification('Sepetiniz boş!', 'error');
        return;
    }

    selectedPaymentMethod = method;
    const modal = document.getElementById('paymentModal');
    const modalBody = document.getElementById('modalBody');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal * 0.10;
    const total = subtotal - discount;

    let paymentForm = '';
    
    switch(method) {
        case 'cash':
            paymentForm = `
                <h3 style="margin-bottom: 20px; color: #28a745;">
                    <i class="fas fa-money-bill-wave"></i> Nakit Ödeme
                </h3>
                <p style="margin-bottom: 20px;">
                    Toplam Tutar: <strong>${total.toFixed(2)} ₺</strong>
                </p>
                <label>Verilen Tutar:</label>
                <input type="number" id="cashGiven" class="discount-input" placeholder="0.00" min="${total}" step="0.01">
                <div id="changeAmount" style="margin-top: 15px; font-size: 20px; font-weight: bold; color: #28a745;">
                    Para Üstü: 0.00 ₺
                </div>
                <button onclick="processPayment('cash')" 
                        style="width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 10px; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 20px;">
                    <i class="fas fa-check"></i> Ödemeyi Tamamla
                </button>
            `;
            
            document.getElementById('cashGiven').addEventListener('input', function() {
                const given = parseFloat(this.value) || 0;
                const change = given - total;
                document.getElementById('changeAmount').textContent = 
                    `Para Üstü: ${change.toFixed(2)} ₺`;
            });
            break;
            
        case 'card':
            paymentForm = `
                <h3 style="margin-bottom: 20px; color: #007bff;">
                    <i class="fas fa-credit-card"></i> Kart Ödeme
                </h3>
                <p style="margin-bottom: 20px;">
                    Toplam Tutar: <strong>${total.toFixed(2)} ₺</strong>
                </p>
                <label>Kart Numarası:</label>
                <input type="text" id="cardNumber" class="discount-input" placeholder="0000 0000 0000 0000" maxlength="19">
                <label style="margin-top: 15px;">Son Kullanma Tarihi:</label>
                <input type="text" id="cardExpiry" class="discount-input" placeholder="MM/YY" maxlength="5">
                <label style="margin-top: 15px;">CVV:</label>
                <input type="text" id="cardCvv" class="discount-input" placeholder="000" maxlength="3">
                <button onclick="processPayment('card')" 
                        style="width: 100%; padding: 15px; background: #007bff; color: white; border: none; border-radius: 10px; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 20px;">
                    <i class="fas fa-check"></i> Ödemeyi Tamamla
                </button>
            `;
            break;
            
        case 'online':
            paymentForm = `
                <h3 style="margin-bottom: 20px; color: #ffc107;">
                    <i class="fas fa-globe"></i> Online Ödeme
                </h3>
                <p style="margin-bottom: 20px;">
                    Toplam Tutar: <strong>${total.toFixed(2)} ₺</strong>
                </p>
                <p style="margin-bottom: 20px; padding: 15px; background: #fff3cd; border-radius: 10px; color: #856404;">
                    <i class="fas fa-info-circle"></i> Ödeme işlemi yönlendirilicektir...
                </p>
                <button onclick="processPayment('online')" 
                        style="width: 100%; padding: 15px; background: #ffc107; color: #333; border: none; border-radius: 10px; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 20px;">
                    <i class="fas fa-external-link-alt"></i> Ödeme Sayfasına Git
                </button>
            `;
            break;
    }
    
    modalBody.innerHTML = paymentForm;
    modal.style.display = 'block';
}

// Close payment modal
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Process payment
async function processPayment(method) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal * 0.10;
    const total = subtotal - discount;
    
    // Validate payment based on method
    if (method === 'cash') {
        const cashGiven = parseFloat(document.getElementById('cashGiven').value) || 0;
        if (cashGiven < total) {
            alert('Yetersiz ödeme!');
            return;
        }
    }
    
    try {
        // Create order
        if (window.orderService) {
            const orderData = {
                customer: {
                    id: 'POS-' + Date.now(),
                    name: 'POS Müşteri',
                    type: 'walk_in'
                },
                items: cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: total,
                shippingAddress: null,
                paymentMethod: method
            };
            
            const order = await window.orderService.createOrder(orderData);
            
            // Process payment
            if (window.paymentService) {
                const paymentData = {
                    method: method,
                    iban: method === 'bank_transfer' ? 'TR330000000000000000000000' : null
                };
                
                const paymentResult = await window.orderService.processOrderPayment(order.id, paymentData);
                
                if (paymentResult.success) {
                    showReceipt(order, paymentResult);
                    cart = [];
                    updateCart();
                    closePaymentModal();
                } else {
                    alert('Ödeme başarısız: ' + paymentResult.message);
                }
            } else {
                // Fallback without payment service
                showReceipt(order, { reference: 'MOCK-' + Date.now() });
                cart = [];
                updateCart();
                closePaymentModal();
            }
        } else {
            // Fallback without order service
            showSimpleReceipt(total, method);
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert('Ödeme işlemi sırasında bir hata oluştu: ' + error.message);
    }
}

// Show receipt
function showReceipt(order, paymentResult) {
    alert(`✅ ÖDEME BAŞARILI!\n\n` +
        `Sipariş No: ${order.orderNumber}\n` +
        `Toplam: ${order.totalAmount.toFixed(2)} ₺\n` +
        `Ödeme: ${paymentResult.reference}\n` +
        `Tarih: ${new Date().toLocaleString('tr-TR')}`);
}

// Simple receipt (fallback)
function showSimpleReceipt(total, method) {
    alert(`✅ ÖDEME BAŞARILI!\n\n` +
        `Toplam: ${total.toFixed(2)} ₺\n` +
        `Ödeme Yöntemi: ${method}\n` +
        `Tarih: ${new Date().toLocaleString('tr-TR')}`);
    
    // Save to localStorage (fallback)
    const transactions = JSON.parse(localStorage.getItem('posTransactions') || '[]');
    transactions.push({
        method: method,
        amount: total,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('posTransactions', JSON.stringify(transactions));
    
    cart = [];
    updateCart();
    closePaymentModal();
}


// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('paymentModal');
    if (event.target === modal) {
        closePaymentModal();
    }
}

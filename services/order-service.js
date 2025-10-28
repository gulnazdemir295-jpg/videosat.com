// Order Service - Backend Simulation
class OrderService {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('orders') || '[]');
        this.tracking = JSON.parse(localStorage.getItem('cargoTracking') || '[]');
    }

    // Create New Order
    async createOrder(orderData) {
        console.log('📦 Creating new order...', orderData);
        
        const order = {
            id: this.generateOrderId(),
            orderNumber: this.generateOrderNumber(),
            customer: orderData.customer,
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            shippingAddress: orderData.shippingAddress,
            status: 'pending',
            paymentMethod: orderData.paymentMethod || 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.orders.push(order);
        this.saveOrders();

        return order;
    }

    // Update Order Status
    async updateOrderStatus(orderId, status, notes = '') {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            throw new Error('Sipariş bulunamadı');
        }

        order.status = status;
        order.updatedAt = new Date().toISOString();
        
        if (notes) {
            if (!order.notes) order.notes = [];
            order.notes.push({
                timestamp: new Date().toISOString(),
                status: status,
                note: notes
            });
        }

        this.saveOrders();

        // Auto-generate tracking for 'shipped' status
        if (status === 'shipped' && !order.trackingNumber) {
            order.trackingNumber = this.generateTrackingNumber();
            this.createTrackingInfo(order);
        }

        return order;
    }

    // Create Tracking Info
    createTrackingInfo(order) {
        const tracking = {
            orderId: order.id,
            orderNumber: order.orderNumber,
            trackingNumber: order.trackingNumber,
            status: 'in_transit',
            currentLocation: 'Depo - İstanbul',
            destination: order.shippingAddress?.city || 'Bilinmiyor',
            estimatedDelivery: this.calculateDeliveryDate(),
            timeline: [
                {
                    date: new Date().toISOString(),
                    location: 'Depo - İstanbul',
                    status: 'Kargoya verildi',
                    description: 'Sipariş depodan çıktı'
                }
            ]
        };

        this.tracking.push(tracking);
        this.saveTracking();

        return tracking;
    }

    // Update Tracking Status
    updateTrackingStatus(trackingNumber, location, status, description) {
        const tracking = this.tracking.find(t => t.trackingNumber === trackingNumber);
        if (!tracking) {
            throw new Error('Takip numarası bulunamadı');
        }

        tracking.currentLocation = location;
        tracking.status = status;

        tracking.timeline.push({
            date: new Date().toISOString(),
            location: location,
            status: status,
            description: description
        });

        this.saveTracking();

        // Update order status based on tracking
        const order = this.orders.find(o => o.trackingNumber === trackingNumber);
        if (order) {
            if (status === 'delivered') {
                order.status = 'delivered';
                order.deliveredAt = new Date().toISOString();
            } else if (status === 'out_for_delivery') {
                order.status = 'out_for_delivery';
            }
            this.saveOrders();
        }

        return tracking;
    }

    // Get Order by ID
    getOrderById(orderId) {
        return this.orders.find(o => o.id === orderId);
    }

    // Get Orders by Customer
    getOrdersByCustomer(customerId) {
        return this.orders.filter(o => o.customer.id === customerId);
    }

    // Get Tracking by Number
    getTrackingByNumber(trackingNumber) {
        return this.tracking.find(t => t.trackingNumber === trackingNumber);
    }

    // Process Payment for Order
    async processOrderPayment(orderId, paymentData) {
        const order = this.getOrderById(orderId);
        if (!order) {
            throw new Error('Sipariş bulunamadı');
        }

        // Use payment service
        if (window.paymentService) {
            const paymentResult = await window.paymentService.processPayment({
                orderId: orderId,
                amount: order.totalAmount,
                method: paymentData.method,
                customer: order.customer,
                iban: paymentData.iban
            });

            if (paymentResult.success) {
                order.status = 'paid';
                order.paymentStatus = 'completed';
                order.paymentReference = paymentResult.reference;
                this.saveOrders();

                // Auto-confirm paid orders
                if (paymentData.autoConfirm) {
                    await this.updateOrderStatus(orderId, 'confirmed', 'Ödeme alındı, sipariş onaylandı');
                }
            }

            return paymentResult;
        } else {
            throw new Error('Payment service not available');
        }
    }

    // Calculate Delivery Date
    calculateDeliveryDate(days = 3) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    // Generate Order ID
    generateOrderId() {
        return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Generate Order Number
    generateOrderNumber() {
        const year = new Date().getFullYear();
        const num = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        return `VS${year}${num}`;
    }

    // Generate Tracking Number
    generateTrackingNumber() {
        return `VS-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Save Orders
    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    // Save Tracking
    saveTracking() {
        localStorage.setItem('cargoTracking', JSON.stringify(this.tracking));
    }

    // Get Order Statistics
    getOrderStatistics() {
        const total = this.orders.length;
        const pending = this.orders.filter(o => o.status === 'pending').length;
        const confirmed = this.orders.filter(o => o.status === 'confirmed').length;
        const shipped = this.orders.filter(o => o.status === 'shipped' || o.status === 'out_for_delivery').length;
        const delivered = this.orders.filter(o => o.status === 'delivered').length;
        
        return {
            total,
            pending,
            confirmed,
            shipped,
            delivered
        };
    }
}

// Export order service instance
const orderService = new OrderService();
window.orderService = orderService;

console.log('✅ Order Service initialized');
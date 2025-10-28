// WebSocket Service - Mock Implementation
class WebSocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.listeners = {};
    }

    // Connect to WebSocket server (mock)
    connect() {
        console.log('🔌 WebSocket bağlantısı başlatılıyor (simüle)...');
        
        // Simulate connection
        setTimeout(() => {
            this.isConnected = true;
            this.onOpen();
        }, 500);
    }

    // Handle connection open
    onOpen() {
        console.log('✅ WebSocket bağlantısı kuruldu');
        this.emit('connect', { status: 'connected' });
    }

    // Send message
    send(event, data) {
        if (this.isConnected) {
            console.log(`📤 Event: ${event}`, data);
            this.handleMessage(event, data);
        } else {
            console.error('❌ WebSocket bağlı değil');
        }
    }

    // Handle incoming message (mock)
    handleMessage(event, data) {
        // Simulate message handling
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                setTimeout(() => callback(data), 100);
            });
        }
    }

    // Listen to events
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    // Remove event listener
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    // Emit event to listeners
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    // Disconnect
    disconnect() {
        console.log('🔌 WebSocket bağlantısı kapatılıyor...');
        this.isConnected = false;
        this.emit('disconnect', { status: 'disconnected' });
    }

    // Check connection status
    getStatus() {
        return {
            connected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts
        };
    }
}

// Export WebSocket service instance
const websocketService = new WebSocketService();
window.websocketService = websocketService;

console.log('✅ WebSocket Service initialized (mock)');


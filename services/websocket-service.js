// WebSocket Service - Mock Implementation
class WebSocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.listeners = {};
        this.wsUrl = null;
        this.init();
    }
    
    init() {
        // WebSocket URL'ini belirle
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            if (hostname === 'basvideo.com' || hostname.includes('basvideo.com')) {
                this.wsUrl = 'wss://basvideo.com/ws';
            } else {
                this.wsUrl = 'ws://localhost:3000/ws';
            }
        }
    }

    // Connect to WebSocket server
    connect() {
        // Gerçek WebSocket server yoksa mock kullan
        if (!this.wsUrl) {
            console.log('🔌 WebSocket bağlantısı başlatılıyor (simüle)...');
            
            // Simulate connection
            setTimeout(() => {
                this.isConnected = true;
                this.onOpen();
            }, 500);
            return;
        }
        
        // Gerçek WebSocket bağlantısı (backend'de WebSocket server varsa)
        try {
            console.log(`🔌 WebSocket bağlantısı başlatılıyor: ${this.wsUrl}`);
            this.socket = new WebSocket(this.wsUrl);
            
            this.socket.onopen = () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.onOpen();
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data.event || 'message', data);
                } catch (error) {
                    this.handleMessage('message', { data: event.data });
                }
            };
            
            this.socket.onerror = (error) => {
                console.error('❌ WebSocket hatası:', error);
                this.emit('error', error);
            };
            
            this.socket.onclose = () => {
                this.isConnected = false;
                this.emit('disconnect', { status: 'disconnected' });
                
                // Otomatik yeniden bağlanma
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
                }
            };
        } catch (error) {
            console.warn('⚠️ WebSocket bağlantısı kurulamadı, mock mod kullanılıyor:', error);
            // Fallback: Mock bağlantı
            setTimeout(() => {
                this.isConnected = true;
                this.onOpen();
            }, 500);
        }
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


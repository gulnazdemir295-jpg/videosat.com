/**
 * Messaging Service - Genel Mesajlaşma Servisi
 * Kullanıcılar arası doğrudan mesajlaşma, mesaj geçmişi, real-time mesajlaşma
 */

class MessagingService {
    constructor() {
        this.messages = [];
        this.conversations = [];
        this.currentConversation = null;
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        
        this.loadMessages();
        this.loadConversations();
        this.initializeEventListeners();
    }

    /**
     * Event listener'ları başlat
     */
    initializeEventListeners() {
        // Storage event listener (çoklu sekme desteği)
        window.addEventListener('storage', (e) => {
            if (e.key === 'messages' || e.key === 'conversations') {
                this.loadMessages();
                this.loadConversations();
                this.notifyListeners('messagesUpdated');
            }
        });
    }

    /**
     * WebSocket bağlantısı kur
     */
    connectWebSocket() {
        try {
            const apiBaseURL = this.getAPIBaseURL();
            // Socket.io için base URL (port olmadan)
            const wsBaseURL = apiBaseURL.replace('/api', '').replace('https://', 'https://').replace('http://', 'http://');
            
            // Socket.io CDN'den yükle (eğer yoksa)
            if (typeof io === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
                script.onload = () => {
                    this.initializeSocketIO(wsBaseURL);
                };
                script.onerror = () => {
                    console.warn('⚠️ Socket.io CDN yüklenemedi, LocalStorage kullanılacak');
                    this.simulateWebSocket();
                };
                document.head.appendChild(script);
            } else {
                this.initializeSocketIO(wsBaseURL);
            }
        } catch (error) {
            console.error('❌ WebSocket bağlantı hatası:', error);
            this.simulateWebSocket();
        }
    }

    /**
     * Socket.io bağlantısını başlat
     */
    initializeSocketIO(wsBaseURL) {
        try {
            this.socket = io(wsBaseURL, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: this.maxReconnectAttempts,
                withCredentials: true
            });

            this.socket.on('connect', () => {
                console.log('✅ WebSocket bağlantısı kuruldu');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                
                // Kullanıcı kimlik doğrulaması
                const currentUserId = this.getCurrentUserId();
                if (currentUserId) {
                    this.socket.emit('authenticate', { userId: currentUserId, email: currentUserId });
                }
                
                this.notifyListeners('connected');
            });

            this.socket.on('authenticated', (data) => {
                if (data.success) {
                    console.log('✅ WebSocket kimlik doğrulandı');
                } else {
                    console.warn('⚠️ WebSocket kimlik doğrulama başarısız:', data.error);
                }
            });

            this.socket.on('disconnect', () => {
                console.log('⚠️ WebSocket bağlantısı kesildi');
                this.isConnected = false;
                this.notifyListeners('disconnected');
                this.attemptReconnect();
            });

            this.socket.on('message', (data) => {
                this.handleIncomingMessage(data);
            });

            this.socket.on('messageSent', (data) => {
                // Gönderilen mesajın onayı
                this.updateMessage(data);
                this.notifyListeners('messageSent', data);
            });

            this.socket.on('messageRead', (data) => {
                this.handleMessageRead(data);
            });

            this.socket.on('error', (error) => {
                console.error('❌ WebSocket hatası:', error);
                this.notifyListeners('error', error);
            });
        } catch (error) {
            console.error('❌ Socket.io başlatma hatası:', error);
            this.simulateWebSocket();
        }
    }

    /**
     * WebSocket simülasyonu (LocalStorage tabanlı)
     */
    simulateWebSocket() {
        console.log('📡 WebSocket simülasyonu başlatıldı');
        this.isConnected = true;
        
        // LocalStorage'dan yeni mesajları kontrol et
        setInterval(() => {
            this.checkForNewMessages();
        }, 2000);
    }

    /**
     * Yeni mesajları kontrol et
     */
    checkForNewMessages() {
        try {
            const storedMessages = JSON.parse(localStorage.getItem('messages') || '[]');
            const lastMessageId = this.messages.length > 0 
                ? Math.max(...this.messages.map(m => m.id || 0))
                : 0;

            const newMessages = storedMessages.filter(m => 
                (m.id || 0) > lastMessageId && 
                m.receiverId === this.getCurrentUserId()
            );

            if (newMessages.length > 0) {
                newMessages.forEach(msg => {
                    this.handleIncomingMessage(msg);
                });
            }
        } catch (error) {
            console.error('Yeni mesaj kontrol hatası:', error);
        }
    }

    /**
     * API Base URL al
     */
    getAPIBaseURL() {
        if (typeof window.getAPIBaseURL === 'function') {
            return window.getAPIBaseURL();
        }
        
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        if (hostname === 'basvideo.com' || hostname.includes('basvideo.com')) {
            return 'https://api.basvideo.com/api';
        }
        
        const port = window.DEFAULT_BACKEND_PORT || 3000;
        return `${protocol}//${hostname}:${port}/api`;
    }

    /**
     * Mevcut kullanıcı ID'sini al
     */
    getCurrentUserId() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            return currentUser.email || currentUser.id || null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Mesaj gönder
     */
    async sendMessage(toUserId, message, type = 'text', metadata = {}) {
        try {
            const currentUserId = this.getCurrentUserId();
            if (!currentUserId) {
                throw new Error('Kullanıcı girişi yapılmamış');
            }

            if (!toUserId || !message) {
                throw new Error('Alıcı ve mesaj gerekli');
            }

            const messageData = {
                id: Date.now() + Math.random(),
                senderId: currentUserId,
                receiverId: toUserId,
                message: message.trim(),
                type: type, // text, image, file, system
                metadata: metadata,
                timestamp: new Date().toISOString(),
                read: false,
                status: 'sending' // sending, sent, delivered, read
            };

            // LocalStorage'a ekle
            this.messages.push(messageData);
            this.saveMessages();

            // Backend'e gönder
            try {
                const response = await fetch(`${this.getAPIBaseURL()}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        toUserId,
                        message,
                        type,
                        metadata
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    messageData.id = result.id || messageData.id;
                    messageData.status = 'sent';
                    this.updateMessage(messageData);
                } else {
                    messageData.status = 'failed';
                    this.updateMessage(messageData);
                    throw new Error('Mesaj gönderilemedi');
                }
            } catch (error) {
                console.warn('Backend mesaj gönderme hatası (LocalStorage kullanılıyor):', error);
                messageData.status = 'sent'; // LocalStorage'da sent olarak işaretle
                this.updateMessage(messageData);
            }

            // WebSocket ile gönder (varsa)
            if (this.isConnected && this.socket) {
                this.socket.emit('sendMessage', messageData);
            }

            // Conversation güncelle
            this.updateConversation(toUserId, messageData);

            // Event fire
            this.notifyListeners('messageSent', messageData);

            return messageData;
        } catch (error) {
            console.error('Mesaj gönderme hatası:', error);
            throw error;
        }
    }

    /**
     * Mesaj al
     */
    handleIncomingMessage(messageData) {
        try {
            // Zaten var mı kontrol et
            const existingIndex = this.messages.findIndex(m => m.id === messageData.id);
            
            if (existingIndex >= 0) {
                // Güncelle
                this.messages[existingIndex] = { ...this.messages[existingIndex], ...messageData };
            } else {
                // Yeni mesaj ekle
                this.messages.push(messageData);
            }

            this.saveMessages();

            // Conversation güncelle
            const senderId = messageData.senderId;
            this.updateConversation(senderId, messageData);

            // Event fire
            this.notifyListeners('messageReceived', messageData);

            // Bildirim gönder
            if (messageData.receiverId === this.getCurrentUserId()) {
                this.sendNotification(messageData);
            }
        } catch (error) {
            console.error('Gelen mesaj işleme hatası:', error);
        }
    }

    /**
     * Mesaj okundu işaretle
     */
    async markAsRead(messageId) {
        try {
            const message = this.messages.find(m => m.id === messageId);
            if (!message) return;

            message.read = true;
            message.readAt = new Date().toISOString();
            this.updateMessage(message);

            // Backend'e bildir
            try {
                await fetch(`${this.getAPIBaseURL()}/messages/${messageId}/read`, {
                    method: 'PUT',
                    credentials: 'include'
                });
            } catch (error) {
                console.warn('Backend okundu işaretleme hatası:', error);
            }

            // WebSocket ile bildir
            if (this.isConnected && this.socket) {
                this.socket.emit('markAsRead', { messageId });
            }

            this.notifyListeners('messageRead', message);
        } catch (error) {
            console.error('Okundu işaretleme hatası:', error);
        }
    }

    /**
     * Mesaj okundu işaretleme (gelen)
     */
    handleMessageRead(data) {
        const message = this.messages.find(m => m.id === data.messageId);
        if (message) {
            message.read = true;
            message.readAt = data.readAt || new Date().toISOString();
            this.updateMessage(message);
            this.notifyListeners('messageRead', message);
        }
    }

    /**
     * Mesajları al
     */
    getMessages(userId = null, limit = 50) {
        let filteredMessages = this.messages;

        if (userId) {
            const currentUserId = this.getCurrentUserId();
            filteredMessages = this.messages.filter(m => 
                (m.senderId === userId && m.receiverId === currentUserId) ||
                (m.senderId === currentUserId && m.receiverId === userId)
            );
        }

        // Tarihe göre sırala
        filteredMessages.sort((a, b) => {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });

        return filteredMessages.slice(-limit);
    }

    /**
     * Mesaj geçmişi al
     */
    getMessageHistory(conversationId, limit = 100) {
        return this.getMessages(conversationId, limit);
    }

    /**
     * Conversation'ları al
     */
    getConversations() {
        const currentUserId = this.getCurrentUserId();
        if (!currentUserId) return [];

        // Son mesajları conversation'lara göre grupla
        const conversationMap = {};

        this.messages.forEach(message => {
            const otherUserId = message.senderId === currentUserId 
                ? message.receiverId 
                : message.senderId;

            if (!conversationMap[otherUserId]) {
                conversationMap[otherUserId] = {
                    userId: otherUserId,
                    userName: this.getUserName(otherUserId),
                    lastMessage: null,
                    lastMessageTime: null,
                    unreadCount: 0
                };
            }

            const conversation = conversationMap[otherUserId];
            const messageTime = new Date(message.timestamp);

            if (!conversation.lastMessageTime || messageTime > conversation.lastMessageTime) {
                conversation.lastMessage = message;
                conversation.lastMessageTime = messageTime;
            }

            if (!message.read && message.receiverId === currentUserId) {
                conversation.unreadCount++;
            }
        });

        // Array'e çevir ve sırala
        const conversations = Object.values(conversationMap);
        conversations.sort((a, b) => {
            return (b.lastMessageTime || 0) - (a.lastMessageTime || 0);
        });

        return conversations;
    }

    /**
     * Kullanıcı adını al
     */
    getUserName(userId) {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === userId || u.id === userId);
            return user ? (user.name || user.email) : userId;
        } catch (error) {
            return userId;
        }
    }

    /**
     * Conversation güncelle
     */
    updateConversation(userId, message) {
        const conversation = this.conversations.find(c => c.userId === userId);
        
        if (conversation) {
            conversation.lastMessage = message;
            conversation.lastMessageTime = new Date(message.timestamp);
        } else {
            this.conversations.push({
                userId,
                userName: this.getUserName(userId),
                lastMessage: message,
                lastMessageTime: new Date(message.timestamp),
                unreadCount: 0
            });
        }

        this.saveConversations();
    }

    /**
     * Mesaj güncelle
     */
    updateMessage(message) {
        const index = this.messages.findIndex(m => m.id === message.id);
        if (index >= 0) {
            this.messages[index] = message;
            this.saveMessages();
        }
    }

    /**
     * Mesajları kaydet
     */
    saveMessages() {
        try {
            localStorage.setItem('messages', JSON.stringify(this.messages));
        } catch (error) {
            console.error('Mesaj kaydetme hatası:', error);
        }
    }

    /**
     * Mesajları yükle
     */
    loadMessages() {
        try {
            const stored = localStorage.getItem('messages');
            this.messages = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Mesaj yükleme hatası:', error);
            this.messages = [];
        }
    }

    /**
     * Conversation'ları kaydet
     */
    saveConversations() {
        try {
            localStorage.setItem('conversations', JSON.stringify(this.conversations));
        } catch (error) {
            console.error('Conversation kaydetme hatası:', error);
        }
    }

    /**
     * Conversation'ları yükle
     */
    loadConversations() {
        try {
            const stored = localStorage.getItem('conversations');
            this.conversations = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Conversation yükleme hatası:', error);
            this.conversations = [];
        }
    }

    /**
     * Bildirim gönder
     */
    sendNotification(message) {
        try {
            if (window.notificationService) {
                window.notificationService.showNotification({
                    title: this.getUserName(message.senderId),
                    message: message.message,
                    type: 'message',
                    data: message
                });
            }
        } catch (error) {
            console.error('Bildirim gönderme hatası:', error);
        }
    }

    /**
     * Event listener'lar
     */
    listeners = {};

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    notifyListeners(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Event listener hatası:', error);
                }
            });
        }
    }

    /**
     * Yeniden bağlanmayı dene
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Maksimum yeniden bağlanma denemesi aşıldı');
            return;
        }

        this.reconnectAttempts++;
        console.log(`🔄 Yeniden bağlanma denemesi ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

        setTimeout(() => {
            this.connectWebSocket();
        }, this.reconnectDelay);
    }

    /**
     * Bağlantıyı kapat
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
    }

    /**
     * Mesaj ara
     */
    searchMessages(query, userId = null) {
        const lowerQuery = query.toLowerCase();
        let filteredMessages = this.messages;

        if (userId) {
            const currentUserId = this.getCurrentUserId();
            filteredMessages = this.messages.filter(m => 
                (m.senderId === userId && m.receiverId === currentUserId) ||
                (m.senderId === currentUserId && m.receiverId === userId)
            );
        }

        return filteredMessages.filter(m => 
            m.message.toLowerCase().includes(lowerQuery)
        ).sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
    }

    /**
     * Okunmamış mesaj sayısı
     */
    getUnreadCount(userId = null) {
        const currentUserId = this.getCurrentUserId();
        if (!currentUserId) return 0;

        let unreadMessages = this.messages.filter(m => 
            !m.read && m.receiverId === currentUserId
        );

        if (userId) {
            unreadMessages = unreadMessages.filter(m => m.senderId === userId);
        }

        return unreadMessages.length;
    }

    /**
     * Mesaj sil
     */
    deleteMessage(messageId) {
        const index = this.messages.findIndex(m => m.id === messageId);
        if (index >= 0) {
            this.messages.splice(index, 1);
            this.saveMessages();
            this.notifyListeners('messageDeleted', { messageId });
            return true;
        }
        return false;
    }
}

// Export
const messagingService = new MessagingService();
window.messagingService = messagingService;

// WebSocket bağlantısını başlat
if (typeof window !== 'undefined') {
    // Sayfa yüklendiğinde bağlan
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            messagingService.connectWebSocket();
        });
    } else {
        messagingService.connectWebSocket();
    }
}

console.log('✅ Messaging Service initialized');


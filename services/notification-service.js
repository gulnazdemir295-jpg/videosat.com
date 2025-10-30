// VideoSat Platform - Notification Service
// Gerçek zamanlı bildirim sistemi

class NotificationService {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isConnected = false;
        this.listeners = new Map();
        this.messageQueue = [];
        
        this.init();
    }

    init() {
        console.log('🔔 Notification Service başlatılıyor...');
        this.connect();
    }

    connect() {
        try {
            // WebSocket bağlantısı (gerçek sunucu için)
            // this.ws = new WebSocket('wss://your-websocket-server.com/notifications');
            
            // Simülasyon için localStorage tabanlı sistem
            this.setupLocalStorageSimulation();
            
            console.log('✅ Notification Service bağlandı');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // Kuyruktaki mesajları gönder
            this.processMessageQueue();
            
        } catch (error) {
            console.error('❌ Notification Service bağlantı hatası:', error);
            this.handleReconnect();
        }
    }

    setupLocalStorageSimulation() {
        // localStorage tabanlı simülasyon sistemi
        this.isConnected = true;
        
        // Periyodik olarak bildirimleri kontrol et
        setInterval(() => {
            this.checkForNotifications();
        }, 2000);
        
        console.log('📱 LocalStorage simülasyon sistemi aktif');
    }

    checkForNotifications() {
        if (!this.isConnected) return;

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!currentUser.email) return;

        // Müşteri için canlı yayın bildirimlerini kontrol et
        if (currentUser.role === 'musteri') {
            this.checkCustomerNotifications(currentUser);
        }

        // Satıcı için bildirimleri kontrol et
        if (currentUser.role === 'satici') {
            this.checkSellerNotifications(currentUser);
        }
    }

    checkCustomerNotifications(user) {
        // Canlı yayın başlatıldığında müşteriye bildirim gönder
        const activeStreams = JSON.parse(localStorage.getItem('activeLivestreams') || '[]');
        const userNotifications = JSON.parse(localStorage.getItem(`customerNotifications_${user.email}`) || '[]');
        
        activeStreams.forEach(stream => {
            // Bu stream için bildirim isteği var mı kontrol et
            const notificationRequests = JSON.parse(localStorage.getItem('customerLiveStreamNotifications') || '[]');
            const userRequest = notificationRequests.find(req => 
                req.sellerEmail === stream.sellerEmail && 
                req.status === 'pending' &&
                !userNotifications.some(notif => notif.streamId === stream.id)
            );

            if (userRequest) {
                this.sendCustomerNotification(user.email, {
                    type: 'live_stream_started',
                    title: 'Canlı Yayın Başladı!',
                    message: `${stream.seller} canlı yayına başladı. ${userRequest.productName} ürünü tanıtılıyor.`,
                    streamId: stream.id,
                    seller: stream.seller,
                    productName: userRequest.productName,
                    timestamp: new Date().toISOString()
                });

                // Bildirim isteğini tamamlandı olarak işaretle
                userRequest.status = 'completed';
                localStorage.setItem('customerLiveStreamNotifications', JSON.stringify(notificationRequests));
            }
        });
    }

    checkSellerNotifications(user) {
        // Satıcıya gelen bildirim isteklerini kontrol et
        const sellerNotifications = JSON.parse(localStorage.getItem(`sellerNotifications_${user.email}`) || '[]');
        const unreadCount = sellerNotifications.filter(n => n.status === 'unread').length;
        
        if (unreadCount > 0) {
            this.updateSellerNotificationBadge(unreadCount);
        }
    }

    sendCustomerNotification(userEmail, notification) {
        console.log('📱 Müşteriye bildirim gönderiliyor:', notification);
        
        // Bildirimi kaydet
        let notifications = JSON.parse(localStorage.getItem(`customerNotifications_${userEmail}`) || '[]');
        notifications.push(notification);
        localStorage.setItem(`customerNotifications_${userEmail}`, JSON.stringify(notifications));
        
        // UI'da bildirim göster
        this.showNotification(notification);
        
        // Event listener'ları tetikle
        this.emit('notification', notification);
    }

    sendSellerNotification(sellerEmail, notification) {
        console.log('📱 Satıcıya bildirim gönderiliyor:', notification);
        
        // Bildirimi kaydet
        let notifications = JSON.parse(localStorage.getItem(`sellerNotifications_${sellerEmail}`) || '[]');
        notifications.push(notification);
        localStorage.setItem(`sellerNotifications_${sellerEmail}`, JSON.stringify(notifications));
        
        // UI'da bildirim göster
        this.showNotification(notification);
        
        // Event listener'ları tetikle
        this.emit('notification', notification);
    }

    showNotification(notification) {
        // Bildirim popup'ı oluştur
        const notificationElement = document.createElement('div');
        notificationElement.className = 'notification-popup';
        notificationElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1a1a1a;
            border: 1px solid #dc2626;
            border-radius: 10px;
            padding: 15px 20px;
            color: white;
            z-index: 10000;
            max-width: 350px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
        `;

        notificationElement.innerHTML = `
            <div style="display: flex; align-items: start; gap: 10px;">
                <div style="color: #dc2626; font-size: 20px;">
                    <i class="fas fa-bell"></i>
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; color: #ffffff; font-size: 16px;">
                        ${notification.title}
                    </h4>
                    <p style="margin: 0; color: #ccc; font-size: 14px; line-height: 1.4;">
                        ${notification.message}
                    </p>
                    ${notification.type === 'live_stream_started' ? `
                        <button onclick="joinLiveStream('${notification.streamId}')" 
                                style="background: #dc2626; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin-top: 10px; font-size: 14px;">
                            <i class="fas fa-play"></i> Yayına Katıl
                        </button>
                    ` : ''}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: #999; cursor: pointer; font-size: 18px;">
                    ×
                </button>
            </div>
        `;

        // CSS animasyonu ekle
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-popup {
                    animation: slideIn 0.3s ease-out;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notificationElement);

        // 5 saniye sonra otomatik kapat
        setTimeout(() => {
            if (notificationElement.parentElement) {
                notificationElement.remove();
            }
        }, 5000);
    }

    updateSellerNotificationBadge(count) {
        const badge = document.getElementById('navNotificationBadge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // Event listener sistemi
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Notification listener hatası:', error);
                }
            });
        }
    }

    // Bildirim isteği gönder
    requestLiveStreamNotification(productId, sellerEmail, productName) {
        const notification = {
            id: Date.now(),
            type: 'live_stream_request',
            message: `Müşteri ${productName} ürünü için canlı yayın bildirimi istedi`,
            productName: productName,
            sellerEmail: sellerEmail,
            timestamp: new Date().toISOString(),
            status: 'unread'
        };

        this.sendSellerNotification(sellerEmail, notification);
    }

    // Canlı yayın başlatıldığında bildirim gönder
    notifyLiveStreamStarted(streamData) {
        console.log('📡 Canlı yayın başlatıldı, bildirimler gönderiliyor:', streamData);
        
        // Stream verisini kaydet
        let activeStreams = JSON.parse(localStorage.getItem('activeLivestreams') || '[]');
        activeStreams.push(streamData);
        localStorage.setItem('activeLivestreams', JSON.stringify(activeStreams));

        // Bu satıcı için bildirim isteği olan müşterilere bildirim gönder
        const notificationRequests = JSON.parse(localStorage.getItem('customerLiveStreamNotifications') || '[]');
        const relevantRequests = notificationRequests.filter(req => 
            req.sellerEmail === streamData.sellerEmail && req.status === 'pending'
        );

        relevantRequests.forEach(request => {
            // Müşteri email'ini bul (simülasyon için)
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const customer = users.find(u => u.role === 'musteri');
            
            if (customer) {
                this.sendCustomerNotification(customer.email, {
                    type: 'live_stream_started',
                    title: 'Canlı Yayın Başladı!',
                    message: `${streamData.seller} canlı yayına başladı. ${request.productName} ürünü tanıtılıyor.`,
                    streamId: streamData.id,
                    seller: streamData.seller,
                    productName: request.productName,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    // Canlı yayına katıl
    joinLiveStream(streamId) {
        console.log('🎥 Canlı yayına katılıyor:', streamId);
        window.location.href = `../live-stream.html?join=${streamId}`;
    }

    // Bağlantı kesilirse yeniden bağlan
    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Yeniden bağlanma denemesi ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('❌ Maksimum yeniden bağlanma denemesi aşıldı');
        }
    }

    // Bağlantıyı kapat
    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        this.isConnected = false;
        console.log('🔌 Notification Service bağlantısı kapatıldı');
    }
}

// Global instance oluştur
window.notificationService = new NotificationService();

// Global fonksiyonlar
window.joinLiveStream = function(streamId) {
    window.notificationService.joinLiveStream(streamId);
};

console.log('✅ Notification Service yüklendi');

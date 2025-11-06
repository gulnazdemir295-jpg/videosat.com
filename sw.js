/**
 * Service Worker - VideoSat PWA
 * Offline support ve caching
 */

const CACHE_NAME = 'videosat-pwa-v1';
const RUNTIME_CACHE = 'videosat-runtime-v1';
const STATIC_CACHE = 'videosat-static-v1';

// Cache edilecek statik dosyalar
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.min.js',
    '/config/backend-config.js',
    '/services/i18n-service.js',
    '/services/analytics-service.js',
    '/services/messaging-service.js',
    '/services/push-notification-service.js',
    '/components/language-selector.html',
    '/live-stream.html',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
    console.log('✅ Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('✅ Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('❌ Service Worker: Cache error:', error);
            })
    );
    
    // Activate immediately
    self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== RUNTIME_CACHE && 
                            cacheName !== CACHE_NAME) {
                            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
    
    // Take control of all pages
    return self.clients.claim();
});

// Fetch Event - Network first, cache fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests (except CDN)
    if (url.origin !== location.origin && 
        !url.href.includes('cdnjs.cloudflare.com') &&
        !url.href.includes('cdn.jsdelivr.net')) {
        return;
    }
    
    // API requests - Network first
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone response for cache
                    const responseClone = response.clone();
                    
                    // Cache successful responses
                    if (response.status === 200) {
                        caches.open(RUNTIME_CACHE)
                            .then((cache) => {
                                cache.put(request, responseClone);
                            });
                    }
                    
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache
                    return caches.match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            
                            // Return offline response
                            return new Response(
                                JSON.stringify({ 
                                    error: 'Offline', 
                                    message: 'İnternet bağlantınızı kontrol edin' 
                                }),
                                {
                                    status: 503,
                                    headers: { 'Content-Type': 'application/json' }
                                }
                            );
                        });
                })
        );
        return;
    }
    
    // Static assets - Cache first
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Not in cache, fetch from network
                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone response for cache
                        const responseClone = response.clone();
                        
                        caches.open(RUNTIME_CACHE)
                            .then((cache) => {
                                cache.put(request, responseClone);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Network failed, return offline page if available
                        if (request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Push Notification Event
self.addEventListener('push', (event) => {
    console.log('📬 Service Worker: Push notification received');
    
    let notificationData = {
        title: 'VideoSat',
        body: 'Yeni bildirim',
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        tag: 'videosat-notification',
        requireInteraction: false
    };
    
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                ...notificationData,
                ...data
            };
        } catch (error) {
            notificationData.body = event.data.text();
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon || '/icon-192x192.png',
            badge: notificationData.badge || '/icon-96x96.png',
            tag: notificationData.tag,
            requireInteraction: notificationData.requireInteraction,
            data: notificationData.data || {},
            actions: notificationData.actions || [],
            vibrate: notificationData.vibrate || [200, 100, 200]
        })
    );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Service Worker: Notification clicked');
    
    event.notification.close();
    
    const notificationData = event.notification.data || {};
    const urlToOpen = notificationData.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if window is already open
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Background Sync Event (for offline actions)
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Background sync:', event.tag);
    
    if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages());
    }
    
    if (event.tag === 'sync-orders') {
        event.waitUntil(syncOrders());
    }
});

// Sync Messages
async function syncMessages() {
    // Get pending messages from IndexedDB
    // Send to server
    // Clear from IndexedDB
    console.log('📨 Syncing messages...');
}

// Sync Orders
async function syncOrders() {
    // Get pending orders from IndexedDB
    // Send to server
    // Clear from IndexedDB
    console.log('🛒 Syncing orders...');
}

// Message Event (from main thread)
self.addEventListener('message', (event) => {
    console.log('💬 Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(RUNTIME_CACHE)
                .then((cache) => {
                    return cache.addAll(event.data.urls);
                })
        );
    }
});

console.log('✅ Service Worker loaded');


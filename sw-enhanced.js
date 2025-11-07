/**
 * Enhanced Service Worker - VideoSat PWA
 * Advanced offline support, caching strategies, and background sync
 */

const CACHE_VERSION = 'v2.1.0';
const STATIC_CACHE = `videosat-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `videosat-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `videosat-images-${CACHE_VERSION}`;
const API_CACHE = `videosat-api-${CACHE_VERSION}`;

// Cache edilecek kritik statik dosyalar
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/styles-touch-targets.css',
    '/styles-responsive-tables.css',
    '/styles-mobile.css',
    '/app.min.js',
    '/config/backend-config.js',
    '/manifest.json',
    '/favicon.ico',
    '/favicon.svg',
    '/services/mobile-form-handler.js',
    '/services/responsive-tables.js',
    '/live-stream.html',
    '/live-stream.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Cache stratejileri
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',      // Statik dosyalar için
    NETWORK_FIRST: 'network-first',  // API çağrıları için
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate', // Dinamik içerik için
    NETWORK_ONLY: 'network-only',    // Real-time veriler için
    CACHE_ONLY: 'cache-only'         // Offline fallback için
};

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing version', CACHE_VERSION);
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })))
                    .catch((error) => {
                        console.warn('⚠️ Service Worker: Some assets failed to cache:', error);
                        // Continue even if some assets fail
                        return Promise.resolve();
                    });
            })
            .then(() => {
                console.log('✅ Service Worker: Installed successfully');
                return self.skipWaiting(); // Activate immediately
            })
    );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Delete old caches that don't match current version
                        if (!cacheName.includes(CACHE_VERSION) && 
                            (cacheName.startsWith('videosat-') || cacheName.startsWith('basvideo-'))) {
                            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activated');
                return self.clients.claim(); // Take control of all pages immediately
            })
    );
});

// Fetch Event - Handle requests with different strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Determine cache strategy based on request type
    if (isStaticAsset(request.url)) {
        event.respondWith(cacheFirst(request));
    } else if (isAPIRequest(request.url)) {
        event.respondWith(networkFirst(request));
    } else if (isImageRequest(request.url)) {
        event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    } else {
        event.respondWith(networkFirst(request));
    }
});

// Cache First Strategy - For static assets
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('❌ Cache First error:', error);
        return new Response('Offline - Resource not cached', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network First Strategy - For API requests
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('📴 Network First: Offline, trying cache...');
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline fallback
        return new Response(JSON.stringify({
            error: 'Offline',
            message: 'Bağlantı yok. Lütfen internet bağlantınızı kontrol edin.'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Stale While Revalidate Strategy - For dynamic content
async function staleWhileRevalidate(request, cacheName = DYNAMIC_CACHE) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        // Network failed, return cached if available
        return cachedResponse;
    });
    
    // Return cached immediately, update in background
    return cachedResponse || fetchPromise;
}

// Background Sync - For offline actions
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Background sync', event.tag);
    
    if (event.tag === 'sync-offline-actions') {
        event.waitUntil(syncOfflineActions());
    }
});

// Sync offline actions when online
async function syncOfflineActions() {
    try {
        // Get offline actions from IndexedDB or localStorage
        const offlineActions = await getOfflineActions();
        
        for (const action of offlineActions) {
            try {
                await fetch(action.url, {
                    method: action.method,
                    body: action.body,
                    headers: action.headers
                });
                // Remove successful action
                await removeOfflineAction(action.id);
            } catch (error) {
                console.error('❌ Failed to sync action:', error);
            }
        }
    } catch (error) {
        console.error('❌ Sync error:', error);
    }
}

// Push Notification - Handle push events
self.addEventListener('push', (event) => {
    console.log('📬 Service Worker: Push notification received');
    
    let notificationData = {
        title: 'VideoSat',
        body: 'Yeni bildirim',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'videosat-notification',
        requireInteraction: false,
        data: {}
    };
    
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = { ...notificationData, ...data };
        } catch (e) {
            notificationData.body = event.data.text();
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Notification Click - Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Service Worker: Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If app is open, focus it
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open new window
                if (clients.openWindow) {
                    const url = event.notification.data?.url || '/';
                    return clients.openWindow(url);
                }
            })
    );
});

// Message Event - Handle messages from main thread
self.addEventListener('message', (event) => {
    console.log('💬 Service Worker: Message received', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'CACHE_URLS':
                cacheUrls(event.data.urls);
                break;
            case 'GET_CACHE_SIZE':
                getCacheSize().then(size => {
                    event.ports[0].postMessage({ size });
                });
                break;
            case 'CLEAR_CACHE':
                clearAllCaches().then(() => {
                    event.ports[0].postMessage({ success: true });
                });
                break;
        }
    }
});

// Helper Functions

function isStaticAsset(url) {
    return STATIC_ASSETS.some(asset => url.includes(asset)) ||
           url.includes('.css') ||
           url.includes('.js') && !url.includes('/api/') ||
           url.includes('.html') && !url.includes('/api/');
}

function isAPIRequest(url) {
    return url.includes('/api/') || 
           url.includes('/auth/') ||
           url.includes('/backend/');
}

function isImageRequest(url) {
    return url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i);
}

async function cacheUrls(urls) {
    const cache = await caches.open(DYNAMIC_CACHE);
    return Promise.all(urls.map(url => {
        return fetch(url).then(response => {
            if (response.ok) {
                return cache.put(url, response);
            }
        }).catch(err => {
            console.warn('Failed to cache URL:', url, err);
        });
    }));
}

async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        for (const key of keys) {
            const response = await cache.match(key);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }
    
    return totalSize;
}

async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(cacheNames.map(name => caches.delete(name)));
}

async function getOfflineActions() {
    // Implement IndexedDB or localStorage logic here
    // For now, return empty array
    return [];
}

async function removeOfflineAction(id) {
    // Implement removal logic here
    return Promise.resolve();
}

// Periodic Background Sync (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
        event.waitUntil(syncContent());
    }
});

async function syncContent() {
    // Sync content in background
    console.log('🔄 Service Worker: Periodic sync');
    // Implement content sync logic
}

console.log('✅ Enhanced Service Worker loaded:', CACHE_VERSION);


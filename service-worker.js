/**
 * Service Worker - Push Notification ve Offline Support
 * Web Push API, Cache Management, Background Sync
 */

const CACHE_NAME = 'basvideo-v1';
const CACHE_VERSION = '1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.min.js',
  '/live-stream.html',
  '/live-stream.js',
  '/config/backend-config.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.socket.io/4.7.2/socket.io.min.js'
];

// Install Event - Cache resources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: Installed');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('❌ Service Worker: Cache error', error);
      })
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('✅ Service Worker: Activated');
      return self.clients.claim(); // Take control of all pages
    })
  );
});

// Fetch Event - Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests (always use network)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Offline fallback
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Push Event - Handle push notifications
self.addEventListener('push', (event) => {
  console.log('📬 Service Worker: Push notification received');

  let notificationData = {
    title: 'Bildirim',
    body: 'Yeni bir bildirim var',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'notification',
    requireInteraction: false,
    data: {}
  };

  // Parse push data
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        requireInteraction: data.requireInteraction || false,
        data: data.data || {},
        actions: data.actions || []
      };
    } catch (error) {
      // Text data
      notificationData.body = event.data.text();
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: notificationData.actions,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    })
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Notification clicked', event.notification.data);

  event.notification.close();

  // Handle action buttons
  if (event.action) {
    // Action button clicked
    const action = event.action;
    const data = event.notification.data;

    // Handle different actions
    if (action === 'view') {
      event.waitUntil(
        clients.openWindow(data.url || '/')
      );
    } else if (action === 'dismiss') {
      // Just close the notification
      return;
    }
  } else {
    // Notification body clicked
    const urlToOpen = event.notification.data.url || '/';
    
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then((clientList) => {
        // Check if there's already a window/tab open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Notification Close Event
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Service Worker: Notification closed', event.notification.tag);
});

// Background Sync Event (for offline actions)
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync', event.tag);

  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  } else if (event.tag === 'sync-payments') {
    event.waitUntil(syncPayments());
  }
});

// Sync Messages
async function syncMessages() {
  try {
    // Get pending messages from IndexedDB
    // Send to backend
    // Clear from IndexedDB
    console.log('📨 Service Worker: Syncing messages');
  } catch (error) {
    console.error('❌ Service Worker: Message sync error', error);
  }
}

// Sync Payments
async function syncPayments() {
  try {
    // Get pending payments from IndexedDB
    // Send to backend
    // Clear from IndexedDB
    console.log('💳 Service Worker: Syncing payments');
  } catch (error) {
    console.error('❌ Service Worker: Payment sync error', error);
  }
}

// Message Event - Communication with main thread
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Message received', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

console.log('✅ Service Worker: Loaded');


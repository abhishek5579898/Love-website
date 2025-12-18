const CACHE_NAME = 'us-love-v2';
const STATIC_CACHE = 'us-static-v2';

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
            self.skipWaiting()
        ])
    );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - Network first for API, Cache first for static
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external API calls (Firebase, Cloudinary)
    if (url.hostname.includes('firebase') ||
        url.hostname.includes('cloudinary') ||
        url.hostname.includes('googleapis')) {
        return;
    }

    // For navigation and static assets - stale-while-revalidate
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(request).then((cachedResponse) => {
                const fetchPromise = fetch(request).then((networkResponse) => {
                    // Cache successful responses
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
            });
        })
    );
});

// Handle background sync for offline messages (future)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages());
    }
});

async function syncMessages() {
    // Future: sync queued messages when back online
    console.log('Background sync triggered');
}

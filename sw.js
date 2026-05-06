// ================================================================
// sw.js - Service Worker for Pharmacy Management System v3.0 FINAL
// Designed by Ahmed Hassan | WhatsApp: +249125000574
// ================================================================

const CACHE_NAME = 'pharmacy-cache-v5-final';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json'
];

// Install event - cache core files
self.addEventListener('install', function(e) {
    console.log('[SW] Installing v5-final...');
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('[SW] Caching core files');
            return cache.addAll(urlsToCache);
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', function(e) {
    console.log('[SW] Activating v5-final...');
    e.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(e) {
    // Skip non-GET requests and browser extensions
    if (e.request.method !== 'GET' || 
        e.request.url.indexOf('chrome-extension') !== -1 || 
        e.request.url.indexOf('extension') !== -1) {
        return;
    }
    
    // Normalize URL to avoid duplicating / and /index.html
    let requestUrl = e.request.url;
    
    if (requestUrl.endsWith('/index.html')) {
        requestUrl = requestUrl.replace('/index.html', '/');
    }
    
    // Use original request to avoid mode:navigate error
    e.respondWith(
        caches.match(e.request).then(function(response) {
            if (response) {
                return response;
            }
            
            return fetch(e.request).then(function(fetchResponse) {
                if (fetchResponse && fetchResponse.status === 200) {
                    const responseClone = fetchResponse.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(e.request, responseClone);
                    });
                }
                return fetchResponse;
            });
        }).catch(function() {
            return caches.match('/index.html');
        })
    );
});
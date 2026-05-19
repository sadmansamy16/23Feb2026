const CACHE_NAME = 'samy-hub-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/404.html',
  '/favicon.ico',
  '/manifest.json',
  '/homepage.json',
  '/redirect.json',
  '/shorturl.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install Service Worker and cache essential UI shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Worker and clear old versions if cache name updates
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy for flexible dynamic routing validation
self.addEventListener('fetch', (event) => {
  // Only handle standard HTTP/HTTPS GET requests (prevents browser extension interference)
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If valid network response, clone it into the cache for offline fallback
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails (Offline), attempt to match cache or route cleanly to root
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fall back to the index/404 shell if a custom router subpath is pulled while offline
          return caches.match('/index.html') || caches.match('/404.html');
        });
      })
  );
});

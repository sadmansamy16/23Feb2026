const CACHE_NAME = 'samy-dynamic-cache';

self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If network works, clone it to cache and return
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            })
            .catch(() => {
                // If network fails (offline), use cache
                return caches.match(event.request);
            })
    );
});

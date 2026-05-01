const CACHE_NAME = 'samy-v1';
const assets = ['/', '/index.html', '/manifest.json', '/redirect.json'];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});

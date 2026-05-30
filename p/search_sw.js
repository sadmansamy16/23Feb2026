const CACHE_NAME = 'samy-search-v1';
const ASSETS = [
  '/p/search.html',
  '/p/search_manifest.json',
  '/p/search_web_list.json',
  '/p/search_web_img.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

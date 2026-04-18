const CACHE_NAME = 'samy-root-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // BLOCK root PWA from touching the chat folder
  if (url.pathname.startsWith('/chat')) {
    return; 
  }

  // Handle everything else (Root and /2fa)
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

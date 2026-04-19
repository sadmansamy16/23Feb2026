const CACHE_NAME = 'samy-root-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // If the user is trying to access /chat, the root PWA must ignore it
  if (url.pathname.startsWith('/chat')) {
    return; 
  }

  // Handle other requests (root, /2fa, etc)
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

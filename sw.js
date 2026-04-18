const CACHE_NAME = 'samy-site-v1';

// Install event
self.addEventListener('install', (e) => {
  console.log('Root Service Worker Installed');
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // IF THE URL IS /CHAT, DO NOTHING (Let the other PWA handle it)
  if (url.pathname.startsWith('/chat')) {
    return; 
  }

  // FOR EVERYTHING ELSE (Root, /2fa, etc.), use the network
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

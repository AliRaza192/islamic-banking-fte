// Islamic Banking FTE — Service Worker
// Offline support + caching for faster loads

const CACHE_NAME = 'ib-fte-v2';

// Static assets to cache
const STATIC_ASSETS = [
  '/chat',
  '/calculators',
  '/banks',
  '/style.css',
  '/app.js',
  '/auth.js',
  '/js/calculators.js',
  '/favicon.svg'
];

// Install — cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.log('Cache install partial:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API calls — network only, never cache
  if (url.pathname.startsWith('/api/')) {
    return; // Let browser handle normally
  }

  // Static assets — cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Cache successful GET responses
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for pages
        if (event.request.destination === 'document') {
          return caches.match('/chat');
        }
      });
    })
  );
});
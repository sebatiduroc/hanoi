/* ── Service Worker — Tours de Hanoï ── */
const CACHE = 'hanoi-v1';

const PRECACHE = [
  '/hanoi/',
  '/hanoi/index.html',
  '/hanoi/icon-192.png',
  '/hanoi/icon-512.png',
  '/hanoi/manifest.json',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;900&family=Cinzel+Decorative:wght@400;700&display=swap',
];

/* ── Installation : mise en cache initiale ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

/* ── Activation : nettoyage des anciens caches ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch : cache-first, réseau en fallback ── */
self.addEventListener('fetch', e => {
  /* On ne met pas en cache les appels API JSONBin */
  if (e.request.url.includes('jsonbin.io') ||
      e.request.url.includes('emailjs.com') ||
      e.request.method !== 'GET') {
    return;
  }

  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(e.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type === 'opaque') {
              return response;
            }
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(e.request, clone));
            return response;
          })
          .catch(() => caches.match('/hanoi/index.html'));
      })
  );
});

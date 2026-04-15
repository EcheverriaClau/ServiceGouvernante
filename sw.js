// ===== SERVICE WORKER =====
const CACHE_NAME = 'menage-hotel-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/data.js',
  '/js/app.js',
  '/js/pdf.js',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

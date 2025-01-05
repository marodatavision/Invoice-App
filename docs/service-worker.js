const CACHE_NAME = 'invoice-app-cache-v1';
const urlsToCache = [
  '/', // Startseite
  '/index.html', // Hauptdatei
  '/static/js/', // JS-Dateien
  '/static/css/', // CSS-Dateien
  '/manifest.json', // PWA-Manifest
];

// Installations-Event: Ressourcen cachen
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Aktivierungs-Event: Alte Caches löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch-Event: Ressourcen aus dem Cache holen
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

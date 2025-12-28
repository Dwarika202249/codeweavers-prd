/// <reference lib="webworker" />

// bump cache name to ensure clients pick up new assets
const CACHE_NAME = 'codeweavers-v2';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - precache core assets more robustly (avoid cache.addAll failing)
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    console.log('[SW] Precaching core assets (robust)');
    // Attempt to fetch each resource and cache only successful responses
    await Promise.all(
      PRECACHE_ASSETS.map(async (url) => {
        try {
          const response = await fetch(url, { cache: 'no-cache' });
          if (response && response.ok) {
            await cache.put(url, response.clone());
            return { url, ok: true };
          }
          console.warn('[SW] Skipping cache for', url, 'status:', response && response.status);
          return { url, ok: false };
        } catch (err) {
          console.warn('[SW] Failed to fetch', url, err);
          return { url, ok: false };
        }
      })
    );
  })());
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests
  if (url.origin !== location.origin) return;

  // Skip API requests (if any in future)
  if (url.pathname.startsWith('/api/')) return;

  // For navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version or offline page
          return caches.match(request).then((cached) => {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // For static assets - cache first, network fallback
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2?|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Return cached, but also update cache in background
          fetch(request).then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response);
              });
            }
          });
          return cached;
        }
        // Not in cache, fetch and cache
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

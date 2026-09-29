/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = 'agenda-professor-ti-v1';
const OFFLINE_URL = '/';

// Core assets to cache immediately upon service worker installation
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pré-cacheando recursos do núcleo');
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stale-While-Revalidate caching strategy for high performance and offline resilience
self.addEventListener('fetch', (event) => {
  // Only handle standard GET requests (ignore API proxies or Firebase Auth popup channels)
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Ignore external API endpoints like Google APIs or Firebase to prevent corrupting caches
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/__/auth/')
  ) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Cache successful responses
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          console.warn('[Service Worker] Falha ao buscar recurso na rede, servindo do cache se disponível:', err);
          // Return offline fallback if network is down and match fails
          if (!cachedResponse && event.request.mode === 'navigate') {
            return cache.match(OFFLINE_URL);
          }
        });

        // Instant response from cache, falling back to network fetch
        return cachedResponse || fetchPromise;
      });
    })
  );
});

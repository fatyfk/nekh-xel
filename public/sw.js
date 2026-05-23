// NEKH XËL — Service Worker
// Stratégie : cache-first pour assets statiques, network-first pour navigation, offline fallback.

const CACHE_VERSION = 'nekh-v1';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Resources to pre-cache on install (app shell)
const APP_SHELL = [
  '/',
  '/quiz',
  '/competition',
  '/login',
  '/offline',
  '/manifest.json',
  '/icons/icon.svg',
];

// ── Install: pre-cache app shell ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] Pre-cache failed (ok in dev):', err))
  );
});

// ── Activate: remove old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: routing strategy ─────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Skip API routes — always network-only
  if (url.pathname.startsWith('/api/')) return;

  // Next.js static assets (content-hashed) — cache-first, never expire
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Manifest and icons — cache-first
  if (url.pathname.startsWith('/icons/') || url.pathname === '/manifest.json') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // CSV files (quiz model) — cache-first
  if (url.pathname.endsWith('.csv')) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  // Navigation requests (HTML pages) — network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Default: stale-while-revalidate for other same-origin resources
  event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
});

// ── Strategies ──────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Resource not available offline', { status: 503 });
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Try runtime cache
    const cached = await caches.match(request);
    if (cached) return cached;
    // Try static cache
    const staticCached = await caches.match(request, { cacheName: STATIC_CACHE });
    if (staticCached) return staticCached;
    // Offline fallback page
    const offline = await caches.match('/offline', { cacheName: STATIC_CACHE });
    return offline || new Response('<h1>Hors ligne</h1>', { headers: { 'Content-Type': 'text/html' }, status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache    = await caches.open(cacheName);
  const cached   = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

// ── Background sync placeholder ─────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

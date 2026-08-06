/// <reference lib="webworker" />
// public/sw.ts (ou em app/sw.ts com Next.js)
type ExtendedInstallEvent = ExtendableEvent & { waitUntil: (promise: Promise<any>) => void };
type ExtendedActivateEvent = ExtendableEvent & { waitUntil: (promise: Promise<any>) => void };
type ExtendedFetchEvent = FetchEvent & { respondWith: (promise: Promise<Response>) => void };

const CACHE_NAMES = {
  pages: 'pages-cache',
  api: 'api-cache',
  assets: 'assets-cache',
  images: 'images-cache'
};

const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/offline',
  '/styles/globals.css',
  '/app/favicon.ico'
];

self.addEventListener('install', (event: ExtendedInstallEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.assets).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendedActivateEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event: ExtendedFetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls
  if (url.pathname.startsWith('/api/')) {
    return event.respondWith(networkFirst(request, CACHE_NAMES.api));
  }

  // Images
  if (/\.(png|jpg|jpeg|svg|gif|webp)$/i.test(url.pathname)) {
    return event.respondWith(cacheFirst(request, CACHE_NAMES.images));
  }

  // Pages
  event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.pages));
});

async function networkFirst(request: Request, cacheName: string): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(request) || new Response('Offline', { status: 503 });
  }
}

async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
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
    return new Response('Image not found', { status: 404 });
  }
}

async function staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(cacheName);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  });

  return cached || fetchPromise;
}
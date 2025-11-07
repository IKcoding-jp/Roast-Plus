// Service Worker for PWA
const CACHE_NAME = 'roast-plus-v1';
const RUNTIME_CACHE = 'roast-plus-runtime-v1';

// キャッシュするリソース
const PRECACHE_URLS = [
  '/',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
];

// インストール時の処理
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// アクティベート時の処理
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => {
      return self.clients.claim();
    })
  );
});

// フェッチ時の処理（Network First戦略）
self.addEventListener('fetch', (event) => {
  // GETリクエストのみ処理
  if (event.request.method !== 'GET') {
    return;
  }

  // 外部リソース（Firebase等）はキャッシュしない
  if (event.request.url.startsWith('http') && !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // レスポンスが有効な場合、キャッシュに保存
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // ネットワークエラー時はキャッシュから取得
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // キャッシュにもない場合は、オフラインページを返す
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});


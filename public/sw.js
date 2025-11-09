// Service Worker for PWA
const CACHE_NAME = 'roast-plus-v2';
const RUNTIME_CACHE = 'roast-plus-runtime-v2';

// キャッシュするリソース
const PRECACHE_URLS = [
  '/',
  '/assignment.html',
  '/settings.html',
  '/login.html',
  '/notifications.html',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
];

// Next.jsの静的エクスポートでは、ルートパス（/assignment）は実際には/assignment.htmlとして生成される
// この関数は、ルートパスをHTMLファイルパスに変換する
function getHtmlPath(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  
  // 既に.htmlで終わっているか、拡張子がある場合はそのまま返す
  if (pathname.endsWith('.html') || pathname.match(/\.[a-zA-Z0-9]+$/)) {
    return pathname;
  }
  
  // ルートパスの場合はindex.html
  if (pathname === '/') {
    return '/index.html';
  }
  
  // その他のルートパスは.htmlを追加
  return `${pathname}.html`;
}

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

  const requestUrl = new URL(event.request.url);
  const isDocumentRequest = event.request.destination === 'document' || 
                            event.request.mode === 'navigate';

  // ドキュメントリクエストの場合、ルートパスをHTMLファイルパスに変換
  if (isDocumentRequest) {
    const htmlPath = getHtmlPath(event.request.url);
    
    // HTMLファイルパスが元のパスと異なる場合、新しいリクエストを作成
    if (htmlPath !== requestUrl.pathname) {
      const htmlUrl = new URL(htmlPath, event.request.url);
      const htmlRequest = new Request(htmlUrl.toString(), {
        method: event.request.method,
        headers: event.request.headers,
        mode: 'same-origin',
        credentials: event.request.credentials,
        redirect: event.request.redirect,
      });

      event.respondWith(
        // まず、HTMLファイルパスを試す
        fetch(htmlRequest)
          .then((response) => {
            // レスポンスが有効な場合、元のリクエストとHTMLファイルパスの両方をキャッシュに保存
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(event.request, responseToCache.clone());
                cache.put(htmlRequest, responseToCache);
              });
              return response;
            }
            // 404の場合は、元のリクエストを試す（Firebase Hostingのrewritesが適用される可能性がある）
            return fetch(event.request).then((originalResponse) => {
              if (originalResponse && originalResponse.status === 200) {
                const responseToCache = originalResponse.clone();
                caches.open(RUNTIME_CACHE).then((cache) => {
                  cache.put(event.request, responseToCache);
                  cache.put(htmlRequest, responseToCache.clone());
                });
              }
              return originalResponse;
            });
          })
          .catch(() => {
            // ネットワークエラー時はキャッシュから取得
            return caches.match(htmlRequest).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // 元のリクエストも試す
              return caches.match(event.request).then((originalCached) => {
                if (originalCached) {
                  return originalCached;
                }
                // それでも見つからない場合は、index.htmlを返す（SPAフォールバック）
                return caches.match('/index.html') || caches.match('/');
              });
            });
          })
      );
      return;
    }
  }

  // 通常のリクエスト処理
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
          
          // ドキュメントリクエストの場合、HTMLファイルパスに変換して再試行
          if (isDocumentRequest) {
            const htmlPath = getHtmlPath(event.request.url);
            if (htmlPath !== requestUrl.pathname) {
              return caches.match(htmlPath).then((htmlCachedResponse) => {
                if (htmlCachedResponse) {
                  return htmlCachedResponse;
                }
                // それでも見つからない場合は、index.htmlを返す（SPAフォールバック）
                return caches.match('/index.html') || caches.match('/');
              });
            }
            // HTMLファイルパスが同じ場合は、index.htmlを返す（SPAフォールバック）
            return caches.match('/index.html') || caches.match('/');
          }
          
          return null;
        });
      })
  );
});


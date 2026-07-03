/*
 * 04 · 缓存策略（Caching Strategies）演示 SW
 * ---------------------------------------------------------------
 * SW 是「可编程网络代理」：每个请求都进 fetch 事件，由我们决定
 * 「先查缓存还是先走网络、要不要写缓存、离线时怎么兜底」。
 * 本 SW 根据请求 URL 上的 ?strategy= 参数，对同一个 payload.json
 * 施加 5 种经典策略，并给返回结果打上来源标记，便于页面观察。
 */
const CACHE = 'caching-strategies-v1';
// App Shell 预缓存：保证离线也能打开页面本身
const SHELL = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // 演示用：装好立即接管
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// 给返回的 Response 附加来源标记（页面靠这个头判断命中了缓存还是网络）
async function tag(res, source) {
  const body = await res.clone().blob();
  const headers = new Headers(res.headers);
  headers.set('X-Cache-Source', source);
  return new Response(body, { status: res.status, statusText: res.statusText, headers });
}

// —— 5 种策略实现 ——
async function cacheFirst(req, cache) {
  const hit = await cache.match(req);
  if (hit) return tag(hit, 'cache');            // 命中缓存：极快、可离线
  const res = await fetch(req);                  // 未命中：走网络并写入缓存
  cache.put(req, res.clone());
  return tag(res, 'network');
}
async function networkFirst(req, cache) {
  try {
    const res = await fetch(req);               // 优先拿最新
    cache.put(req, res.clone());
    return tag(res, 'network');
  } catch {
    const hit = await cache.match(req);          // 断网时回退缓存
    if (hit) return tag(hit, 'cache(fallback)');
    return new Response('离线且无缓存', { status: 504 });
  }
}
async function staleWhileRevalidate(req, cache) {
  const hit = await cache.match(req);
  const networkPromise = fetch(req).then((res) => { cache.put(req, res.clone()); return res; }).catch(() => null);
  if (hit) { networkPromise; return tag(hit, 'cache(stale)'); } // 先返回旧的，后台悄悄更新
  const res = await networkPromise;
  return res ? tag(res, 'network') : new Response('离线且无缓存', { status: 504 });
}
async function cacheOnly(req, cache) {
  const hit = await cache.match(req);
  return hit ? tag(hit, 'cache') : new Response('缓存里没有该资源', { status: 504 });
}
async function networkOnly(req) {
  try { const res = await fetch(req); return tag(res, 'network'); }
  catch { return new Response('离线，networkOnly 无兜底', { status: 504 }); }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const strategy = url.searchParams.get('strategy');
  // 只有带 ?strategy= 的请求走策略分发；其余（页面/图标）用 cache-first 兜底离线
  if (strategy) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      switch (strategy) {
        case 'cache-first': return cacheFirst(event.request, cache);
        case 'network-first': return networkFirst(event.request, cache);
        case 'swr': return staleWhileRevalidate(event.request, cache);
        case 'cache-only': return cacheOnly(event.request, cache);
        case 'network-only': return networkOnly(event.request);
        default: return fetch(event.request);
      }
    })());
    return;
  }
  // App Shell：缓存优先，保证离线可打开页面
  event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
});

/*
 * 05 · 离线优先应用（Offline App）SW
 * ---------------------------------------------------------------
 * 目标：让整个应用「断网也能打开、能用」。核心手法：
 *   1) install 阶段预缓存 App Shell（骨架 HTML/CSS/JS/图标）——这是离线的地基。
 *   2) 导航请求用 Network First：有网拿最新页面，断网回退缓存的页面，
 *      连缓存都没有时兜底一张友好的 offline.html。
 *   3) 静态资源用 Cache First。
 * 「离线优先」= 先保证有一份可用的本地副本，网络只是锦上添花。
 */
const VERSION = 'offline-app-v1';
const SHELL_CACHE = `shell-${VERSION}`;
// App Shell：应用的静态骨架，预缓存后即可离线渲染
const SHELL = ['./', './index.html', './offline.html', './manifest.json', './icon.svg'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // 只处理 GET

  // 1) 导航请求（打开/刷新页面）：Network First + offline.html 兜底
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);          // 有网：拿最新页面
        const cache = await caches.open(SHELL_CACHE);
        cache.put('./index.html', fresh.clone()); // 顺手更新 Shell
        return fresh;
      } catch {
        // 断网：先回退缓存的首页，再退到专门的离线兜底页
        const cached = await caches.match('./index.html');
        return cached || caches.match('./offline.html');
      }
    })());
    return;
  }

  // 2) 其它静态资源：Cache First（命中即返回，未命中走网络并回填）
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      const cache = await caches.open(SHELL_CACHE);
      cache.put(req, res.clone());
      return res;
    } catch {
      return new Response('资源离线不可用', { status: 504 });
    }
  })());
});

/**
 * sw.js —— Service Worker 脚本（缓存策略核心）
 *
 * 本文件演示两种最常用的运行时缓存策略：
 *   1) cache-first（缓存优先）    —— 用于「不常变的静态资源」（HTML/CSS/JS/图片）
 *   2) network-first（网络优先）  —— 用于「数据接口」（要尽量新，但断网时退回缓存）
 *
 * Service Worker 生命周期：install（安装/预缓存）→ activate（激活/清理旧缓存）→ fetch（拦截请求）
 * 注意：SW 运行在独立线程，无法访问 DOM；只能通过 fetch 事件拦截网络请求。
 */

// 缓存版本号：改这个字符串即可让浏览器丢弃旧缓存（相当于给缓存加版本）
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`; // 存放静态资源的缓存桶
const DATA_CACHE = `data-${CACHE_VERSION}`;     // 存放数据接口响应的缓存桶

// install 阶段要预缓存（precache）的静态资源清单（App Shell 应用外壳）
const PRECACHE_URLS = [
  './',            // 让离线时访问根路径也能拿到 index.html
  './index.html',
  './app.js',
  './style.css',
];

/**
 * install 事件：SW 首次安装时触发。
 * 这里把「应用外壳」预先塞进缓存，保证首屏离线可用。
 */
self.addEventListener('install', (event) => {
  console.log('[SW] install：开始预缓存静态资源');
  // waitUntil 会延长 install 生命周期，直到 Promise 完成
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
      // skipWaiting：让新 SW 安装完立即进入 activate，不必等旧 SW 释放
      .then(() => self.skipWaiting())
  );
});

/**
 * activate 事件：新 SW 激活时触发。
 * 典型用途：删除旧版本缓存桶，避免磁盘越占越多。
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] activate：清理旧缓存');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          // 保留当前版本的两个桶，其它一律删除
          .filter((key) => key !== STATIC_CACHE && key !== DATA_CACHE)
          .map((key) => {
            console.log('[SW] 删除旧缓存桶：', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim()) // 立即接管所有已打开页面
  );
});

/**
 * fetch 事件：页面发出的每个请求都会先经过这里。
 * 我们按 URL 特征分流到不同缓存策略。
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 只处理 GET 请求；POST/PUT 等有副作用，不应缓存
  if (event.request.method !== 'GET') return;

  // 约定：路径里带 /api/ 的算「数据请求」→ network-first
  if (url.pathname.includes('/api/') || url.search.includes('api')) {
    event.respondWith(networkFirst(event.request));
  } else {
    // 其余（HTML/CSS/JS/图片）算「静态资源」→ cache-first
    event.respondWith(cacheFirst(event.request));
  }
});

/**
 * 策略一：cache-first（缓存优先）
 * 流程：先查缓存 → 命中直接返回（秒开、离线可用）→ 未命中再走网络并写回缓存。
 * 适用：带内容 hash 的静态资源，几乎不变，越快越好。
 */
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    console.log('[SW] cache-first 命中缓存：', request.url);
    return cached; // 命中：不走网络
  }
  console.log('[SW] cache-first 未命中，走网络：', request.url);
  try {
    const response = await fetch(request);
    // 只缓存成功的响应（status 200）
    if (response && response.status === 200) {
      cache.put(request, response.clone()); // response 只能读一次，必须 clone
    }
    return response;
  } catch (err) {
    // 网络也失败（离线且没缓存）：返回一个兜底响应
    return new Response('离线且资源未缓存', { status: 503, statusText: 'Offline' });
  }
}

/**
 * 策略二：network-first（网络优先）
 * 流程：先走网络 → 成功则返回并顺手更新缓存 → 网络失败（断网）再退回缓存。
 * 适用：数据接口，希望尽量拿最新，但断网时也能展示上次的数据。
 */
async function networkFirst(request) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const response = await fetch(request);
    console.log('[SW] network-first 走网络成功：', request.url);
    if (response && response.status === 200) {
      cache.put(request, response.clone()); // 更新缓存，供离线时使用
    }
    return response;
  } catch (err) {
    console.log('[SW] network-first 网络失败，退回缓存：', request.url);
    // ignoreSearch:true 忽略 ?ts=xxx 查询串，让不同时间戳的请求也能命中同一份缓存
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    // 缓存也没有：返回可被前端识别的离线 JSON
    return new Response(
      JSON.stringify({ offline: true, message: '当前离线且无缓存数据' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

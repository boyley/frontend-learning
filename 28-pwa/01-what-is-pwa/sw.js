/*
 * 01 · 最小 Service Worker —— 只为让本页"具备 PWA 的离线能力"
 * ------------------------------------------------------------
 * 作用：把首页与图标预缓存，断网后依旧能打开（体验"可离线"）。
 * Service Worker 本质：浏览器与网络之间的一个"可编程网络代理"，
 * 运行在独立线程、无 DOM、事件驱动、只在安全上下文（HTTPS / localhost）可用。
 */

const CACHE = 'pwa-intro-v1';
// 预缓存清单：应用外壳（App Shell）
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg'];

// install：新 SW 被检测到时触发，通常在这里预缓存资源
self.addEventListener('install', (event) => {
  // waitUntil 延长 install 生命周期，直到缓存写入完成才算安装成功
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

// activate：激活时清理旧版本缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

// fetch：拦截页面发出的每一个请求（这就是"网络代理"的核心入口）
self.addEventListener('fetch', (event) => {
  // 缓存优先：命中缓存直接返回，否则走网络（离线也能打开首页）
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

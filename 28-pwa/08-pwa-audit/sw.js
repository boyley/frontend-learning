/*
 * 08 · PWA 审计（Audit）SW
 * ---------------------------------------------------------------
 * 一个「合格」的最小 SW：预缓存 App Shell + fetch 处理，
 * 让本页满足「可离线 / 可安装」这条审计项。审计工具（Lighthouse /
 * DevTools Application）正是检查「有没有注册带 fetch 的 SW」等条件。
 */
const CACHE = 'pwa-audit-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});
// 带 fetch 处理 + 离线兜底：审计的「可离线」关键
self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    try { return await fetch(event.request); }
    catch { return (await caches.match(event.request)) || caches.match('./index.html'); }
  })());
});

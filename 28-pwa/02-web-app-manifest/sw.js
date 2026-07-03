/*
 * 02 · 用于满足"可安装"条件的最小 Service Worker
 * 可安装条件之一：注册了带 fetch 事件处理的 Service Worker。
 */
const CACHE = 'manifest-demo-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg', './icon-maskable.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});

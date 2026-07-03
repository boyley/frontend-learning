/*
 * 06 · 后台同步（Background Sync）SW
 * ---------------------------------------------------------------
 * 场景：用户离线时提交了数据，我们不想丢，也不想让他一直等。
 * 做法：把数据存进 IndexedDB「发件箱(outbox)」，注册一个 sync 标签。
 * 浏览器会在「网络恢复」时（哪怕页面已关闭）自动触发 SW 的 sync 事件，
 * 我们在事件里把发件箱里的数据一条条真正发出去（本 demo 模拟发送）。
 * 关键：event.waitUntil(promise) —— 若 promise reject，浏览器会自动重试。
 */
importScripts('./idb.js');

const CACHE = 'bg-sync-shell-v1';
const SHELL = ['./', './index.html', './idb.js', './manifest.json', './icon.svg'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
});

// 广播日志给所有页面
async function post(msg) {
  const cs = await self.clients.matchAll({ includeUncontrolled: true });
  cs.forEach((c) => c.postMessage(msg));
}

// 真正「发送」发件箱：这里用延时模拟一次网络请求（生产中换成 fetch(POST)）
async function flushOutbox() {
  const items = await idbGetAll();
  await post({ type: 'sync-start', count: items.length });
  for (const item of items) {
    // 生产写法： await fetch('/api/messages', { method:'POST', body: JSON.stringify(item) })
    await new Promise((r) => setTimeout(r, 600)); // 模拟网络往返
    await idbDelete(item.id);
    await post({ type: 'sync-sent', item });
  }
  await post({ type: 'sync-done' });
}

// 核心：sync 事件——网络恢复时由浏览器触发（页面可已关闭）
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-outbox') {
    // waitUntil 里的 promise 若 reject，浏览器会择机自动重试本次 sync
    event.waitUntil(flushOutbox());
  }
});

// 兜底：不支持 Background Sync 的浏览器，页面会发这条消息手动触发
self.addEventListener('message', (event) => {
  if (event.data === 'manual-flush') event.waitUntil(flushOutbox());
});

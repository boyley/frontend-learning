/*
 * 07 · 推送通知（Push Notification）SW
 * ---------------------------------------------------------------
 * SW 承担推送链路的「客户端后台」角色，处理两个关键事件：
 *   - push：收到推送服务投递的消息（页面可关闭，SW 被唤醒）→ 弹出通知
 *   - notificationclick：用户点击通知 → 聚焦已开窗口或打开新窗口
 * 提示：没有真实推送服务器时，可用 DevTools → Application →
 *       Service Workers 的「Push」输入框手动派发一条 push 事件来测试。
 */
const CACHE = 'push-shell-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});

// 1) push：推送服务把消息投递到用户设备时触发
self.addEventListener('push', (event) => {
  // 推送负载可能是 JSON 或纯文本，也可能为空（DevTools 测试时常为空）
  let data = { title: '📬 新消息', body: '你收到了一条推送通知', url: './index.html' };
  try { if (event.data) data = { ...data, ...event.data.json() }; }
  catch { if (event.data) data.body = event.data.text(); }

  // showNotification 返回 Promise，用 waitUntil 保证通知弹出前 SW 不被杀掉
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon.svg',
      badge: './icon.svg',
      data: { url: data.url },            // 存下点击后要打开的地址
      actions: [                          // 通知上的操作按钮
        { action: 'open', title: '查看' },
        { action: 'dismiss', title: '忽略' },
      ],
      vibrate: [80, 40, 80],
      tag: 'demo-push',                    // 同 tag 的通知会合并，避免刷屏
    })
  );
});

// 2) notificationclick：用户点击通知或其操作按钮
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || './index.html';
  event.waitUntil((async () => {
    const clientsArr = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // 若应用已有窗口，聚焦它；否则打开新窗口——避免重复开多个标签
    for (const c of clientsArr) {
      if ('focus' in c) { c.postMessage({ type: 'notification-clicked', url: targetUrl }); return c.focus(); }
    }
    if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
  })());
});

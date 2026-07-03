/*
 * 03 · Service Worker 生命周期演示
 * -------------------------------------------------
 * 通过在各生命周期事件里 postMessage 给页面，直观看到：
 *   install（安装）→ waiting（等待）→ activate（激活）→ 控制页面 → fetch 拦截
 *
 * 改这里的 VERSION 再刷新页面，即可观察"新 SW 进入 waiting、旧 SW 仍在控制"的更新过程。
 */
const VERSION = 'v1'; // ← 想体验更新时把它改成 v2 再刷新
const CACHE = `sw-lifecycle-${VERSION}`;

// 向所有受控页面广播一条生命周期日志
async function log(text) {
  const all = await self.clients.matchAll({ includeUncontrolled: true });
  for (const c of all) c.postMessage({ type: 'sw-log', version: VERSION, text });
}

// 1) install：新 SW 被检测到时触发一次，适合预缓存
self.addEventListener('install', (event) => {
  log(`install：开始安装（${VERSION}）`);
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(['./', './index.html']);
    log('install：预缓存完成，进入 waiting（等待激活）');
    // 注意：这里"没有"调用 skipWaiting()，所以能观察到 waiting 阶段。
    // 若想立即激活可解开下一行：
    // await self.skipWaiting();
  })());
});

// 2) activate：旧 SW 被替换、新 SW 开始接管时触发，适合清理旧缓存
self.addEventListener('activate', (event) => {
  log(`activate：开始激活（${VERSION}）`);
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    // clients.claim()：让当前已打开、尚未受控的页面立即被本 SW 接管
    await self.clients.claim();
    log('activate：已清理旧缓存并 clients.claim() 接管页面');
  })());
});

// 3) fetch：激活并控制页面后，页面的每个请求都会经过这里
self.addEventListener('fetch', (event) => {
  // 仅记录首页请求，避免刷屏
  if (event.request.mode === 'navigate') log(`fetch 拦截：${event.request.url}`);
  event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
});

// 4) 接收页面指令：点击"跳过等待"时立即激活 waiting 中的 SW
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    log('收到 SKIP_WAITING → skipWaiting()');
    self.skipWaiting();
  }
});

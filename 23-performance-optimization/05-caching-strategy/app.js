/**
 * app.js —— 页面主脚本（会被 SW 以 cache-first 缓存）
 * 职责：
 *   1) 注册 Service Worker
 *   2) 监听在线/离线状态
 *   3) 发起数据请求，演示 network-first 在线/离线两种表现
 */

// ---------- 工具：把日志打到页面上，方便直观观察 ----------
const logBox = document.getElementById('log');
function log(msg) {
  const time = new Date().toLocaleTimeString();
  logBox.textContent += `[${time}] ${msg}\n`;
  logBox.scrollTop = logBox.scrollHeight; // 自动滚到底
  console.log(msg);
}

// ---------- 1) 注册 Service Worker ----------
const swStatus = document.getElementById('sw-status');
if ('serviceWorker' in navigator) {
  // 必须等页面 load 后再注册，避免与首屏资源抢带宽
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        swStatus.textContent = '注册成功 ✅';
        log('Service Worker 注册成功，scope=' + reg.scope);
        log('提示：首次注册后，请刷新一次页面让 SW 开始接管请求。');
      })
      .catch((err) => {
        swStatus.textContent = '注册失败 ❌';
        log('Service Worker 注册失败：' + err.message);
        log('大概率是用 file:// 打开的。请用 npx serve 或 python3 -m http.server 启动本地服务器。');
      });
  });
} else {
  swStatus.textContent = '浏览器不支持 ❌';
}

// ---------- 2) 在线/离线状态显示 ----------
const netStatus = document.getElementById('net-status');
function refreshNetStatus() {
  if (navigator.onLine) {
    netStatus.textContent = '在线';
    netStatus.className = 'status online';
  } else {
    netStatus.textContent = '离线';
    netStatus.className = 'status offline';
  }
}
window.addEventListener('online', () => { refreshNetStatus(); log('网络已恢复：online'); });
window.addEventListener('offline', () => { refreshNetStatus(); log('网络已断开：offline'); });
refreshNetStatus();

// ---------- 3) 数据请求（network-first 由 sw.js 拦截实现）----------
document.getElementById('btn-fetch').addEventListener('click', async () => {
  // 免后端方案：请求一个真实存在的静态文件 api/time.json（路径含 /api/ → SW 走 network-first）。
  // 在线：SW 走网络拿到 200 并写入缓存；离线：SW 网络失败 → 退回上次缓存的这份 JSON。
  // 加时间戳查询参数是为了绕过浏览器 HTTP 缓存，保证请求真正到达 SW。
  const url = './api/time.json?ts=' + Date.now();
  const t0 = performance.now();
  try {
    const res = await fetch(url);
    const cost = (performance.now() - t0).toFixed(1);
    if (res.ok) {
      const text = await res.text();
      log(`数据请求成功（耗时 ${cost}ms）：${text.slice(0, 80)}`);
    } else {
      const data = await res.json().catch(() => ({}));
      log(`离线退回：${data.message || '无缓存数据'}（耗时 ${cost}ms）`);
    }
  } catch (err) {
    log('请求异常：' + err.message);
  }
});

document.getElementById('btn-clear').addEventListener('click', () => {
  logBox.textContent = '';
});

document.getElementById('btn-reload').addEventListener('click', () => {
  location.reload();
});

/**
 * BOM 浏览器对象模型（Browser Object Model）演示
 * ---------------------------------------------------------
 * BOM 以 window 为顶层全局对象，下面挂着：
 *   location  —— 当前 URL 的各部分信息与跳转能力
 *   navigator —— 浏览器/设备信息（UA、语言、在线状态）
 *   screen    —— 屏幕信息
 *   history   —— 浏览历史
 *   document  —— DOM 入口（属于 DOM，但也是 window 的属性）
 */

// ============ ① window.location 解析 ============
// location 把当前 URL 拆成若干部分，方便读取与修改
function renderLocation() {
  const loc = window.location;
  const rows = [
    ['href（完整 URL）', loc.href],
    ['protocol（协议）', loc.protocol],
    ['host（主机+端口）', loc.host || '(空，file:// 协议无 host)'],
    ['hostname（主机名）', loc.hostname || '(空)'],
    ['port（端口）', loc.port || '(默认)'],
    ['pathname（路径）', loc.pathname],
    ['search（查询串）', loc.search || '(无 ?查询)'],
    ['hash（锚点）', loc.hash || '(无 #锚点)'],
  ];
  const tbody = document.getElementById('loc-body');
  tbody.innerHTML = rows
    .map(([k, v]) => `<tr><td>${k}</td><td>${escapeHtml(v)}</td></tr>`)
    .join('');
}

// ============ ② window.navigator 信息 ============
function renderNavigator() {
  const nav = window.navigator;
  document.getElementById('nav-language').textContent = nav.language;          // 首选语言
  document.getElementById('nav-languages').textContent = (nav.languages || []).join(', ');
  document.getElementById('nav-online').textContent = nav.onLine ? '✅ 在线' : '❌ 离线'; // 网络状态
  document.getElementById('nav-platform').textContent = nav.platform || '(已弃用/未知)';
  document.getElementById('nav-ua').textContent = nav.userAgent;              // User-Agent 字符串
}

// onLine 状态会随断网/联网变化，监听 online / offline 事件实时更新
window.addEventListener('online', renderNavigator);
window.addEventListener('offline', renderNavigator);

// ============ ③ window.screen 与窗口尺寸 ============
function renderSize() {
  // screen 是物理屏幕；innerWidth/Height 是视口（含滚动条则不含）
  document.getElementById('screen-size').textContent =
    `${window.screen.width} × ${window.screen.height}`;
  document.getElementById('avail-size').textContent =
    `${window.screen.availWidth} × ${window.screen.availHeight}`;
  document.getElementById('inner-size').textContent =
    `${window.innerWidth} × ${window.innerHeight}`;
}
// 窗口缩放时 innerWidth/Height 变化，监听 resize 事件实时刷新
window.addEventListener('resize', renderSize);

// ============ ④ 交互按钮 ============

// 修改 hash（不会刷新页面，只改 location.hash，可触发 hashchange）
document.getElementById('btn-hash').addEventListener('click', function () {
  const value = 'section-' + Math.floor(Math.random() * 100);
  window.location.hash = value; // 等价于在地址栏 URL 末尾加 #section-xx
  renderLocation();             // 重新解析显示
});

// 监听 hashchange，证明 hash 变化可被感知（常用于路由）
window.addEventListener('hashchange', function () {
  document.getElementById('hash-log').textContent =
    `hashchange 触发！当前 hash = ${window.location.hash}`;
});

// 滚动到顶部（scrollTo 支持平滑滚动）
document.getElementById('btn-top').addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// reload：重新加载当前页面（演示时会刷新本页，谨慎点）
document.getElementById('btn-reload').addEventListener('click', function () {
  if (window.confirm('确定要 reload 重新加载本页吗？')) {
    window.location.reload();
  }
});

// alert / confirm / prompt 三种对话框
document.getElementById('btn-alert').addEventListener('click', function () {
  window.alert('这是 alert 弹窗：仅通知，只有一个确定按钮。');
});
document.getElementById('btn-confirm').addEventListener('click', function () {
  // confirm 返回布尔值
  const ok = window.confirm('这是 confirm：点确定返回 true，取消返回 false。');
  document.getElementById('dialog-log').textContent = `confirm 返回：${ok}`;
});
document.getElementById('btn-prompt').addEventListener('click', function () {
  // prompt 返回输入的字符串，取消则返回 null
  const name = window.prompt('这是 prompt：请输入你的名字', '访客');
  document.getElementById('dialog-log').textContent =
    name === null ? 'prompt 已取消（返回 null）' : `prompt 输入：${name}`;
});

// window.open / close（打开一个新窗口，再用返回的引用关闭它）
let openedWin = null;
document.getElementById('btn-open').addEventListener('click', function () {
  // 打开 about:blank 新窗口，宽高 400x300
  openedWin = window.open('about:blank', 'bomDemo', 'width=400,height=300');
  if (openedWin) {
    openedWin.document.write('<h2 style="font-family:sans-serif">这是 window.open 打开的新窗口</h2>');
  } else {
    document.getElementById('open-log').textContent = '被浏览器拦截了（请允许弹窗）。';
  }
});
document.getElementById('btn-close-win').addEventListener('click', function () {
  if (openedWin && !openedWin.closed) {
    openedWin.close(); // 只能关闭由脚本 open 出来的窗口
    document.getElementById('open-log').textContent = '已关闭新窗口。';
  } else {
    document.getElementById('open-log').textContent = '没有可关闭的窗口（先点「打开新窗口」）。';
  }
});

// 工具：转义 HTML，避免把 URL 里的特殊字符当标签
function escapeHtml(str) {
  return String(str).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])
  );
}

// 初始化渲染
renderLocation();
renderNavigator();
renderSize();

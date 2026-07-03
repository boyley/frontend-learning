/**
 * 03 · 资源加载错误捕获 demo
 * ---------------------------------------------------------------
 * 演示：<img>/<script>/<link> 等资源加载失败时，如何可靠捕获。
 *
 * 核心结论：
 *   资源加载失败触发的 error 事件「只在目标元素上派发，不会冒泡到 window」。
 *   因此：
 *     - window.onerror                            —— 抓不到（它面向 JS 运行时错误）
 *     - window.addEventListener('error', fn)      —— 抓不到（默认冒泡阶段，事件根本不冒泡上来）
 *     - window.addEventListener('error', fn, true)—— 能抓到（捕获阶段：事件从 window 向下传播时经过这里）
 *
 * 为验证这一点，本 demo 同时注册「冒泡阶段」和「捕获阶段」两个监听器，
 * 面板会明确标注每条错误是被谁抓到的——你会看到只有捕获阶段那个抓得到资源错误。
 */

var panelEl = document.getElementById('panel');
var emptyEl = document.getElementById('empty');
var countEl = document.getElementById('count');
var sinkEl = document.getElementById('sink');
var total = 0;

/**
 * render —— 把一条记录渲染进面板
 * @param {object} info
 * @param {'resource'|'miss'} info.type   resource=成功捕获到的资源错误；miss=用于对照的说明
 * @param {string} info.via     捕获来源（哪个监听器）
 * @param {string} info.message 概述
 * @param {string} [info.meta]  元信息（标签、URL 等）
 */
function render(info) {
  total++;
  if (emptyEl) { emptyEl.remove(); emptyEl = null; }
  console.log('[资源错误]', info.via, info.message, info);

  var row = document.createElement('div');
  row.className = 'row ' + info.type;
  row.innerHTML =
    '<div class="head">' +
      '<span class="badge">' + (info.type === 'miss' ? '对照说明' : '资源加载失败') + '</span>' +
      '<span class="via">来源：' + info.via + '</span>' +
      '<span class="time">' + new Date().toLocaleTimeString() + '</span>' +
    '</div>' +
    '<div class="msg">' + info.message + '</div>' +
    (info.meta ? '<div class="meta">' + info.meta + '</div>' : '');
  panelEl.appendChild(row);
  countEl.textContent = total + ' 条';
}

// ============ A) 捕获阶段监听（能抓到资源错误）============
// 第三个参数 true 表示在「捕获阶段」监听。事件从 window 往目标元素传播时会先经过这里，
// 所以即便资源 error 事件不冒泡，也能在捕获阶段被 window 上的监听器截获。
window.addEventListener('error', function (e) {
  // e.target 是发生错误的 DOM 元素（img/script/link…），而不是 window。
  // JS 运行时错误时 e.target === window，需要区分开。
  var target = e.target;
  var isResource = target && target !== window && (target.src || target.href);
  if (!isResource) return; // 不是资源错误（是 JS 错误），本模块不处理

  var tag = target.tagName ? target.tagName.toLowerCase() : '未知';
  var url = target.src || target.href || '(无)';
  render({
    type: 'resource',
    via: "addEventListener('error', fn, true) · 捕获阶段 ✅",
    message: '<' + tag + '> 资源加载失败',
    meta: '资源 URL：' + url + '<br/>e.target.tagName = ' + (target.tagName || '') +
          '　（注意：资源 error 事件没有 message/lineno，信息全在 e.target 上）'
  });
}, true); // ← 关键：true = 捕获阶段

// ============ B) 冒泡阶段监听（抓不到资源错误，仅用于对照）============
// 不传第三个参数（默认 false = 冒泡阶段）。资源 error 事件不冒泡，
// 所以这个监听器对资源错误「永远不会触发」——它只会抓到 JS 运行时错误。
window.addEventListener('error', function (e) {
  if (e.target && e.target !== window && (e.target.src || e.target.href)) {
    // 理论上永远进不来。写在这里是为了证明：真跑起来面板不会出现这条"冒泡抓到资源错误"。
    render({
      type: 'resource',
      via: "addEventListener('error', fn) · 冒泡阶段（不该出现！）",
      message: '<' + e.target.tagName + '> 资源加载失败',
      meta: '若你看到这条，说明浏览器行为异常'
    });
  }
}); // ← 没有第三个参数 = 冒泡阶段

// ============ 三个按钮：动态插入会加载失败的资源 ============

// ① 坏图片：img 加载失败最典型（CDN 挂了、图片被删、防盗链）
document.getElementById('btn-img').addEventListener('click', function () {
  var img = document.createElement('img');
  img.src = 'https://example.com/not-exist-' + Date.now() + '.png'; // 必然 404
  sinkEl.appendChild(img);
});

// ② 坏脚本：script 加载失败（第三方 SDK CDN 挂掉、路径拼错）
document.getElementById('btn-script').addEventListener('click', function () {
  var s = document.createElement('script');
  s.src = 'https://example.com/not-exist-sdk-' + Date.now() + '.js'; // 必然 404
  sinkEl.appendChild(s);
});

// ③ 坏样式表：link 加载失败（样式文件丢失，页面可能掉样式）
document.getElementById('btn-css').addEventListener('click', function () {
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://example.com/not-exist-' + Date.now() + '.css'; // 必然 404
  sinkEl.appendChild(link);
});

// 页面加载即给一条对照说明，帮助读者建立预期
render({
  type: 'miss',
  via: '（说明）',
  message: '已注册两个 window 上的 error 监听器：捕获阶段 ✅ 与 冒泡阶段 ❌',
  meta: '点击按钮后，你只会看到「捕获阶段」抓到资源错误；冒泡阶段那条永不出现，' +
        '这就是必须用 addEventListener("error", fn, true) 做资源监控的原因。'
});

console.log('[资源错误 SDK] 已启动：捕获阶段监听 window error');

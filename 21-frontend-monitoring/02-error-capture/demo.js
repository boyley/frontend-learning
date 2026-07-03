/**
 * 02 · JS 错误捕获 demo
 * ---------------------------------------------------------------
 * 演示三种全局错误捕获手段，把捕获结果（message/文件/行列号/stack）
 * 渲染到「捕获面板」并 console.log：
 *   A) window.onerror              —— 经典全局错误钩子
 *   B) window.addEventListener('error')       —— 标准事件监听
 *   C) window.addEventListener('unhandledrejection') —— 未处理的 Promise 拒绝
 */

var panelEl = document.getElementById('panel');
var emptyEl = document.getElementById('empty');
var countEl = document.getElementById('count');
var total = 0;

/**
 * render —— 把一条错误信息渲染进面板
 * @param {object} info
 * @param {'error'|'promise'|'resource'} info.type 分类（决定颜色）
 * @param {string} info.via   捕获来源（说明是被哪个监听器抓到的）
 * @param {string} info.message 错误信息
 * @param {string} [info.meta]  文件/行列号等元信息
 * @param {string} [info.stack] 调用栈
 */
function render(info) {
  total++;
  if (emptyEl) { emptyEl.remove(); emptyEl = null; }
  console.log('[错误捕获]', info.via, info.message, info);

  var row = document.createElement('div');
  row.className = 'row ' + info.type;
  row.innerHTML =
    '<div class="head">' +
      '<span class="badge">' + (info.type === 'promise' ? 'Promise 拒绝' : 'JS 错误') + '</span>' +
      '<span class="via">来源：' + info.via + '</span>' +
      '<span class="time">' + new Date().toLocaleTimeString() + '</span>' +
    '</div>' +
    '<div class="msg">' + info.message + '</div>' +
    (info.meta ? '<div class="meta">' + info.meta + '</div>' : '') +
    (info.stack ? '<pre>' + info.stack + '</pre>' : '');
  panelEl.appendChild(row);
  countEl.textContent = total + ' 条';
}

// ============ A) window.onerror ============
// 参数固定顺序：message（错误信息）, source（出错文件 URL）, lineno（行）, colno（列）, error（Error 对象）
window.onerror = function (message, source, lineno, colno, error) {
  render({
    type: 'error',
    via: 'window.onerror',
    message: message,
    meta: '文件：' + (source || '(inline)') + '　行:列 = ' + lineno + ':' + colno,
    stack: error && error.stack ? error.stack : '(无 stack)'
  });
  // 返回 true 阻止错误继续冒泡到浏览器默认控制台（不再打印红色报错）
  return true;
};

// ============ B) window.addEventListener('error') ============
// 与 onerror 抓的是同一批 JS 运行时错误，但拿到的是 ErrorEvent 事件对象。
// 注意：这里不加第三个参数 true（默认冒泡阶段），用于抓「JS 错误」；
//       资源加载错误需要捕获阶段（见 03 模块）。
window.addEventListener('error', function (e) {
  // e.target 是 window 说明是 JS 错误；否则是资源加载错误（本模块不重点处理）
  if (e.target !== window && e.target && e.target.tagName) return; // 资源错误交给 03 模块
  render({
    type: 'error',
    via: "addEventListener('error')",
    message: e.message,
    meta: '文件：' + (e.filename || '(inline)') + '　行:列 = ' + e.lineno + ':' + e.colno,
    stack: e.error && e.error.stack ? e.error.stack : '(无 stack)'
  });
});

// ============ C) unhandledrejection：未处理的 Promise 拒绝 ============
// 当一个 Promise 被 reject 且没有 .catch 处理时触发。原因在 e.reason 中。
window.addEventListener('unhandledrejection', function (e) {
  var reason = e.reason;
  var message = reason instanceof Error ? reason.message : String(reason);
  render({
    type: 'promise',
    via: "unhandledrejection",
    message: message,
    meta: 'e.reason 类型：' + (reason instanceof Error ? reason.name : typeof reason),
    stack: reason && reason.stack ? reason.stack : '(reason 非 Error，无 stack)'
  });
  // 阻止浏览器默认在控制台打印 "Uncaught (in promise)"
  e.preventDefault();
});

// ============ 三个按钮：制造三类错误 ============

// ① 同步错误：读取 null 的属性 —— 被 onerror / addEventListener('error') 捕获
document.getElementById('btn-sync').addEventListener('click', function () {
  var user = null;
  console.log(user.profile.name); // TypeError: Cannot read properties of null
});

// ② 未捕获 Promise：reject 一个 Error 且不写 .catch —— 被 unhandledrejection 捕获
document.getElementById('btn-promise').addEventListener('click', function () {
  new Promise(function (resolve, reject) {
    reject(new Error('接口请求失败：订单不存在'));
  });
  // 故意不加 .catch，制造 unhandledrejection
});

// ③ 手动 throw：抛一个自定义 Error —— 被 onerror / addEventListener('error') 捕获
document.getElementById('btn-throw').addEventListener('click', function () {
  throw new Error('手动抛出的业务异常：参数校验不通过');
});

console.log('[错误捕获 SDK] 已启动：onerror + addEventListener(error) + unhandledrejection');

/**
 * 01 · 前端监控体系总览 —— 一体化 mini 监控 SDK demo
 * ---------------------------------------------------------------
 * 目标：用最小代码同时演示「三大类监控」各采集一条数据：
 *   1) 错误监控（Error）    —— 全局捕获 window error
 *   2) 性能监控（Performance）—— 页面加载后读一个真实性能数值
 *   3) 行为监控（Behavior）  —— 监听一次页面点击
 * 采集到的数据统一走 report()：塞进捕获面板 + console.log。
 * （真实 SDK 的 report 会用 navigator.sendBeacon 上报到服务端，这里只做本地可视化）
 */

// ============ 通用工具：把一条采集数据渲染到「捕获面板」 ============
var panelEl = document.getElementById('panel');
var emptyEl = document.getElementById('empty');
var countEl = document.getElementById('count');
var total = 0;

/**
 * report —— 监控 SDK 的统一上报出口
 * @param {'error'|'perf'|'action'} type 监控类别
 * @param {string} title 标题（如「JS 错误」）
 * @param {string} detail 详情 HTML 片段
 */
function report(type, title, detail) {
  total++;
  if (emptyEl) { emptyEl.remove(); emptyEl = null; } // 首次采集后移除占位提示

  // 1) 控制台打点（真实项目里此处会 sendBeacon 上报）
  console.log('[监控采集]', type, title, detail);

  // 2) 渲染成一行卡片
  var badgeMap = { error: '错误监控', perf: '性能监控', action: '行为监控' };
  var row = document.createElement('div');
  row.className = 'row ' + type;
  row.innerHTML =
    '<span class="badge">' + badgeMap[type] + '</span>' +
    '<div class="body"><b>' + title + '</b><br>' + detail + '</div>' +
    '<span class="time">' + new Date().toLocaleTimeString() + '</span>';
  panelEl.appendChild(row);

  countEl.textContent = total + ' 条';
}

// ============ ① 错误监控：全局错误捕获 ============
// window.onerror 参数固定顺序：message, source, lineno, colno, error
window.onerror = function (message, source, lineno, colno, error) {
  report('error', 'JS 运行时错误', message + '<br>位置：' + lineno + ':' + colno);
  // 返回 true 可阻止错误继续抛到控制台（这里返回 true，避免红色报错刷屏）
  return true;
};

// 按钮：故意制造一个错误，触发 window.onerror
document.getElementById('btn-error').addEventListener('click', function () {
  // 访问未定义变量的属性 —— 抛出 ReferenceError / TypeError
  var obj = null;
  console.log(obj.foo.bar); // 故意报错
});

// ============ ② 性能监控：页面加载后采一个真实性能数值 ============
// 用 Performance API 读取「页面加载耗时」。用 load 事件确保各阶段时间就绪。
window.addEventListener('load', function () {
  // setTimeout 让 loadEventEnd 有值（load 回调里该字段可能还是 0）
  setTimeout(function () {
    var nav = performance.getEntriesByType('navigation')[0];
    if (nav) {
      var domReady = Math.round(nav.domContentLoadedEventEnd);
      var loadTime = Math.round(nav.loadEventEnd || nav.duration);
      report('perf', '页面加载性能', 'DOMReady：<b>' + domReady + 'ms</b>，Load：<b>' + loadTime + 'ms</b>');
    } else {
      // 兜底：老接口 performance.timing
      var t = performance.timing;
      report('perf', '页面加载性能', 'Load：<b>' + (t.loadEventEnd - t.navigationStart) + 'ms</b>');
    }
  }, 0);
});

// ============ ③ 行为监控：监听一次页面点击 ============
document.addEventListener('click', function (e) {
  // 记录被点击元素的标签与文案，代表一次用户交互行为
  var tag = e.target.tagName.toLowerCase();
  var text = (e.target.textContent || '').trim().slice(0, 20);
  report('action', '用户点击', '元素：<b>&lt;' + tag + '&gt;</b>' + (text ? '，文案：' + text : ''));
});

console.log('[mini 监控 SDK] 已启动：错误 / 性能 / 行为 三类监听就绪');

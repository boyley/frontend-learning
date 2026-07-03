/**
 * 07 · 埋点方案 demo
 * ---------------------------------------------------------------
 * 三种主流埋点方式，采的都是「用户行为」数据，权衡各不同：
 *
 *   ① 代码埋点（手动）：业务里显式 track('事件', {参数})
 *        —— 最精准、可带任意业务字段；缺点：要逐处写、改埋点要发版。
 *   ② 无痕/全埋点（声明式/自动）：全局委托监听所有点击，按 data-track 属性自动采集
 *        —— 一次接入全站自动采、不漏点；缺点：数据泛、语义弱、量大。
 *   ③ 可视化埋点：本质是"无痕"的配置化——运营在后台圈选元素生成规则(选择器)，
 *        SDK 拉取规则后按规则匹配上报。demo 用一份"规则配置"模拟这套匹配。
 *
 * 另含 PV / 单页路由埋点：进入页面、每次路由切换自动上报 PV。
 *
 * 上报统一走 report()，内部用 navigator.sendBeacon 模拟（无真实后端，仅演示 + 面板展示）。
 */

var panelEl = document.getElementById('panel');
var emptyEl = document.getElementById('empty');
var countEl = document.getElementById('count');
var total = 0;

/**
 * report —— 统一上报出口
 * 真实项目里这里会 navigator.sendBeacon(url, JSON) 把数据发给采集服务端。
 * @param {'code'|'auto'|'pv'} channel 埋点方式（决定面板颜色/标签）
 * @param {string} event   事件名
 * @param {object} payload 事件参数
 */
function report(channel, event, payload) {
  var body = JSON.stringify({
    event: event,
    channel: channel,
    payload: payload,
    url: location.hash || location.pathname,
    ts: Date.now()
  });

  // === 真实上报：sendBeacon 在页面卸载时也能可靠发出（见 10 模块）===
  // 这里 URL 是占位的，sendBeacon 失败不影响 demo；主要看面板。
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('https://example.com/collect', body); // 占位地址
    }
  } catch (e) { /* 离线/占位地址失败无所谓，demo 以面板为准 */ }

  console.log('[埋点·' + channel + ']', event, payload);
  renderRow(channel, event, payload);
}

var LABELS = { code: '代码埋点', auto: '无痕埋点', pv: 'PV/路由' };
function renderRow(channel, event, payload) {
  total++;
  if (emptyEl) { emptyEl.remove(); emptyEl = null; }
  var row = document.createElement('div');
  row.className = 'row ' + channel;
  row.innerHTML =
    '<span class="time">' + new Date().toLocaleTimeString() + '</span>' +
    '<span class="type ' + channel + '">' + LABELS[channel] + '</span>' +
    '<span class="name">' + event + '</span>' +
    '<div class="payload">' + JSON.stringify(payload) + '</div>';
  panelEl.appendChild(row);
  countEl.textContent = total + ' 条';
}

// ===========================================================================
// ① 代码埋点：暴露一个 track()，业务代码里想埋哪儿就调哪儿
// ===========================================================================
function track(event, payload) {
  report('code', event, payload || {});
}

document.getElementById('btn-buy').addEventListener('click', function () {
  // 手动埋点的优势：可以带精确的业务上下文
  track('click_buy', { skuId: 'A1001', price: 99, from: '商品详情页' });
});
document.getElementById('btn-fav').addEventListener('click', function () {
  track('click_favorite', { skuId: 'A1001' });
});

// ===========================================================================
// ② 无痕 / 全埋点：全局事件委托，一次监听整页
//    浏览器事件冒泡到 document 时，向上找最近的带 data-track 的元素，自动采集。
//    元素上所有 data-track-* 属性都会作为参数被收集（无需业务写上报代码）。
// ===========================================================================
document.addEventListener('click', function (e) {
  // 从事件目标向上冒泡，找到最近的 data-track 元素（closest 兼容委托）
  var el = e.target.closest('[data-track]');
  if (!el) return;

  var event = el.getAttribute('data-track');
  // 把 dataset 里除 track 本身外的 track-* 收集为参数
  var payload = {};
  Object.keys(el.dataset).forEach(function (k) {
    if (k === 'track') return;            // data-track 本身是事件名
    if (k.indexOf('track') === 0) {       // data-track-pos → trackPos
      var key = k.slice(5);               // 去掉 'track' 前缀
      key = key.charAt(0).toLowerCase() + key.slice(1);
      payload[key] = el.dataset[k];
    }
  });
  // 顺带自动带上元素文本与标签，帮助后台识别
  payload.text = (el.textContent || '').trim().slice(0, 20);
  payload.tag = el.tagName.toLowerCase();

  report('auto', event, payload);
});

// ===========================================================================
// ③ 可视化埋点（配置化的无痕）：SDK 拉取一份"圈选规则"，按 CSS 选择器匹配后上报。
//    这里内置一份规则，演示"运营在后台圈了这些元素"后 SDK 如何自动匹配。
//    （与②共用同一次点击，但走的是"选择器规则"而非 data 属性）
// ===========================================================================
var visualRules = [
  { selector: '#btn-buy',  event: 'visual_buy_button',  desc: '运营圈选：购买按钮' }
  // 真实场景规则由后台可视化圈选生成，SDK 定期拉取
];
document.addEventListener('click', function (e) {
  visualRules.forEach(function (rule) {
    if (e.target.closest(rule.selector)) {
      report('auto', rule.event, { by: '可视化规则', desc: rule.desc });
    }
  });
});

// ===========================================================================
// ④ PV / 单页路由埋点：进入页面 + 每次 hash 路由切换自动上报
// ===========================================================================
function trackPV() {
  report('pv', 'page_view', {
    route: location.hash || '/',
    title: document.title,
    referrer: document.referrer || '(直接进入)'
  });
}
// 首屏 PV
trackPV();
// SPA 路由切换（hashchange）自动 PV —— history 模式则监听 popstate + 劫持 pushState
window.addEventListener('hashchange', trackPV);

console.log('[埋点 SDK] 已启动：代码埋点 track() + 无痕(data-track) + 可视化规则 + PV/路由');

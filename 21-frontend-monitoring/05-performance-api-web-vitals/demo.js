/**
 * 05 · Performance API + Web Vitals demo
 * ---------------------------------------------------------------
 * 用「原生」Performance API 采集核心 Web 指标，并按 web.dev 官方阈值评级：
 *
 *   TTFB (Time To First Byte)          —— Navigation Timing：首字节耗时
 *   FCP  (First Contentful Paint)      —— paint 条目：首次内容绘制
 *   LCP  (Largest Contentful Paint)    —— largest-contentful-paint 条目：最大内容绘制
 *   CLS  (Cumulative Layout Shift)     —— layout-shift 条目累加：累积布局偏移
 *   INP  (Interaction to Next Paint)   —— event/first-input 条目：交互到下一帧绘制
 *
 * 采集全靠 PerformanceObserver（观察者模式）：注册后浏览器有新性能条目就回调，
 * 无需轮询。这也是官方 web-vitals 库内部的做法，这里手写以讲透原理。
 *
 * 注意：本 demo 不依赖任何库、完全离线；file:// 打开即可看到 TTFB/FCP/LCP，
 *       CLS/INP 需要你点按钮制造偏移与交互后才有值。
 */

// ---------------------------------------------------------------------------
// 官方阈值（单位：LCP/FCP/TTFB/INP 为毫秒，CLS 为无量纲分值）
// 来源：web.dev/articles/vitals —— good ≤ 第一档；≤ 第二档为 needs-improvement；否则 poor
// ---------------------------------------------------------------------------
var THRESHOLDS = {
  TTFB: { good: 800,  ni: 1800, unit: 'ms', full: 'Time to First Byte', desc: '服务器首字节响应耗时' },
  FCP:  { good: 1800, ni: 3000, unit: 'ms', full: 'First Contentful Paint', desc: '首次绘制出内容的时间' },
  LCP:  { good: 2500, ni: 4000, unit: 'ms', full: 'Largest Contentful Paint', desc: '最大内容元素绘制完成' },
  CLS:  { good: 0.1,  ni: 0.25, unit: '',   full: 'Cumulative Layout Shift', desc: '累积布局偏移分值（越小越稳）' },
  INP:  { good: 200,  ni: 500,  unit: 'ms', full: 'Interaction to Next Paint', desc: '交互到下一帧绘制的响应时延' }
};

// 每个指标当前值（有的会持续更新，如 LCP/CLS/INP 取最终/最差值）
var metrics = { TTFB: null, FCP: null, LCP: null, CLS: null, INP: null };

var panelEl = document.getElementById('panel');
var cards = {};

/**
 * 根据阈值给出评级：good（优）/ ni（待改进）/ poor（差）
 */
function rate(name, value) {
  if (value == null) return { key: 'wait', label: '采集中…' };
  var t = THRESHOLDS[name];
  if (value <= t.good) return { key: 'good', label: '优 Good' };
  if (value <= t.ni)   return { key: 'ni',   label: '待改进 Needs improvement' };
  return { key: 'poor', label: '差 Poor' };
}

/**
 * 渲染/更新某个指标卡片
 */
function renderCard(name) {
  var t = THRESHOLDS[name];
  var value = metrics[name];
  var r = rate(name, value);
  var shown = value == null ? '—' :
    (t.unit === 'ms' ? Math.round(value) + ' ms' : value.toFixed(3));

  var card = cards[name];
  if (!card) {
    card = document.createElement('div');
    card.className = 'card';
    panelEl.appendChild(card);
    cards[name] = card;
  }
  card.innerHTML =
    '<div class="name"><span>' + name + '</span><span class="full">' + t.full + '</span></div>' +
    '<div class="value">' + shown + '</div>' +
    '<span class="rating ' + r.key + '">' + r.label + '</span>' +
    '<div class="desc">' + t.desc + '</div>' +
    '<div class="thr">阈值：good ≤ ' + t.good + (t.unit) + '　需改进 ≤ ' + t.ni + (t.unit) + '</div>';
}

// 先把 5 张卡片铺出来（值先为「采集中」）
Object.keys(THRESHOLDS).forEach(renderCard);

/**
 * 更新指标值并重绘（LCP/CLS/INP 会多次调用，取更新后的值）
 */
function setMetric(name, value) {
  metrics[name] = value;
  renderCard(name);
  console.log('[Web Vitals] ' + name + ' =', value, '→', rate(name, value).label);
}

// ---------------------------------------------------------------------------
// 1) TTFB —— Navigation Timing（导航条目）
//    responseStart - requestStart ≈ 服务器首字节耗时（简化版，官方还含重定向等）
// ---------------------------------------------------------------------------
function collectTTFB() {
  var nav = performance.getEntriesByType('navigation')[0];
  if (nav) {
    // 用 responseStart 相对导航起点，作为 TTFB（web-vitals 的口径）
    setMetric('TTFB', nav.responseStart);
  }
}
// 导航条目在页面早期就绪，直接取
if (performance.getEntriesByType) collectTTFB();

// ---------------------------------------------------------------------------
// 2) FCP —— paint 条目里 name === 'first-contentful-paint'
// ---------------------------------------------------------------------------
try {
  new PerformanceObserver(function (list) {
    list.getEntries().forEach(function (entry) {
      if (entry.name === 'first-contentful-paint') {
        setMetric('FCP', entry.startTime);
      }
    });
  }).observe({ type: 'paint', buffered: true }); // buffered:true 补发订阅前已产生的条目
} catch (e) { console.warn('paint 观察不支持', e); }

// ---------------------------------------------------------------------------
// 3) LCP —— largest-contentful-paint 条目
//    可能多次触发，每次都是「目前为止最大的内容元素」，取最后一次为准。
//    LCP 在用户首次交互/页面隐藏后定格。
// ---------------------------------------------------------------------------
try {
  new PerformanceObserver(function (list) {
    var entries = list.getEntries();
    var last = entries[entries.length - 1]; // 最后一个即当前最大
    setMetric('LCP', last.renderTime || last.loadTime || last.startTime);
  }).observe({ type: 'largest-contentful-paint', buffered: true });
} catch (e) { console.warn('LCP 观察不支持', e); }

// ---------------------------------------------------------------------------
// 4) CLS —— layout-shift 条目累加
//    只统计「非用户主动引起」的偏移（hadRecentInput 为 false）。
//    官方口径是取「会话窗口」内最大值，这里简化为累加，够讲清概念。
// ---------------------------------------------------------------------------
var clsValue = 0;
try {
  new PerformanceObserver(function (list) {
    list.getEntries().forEach(function (entry) {
      if (!entry.hadRecentInput) {       // 用户交互 500ms 内的偏移不计（那是预期内的）
        clsValue += entry.value;
        setMetric('CLS', clsValue);
      }
    });
  }).observe({ type: 'layout-shift', buffered: true });
} catch (e) { console.warn('layout-shift 观察不支持', e); }

// ---------------------------------------------------------------------------
// 5) INP —— event / first-input 条目
//    取所有交互中「处理时延最大」的那次（duration 最大），近似 INP。
//    duration = 从用户输入到下一帧绘制的时间。
// ---------------------------------------------------------------------------
var maxINP = 0;
try {
  new PerformanceObserver(function (list) {
    list.getEntries().forEach(function (entry) {
      // 只关心真正的交互事件（有 interactionId 的），取最大 duration
      if (entry.interactionId && entry.duration > maxINP) {
        maxINP = entry.duration;
        setMetric('INP', maxINP);
      }
    });
  }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
} catch (e) {
  // 部分浏览器不支持 event，退化用 first-input（近似 FID/INP）
  try {
    new PerformanceObserver(function (list) {
      var e0 = list.getEntries()[0];
      setMetric('INP', e0.processingStart - e0.startTime);
    }).observe({ type: 'first-input', buffered: true });
  } catch (e2) { console.warn('INP 观察不支持', e2); }
}

// ---------------------------------------------------------------------------
// 交互按钮：主动制造 CLS 与 INP，方便观察指标变化
// ---------------------------------------------------------------------------
document.getElementById('btn-shift').addEventListener('click', function () {
  // 突然把一个区块拉高，把下方内容顶下去 → 产生一次布局偏移
  document.getElementById('shifter').classList.toggle('on');
});

document.getElementById('btn-block').addEventListener('click', function () {
  // 故意在主线程上同步空转一段时间，模拟一次「卡顿」的交互 → 拉高 INP
  var start = performance.now();
  while (performance.now() - start < 220) { /* 阻塞主线程约 220ms */ }
  console.log('[INP] 主线程被阻塞约 220ms，本次点击的 INP 会升高');
});

document.getElementById('btn-report').addEventListener('click', function () {
  console.log('[Web Vitals] 当前所有指标快照：', JSON.parse(JSON.stringify(metrics)));
});

console.log('[性能 SDK] 已启动 PerformanceObserver：TTFB / FCP / LCP / CLS / INP');

/**
 * vitals.js —— 用原生 PerformanceObserver 实时测量 Core Web Vitals
 * ------------------------------------------------------------------
 * 本文件被 index.html / bad.html / good.html 共同引入，
 * 只依赖浏览器原生 Performance API，无需任何第三方库。
 *
 * 测量的指标：
 *   - LCP（Largest Contentful Paint，最大内容绘制）—— 加载性能
 *   - CLS（Cumulative Layout Shift，累积布局偏移）—— 视觉稳定性
 *   - INP（Interaction to Next Paint，交互到下一次绘制）—— 交互响应
 *   - FCP（First Contentful Paint，首次内容绘制）—— 辅助加载指标
 *
 * 权威阈值（web.dev 2024+，按第 75 百分位统计，移动端/桌面端分开）：
 *   LCP  good ≤ 2.5s   / needs 2.5–4s    / poor > 4s
 *   INP  good ≤ 200ms  / needs 200–500ms / poor > 500ms
 *   CLS  good ≤ 0.1    / needs 0.1–0.25  / poor > 0.25
 *   FCP  good ≤ 1.8s（辅助）
 */

// ============ 1. 阈值表（毫秒 / 无量纲）============
// 每个指标给出 good / poor 两个分界点，中间即 "needs improvement"（需改进）
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000, unit: 'ms' },
  INP: { good: 200, poor: 500, unit: 'ms' },
  CLS: { good: 0.1, poor: 0.25, unit: '' },
  FCP: { good: 1800, poor: 3000, unit: 'ms' },
};

// 根据数值判定属于哪一档：good / needs / poor
function rate(name, value) {
  const t = THRESHOLDS[name];
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs';
  return 'poor';
}

// 三档对应的中文标签与颜色（good=绿 / needs=橙 / poor=红）
const RATING_LABEL = { good: '良好 good', needs: '需改进 needs', poor: '较差 poor' };
const RATING_COLOR = { good: '#0cce6b', needs: '#ffa400', poor: '#ff4e42' };

// ============ 2. 把某个指标的最新值渲染到页面徽章上 ============
// 页面里约定：每个指标有一个 id="metric-LCP" 的卡片，内部含 .value 与 .badge
function render(name, value) {
  const card = document.getElementById('metric-' + name);
  if (!card) return; // 页面没放这张卡片就跳过

  const r = rate(name, value);
  const unit = THRESHOLDS[name].unit;
  // CLS 是无量纲小数，保留 3 位；时间类指标取整数毫秒
  const shown = unit === '' ? value.toFixed(3) : Math.round(value) + ' ' + unit;

  card.querySelector('.value').textContent = shown;
  const badge = card.querySelector('.badge');
  badge.textContent = RATING_LABEL[r];
  badge.style.background = RATING_COLOR[r];
  card.style.borderColor = RATING_COLOR[r];
}

// ============ 3. LCP —— 监听 largest-contentful-paint ============
// LCP 会随着更大的元素绘制而多次上报，取"最后一个"为准。
// 一旦用户交互（滚动/点击）或页面隐藏，LCP 就定格，不再更新。
function observeLCP() {
  let lcpValue = 0;
  const po = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // entry.startTime = 从导航开始到该元素绘制的时间（ms）
      lcpValue = entry.startTime;
      render('LCP', lcpValue);
    }
  });
  // buffered:true —— 把 observer 创建之前就已产生的条目也一并回放，避免漏测
  po.observe({ type: 'largest-contentful-paint', buffered: true });
}

// ============ 4. CLS —— 监听 layout-shift，按"会话窗口"累加 ============
// CLS 不是简单求和，而是取所有"会话窗口"中最大的一个窗口分值。
// 会话窗口规则：相邻偏移间隔 < 1s 且窗口总时长 < 5s 视为同一窗口。
// 有用户输入触发的偏移（hadRecentInput）不计入。
function observeCLS() {
  let clsValue = 0; // 当前最大窗口分值
  let sessionValue = 0; // 当前窗口累计分值
  let sessionEntries = []; // 当前窗口内的偏移条目

  const po = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.hadRecentInput) continue; // 用户主动交互引起的偏移不算

      const first = sessionEntries[0];
      const last = sessionEntries[sessionEntries.length - 1];

      if (
        sessionValue &&
        entry.startTime - last.startTime < 1000 && // 距上次偏移 < 1s
        entry.startTime - first.startTime < 5000 // 窗口总时长 < 5s
      ) {
        // 归入当前会话窗口
        sessionValue += entry.value;
        sessionEntries.push(entry);
      } else {
        // 开启新的会话窗口
        sessionValue = entry.value;
        sessionEntries = [entry];
      }

      // CLS 取历史所有窗口里的最大值
      if (sessionValue > clsValue) {
        clsValue = sessionValue;
        render('CLS', clsValue);
      }
    }
  });
  po.observe({ type: 'layout-shift', buffered: true });
}

// ============ 5. INP —— 监听 event，取交互延迟的高分位 ============
// INP 关注整个页面生命周期内所有交互（点击/按键/点按）中"最慢"的一批，
// 官方算法取一个近似高分位数（交互很多时约为 98 分位）。这里做一个简化实现：
//   - duration = 从事件发生到下一帧绘制完成的时长
//   - 记录所有交互时长，取近似 P98（少量交互时取最大值）
function observeINP() {
  const durations = [];

  const po = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // 只统计真实用户交互（有 interactionId 的事件），忽略无交互 id 的连续事件
      if (!entry.interactionId) continue;
      durations.push(entry.duration);

      // 从大到小排序，按官方"每 50 次交互允许忽略 1 次最慢"的思路取分位
      durations.sort((a, b) => b - a);
      const idx = Math.min(
        durations.length - 1,
        Math.floor(durations.length / 50)
      );
      render('INP', durations[idx]);
    }
  });
  // durationThreshold:0 —— 上报所有事件（默认会过滤掉短事件）；
  // event 类型即 Event Timing API，用来算 INP
  po.observe({ type: 'event', buffered: true, durationThreshold: 0 });
}

// ============ 6. FCP —— 监听 paint 中的 first-contentful-paint ============
function observeFCP() {
  const po = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        render('FCP', entry.startTime);
      }
    }
  });
  po.observe({ type: 'paint', buffered: true });
}

// ============ 7. 启动所有观察者（带兼容性兜底）============
function startVitals() {
  if (!('PerformanceObserver' in window)) {
    console.warn('当前浏览器不支持 PerformanceObserver，无法测量 Web Vitals');
    return;
  }
  // 用 try/catch 分别包裹：某个 entryType 不被支持时不影响其它指标
  try { observeLCP(); } catch (e) { console.warn('LCP 不支持', e); }
  try { observeCLS(); } catch (e) { console.warn('CLS 不支持', e); }
  try { observeINP(); } catch (e) { console.warn('INP 不支持', e); }
  try { observeFCP(); } catch (e) { console.warn('FCP 不支持', e); }
}

// DOM 就绪即开始测量
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startVitals);
} else {
  startVitals();
}

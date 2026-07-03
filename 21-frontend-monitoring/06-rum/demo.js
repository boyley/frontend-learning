/*
 * 06 · 真实用户监控（RUM）迷你采集器
 * ------------------------------------------------------------
 * 目标：把「当前真实用户会话」的真实数据采集齐全，拼成一条标准
 * RUM 上报 payload（JSON），让你直观看到「一条真实用户数据长什么样」。
 *
 * RUM 的核心：数据来自真实用户、真实设备、真实网络，因此每个人打开
 * 看到的值都不一样（这正是 RUM 与合成监控最大的区别）。
 */

// ============================================================
// 1. sessionId：一次会话的唯一标识
//    真实项目里会写进 sessionStorage，保证同一次会话多次上报可关联。
// ============================================================
function getSessionId() {
  var key = 'rum_session_id';
  var id = sessionStorage.getItem(key);
  if (!id) {
    // 生成一个简易的随机 id（真实项目可用 uuid / nanoid）
    id = 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    sessionStorage.setItem(key, id);
  }
  return id;
}

// ============================================================
// 2. 网络信息：navigator.connection（Network Information API）
//    effectiveType 反映真实网络质量：'4g' / '3g' / '2g' / 'slow-2g'
//    注意：部分浏览器（Safari/Firefox）不支持，需要做兜底。
// ============================================================
function getNetworkInfo() {
  // 兼容不同浏览器前缀
  var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) {
    return { effectiveType: '未知(当前浏览器不支持)', downlink: null, rtt: null };
  }
  return {
    effectiveType: conn.effectiveType, // 网络类型
    downlink: conn.downlink,           // 估算下行带宽 Mbps
    rtt: conn.rtt                      // 估算往返时延 ms
  };
}

// ============================================================
// 3. 性能数据：Performance API（Navigation Timing + Paint Timing）
//    这些是真实用户在自己设备上的真实加载耗时。
// ============================================================
function getPerformanceMetrics() {
  var metrics = {};

  // 3.1 Navigation Timing v2：整页加载各阶段耗时
  var navEntries = performance.getEntriesByType('navigation');
  if (navEntries && navEntries.length > 0) {
    var nav = navEntries[0];
    metrics.dns = Math.round(nav.domainLookupEnd - nav.domainLookupStart);       // DNS 解析
    metrics.tcp = Math.round(nav.connectEnd - nav.connectStart);                 // TCP 建连
    metrics.ttfb = Math.round(nav.responseStart - nav.requestStart);             // 首字节时间
    metrics.domContentLoaded = Math.round(nav.domContentLoadedEventEnd - nav.startTime); // DOM 就绪
    metrics.load = Math.round(nav.loadEventEnd - nav.startTime);                 // 页面完全加载
  }

  // 3.2 Paint Timing：首次绘制 / 首次内容绘制
  var paints = performance.getEntriesByType('paint');
  paints.forEach(function (p) {
    if (p.name === 'first-paint') metrics.fp = Math.round(p.startTime);          // FP
    if (p.name === 'first-contentful-paint') metrics.fcp = Math.round(p.startTime); // FCP
  });

  return metrics;
}

// ============================================================
// 4. 组装完整的 RUM 上报 payload
//    这些字段是行业里 RUM 系统（Sentry / DataDog RUM / 阿里 ARMS）
//    普遍会采集的维度。
// ============================================================
function collectRUMPayload() {
  var screen = window.screen;
  return {
    // —— 会话与页面维度 ——
    sessionId: getSessionId(),
    pageUrl: location.href,               // 当前页面
    referrer: document.referrer || '(直接访问，无来源)', // 上一个来源页
    timestamp: Date.now(),                // 上报时间戳
    timeISO: new Date().toISOString(),

    // —— 设备与环境维度 ——
    userAgent: navigator.userAgent,       // UA（后端可解析出 OS/浏览器/版本）
    language: navigator.language,         // 语言
    platform: navigator.platform,         // 平台
    screen: {
      width: screen.width,                // 屏幕分辨率
      height: screen.height,
      dpr: window.devicePixelRatio,       // 设备像素比（区分高清屏）
      viewport: window.innerWidth + 'x' + window.innerHeight // 可视区尺寸
    },

    // —— 网络维度（真实网络质量，长尾用户关键指标）——
    network: getNetworkInfo(),

    // —— 性能维度（Web Vitals 相关的真实耗时）——
    performance: getPerformanceMetrics()
  };
}

// ============================================================
// 5. 渲染到捕获面板 + console.log
// ============================================================
function renderPayload() {
  var payload = collectRUMPayload();

  // 5.1 控制台打印（真实项目会 navigator.sendBeacon 发到服务端）
  console.log('[RUM] 采集到一条真实用户数据：', payload);

  // 5.2 面板展示：格式化的 JSON，让用户一眼看清结构
  var panel = document.getElementById('panel');
  var json = JSON.stringify(payload, null, 2);
  panel.innerHTML =
    '<div class="panel-title">📡 RUM 上报 Payload（当前真实用户数据）</div>' + json;

  // 5.3 模拟上报（此处仅演示，不真的发请求；真实项目见下方注释）
  // navigator.sendBeacon('/rum/collect', JSON.stringify(payload));
}

// ============================================================
// 6. 事件绑定：页面加载完成后先采集一次，按钮点击可再次采集
//    用 load 事件保证 Navigation Timing 的 loadEventEnd 已经产生。
// ============================================================
window.addEventListener('load', function () {
  // 延迟一点点，确保 loadEventEnd 已写入
  setTimeout(renderPayload, 50);
});

document.getElementById('reportBtn').addEventListener('click', renderPayload);

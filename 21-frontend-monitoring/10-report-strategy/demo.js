/**
 * 10 · 上报策略 —— demo.js
 *
 * 实现一个 mini Reporter（上报器），演示生产级埋点上报的关键策略：
 *   1) 入队    ：业务侧只管 report(event)，事件先进内存队列，不立即发请求
 *   2) 采样    ：按 sampleRate 概率丢弃部分事件，给后端降量
 *   3) 缓冲合并 ：多条事件攒在一起，达到阈值 / 定时 / 页面隐藏时，合并成「一个请求」发出
 *   4) 选传输  ：优先 sendBeacon（卸载也能发），回退到图片打点 / fetch keepalive
 *
 * 为了教学，真正的网络请求被「拦截」并渲染到网络日志面板，
 * 这样在 file:// 下也能直观看到「哪几条被合并、用什么方式发的」。
 */

// ============================================================
// 一、配置与状态
// ============================================================
var REPORT_URL = 'https://example.com/collect'; // 假的上报地址（不会真的打通）
var BATCH_SIZE = 5;      // 缓冲达到这么多条就 flush
var FLUSH_INTERVAL = 5000; // 定时 flush 间隔（毫秒）

var queue = [];          // 事件缓冲队列
var sampleRate = 1.0;    // 采样率：1.0 = 全部上报，0.5 = 约丢一半
var droppedCount = 0;    // 累计被采样丢弃的条数
var seq = 0;             // 事件自增 id

// ============================================================
// 二、面板与状态渲染
// ============================================================
var panel = document.getElementById('panel');
var bufCountEl = document.getElementById('buf-count');
var dropCountEl = document.getElementById('drop-count');
var rateLabelEl = document.getElementById('rate-label');

function now() {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false });
}

/** 刷新顶部状态栏（当前缓冲条数、累计丢弃条数） */
function updateStatus() {
  bufCountEl.textContent = queue.length;
  dropCountEl.textContent = droppedCount;
  rateLabelEl.textContent = sampleRate.toFixed(1);
}

/**
 * 把「一次模拟发出的请求」渲染到网络日志面板
 * @param {string} transport - beacon | image | fetch
 * @param {Array}  batch     - 本次合并上报的事件数组
 */
function renderRequest(transport, batch) {
  var el = document.createElement('div');
  el.className = 'req ' + transport;
  var label = { beacon: 'sendBeacon', image: 'Image打点', fetch: 'fetch keepalive' }[transport];
  var body = JSON.stringify(batch.map(function (e) { return e.type + '#' + e.id; }));
  el.innerHTML =
    '<span class="time">' + now() + '</span>' +
    '<span class="transport">' + label + '</span>' +
    'POST ' + REPORT_URL + ' —— 合并 ' + batch.length + ' 条' +
    '<pre>' + body + '</pre>';
  panel.appendChild(el);
  panel.scrollTop = panel.scrollHeight;
}

// ============================================================
// 三、传输层：优先 sendBeacon，回退 image / fetch
// ============================================================

/**
 * 真正「发送」一批事件。这里做能力探测选择传输方式，
 * 并把请求渲染到面板（教学用，不真的联网；改成真实 URL 即可上线）。
 * @param {Array} batch
 */
function transport(batch) {
  var payload = JSON.stringify({ events: batch, ts: Date.now() });

  // 方式一：navigator.sendBeacon —— 首选。
  // 异步 POST，即使页面正在卸载也能可靠发出，不阻塞卸载。数据量有限制。
  if (navigator.sendBeacon) {
    // 真实代码：navigator.sendBeacon(REPORT_URL, payload);
    navigator.sendBeacon(REPORT_URL, payload);
    renderRequest('beacon', batch);
    console.log('[Reporter] sendBeacon 上报', batch);
    return;
  }

  // 方式二：图片打点 —— 兼容性最好，天然跨域不触发预检，但只能 GET、受 URL 长度限制。
  if (payload.length < 2000) {
    var img = new Image();
    img.src = REPORT_URL + '?data=' + encodeURIComponent(payload);
    renderRequest('image', batch);
    console.log('[Reporter] Image 打点上报', batch);
    return;
  }

  // 方式三：fetch keepalive —— 类似 sendBeacon，页面卸载也能发，且能自定义 header/方法。
  fetch(REPORT_URL, {
    method: 'POST',
    body: payload,
    keepalive: true,
    headers: { 'Content-Type': 'application/json' }
  });
  renderRequest('fetch', batch);
  console.log('[Reporter] fetch keepalive 上报', batch);
}

// ============================================================
// 四、Reporter 核心：入队 / 采样 / flush
// ============================================================

/**
 * 业务侧调用入口：上报一个事件。
 * 先做采样过滤，命中则丢弃；未丢弃则入队，队满触发 flush。
 * @param {object} event
 */
function report(event) {
  // 采样：以 (1 - sampleRate) 的概率丢弃。sampleRate=1.0 时永不丢弃。
  if (Math.random() >= sampleRate) {
    droppedCount++;
    console.log('[Reporter] 采样丢弃', event);
    updateStatus();
    return;
  }
  queue.push(event);
  updateStatus();

  // 触发条件之一：缓冲达到阈值，立刻合并上报
  if (queue.length >= BATCH_SIZE) {
    flush('batch-full');
  }
}

/**
 * 把当前队列里的事件合并成一次请求发出，然后清空队列。
 * @param {string} reason - 触发原因（batch-full / timer / hidden / manual），仅用于日志
 */
function flush(reason) {
  if (queue.length === 0) return;
  var batch = queue.slice();  // 快照
  queue = [];                 // 先清空，避免重复发送
  console.log('[Reporter] flush，原因=' + reason + '，合并 ' + batch.length + ' 条');
  transport(batch);
  updateStatus();
}

// ============================================================
// 五、自动 flush 时机
// ============================================================

// 时机一：定时 flush，兜底把低频攒下的事件发出去
setInterval(function () { flush('timer'); }, FLUSH_INTERVAL);

// 时机二：页面隐藏时 flush（比 unload/beforeunload 更可靠，尤其移动端）。
// visibilitychange -> hidden 覆盖切后台/锁屏/切标签页；pagehide 覆盖真正卸载。
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'hidden') {
    flush('hidden');
  }
});
window.addEventListener('pagehide', function () {
  flush('pagehide');
});

// ============================================================
// 六、按钮交互
// ============================================================
var typePool = ['click', 'pv', 'api_error', 'perf', 'exposure'];

/** 造一个随机事件 */
function makeEvent() {
  seq++;
  return { id: seq, type: typePool[seq % typePool.length], t: Date.now() };
}

document.getElementById('btn-gen').addEventListener('click', function () {
  report(makeEvent());
});

document.getElementById('btn-gen5').addEventListener('click', function () {
  // 连产 5 条，配合默认阈值 5 可直观看到「攒够就自动合并成一次上报」
  for (var i = 0; i < 5; i++) report(makeEvent());
});

document.getElementById('btn-flush').addEventListener('click', function () {
  flush('manual');
});

// 采样率在 1.0 / 0.5 / 0.2 之间循环，切到 0.2 后猛点「产生事件」能看到丢弃计数上涨
var rates = [1.0, 0.5, 0.2];
var rateIdx = 0;
document.getElementById('btn-rate').addEventListener('click', function () {
  rateIdx = (rateIdx + 1) % rates.length;
  sampleRate = rates[rateIdx];
  updateStatus();
  console.log('[Reporter] 采样率切换为 ' + sampleRate);
});

// 初始化状态栏
updateStatus();

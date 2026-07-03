/**
 * 08 · 白屏检测 demo
 * ---------------------------------------------------------------
 * "白屏"指页面加载后一片空白（JS 报错、资源挂掉、接口全失败、框架没挂载成功）。
 * 它往往不抛错，普通错误监控抓不到，需要"主动探测页面到底有没有渲染出东西"。
 *
 * 本 demo 实现业界最常用的「采样点检测法」，并配合根节点检测与超时兜底：
 *
 *   ① 采样点检测（核心）：
 *      在屏幕上取若干个点（这里取两条对角线上的 17 个点），
 *      用 document.elementsFromPoint(x, y) 拿到每个点堆叠的元素，
 *      看最上层元素是不是「容器/空白节点」（html/body/#app 根容器）。
 *      如果绝大多数采样点命中的都是容器而非真实内容 → 判定白屏。
 *
 *   ② 根节点检测：#app 根容器 innerHTML 是否为空 / 无子元素。
 *
 *   ③ 超时兜底：约定时间内首屏还没渲染出内容，直接上报"疑似白屏"。
 *
 * 判空白的关键：预先约定一批「算作空白」的容器选择器（wrapperSelectors），
 * 采样点命中它们就计一个"空白点"。命中真实内容元素则不计。
 */

var rowsEl = document.getElementById('rows');

// 约定：这些选择器对应的元素算作「空白/容器」——采样点落在它们身上说明该处没内容
var wrapperSelectors = ['html', 'body', '#app', '#panel', '.toolbar'];

/**
 * 判断某个元素是否属于「空白容器」
 */
function isWrapper(el) {
  if (!el) return true; // 没取到元素，也算空白
  for (var i = 0; i < wrapperSelectors.length; i++) {
    // matches：元素自身是否匹配该选择器
    if (el.matches && el.matches(wrapperSelectors[i])) return true;
  }
  return false;
}

/**
 * 核心：采样点白屏检测
 * 在两条对角线上取 17 个采样点，统计有多少个点命中「空白容器」。
 * @returns {object} { blankPoints, total, isWhite, ratio }
 */
function detectBySamplePoints() {
  var points = [];
  var w = window.innerWidth;
  var h = window.innerHeight;

  // 取 9 段 → 两条对角线各 9 个点，去重中心点后共 17 个采样点
  for (var i = 1; i <= 9; i++) {
    var x = (w / 10) * i;
    // 主对角线（左上→右下）
    points.push([x, (h / 10) * i]);
    // 副对角线（左下→右上）
    points.push([x, h - (h / 10) * i]);
  }

  var blankPoints = 0;
  var hitDetail = [];
  points.forEach(function (p) {
    // elementsFromPoint 返回该坐标处从上到下堆叠的所有元素，[0] 是最上层
    var stack = document.elementsFromPoint(p[0], p[1]);
    var topEl = stack && stack[0];
    var blank = isWrapper(topEl);
    if (blank) blankPoints++;
    hitDetail.push((topEl && topEl.tagName ? topEl.tagName.toLowerCase() : 'null') +
                   (topEl && topEl.id ? '#' + topEl.id : '') + (blank ? '(空)' : '(内容)'));
  });

  var total = points.length;
  var ratio = blankPoints / total;
  // 阈值：命中空白容器的采样点 ≥ 阈值（这里 0.95）判为白屏
  var isWhite = ratio >= 0.95;
  return { blankPoints: blankPoints, total: total, ratio: ratio, isWhite: isWhite, hitDetail: hitDetail };
}

/**
 * 辅助：根节点检测——#app 是否为空
 */
function detectByRoot() {
  var app = document.getElementById('app');
  var empty = !app || app.children.length === 0 || app.innerHTML.trim() === '';
  return empty;
}

/**
 * 渲染一条检测结果
 */
function renderResult(result) {
  var row = document.createElement('div');
  row.className = 'row ' + (result.isWhite ? 'white' : 'ok');
  row.innerHTML =
    '<span class="time">' + new Date().toLocaleTimeString() + '</span>' +
    '<div class="verdict">' + (result.isWhite ? '⚠️ 判定：白屏！' : '✅ 判定：页面正常') + '</div>' +
    '<div class="detail">' +
      '采样点检测：' + result.blankPoints + ' / ' + result.total +
        ' 个点命中空白容器（占比 ' + (result.ratio * 100).toFixed(0) + '%，阈值 95%）<br/>' +
      '根节点检测：#app ' + (result.rootEmpty ? '为空 ❌' : '有内容 ✅') +
    '</div>';
  rowsEl.insertBefore(row, rowsEl.firstChild);

  console.log('[白屏检测]', result.isWhite ? '白屏' : '正常', result);
}

/**
 * 执行一次完整检测（采样点 + 根节点）
 */
function runDetection() {
  var sample = detectBySamplePoints();
  sample.rootEmpty = detectByRoot();
  // 综合判定：采样点判白 或 根节点为空，都算白屏
  sample.isWhite = sample.isWhite || sample.rootEmpty;
  renderResult(sample);
  return sample;
}

// ---------------------------------------------------------------------------
// 交互按钮
// ---------------------------------------------------------------------------
var appEl = document.getElementById('app');
var originalHTML = appEl.innerHTML; // 备份，用于恢复

// 制造白屏：清空 #app 并把背景刷白，模拟真实白屏
document.getElementById('btn-blank').addEventListener('click', function () {
  appEl.innerHTML = '';
  appEl.classList.add('blank');
  console.warn('[白屏检测] 已制造白屏：#app 被清空');
});

// 恢复内容
document.getElementById('btn-restore').addEventListener('click', function () {
  appEl.innerHTML = originalHTML;
  appEl.classList.remove('blank');
  console.log('[白屏检测] 已恢复页面内容');
});

// 手动触发检测
document.getElementById('btn-detect').addEventListener('click', runDetection);

// ---------------------------------------------------------------------------
// ③ 超时兜底：页面加载后一段时间自动检测一次；若首屏迟迟没内容则上报疑似白屏
//    真实项目里这个定时器要在首屏渲染完成的回调里 clear 掉。
// ---------------------------------------------------------------------------
window.addEventListener('load', function () {
  setTimeout(function () {
    console.log('[白屏检测] 超时兜底：load 后自动执行一次检测');
    runDetection();
  }, 1000); // 约定 1s 后仍要能看到内容
});

console.log('[白屏检测 SDK] 已启动：采样点(elementsFromPoint) + 根节点 + 超时兜底');

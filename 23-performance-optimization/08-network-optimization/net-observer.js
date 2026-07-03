// ============================================================================
// net-observer.js —— 用 Resource Timing API 把页面加载的每个资源列到表格里
// ----------------------------------------------------------------------------
// before.html / after.html 共用。核心：PerformanceObserver 监听 'resource' 条目。
// 每条 PerformanceResourceTiming 记录了一个资源从「发起」到「完成」的完整时间线：
//   startTime → domainLookup(DNS) → connect(TCP/TLS) → request → response
// 我们把 name / 类型 / 耗时 / 传输体积 渲染出来，直观感受 Resource Timing。
// ============================================================================

(function () {
  const tbody = document.getElementById('resTbody');
  if (!tbody) return;

  // 只显示本 demo 关心的资源（过滤掉 observer 脚本自身等噪音可选，这里全展示）。
  function addRow(entry) {
    const tr = document.createElement('tr');
    // 只取文件名，避免超长路径撑破表格。
    const shortName = entry.name.split('/').pop() || entry.name;

    // 关键子时段（毫秒）：
    const dns = (entry.domainLookupEnd - entry.domainLookupStart).toFixed(1);
    const tcp = (entry.connectEnd - entry.connectStart).toFixed(1);
    const ttfb = (entry.responseStart - entry.requestStart).toFixed(1);
    const total = entry.duration.toFixed(1);
    // transferSize：实际经网络传输的字节（走缓存时为 0）。file:// 下常为 0。
    const size = entry.transferSize ? (entry.transferSize / 1024).toFixed(1) + ' KB' : '—';

    tr.innerHTML =
      `<td title="${entry.name}">${shortName}</td>` +
      `<td>${entry.initiatorType || '—'}</td>` +
      `<td>${dns}</td>` +
      `<td>${tcp}</td>` +
      `<td>${ttfb}</td>` +
      `<td><b>${total}</b></td>` +
      `<td>${size}</td>`;
    tbody.appendChild(tr);
  }

  try {
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) addRow(entry);
    });
    // buffered: true 会回放 observer 创建之前就已经产生的 resource 条目，避免漏掉早期资源。
    po.observe({ type: 'resource', buffered: true });
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="7">当前浏览器不支持 Resource Timing 的 PerformanceObserver。</td></tr>';
  }

  // 提示：file:// 协议下 transferSize/部分子时段可能为 0，用本地服务器打开更准确。
  if (location.protocol === 'file:') {
    const note = document.getElementById('protoNote');
    if (note) note.style.display = 'block';
  }
})();

// ============================================================================
// worker.js —— Web Worker 线程脚本（独立于主线程运行）
// ----------------------------------------------------------------------------
// 关键点：
//   1. 这里是一个独立的 JS 执行上下文（独立线程），无法访问 window / document / DOM。
//   2. 只能通过 self.onmessage 接收主线程消息，用 self.postMessage 回传结果。
//   3. 主线程与 worker 之间传递的数据默认是「结构化克隆（structured clone）」，
//      即数据被深拷贝一份，两侧互不共享引用。
// ============================================================================

// self 指向 worker 的全局作用域（相当于主线程的 window）。
// 在 Worker 里没有 window / document，但有 self / postMessage / onmessage 等。
self.onmessage = function (e) {
  // e.data 就是主线程 postMessage 过来的数据（已被结构化克隆）。
  const { type, limit } = e.data;

  if (type === 'countPrimes') {
    const t0 = performance.now();            // worker 里也可以用 performance
    const count = countPrimes(limit);        // 执行 CPU 密集计算（不会阻塞主线程）
    const cost = performance.now() - t0;

    // 计算完成，把结果回传给主线程。
    // postMessage 的数据同样会被结构化克隆送回主线程。
    self.postMessage({ type: 'result', count, cost });
  }
};

// ----------------------------------------------------------------------------
// 一个故意「很重」的 CPU 密集函数：统计 [2, limit) 内素数的个数。
// 采用最朴素的试除法，故意不做优化，好让计算耗时足够长、能明显看出阻塞差异。
// ----------------------------------------------------------------------------
function countPrimes(limit) {
  let count = 0;
  for (let n = 2; n < limit; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) count++;
  }
  return count;
}

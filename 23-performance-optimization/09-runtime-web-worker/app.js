// ============================================================================
// app.js —— 主线程脚本
// ----------------------------------------------------------------------------
// 演示两种做法的对比：
//   A. 「主线程直接算」：CPU 密集计算跑在主线程 → 长任务阻塞 → 动画卡死、计数器停更。
//   B. 「Web Worker 计算」：计算卸载到 worker 线程 → 主线程空闲 → 动画/计数器依旧流畅。
// ============================================================================

// 计算规模：素数上限。数字越大越耗时（越能看出卡顿）。可按机器性能调整。
const LIMIT = 3_000_000;

// ---------- 抓取页面元素 ----------
const btnMain = document.getElementById('btnMain');
const btnWorker = document.getElementById('btnWorker');
const mainResult = document.getElementById('mainResult');
const workerResult = document.getElementById('workerResult');
const counterEl = document.getElementById('counter');
const fpsEl = document.getElementById('fps');

// ============================================================================
// 「主线程流畅度探针」：一个每 100ms 自增的计数器 + 一个粗略的 FPS 计算。
// 如果主线程被长任务占住，setInterval 回调 / requestAnimationFrame 都无法按时执行，
// 计数器会「卡住不动」，FPS 会掉到很低 —— 这就是可视化的「主线程卡顿」。
// ============================================================================
let counter = 0;
setInterval(() => {
  counter++;
  counterEl.textContent = counter;
}, 100);

// 用 requestAnimationFrame 统计每秒帧数（rAF 正常约 60 次/秒；被阻塞时会骤降）。
let frames = 0;
let lastFpsTs = performance.now();
function fpsLoop(now) {
  frames++;
  if (now - lastFpsTs >= 1000) {
    fpsEl.textContent = frames;                 // 显示上一秒的帧数
    // 卡顿时 FPS 低，给出红色警示
    fpsEl.style.color = frames < 30 ? '#d93025' : '#188038';
    frames = 0;
    lastFpsTs = now;
  }
  requestAnimationFrame(fpsLoop);
}
requestAnimationFrame(fpsLoop);

// ----------------------------------------------------------------------------
// 与 worker.js 里同一份 CPU 密集函数（主线程版本，用于「反面教材」）。
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

// ============================================================================
// A. 主线程直接算 —— 会阻塞！
// ============================================================================
btnMain.addEventListener('click', () => {
  mainResult.textContent = '计算中…（注意左侧动画和计数器会卡死）';
  btnMain.disabled = true;

  // 用 setTimeout 让浏览器先把「计算中…」这句文字渲染出来，
  // 否则同步长任务会连这句提示都一起卡住、看不到。
  setTimeout(() => {
    const t0 = performance.now();
    const count = countPrimes(LIMIT);          // ← 同步长任务，独占主线程数秒
    const cost = performance.now() - t0;

    mainResult.innerHTML =
      `结果：${count} 个素数<br>耗时：<b>${cost.toFixed(0)} ms</b>` +
      `<br><span class="bad">👎 计算期间主线程被完全阻塞：动画停转、计数器停更、点击无响应</span>`;
    btnMain.disabled = false;
  }, 50);
});

// ============================================================================
// B. Web Worker 计算 —— 不阻塞主线程！
// ============================================================================

// 创建 worker。默认是 classic worker（兼容性最好，file:// 下部分浏览器也可用）。
// 若想用 ES module worker：new Worker('worker.js', { type: 'module' })，此时 worker
// 内部可以使用 import。这里用 classic 以获得最好的兼容性与「免构建直接跑」体验。
let worker = null;

btnWorker.addEventListener('click', () => {
  workerResult.textContent = '计算中…（注意左侧动画和计数器依旧流畅）';
  btnWorker.disabled = true;

  // 懒创建 worker（也可以在文件顶部一次性创建并复用）。
  if (!worker) {
    worker = new Worker('worker.js');

    // 监听 worker 回传的消息。计算在另一条线程完成，主线程只在这一刻被短暂唤醒处理结果。
    worker.onmessage = (e) => {
      const { count, cost } = e.data;
      workerResult.innerHTML =
        `结果：${count} 个素数<br>耗时：<b>${cost.toFixed(0)} ms</b>` +
        `<br><span class="good">👍 计算全程在 worker 线程，主线程零阻塞：动画流畅、计数器不停</span>`;
      btnWorker.disabled = false;
    };

    // 监听 worker 里抛出的错误，便于调试。
    worker.onerror = (err) => {
      workerResult.textContent = 'Worker 出错：' + err.message;
      btnWorker.disabled = false;
    };
  }

  // 把任务参数发给 worker。数据会被结构化克隆送入 worker 线程。
  worker.postMessage({ type: 'countPrimes', limit: LIMIT });
});

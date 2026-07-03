// ============================================================================
// probe.js —— 主线程流畅度探针（before.html / after.html 共用）
// ----------------------------------------------------------------------------
// 两个直观信号，用来「肉眼」感受主线程是否被阻塞：
//   1）每 100ms 自增一次的计数器：主线程被长任务/大量 reflow 占住时，setInterval
//      回调无法按时执行 → 计数器「卡住不动」。
//   2）FPS（每秒渲染帧数）：正常约 60；主线程繁忙时 requestAnimationFrame 无法按帧
//      调度 → FPS 骤降到个位数。
//   （左上角的旋转方块由 CSS 动画驱动，卡顿时同样会僵住。）
// ============================================================================

// ---- 计数器：每 100ms +1 ----
let counter = 0;
const counterEl = document.getElementById('counter');
setInterval(() => {
  counter++;
  counterEl.textContent = counter;
}, 100);

// ---- FPS：用 requestAnimationFrame 统计每秒帧数 ----
let frames = 0;
let lastFpsTs = performance.now();
const fpsEl = document.getElementById('fps');
function fpsLoop(now) {
  frames++;
  if (now - lastFpsTs >= 1000) {
    fpsEl.textContent = frames;                          // 显示上一秒的帧数
    fpsEl.style.color = frames < 30 ? '#d93025' : '#188038'; // 低于 30 帧标红
    frames = 0;
    lastFpsTs = now;
  }
  requestAnimationFrame(fpsLoop);
}
requestAnimationFrame(fpsLoop);

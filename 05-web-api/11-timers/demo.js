'use strict';
/**
 * 定时器与动画帧演示
 *  - setInterval / clearInterval：秒表
 *  - requestAnimationFrame / cancelAnimationFrame：平滑进度条 + 小球
 *  - setInterval 做动画的卡顿对比
 */

/* =========================================================
 * Demo 1：秒表（setInterval + clearInterval）
 * 关键点：不要用「每次 +10ms」累加，那会随回调被延迟而漂移。
 * 正确做法是记录起点时间，每帧用 Date.now() - 起点 计算真实经过时间。
 * =======================================================*/
(function stopwatch() {
  const clockEl = document.getElementById('clock');
  let timerId = null;     // setInterval 返回的句柄，clear 时要用
  let startTime = 0;      // 本段开始的时间戳
  let elapsed = 0;        // 暂停前已累计的毫秒

  function format(ms) {
    const totalCs = Math.floor(ms / 10);       // 厘秒
    const cs = totalCs % 100;
    const totalSec = Math.floor(totalCs / 100);
    const sec = totalSec % 60;
    const min = Math.floor(totalSec / 60);
    const pad = (n, l = 2) => String(n).padStart(l, '0');
    return `${pad(min)}:${pad(sec)}.<small>${pad(cs)}</small>`;
  }

  function tick() {
    const now = elapsed + (Date.now() - startTime); // 真实经过时间，避免漂移
    clockEl.innerHTML = format(now);
  }

  document.getElementById('swStart').addEventListener('click', () => {
    if (timerId !== null) return;       // 防止重复启动导致多个定时器叠加
    startTime = Date.now();
    timerId = setInterval(tick, 30);    // 30ms 刷新一次显示
  });

  document.getElementById('swPause').addEventListener('click', () => {
    if (timerId === null) return;
    clearInterval(timerId);             // 必须 clear，否则定时器一直跑（内存泄漏隐患）
    timerId = null;
    elapsed += Date.now() - startTime;  // 把本段时间累计进去
  });

  document.getElementById('swReset').addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    elapsed = 0;
    clockEl.innerHTML = format(0);
  });
})();


/* =========================================================
 * Demo 2：requestAnimationFrame 平滑动画
 * rAF 回调会收到一个高精度时间戳参数（performance.now() 体系），
 * 在浏览器下一次重绘前执行，与屏幕刷新率同步。
 * =======================================================*/
(function rafAnimation() {
  const bar = document.getElementById('bar');
  const ball = document.getElementById('ballRaf');
  const stage = ball.parentElement;
  const fpsEl = document.getElementById('fps');

  let rafId = null;
  let progress = 0;        // 0 ~ 1
  let lastTs = 0;          // 上一帧时间戳，用于计算速度（与帧率无关）
  let lastFpsTs = 0, frames = 0;

  function frame(ts) {
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;   // 两帧间隔（ms）
    lastTs = ts;

    // 按「每秒前进 35%」的速度推进，乘以 dt 让动画速度与帧率无关
    progress += (dt / 1000) * 0.35;
    if (progress >= 1) progress = 0; // 循环

    bar.style.width = (progress * 100).toFixed(1) + '%';
    const maxX = stage.clientWidth - ball.offsetWidth;
    ball.style.left = (progress * maxX) + 'px';

    // 估算 FPS（每秒统计一次）
    frames++;
    if (ts - lastFpsTs >= 1000) {
      fpsEl.textContent = 'FPS: ' + frames;
      frames = 0; lastFpsTs = ts;
    }

    rafId = requestAnimationFrame(frame); // 递归预约下一帧
  }

  document.getElementById('rafStart').addEventListener('click', () => {
    if (rafId !== null) return;
    lastTs = 0;                            // 重置，避免暂停后 dt 突然很大跳一下
    lastFpsTs = performance.now();
    rafId = requestAnimationFrame(frame);
  });

  document.getElementById('rafPause').addEventListener('click', () => {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);           // 取消预约
    rafId = null;
  });

  document.getElementById('rafReset').addEventListener('click', () => {
    cancelAnimationFrame(rafId);
    rafId = null;
    progress = 0;
    bar.style.width = '0%';
    ball.style.left = '0px';
    fpsEl.textContent = 'FPS: --';
  });
})();


/* =========================================================
 * Demo 3：用 setInterval 做动画（对比卡顿）
 * 8ms 间隔尝试模拟 ~120fps，但浏览器最小延迟、回调排队、与刷新不同步，
 * 实际会忽快忽慢、掉帧。把它和上面的 rAF 小球一起跑可对比。
 * =======================================================*/
(function intervalAnimation() {
  const ball = document.getElementById('ballInterval');
  const stage = ball.parentElement;
  let timerId = null;
  let x = 0;
  let dir = 1;

  document.getElementById('cmpStart').addEventListener('click', () => {
    if (timerId !== null) return;
    timerId = setInterval(() => {
      const maxX = stage.clientWidth - ball.offsetWidth;
      x += dir * 3;                  // 固定步长，与刷新率无关 → 容易抖
      if (x >= maxX) { x = maxX; dir = -1; }
      if (x <= 0) { x = 0; dir = 1; }
      ball.style.left = x + 'px';
    }, 8); // 注意：实际浏览器对嵌套 setTimeout 有 4ms 最小延迟，setInterval 也受限
  });

  document.getElementById('cmpStop').addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
  });
})();

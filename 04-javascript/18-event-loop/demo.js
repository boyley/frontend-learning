// 18 · 事件循环 demo
// 本文件聚焦：调用栈、宏任务(setTimeout)、微任务(Promise.then / queueMicrotask) 的执行顺序
// 既能在浏览器运行（index.html 引入），也能 `node demo.js` 直接运行

'use strict';

const lines = [];
function log(...args) {
  const text = args.map(String).join(' ');
  lines.push(text);
  console.log(text);
  if (typeof document !== 'undefined') {
    const pre = document.getElementById('output');
    if (pre) pre.textContent = lines.join('\n');
  }
}

// ============================================================
// 经典输出顺序题：先想清楚答案，再看运行结果
// 规则：同步代码全部执行 -> 清空所有微任务 -> 取一个宏任务 -> 再清空所有微任务 ...
// ============================================================

log('1 同步：脚本开始'); // 同步，立即执行

// 宏任务：setTimeout 的回调进入"宏任务队列"，要等当前同步代码 + 所有微任务跑完
setTimeout(() => {
  log('5 宏任务：setTimeout A');
  // 在宏任务里再注册一个微任务：会在"这个宏任务结束后、下一个宏任务前"执行
  Promise.resolve().then(() => log('6 微任务：宏任务 A 内的 then'));
}, 0);

// 微任务：Promise.then 的回调进入"微任务队列"
Promise.resolve().then(() => log('3 微任务：then 1'));

// queueMicrotask：直接注册一个微任务，和 Promise.then 同级
queueMicrotask(() => log('4 微任务：queueMicrotask'));

// 又一个宏任务，排在 setTimeout A 后面
setTimeout(() => log('7 宏任务：setTimeout B'), 0);

log('2 同步：脚本结束'); // 同步，立即执行

// ----------------------------------------------------------------
// 预期输出顺序（务必对照）：
// 1 同步：脚本开始
// 2 同步：脚本结束
// 3 微任务：then 1
// 4 微任务：queueMicrotask
// 5 宏任务：setTimeout A
// 6 微任务：宏任务 A 内的 then
// 7 宏任务：setTimeout B
//
// 解析：
// - 先把所有"同步代码"跑完 -> 输出 1、2
// - 调用栈清空后，清空"微任务队列" -> 输出 3、4
// - 取队首的一个"宏任务"(setTimeout A) 执行 -> 输出 5，并产生一个新微任务
// - 这个宏任务结束后立刻清空微任务队列 -> 输出 6
// - 再取下一个宏任务(setTimeout B) -> 输出 7
// 关键点：每执行完"一个"宏任务，都会把当时的微任务队列"全部清空"，才取下一个宏任务
// ----------------------------------------------------------------

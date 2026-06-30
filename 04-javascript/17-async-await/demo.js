// 17 · async / await demo
// 本文件聚焦：async 返回 Promise、await 暂停、try/catch、并行 await、与 Promise 对比
// 既能在浏览器运行（index.html 引入），也能 `node demo.js` 直接运行

'use strict';

const lines = [];
function log(...args) {
  const text = args
    .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
    .join(' ');
  lines.push(text);
  console.log(text);
  if (typeof document !== 'undefined') {
    const pre = document.getElementById('output');
    if (pre) pre.textContent = lines.join('\n');
  }
}

// 模拟一个异步请求：ms 毫秒后返回 value
function fetchData(value, ms) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
// 模拟一个会失败的异步请求
function fetchFail(reason, ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(reason)), ms)
  );
}

// ============================================================
// 一、async 函数永远返回一个 Promise
// ============================================================
log('===== 一、async 返回 Promise =====');

async function getNumber() {
  // 即使 return 的是普通值，外部拿到的也是 Promise，值会被自动包装
  return 42;
}
// 所以调用方需要用 then 或 await 取值
getNumber().then((n) => log('async 返回值（被包成 Promise）:', n));

// ============================================================
// 二、await 暂停函数，等待 Promise 敲定后取出其值
// ============================================================
log('===== 二、await 暂停取值 =====');

async function loadUser() {
  log('  loadUser 开始');
  // await 会"暂停"本函数，把后续代码注册为微任务，直到右侧 Promise 完成
  const name = await fetchData('小明', 20);
  log('  await 拿到 name:', name);
  const age = await fetchData(18, 20);
  log('  await 拿到 age:', age);
  return { name, age };
}
loadUser().then((user) => log('loadUser 结果:', user));

// ============================================================
// 三、try/catch 捕获 await 的错误（比 .catch 更像同步写法）
// ============================================================
log('===== 三、try / catch 错误处理 =====');

async function loadWithError() {
  try {
    const data = await fetchFail('网络挂了', 10);
    log('  不会执行:', data);
  } catch (err) {
    // rejected 的 Promise 会让 await 抛出异常，被 catch 接住
    log('  捕获到错误:', err.message);
  } finally {
    log('  finally: 收尾逻辑（如关闭 loading）');
  }
}
loadWithError();

// ============================================================
// 四、串行 vs 并行：独立任务别用串行 await，要用 Promise.all 并行
// ============================================================
log('===== 四、串行 vs 并行 =====');

// 串行：两个独立请求各 50ms，串行总耗时约 100ms（后一个白等前一个）
async function serial() {
  const t = Date.now();
  const a = await fetchData('A', 50);
  const b = await fetchData('B', 50);
  log('  串行结果:', a, b, '约', Date.now() - t, 'ms');
}
// 并行：先同时发起，再用 await Promise.all 一起等，总耗时约 50ms
async function parallel() {
  const t = Date.now();
  const pa = fetchData('A', 50); // 立即发起，不 await
  const pb = fetchData('B', 50);
  const [a, b] = await Promise.all([pa, pb]); // 一起等
  log('  并行结果:', a, b, '约', Date.now() - t, 'ms');
}
serial().then(parallel);

// ============================================================
// 五、与纯 Promise 写法对比（两段逻辑等价）
// ============================================================
log('===== 五、与 Promise 写法对比 =====');

// Promise 链式写法
function chainStyle() {
  return fetchData(1, 10)
    .then((n) => fetchData(n + 1, 10))
    .then((n) => log('  链式风格最终:', n));
}
// async/await 写法：更接近同步、可读性更好
async function awaitStyle() {
  let n = await fetchData(1, 10);
  n = await fetchData(n + 1, 10);
  log('  await 风格最终:', n);
}
chainStyle().then(awaitStyle);

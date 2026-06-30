// ============================================================
// 11 · 异步编程 与 事件循环 —— 回调 / Promise / async-await
// 运行方式：node async-demo.js
// ============================================================

// Node 是「单线程 + 事件循环 + 非阻塞 I/O」。耗时操作（读文件、网络）交给底层，
// 完成后把回调放进队列，主线程空闲时再取出执行 —— 这就是异步的本质。

// ========== ① 回调（Callback）：最原始的异步写法 ==========
function readUserById(id, callback) {
  // 用 setTimeout 模拟一次耗时 I/O（如查数据库）
  setTimeout(() => {
    if (id <= 0) {
      // Node 约定：回调第一个参数是 error（error-first callback）
      callback(new Error('id 不合法'));
      return;
    }
    callback(null, { id, name: '用户' + id });
  }, 100);
}

readUserById(1, (err, user) => {
  if (err) return console.error('① 回调出错：', err.message);
  console.log('① 回调拿到用户：', user);
  // 如果还要接着查订单、查商品……回调里套回调 → 「回调地狱」，难维护
});

// ========== ② Promise：把异步结果用对象封装，链式 .then ==========
function readUserPromise(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      id > 0 ? resolve({ id, name: '用户' + id }) : reject(new Error('id 不合法'));
    }, 100);
  });
}

readUserPromise(2)
  .then((user) => {
    console.log('② Promise 拿到用户：', user);
    return readUserPromise(3); // 返回新 Promise → 链式继续，避免嵌套
  })
  .then((user2) => console.log('② 链式拿到第二个用户：', user2))
  .catch((err) => console.error('② Promise 出错：', err.message));

// ========== ③ async/await：用同步的写法写异步（语法糖，底层还是 Promise）==========
async function main() {
  try {
    const u1 = await readUserPromise(10); // await 等待 Promise 完成，拿到结果
    console.log('③ await 拿到用户：', u1);

    // 串行 vs 并行：
    // 串行（一个等一个，慢）：
    // const a = await readUserPromise(1); const b = await readUserPromise(2);

    // 并行（同时发起，用 Promise.all 等全部完成，快）✅
    const [a, b, c] = await Promise.all([
      readUserPromise(1),
      readUserPromise(2),
      readUserPromise(3),
    ]);
    console.log('③ Promise.all 并行拿到：', a.name, b.name, c.name);
  } catch (err) {
    console.error('③ await 出错：', err.message);
  }
}
main();

// ========== ④ 事件循环顺序演示（重点）==========
// 执行优先级：同步代码 > 微任务(microtask) > 宏任务(macrotask)
//   微任务：process.nextTick（最优先）→ Promise.then
//   宏任务：setTimeout / setInterval → setImmediate
console.log('④ A 同步：脚本最先执行');

setTimeout(() => console.log('④ E 宏任务：setTimeout 0ms'), 0);
setImmediate(() => console.log('④ F 宏任务：setImmediate'));

Promise.resolve().then(() => console.log('④ D 微任务：Promise.then'));
process.nextTick(() => console.log('④ C 微任务：process.nextTick（比 Promise 还早）'));

console.log('④ B 同步：脚本同步代码结束');

// 预期打印顺序（同步先全部跑完，再清空微任务，再进宏任务）：
//   A → B → C(nextTick) → D(Promise) → 然后才是各种异步回调 E/F 与上面的 ①②③

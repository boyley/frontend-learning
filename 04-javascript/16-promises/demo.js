// 16 · Promise demo
// 本文件聚焦：Promise 三态、then/catch/finally、链式调用、Promise 静态方法
// 既能在浏览器运行（index.html 引入），也能 `node demo.js` 直接运行

'use strict';

// 收集所有输出，并实时打印到页面 + 控制台
// 因为 Promise 是异步的，所以每次 log 都立即刷新页面，保证看到全部异步结果
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

// ============================================================
// 一、Promise 三态：pending -> fulfilled / rejected（状态只能改变一次）
// ============================================================
log('===== 一、Promise 三态 =====');

// new Promise 时立即执行 executor（同步）；调用 resolve 进入 fulfilled，reject 进入 rejected
const p1 = new Promise((resolve, reject) => {
  // 这里是同步代码，构造 Promise 时立刻运行
  const ok = true;
  if (ok) {
    resolve('成功的值'); // 状态 pending -> fulfilled
  } else {
    reject(new Error('失败的原因')); // 状态 pending -> rejected
  }
  // 状态一旦确定就被"锁死"，下面再调用 resolve/reject 都无效
  resolve('这行不会生效');
});

// then 注册成功回调，返回的依然是一个新的 Promise
p1.then((value) => log('p1 fulfilled:', value));

// ============================================================
// 二、then / catch / finally
// ============================================================
log('===== 二、then / catch / finally =====');

const p2 = new Promise((resolve, reject) => {
  reject(new Error('出错啦'));
});

p2
  // then 的第二个参数也能接收错误，但通常用 catch 统一处理
  .then((v) => log('不会执行:', v))
  // catch 捕获前面链路上的任何 rejected / 抛出的异常
  .catch((err) => log('p2 catch:', err.message))
  // finally 不论成功失败都会执行，常用于收尾（关闭 loading 等），不接收值
  .finally(() => log('p2 finally: 无论成败都执行'));

// ============================================================
// 三、链式调用：then 返回值会被自动包成下一个 Promise 的 resolve 值
// ============================================================
log('===== 三、链式调用 =====');

new Promise((resolve) => resolve(1))
  .then((n) => {
    log('第 1 步收到:', n);
    return n + 1; // 普通返回值 -> 下一个 then 收到 2
  })
  .then((n) => {
    log('第 2 步收到:', n);
    // 返回一个 Promise，链会等待它完成再继续（值会被"拆箱"）
    return new Promise((resolve) => setTimeout(() => resolve(n * 10), 0));
  })
  .then((n) => {
    log('第 3 步收到（来自异步）:', n);
    throw new Error('链中抛错'); // 抛错会跳到最近的 catch
  })
  .then((n) => log('被跳过的步骤:', n))
  .catch((err) => log('链式 catch:', err.message));

// ============================================================
// 四、Promise 静态方法
// ============================================================
log('===== 四、Promise.all / race / allSettled / any =====');

// 构造几个不同耗时、不同结果的 Promise 辅助函数
const ok = (value, ms) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));
const fail = (reason, ms) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(reason)), ms));

// Promise.all：全部成功才成功，返回结果数组；任一失败立即整体失败
Promise.all([ok('A', 30), ok('B', 10), ok('C', 20)]).then((arr) =>
  log('all 全部成功:', arr)
);
Promise.all([ok('A', 30), fail('B 挂了', 10)]).catch((err) =>
  log('all 有一个失败:', err.message)
);

// Promise.race：谁先"敲定"（无论成败）就采用谁的结果
Promise.race([ok('慢', 30), ok('快', 10)]).then((v) => log('race 最快的:', v));

// Promise.allSettled：等所有都敲定，返回每个的状态（永远 fulfilled）
Promise.allSettled([ok('X', 10), fail('Y 挂了', 20)]).then((results) =>
  log('allSettled:', results.map((r) => r.status).join(', '))
);

// Promise.any：任一成功即成功；全部失败才返回 AggregateError
Promise.any([fail('e1', 10), ok('终于成功', 20)]).then((v) =>
  log('any 第一个成功:', v)
);

// ============================================================
// 五、resolve / reject 快捷方法
// ============================================================
Promise.resolve('立即成功').then((v) => log('Promise.resolve:', v));
Promise.reject(new Error('立即失败')).catch((e) =>
  log('Promise.reject:', e.message)
);

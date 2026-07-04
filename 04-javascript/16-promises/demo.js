// 16 · Promise 完全指南 demo
// 覆盖：三态流转、then/catch/finally、链式调用、then 返回值三形态、
// 微任务执行顺序、then 二参与 catch 区别、静态方法全集、
// 实战模式（超时、重试、并发限制、AbortController）、错误处理深度
// 浏览器：打开 index.html 看控制台；Node：node demo.js

'use strict';

// ── 通用输出 ─────────────────────────────────────────────
const lines = [];
function log(...args) {
  const text = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
  lines.push(text);
  console.log(text);
  if (typeof document !== 'undefined') {
    const pre = document.getElementById('output');
    if (pre) pre.textContent = lines.join('\n');
  }
}

function divider(title) {
  log('');
  log('='.repeat(60));
  log(`  ${title}`);
  log('='.repeat(60));
}

// ============================================================
// 一、Promise 三态：状态只能改变一次
// ============================================================
divider('一、Promise 三态（pending → fulfilled / rejected）');

const p1 = new Promise((resolve, reject) => {
  const ok = true;
  if (ok) resolve('成功的值');         // pending → fulfilled
  else reject(new Error('失败的原因')); // pending → rejected
  resolve('这行不会生效');              // ❌ 状态已锁定，无效
});

p1.then(v => log('p1 fulfilled:', v));

// ============================================================
// 二、then / catch / finally
// ============================================================
divider('二、then / catch / finally');

const p2 = new Promise((_, reject) => reject(new Error('出错了')));
p2
  .then(v => log('不会执行:', v))
  .catch(err => log('p2 catch:', err.message))
  .finally(() => log('p2 finally: 无论成败都执行'));   // finally 不接收结果

// ============================================================
// 三、链式调用：then 的返回值决定下一个 then 收到什么
// ============================================================
divider('三、链式调用');

new Promise(resolve => resolve(1))
  .then(n => {
    log('第 1 步收到:', n);
    return n + 1;                              // ➜ 普通值 → 自动包装为 Promise
  })
  .then(n => {
    log('第 2 步收到:', n);
    return new Promise(resolve =>               // ➜ 返回 Promise → 等待拆箱
      setTimeout(() => resolve(n * 10), 0)
    );
  })
  .then(n => {
    log('第 3 步收到（来自异步）:', n);
    throw new Error('链中抛错');                // ➜ throw → 跳过后面 then
  })
  .then(() => log('被跳过的步骤'))
  .catch(err => log('链式 catch:', err.message));

// ============================================================
// 四、Promise 静态方法
// ============================================================
divider('四、静态方法：all / race / allSettled / any');

const ok = (value, ms) =>
  new Promise(resolve => setTimeout(() => resolve(value), ms));
const fail = (reason, ms) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(reason)), ms));

Promise.all([ok('A', 30), ok('B', 10), ok('C', 20)])
  .then(arr => log('all 全部成功:', arr));

Promise.all([ok('A', 30), fail('B 挂了', 10)])
  .catch(err => log('all 有一个失败:', err.message));

Promise.race([ok('慢', 30), ok('快', 10)])
  .then(v => log('race 最快的:', v));

Promise.allSettled([ok('X', 10), fail('Y 挂了', 20)])
  .then(results => log('allSettled:', results.map(r => r.status).join(', ')));

Promise.any([fail('e1', 10), ok('终于成功', 20)])
  .then(v => log('any 第一个成功:', v));

// ============================================================
// 五、then 返回值三形态（进阶）
// ============================================================
divider('五、then 返回值的三种形态');

// 形态①：普通值 → 自动包装
Promise.resolve(10)
  .then(v => v * 2)           // 返回普通值 20
  .then(v => log('形态① 普通值:', v));

// 形态②：Promise → 等待拆箱
Promise.resolve('hello')
  .then(v => Promise.resolve(v.toUpperCase()))  // 返回 Promise
  .then(v => log('形态② Promise拆箱:', v));

// 形态③：thenable 对象（有 then 方法的普通对象）→ 也会拆箱
Promise.resolve(1)
  .then(v => ({ then(resolve) { resolve(v + 100); } }))
  .then(v => log('形态③ thenable拆箱:', v));

// ============================================================
// 六、⭐ 微任务执行顺序
// ============================================================
divider('六、微任务执行顺序（同步 → 微任务 → 宏任务）');

log('--- 注意看输出顺序：');

setTimeout(() => log('[宏任务] setTimeout'), 0);           // 3rd

Promise.resolve().then(() => log('[微任务] then 1'));      // 2nd (同一批)
Promise.resolve().then(() => log('[微任务] then 2'));

log('[同步] 最后一行同步代码');                             // 1st

// 嵌套微任务 vs 宏任务
Promise.resolve()
  .then(() => {
    log('[微任务] then A');
    Promise.resolve().then(() => log('[微任务] then A 内嵌 then')); // 同一批微任务
    setTimeout(() => log('[宏任务] A 内嵌 setTimeout'), 0);         // 下一轮
  })
  .then(() => log('[微任务] then B'));  // B 被 A 的 then 返回链追加到该批微任务

log('--- 执行顺序思考：上面两行哪个先打印？');

// ============================================================
// 七、then(onFulfilled, onRejected) vs catch
// ============================================================
divider('七、then 二参数 vs catch 的区别');

// 区别①：then 的二参不能捕获自身 then 回调里抛出的错误
Promise.reject('err1')
  .then(
    null,
    err => {
      log('二参捕获:', err);
      throw '二参里又出错';             // ❌ 二参处理不了这个
    }
  )
  .then(() => log('❌ 不会执行'))
  .catch(e => log('✅ catch 捕获二参里的错误:', e));

// 区别②：catch 是语法糖 —— 但"距离"不同
// 二参的位置决定了它能兜底的错误范围
Promise.resolve()
  .then(() => { throw '错误A'; })
  .then(null, e => { log('二参只能捕获来自上一个 then 的错误->', e); });

Promise.resolve()
  .then(() => Promise.resolve('✅ 成功'))
  .catch(e => log('catch 捕获不到', e));  // 没有错误

// ============================================================
// 八、Promise.resolve 的 thenable 拆箱机制
// ============================================================
divider('八、thenable 拆箱（鸭式辨型）');

// 任何有 then 方法的对象都会被 Promise 当成 thenable 处理
const thenable = {
  then(resolve, reject) {
    log('   thenable 被执行器调用了');
    resolve('从 thenable 拆箱而来');
  }
};
Promise.resolve(thenable).then(v => log('   thenable 结果:', v));

// 真实的 Promise 也是 thenable——Promise.resolve(p) 返回 p 本身
const orig = new Promise(r => r('保持原引用'));
log('   Promise.resolve(原Promise) 相同引用:', Promise.resolve(orig) === orig);

// ============================================================
// 九、错误处理深度
// ============================================================
divider('九、错误处理深度');

// 模式①：全局监听未捕获的 Promise 错误
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', event => {
    log('[全局] 未捕获的 Promise 错误:', event.reason.message || event.reason);
    event.preventDefault();
  });
}

// 模式②：错误恢复 —— catch 可以返回一个"降级"值
const riskyFetch = new Promise((_, reject) =>
  reject(new Error('网络请求失败'))
);

riskyFetch
  .catch(err => {
    log('   catch 降级:', err.message);
    return '降级数据（缓存）';           // 返回普通值 → Promise 恢复为 fulfilled！
  })
  .then(data => log('   降级后继续:', data));

// 模式③：finally 里抛错会覆盖前面结果
Promise.resolve('正常')
  .finally(() => {
    throw new Error('finally 抛错');
  })
  .catch(e => log('   finally 抛错覆盖结果:', e.message));

// ============================================================
// 十、实战模式
// ============================================================
divider('十、实战模式');

// ── 10a. Promise 化定时器 ────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── 10b. 超时控制（race） ─────────────────────────────
function fetchWithTimeout(ms) {
  return Promise.race([
    delay(200).then(() => '请求成功'),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`超时 ${ms}ms`)), ms)
    )
  ]);
}

fetchWithTimeout(500)
  .then(r => log('超时控制 成功:', r));

fetchWithTimeout(50)
  .then(r => log('不会执行'))
  .catch(e => log('超时控制 超时:', e.message));

// ── 10c. 重试 + 指数退避 ─────────────────────────────
async function fetchWithRetry(task, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try { return await task(); }
    catch (err) {
      log(`   重试 ${i + 1}/${retries}:`, err.message);
      if (i === retries - 1) throw err;
      await delay(100 * Math.pow(2, i));  // 100ms → 200ms → 400ms
    }
  }
}

// 模拟：前 2 次失败，第 3 次成功
let attempt = 0;
fetchWithRetry(
  () => new Promise((resolve, reject) => {
    attempt++;
    attempt < 3 ? reject(new Error(`第${attempt}次失败`)) : resolve('第3次成功 ✅');
  }),
  3
).then(r => log('fetchWithRetry 最终:', r));

// ── 10d. 并发限制（类似 p-limit）─────────────────────
async function parallelLimit(tasks, limit) {
  const results = [];
  const running = new Set();

  for (const [i, task] of tasks.entries()) {
    const p = task(i).then(r => { results[i] = r; });
    running.add(p);
    p.finally(() => running.delete(p));
    if (running.size >= limit) {
      await Promise.race(running);   // 等其中一个完成再继续加
    }
  }
  await Promise.all(running);        // 收尾剩余的
  return results;
}

const tasks = [
  () => delay(200).then(() => '任务 A'),
  () => delay(100).then(() => '任务 B'),
  () => delay(300).then(() => '任务 C'),
  () => delay(50).then(() => '任务 D'),
];

parallelLimit(tasks, 2).then(r => log('并发限制 结果:', r));

// ── 10e. AbortController 取消 ─────────────────────────
divider('十(e)、AbortController 取消演示');

async function cancellableTask() {
  const ac = new AbortController();
  const signal = ac.signal;

  // 模拟一个可取消操作
  const promise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve('任务完成'), 1000);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('操作已取消', 'AbortError'));
    }, { once: true });
  });

  // 200ms 后取消
  setTimeout(() => {
    log('   发起取消...');
    ac.abort();
  }, 200);

  try {
    await promise;
  } catch (e) {
    log('   AbortController 取消结果:', e.message);
  }
}
cancellableTask();

// ── 10f. Promise 轮询（retry until condition）─────────
divider('十(f)、Promise 轮询');

async function poll(condition, interval = 300, timeout = 3000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await condition()) return true;
    await delay(interval);
  }
  throw new Error('轮询超时');
}

// 模拟：某条件在 600ms 后变为 true
let flag = false;
setTimeout(() => { flag = true; log('   条件已满足'); }, 600);
poll(() => Promise.resolve(flag), 200, 2000)
  .then(r => log('轮询结果:', r ? '✅ 成功' : '❌ 失败'))
  .catch(e => log('轮询超时:', e.message));

// ============================================================
// 十一、Promise 与 async/await 等价对照
// ============================================================
divider('十一、Promise ⇔ async/await 等价对照');

async function asyncVersion() {
  const a = await delay(10).then(() => 'A');
  const b = await delay(10).then(() => 'B');
  return [a, b];
}

function promiseVersion() {
  return delay(10).then(() => 'A')
    .then(a => delay(10).then(() => 'B').then(b => [a, b]));
}

asyncVersion().then(r => log('async/await 写法:', r));
promiseVersion().then(r => log('Promise 等价写法:', r));

// ============================================================
// 十二、常见坑
// ============================================================
divider('十二、常见坑示范');

// 坑①：忘记 return → 下一个 then 收到 undefined
Promise.resolve('原始值')
  .then(v => {
    v.toUpperCase();           // ❌ 忘记 return
  })
  .then(v => log('坑① 忘记 return:', v));  // undefined

// 坑②：嵌套 then 而非链式
Promise.resolve('外层')
  .then(v => {
    new Promise(resolve => {
      resolve(v + ' + 内层');
    }).then(r => log('坑② 嵌套（不推荐）:', r));
    return;  // 不好：外层已经走了，无法控制内层
  });

// 坑③：忽略 then 创造新 Promise
const base = Promise.resolve('base');
base.then(v => '分支 A');
base.then(v => '分支 B');     // 两个分支独立，互不影响

// ============================================================
// 总结
// ============================================================
divider('🎯 总结');

log('  Promise 核心：链路状态机，微任务驱动');
log('  ✅ 状态只变一次   ✅ return 决定传参   ✅ 微任务先于宏任务');
log('  ✅ 链尾加 catch   ✅ catch 可恢复     ✅ thenable 自动拆箱');
log('  实战：超时→race  重试→递归catch  并发→limit+race');

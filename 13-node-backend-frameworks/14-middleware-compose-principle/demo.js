// 用「自己手写的 compose」跑几个中间件，验证洋葱模型的去程 + 回程顺序。
// 无任何依赖，直接 node demo.js 即可运行。

const compose = require('./compose');

// 模拟一个上下文对象（相当于 Koa 的 ctx）
const ctx = { logs: [] };

// 小工具：既打印到控制台，又记录到 ctx.logs 方便最后核对顺序
function log(msg) {
  console.log(msg);
  ctx.logs.push(msg);
}

// 中间件 1（最外层）
async function mw1(ctx, next) {
  log('1 进入（去程）');
  await next(); // ← 挂起 mw1，进入 mw2
  log('1 离开（回程）');
}

// 中间件 2（中间层），带一个异步等待，证明 await next() 能跨异步正确挂起/恢复
async function mw2(ctx, next) {
  log('2 进入（去程）');
  await new Promise((r) => setTimeout(r, 30)); // 模拟异步 IO
  await next(); // ← 挂起 mw2，进入 mw3
  log('2 离开（回程）');
}

// 中间件 3（最内层，核心）
async function mw3(ctx, next) {
  log('3 进入（去程）—— 到达核心');
  await next(); // 后面没有中间件了，next() 立即 resolve，开始回程
  log('3 离开（回程）');
}

// 把三个中间件组合成一个函数
const fn = compose([mw1, mw2, mw3]);

// 执行整条洋葱链
fn(ctx).then(() => {
  console.log('\n实际执行顺序:', ctx.logs.map((s) => s[0]).join(''));
  console.log('期望洋葱顺序: 1→2→3→3→2→1（去程 123 + 回程 321）');

  // ── 顺便验证「多次调用 next() 会抛错」的防御逻辑 ──
  console.log('\n验证：同一个中间件里调用两次 next() 应报错');
  const bad = compose([
    async (ctx, next) => {
      await next();
      await next(); // 第二次调用 next()，应触发错误
    },
  ]);
  bad({}).then(
    () => console.log('  ✗ 没报错（不符合预期）'),
    (err) => console.log('  ✓ 已捕获错误:', err.message)
  );
});

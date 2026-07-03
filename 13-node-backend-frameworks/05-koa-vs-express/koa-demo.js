// 05-koa-vs-express —— Koa 3 版本
// 和 express-demo.js 实现同一个接口，但用 Koa 的「洋葱 async/await」模型，
// 对照体会：ctx vs req/res、await next 回程 vs res 事件、try/catch 错误处理。

const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();

// ── 错误处理：最外层 try/catch 包住 await next()，一层兜住内层所有异步错误 ──
app.use(async (ctx, next) => {
  try {
    await next(); // ← 内层任何 middleware / 路由抛错都会被这里 catch
  } catch (err) {
    console.log('[Koa] ✗ 最外层 try/catch 捕获:', err.message);
    ctx.status = 500;
    ctx.body = { error: err.message };
  }
});

// ── 中间件 1：日志。Koa 用 async (ctx, next)，ctx 揉合了 request/response ──
app.use(async (ctx, next) => {
  console.log(`[Koa] 1 进入日志中间件: ${ctx.method} ${ctx.url}`);
  await next(); // ← 挂起，等内层全部处理完再恢复
  console.log('[Koa] 1 日志中间件 await next() 之后（可靠的“回程”）');
});

// ── 中间件 2：计时。洋葱回程天然能量整条链耗时，无需监听事件 ──
app.use(async (ctx, next) => {
  const start = Date.now();
  await next(); // 去程交给下游
  const ms = Date.now() - start; // 回程：内层全跑完了，直接算耗时
  ctx.set('X-Response-Time', `${ms}ms`);
  console.log(`[Koa] 2 计时: ${ms}ms（await next 回程直接拿到）`);
});

// ── 路由：返回 JSON ──
router.get('/api/hello', async (ctx) => {
  console.log('[Koa] 3 命中路由 /api/hello');
  ctx.body = { framework: 'koa', message: 'Hello from Koa 3', ts: Date.now() };
});

// ── 故意抛错的路由：直接 throw，会被最外层 try/catch 兜住 ──
router.get('/api/boom', async (ctx) => {
  throw new Error('故意炸一个错误');
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 3052;
app.listen(PORT, () => {
  console.log(`Koa demo: http://localhost:${PORT}  (/api/hello, /api/boom)`);
});

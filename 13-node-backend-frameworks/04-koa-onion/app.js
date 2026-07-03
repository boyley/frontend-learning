// 04-koa-onion —— Koa 3 洋葱模型 / context / async 中间件
// 核心：Koa 的中间件通过 async/await + next() 形成「洋葱模型」，
// 请求「去程」依次穿过每一层中间件，到达最内层（核心逻辑），
// 再「回程」逆序穿出每一层。每个中间件 await next() 前后各执行一段代码。

const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();

// ── 中间件 1：最外层。计时中间件，回程时设置 X-Response-Time 响应头 ──
app.use(async (ctx, next) => {
  console.log('1 进入 —— 最外层（计时）开始');
  const start = Date.now(); // 去程记录起始时间

  await next(); // ← 暂停当前中间件，把控制权交给下一层（中间件 2）

  // 回程：内层全部执行完毕后，才会回到这里继续往下
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`); // 响应头必须在 body 发送前设置
  console.log(`1 离开 —— 最外层（计时）结束，耗时 ${ms}ms`);
});

// ── 中间件 2：中间层。日志中间件，演示 ctx 的常用属性 ──
app.use(async (ctx, next) => {
  console.log('2 进入 —— 中间层（日志）开始');

  // ctx 是「上下文对象」，把 request/response 揉在一起，常用属性：
  console.log('   ctx.method =', ctx.method); // 请求方法，等价 ctx.request.method
  console.log('   ctx.url    =', ctx.url); // 请求 URL
  // ctx.request 是 Koa 封装的请求对象；ctx.response 是封装的响应对象
  console.log('   ctx.request.headers.host =', ctx.request.headers.host);

  // ctx.state 是「本次请求内」跨中间件传递数据的推荐位置
  ctx.state.requestId = Math.random().toString(36).slice(2, 8);
  console.log('   写入 ctx.state.requestId =', ctx.state.requestId);

  await next(); // ← 交给下一层（中间件 3）

  console.log('2 离开 —— 中间层（日志）结束');
});

// ── 中间件 3：最内层的「业务前置」层。挂载路由前再包一层演示 ──
app.use(async (ctx, next) => {
  console.log('3 进入 —— 最内层（业务前置）开始');

  await next(); // ← 交给路由中间件（真正的核心处理）

  // 回程：路由处理完 body 后，可在这里统一加工
  console.log('3 离开 —— 最内层（业务前置）结束，ctx.body 已被设置');
});

// ── 路由（核心处理）：@koa/router ──
router.get('/', async (ctx) => {
  console.log('   ★ 核心：命中路由 GET /，设置 ctx.body');
  // ctx.body 就是响应体，Koa 会根据类型自动设置 Content-Type
  ctx.body = {
    message: 'Hello Koa 洋葱模型',
    requestId: ctx.state.requestId, // 读取上游中间件写入的 state
    method: ctx.method,
    url: ctx.url,
  };
});

router.get('/hello/:name', async (ctx) => {
  console.log('   ★ 核心：命中路由 GET /hello/:name');
  // ctx.params 是路由参数；ctx.response.status 可读写状态码
  ctx.body = `你好，${ctx.params.name}！(requestId=${ctx.state.requestId})`;
  ctx.response.status = 200;
});

// 把路由中间件挂到 app（routes 分发匹配，allowedMethods 处理 405/501）
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 3004;
app.listen(PORT, () => {
  console.log(`\nKoa 洋葱模型 demo 已启动: http://localhost:${PORT}`);
  console.log('试试: curl http://localhost:%d/  或  curl http://localhost:%d/hello/张三\n', PORT, PORT);
});

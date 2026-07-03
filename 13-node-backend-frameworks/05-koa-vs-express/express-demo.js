// 05-koa-vs-express —— Express 5 版本
// 同一个接口（日志中间件 + 计时 + 返回 JSON 的路由 + 错误处理），
// 用 Express 的「线性 next 回调」模型实现，方便和 koa-demo.js 并排对比。

const express = require('express');
const app = express();

// ── 中间件 1：日志。Express 用 (req, res, next) 签名，调用 next() 进入下一个 ──
app.use((req, res, next) => {
  console.log(`[Express] 1 进入日志中间件: ${req.method} ${req.url}`);
  // Express 里没有 ctx，请求信息在 req 上，响应操作在 res 上
  next(); // ← 线性地把控制权交给下一个中间件（不是 await）
  // 注意：next() 之后这里的代码会「立刻」执行（同步返回），
  // 此时下游可能还没处理完（异步），所以 Express 不适合在 next() 后做回程逻辑
  console.log('[Express] 1 日志中间件的 next() 之后（注意：这里不是可靠的“回程”）');
});

// ── 中间件 2：计时。Express 靠监听 res 的 'finish' 事件来「回程」计时 ──
app.use((req, res, next) => {
  const start = Date.now();
  // Express 没有洋葱回程，要量整条链耗时得 hook res 的 finish 事件
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[Express] 2 计时: ${ms}ms（通过 res 'finish' 事件拿到）`);
  });
  next();
});

// ── 路由：返回 JSON ──
app.get('/api/hello', (req, res) => {
  console.log('[Express] 3 命中路由 /api/hello');
  res.json({ framework: 'express', message: 'Hello from Express 5', ts: Date.now() });
});

// ── 故意抛错的路由，演示错误处理 ──
app.get('/api/boom', (req, res) => {
  // Express 5：异步错误可直接 throw 或传给 next(err)，会被错误中间件捕获
  throw new Error('故意炸一个错误');
});

// ── 错误处理中间件：靠「4 个参数」(err, req, res, next) 识别，必须放最后 ──
app.use((err, req, res, next) => {
  console.log('[Express] ✗ 错误中间件捕获:', err.message);
  res.status(500).json({ error: err.message });
});

const PORT = 3051;
app.listen(PORT, () => {
  console.log(`Express demo: http://localhost:${PORT}  (/api/hello, /api/boom)`);
});

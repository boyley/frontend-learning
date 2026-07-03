// ============================================================
// app.js —— Express 中间件机制 + 错误处理中间件
// 演示：洋葱式串联、应用级 vs 路由级、next(err) 短路、
//       express.static、404 兜底、四参错误处理中间件
// 运行：npm install && npm start，然后 curl 测试（见 README）
// ============================================================

const path = require('path');
const express = require('express');
const app = express();

app.use(express.json()); // 解析 JSON body

// ---------- 1) 应用级中间件（洋葱式串联，按顺序执行）----------
// 中间件 A：计时开始 + 打印
app.use((req, res, next) => {
  req._start = Date.now(); // 挂个字段给后面的中间件用
  console.log(`→ [A 进入] ${req.method} ${req.url}`);
  next(); // 交给下一个
  // 注意：next() 之后这里同步代码会继续，但响应耗时统计更适合放 res 'finish' 事件
});

// 中间件 B：给所有响应加一个自定义头
app.use((req, res, next) => {
  console.log('  [B 进入] 加响应头 X-Powered-By-Demo');
  res.setHeader('X-Powered-By-Demo', 'express-middleware');
  next();
});

// ---------- 2) express.static：静态资源服务 ----------
// 访问 /static/hello.txt 会直接返回 public/hello.txt 文件内容
app.use('/static', express.static(path.join(__dirname, 'public')));

// ---------- 3) 路由级中间件：只作用于挂载它的这条路由 ----------
// 一个「假鉴权」中间件：需要 header x-token 才放行，否则 next(err) 短路
function auth(req, res, next) {
  console.log('  [auth 路由级中间件] 检查 x-token');
  if (req.headers['x-token'] === 'secret') {
    return next(); // 通过
  }
  const err = new Error('未授权：缺少或错误的 x-token');
  err.status = 401;
  next(err); // 传 err → 跳过后续普通中间件/路由，直达错误处理中间件
}

app.get('/', (req, res) => {
  res.send('中间件 demo 首页，试试 /profile、/boom、/static/hello.txt');
});

// 只有这条路由经过 auth；其它路由不受影响 —— 这就是「路由级」
app.get('/profile', auth, (req, res) => {
  res.json({ user: '张三', vip: true });
});

// ---------- 4) 故意抛错的路由：演示错误被自动捕获 ----------
// Express 5 里 async 路由 throw 的错误会自动进错误处理中间件
app.get('/boom', async (req, res) => {
  throw new Error('业务处理时炸了！(故意的)'); // 无需手动 try/catch + next
});

// 同步抛错也一样会被 Express 捕获
app.get('/boom-sync', (req, res) => {
  throw new Error('同步抛错也会被捕获');
});

// ---------- 5) 404 兜底中间件（放在所有路由之后、错误处理之前）----------
// 走到这里说明前面没有任何路由匹配
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

// ---------- 6) 错误处理中间件（四个参数！必须放最后）----------
// 签名固定为 (err, req, res, next)，Express 靠「参数个数=4」识别它
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(`✗ [错误中间件] ${status} ${err.message}`);
  res.status(status).json({ error: err.message, status });
});

const PORT = 3004;
app.listen(PORT, () => {
  console.log(`express-middleware 运行在 http://localhost:${PORT}`);
});

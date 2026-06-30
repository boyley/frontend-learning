// ============================================================
// 14 · Express 入门 —— 路由、中间件、请求/响应
// 安装依赖：npm install
// 运行方式：node app.js  （或 npm start）
// 访问：http://localhost:3000
// ============================================================

// Express 是最流行的 Node Web 框架，把原生 http 的繁琐（手写路由、解析 body）
// 封装成简洁的「路由 + 中间件」模型。
const express = require('express');
const path = require('node:path');

const app = express();   // 创建应用实例
const PORT = 3000;

// ========== 中间件（Middleware）==========
// 中间件 = 一个 (req, res, next) 函数，请求会像流水线一样依次穿过它们。
// 调 next() 进入下一个中间件；不调用就「截断」请求。顺序很重要！

// ① 内置中间件：解析 JSON 请求体（解析后挂到 req.body）
app.use(express.json());
// 解析表单 application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// ② 自定义中间件：打印每个请求的日志（放最前面，所有请求都会经过）
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next(); // 必须调用，否则请求卡死在这里
});

// ③ 静态资源中间件：把 public 目录下的文件直接对外提供（访问 /index.html 等）
app.use(express.static(path.join(__dirname, 'public')));

// ========== 路由（Routing）==========
// app.METHOD(路径, 处理函数)，处理函数拿到 req（请求）和 res（响应）

// GET /
app.get('/', (req, res) => {
  // res.send 自动设置 Content-Type 并结束响应
  res.send('<h1>Express 入门</h1><p>试试 /hello/张三 或 /search?q=node</p>');
});

// 路径参数 :name —— 用 req.params 读取
app.get('/hello/:name', (req, res) => {
  res.send(`你好，${req.params.name}！`);
});

// 查询参数 ?q=xxx —— 用 req.query 读取
app.get('/search', (req, res) => {
  const keyword = req.query.q || '(空)';
  // res.json 返回 JSON，自动设置 application/json
  res.json({ keyword, results: [`关于「${keyword}」的结果1`, '结果2'] });
});

// POST，读取 JSON body（前面 express.json() 已解析好）
app.post('/echo', (req, res) => {
  res.json({ youSent: req.body });
});

// ④ 404 兜底中间件：放在所有路由「之后」，没匹配到的请求会落到这里
app.use((req, res) => {
  res.status(404).json({ error: '404 Not Found', path: req.path });
});

// ⑤ 错误处理中间件：4 个参数 (err, req, res, next)，Express 专门识别它
app.use((err, req, res, next) => {
  console.error('服务器错误：', err.message);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`Express 服务已启动 → http://localhost:${PORT}`);
  console.log('试试：');
  console.log(`  curl http://localhost:${PORT}/hello/张三`);
  console.log(`  curl http://localhost:${PORT}/search?q=node`);
  console.log(`  curl -X POST http://localhost:${PORT}/echo -H "Content-Type: application/json" -d '{"a":1}'`);
});

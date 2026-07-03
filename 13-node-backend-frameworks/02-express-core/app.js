// ============================================================
// app.js —— Express 5 核心：路由 / req·res / 基础中间件
// 运行：npm install && npm start，然后 curl 测试（见 README）
// ============================================================

const express = require('express');
const app = express();

// ---- 内置 body 解析中间件：把 JSON 请求体解析到 req.body ----
// Express 4 里需要单独装 body-parser，Express 5 内置 express.json() / express.urlencoded()
app.use(express.json()); // 解析 Content-Type: application/json
app.use(express.urlencoded({ extended: true })); // 解析表单 x-www-form-urlencoded

// ---- 一个简单的日志中间件（应用级 use）----
// 每个请求都会先经过这里，next() 把控制权交给后续路由
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); // 必须调用，否则请求卡死
});

// ---- GET / ：res.send 可发送字符串/HTML ----
app.get('/', (req, res) => {
  res.send('<h1>Express 5 首页</h1>'); // 自动设 Content-Type: text/html
});

// ---- 路由参数 /users/:id ：从 req.params 取 ----
app.get('/users/:id', (req, res) => {
  const { id } = req.params; // 路径参数
  // res.json 自动 JSON.stringify + 设 application/json
  res.json({ id, name: `用户${id}` });
});

// ---- 查询参数 req.query ：/search?keyword=xx&page=2 ----
app.get('/search', (req, res) => {
  const { keyword = '', page = '1' } = req.query; // query 全是字符串
  res.json({ keyword, page: Number(page), tip: '试试 /search?keyword=node&page=2' });
});

// ---- POST /users ：req.body（依赖上面的 express.json()）----
app.post('/users', (req, res) => {
  const { name } = req.body || {};
  if (!name) {
    // res.status 设状态码，链式调用 .json
    return res.status(400).json({ error: 'name 必填' });
  }
  // 201 Created
  res.status(201).json({ created: true, name });
});

// ---- 启动 ----
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`express-core 运行在 http://localhost:${PORT}`);
});

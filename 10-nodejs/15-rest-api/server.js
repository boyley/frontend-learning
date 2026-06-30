// ============================================================
// 15 · REST API —— 用 Express 写一套标准的 CRUD 接口
// 资源：todos（待办事项），数据存内存（重启即清空，仅教学）
// 安装依赖：npm install
// 运行方式：node server.js  （或 npm start）
// ============================================================

// REST 风格：用「HTTP 方法 + 资源 URL」表达操作，用「状态码」表达结果。
//   GET    /todos       查询列表
//   GET    /todos/:id   查询单个
//   POST   /todos       新建
//   PUT    /todos/:id   全量更新
//   DELETE /todos/:id   删除
//
// 常用状态码：200 成功 / 201 创建成功 / 204 成功无内容 / 400 参数错 / 404 找不到

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json()); // 解析 JSON 请求体

// ---- 内存数据库（数组模拟）----
let todos = [
  { id: 1, title: '学习 Node 基础', done: true },
  { id: 2, title: '学习 Express', done: false },
];
let nextId = 3; // 自增主键

// ① 查询列表（支持 ?done=true 过滤，演示查询参数）
app.get('/todos', (req, res) => {
  let result = todos;
  if (req.query.done !== undefined) {
    const want = req.query.done === 'true';
    result = todos.filter((t) => t.done === want);
  }
  res.json({ total: result.length, data: result });
});

// ② 查询单个（路径参数 :id）
app.get('/todos/:id', (req, res) => {
  const todo = todos.find((t) => t.id === Number(req.params.id));
  if (!todo) {
    // 找不到资源 → 404
    return res.status(404).json({ error: '该 todo 不存在' });
  }
  res.json(todo);
});

// ③ 新建（POST，从 req.body 拿数据）
app.post('/todos', (req, res) => {
  const { title } = req.body;
  // 参数校验：标题必填 → 400
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title 必填且为字符串' });
  }
  const todo = { id: nextId++, title, done: false };
  todos.push(todo);
  // 创建成功 → 201，并返回新建的资源
  res.status(201).json(todo);
});

// ④ 全量更新（PUT）
app.put('/todos/:id', (req, res) => {
  const todo = todos.find((t) => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: '该 todo 不存在' });

  const { title, done } = req.body;
  if (title !== undefined) todo.title = title;
  if (done !== undefined) todo.done = Boolean(done);
  res.json(todo);
});

// ⑤ 删除（DELETE）
app.delete('/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const exists = todos.some((t) => t.id === id);
  if (!exists) return res.status(404).json({ error: '该 todo 不存在' });

  todos = todos.filter((t) => t.id !== id);
  // 删除成功通常返回 204（无响应体）
  res.status(204).end();
});

// 404 兜底
app.use((req, res) => res.status(404).json({ error: '接口不存在' }));

app.listen(PORT, () => {
  console.log(`REST API 已启动 → http://localhost:${PORT}`);
  console.log('用 curl 测试 CRUD：');
  console.log(`  查列表  curl http://localhost:${PORT}/todos`);
  console.log(`  查单个  curl http://localhost:${PORT}/todos/1`);
  console.log(`  新建    curl -X POST http://localhost:${PORT}/todos -H "Content-Type: application/json" -d '{"title":"写代码"}'`);
  console.log(`  更新    curl -X PUT http://localhost:${PORT}/todos/2 -H "Content-Type: application/json" -d '{"done":true}'`);
  console.log(`  删除    curl -X DELETE http://localhost:${PORT}/todos/1`);
});

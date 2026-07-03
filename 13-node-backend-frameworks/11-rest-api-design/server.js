// ============================================================
// 规范的 RESTful 资源接口示范：/api/articles
// 演示 REST 的核心约定：
//   1. 资源用【名词复数】命名（articles，不是 getArticle）
//   2. 用【HTTP 方法】表达动作：GET 查 / POST 建 / PUT 全量改 / PATCH 部分改 / DELETE 删
//   3. 用【状态码】表达结果：200 OK / 201 Created / 204 No Content / 400 / 404
//   4. 统一 JSON 响应结构：{ code, message, data }
// 存储用内存数组即可，聚焦“接口设计”本身。
// ============================================================

const express = require('express');
const app = express();
app.use(express.json());

// ---------------- 内存“数据库” ----------------
let articles = [
  { id: 1, title: 'REST 入门', content: '什么是 REST', tags: ['rest'] },
  { id: 2, title: 'HTTP 方法语义', content: '幂等与安全', tags: ['http'] },
];
let nextId = 3;

// ---------------- 统一响应助手 ----------------
// 所有成功响应都走这里，保证前端拿到的结构一致：{ code, message, data }
function ok(res, status, data, message = 'success') {
  return res.status(status).json({ code: 0, message, data });
}
// 错误响应：{ code, message, data:null }
function fail(res, status, message) {
  return res.status(status).json({ code: status, message, data: null });
}

// ============================================================
// GET /api/articles —— 获取列表（安全 + 幂等）
// 200 OK，返回数组
// ============================================================
app.get('/api/articles', (req, res) => {
  ok(res, 200, articles);
});

// ============================================================
// GET /api/articles/:id —— 获取单个（安全 + 幂等）
// 命中 200；找不到 404
// ============================================================
app.get('/api/articles/:id', (req, res) => {
  const article = articles.find((a) => a.id === Number(req.params.id));
  if (!article) return fail(res, 404, `article ${req.params.id} not found`);
  ok(res, 200, article);
});

// ============================================================
// POST /api/articles —— 创建（不安全、不幂等：连发两次建两条）
// 校验通过 201 Created，返回新资源；缺字段 400
// ============================================================
app.post('/api/articles', (req, res) => {
  const { title, content, tags } = req.body || {};
  if (!title || !content) return fail(res, 400, 'title 和 content 为必填');
  const article = { id: nextId++, title, content, tags: tags || [] };
  articles.push(article);
  ok(res, 201, article, 'created');
});

// ============================================================
// PUT /api/articles/:id —— 全量更新（幂等：同样的请求重复发结果一致）
// 用请求体整体替换该资源的字段；找不到 404，缺字段 400
// ============================================================
app.put('/api/articles/:id', (req, res) => {
  const article = articles.find((a) => a.id === Number(req.params.id));
  if (!article) return fail(res, 404, `article ${req.params.id} not found`);
  const { title, content, tags } = req.body || {};
  // PUT 语义 = 用完整表示替换，因此必填字段缺了就是 400
  if (!title || !content) return fail(res, 400, 'PUT 需提供完整的 title 和 content');
  article.title = title;
  article.content = content;
  article.tags = tags || [];
  ok(res, 200, article, 'replaced');
});

// ============================================================
// PATCH /api/articles/:id —— 部分更新（只改传入的字段）
// 找不到 404
// ============================================================
app.patch('/api/articles/:id', (req, res) => {
  const article = articles.find((a) => a.id === Number(req.params.id));
  if (!article) return fail(res, 404, `article ${req.params.id} not found`);
  const { title, content, tags } = req.body || {};
  // 只更新“确实传了”的字段，其余保持不变
  if (title !== undefined) article.title = title;
  if (content !== undefined) article.content = content;
  if (tags !== undefined) article.tags = tags;
  ok(res, 200, article, 'patched');
});

// ============================================================
// DELETE /api/articles/:id —— 删除（幂等）
// 成功 204 No Content（无响应体）；找不到 404
// ============================================================
app.delete('/api/articles/:id', (req, res) => {
  const idx = articles.findIndex((a) => a.id === Number(req.params.id));
  if (idx === -1) return fail(res, 404, `article ${req.params.id} not found`);
  articles.splice(idx, 1);
  res.status(204).end(); // 204：删除成功，不返回 body
});

// 兜底 404
app.use((req, res) => fail(res, 404, `找不到 ${req.method} ${req.originalUrl}`));

const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
  console.log(`[11-rest-api-design] listening on http://localhost:${PORT}`);
});

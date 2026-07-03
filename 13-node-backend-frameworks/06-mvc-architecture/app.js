// ============================================================
// app.js：组装入口（Composition Root）
// 把各层拼起来：express 应用 → 挂 body 解析 → 挂路由 → 挂统一错误处理。
// 分层的“接线”只在这里发生，其它文件互不感知框架启动细节。
// ============================================================

const express = require('express');
const userRoutes = require('./src/routes/userRoutes');

const app = express();

// 内置 JSON body 解析（Express 5 自带，无需 body-parser）
app.use(express.json());

// 把 user 资源的路由挂到 /api/users 前缀下
app.use('/api/users', userRoutes);

// 兜底 404：没有任何路由匹配时
app.use((req, res) => {
  res.status(404).json({ error: `找不到 ${req.method} ${req.originalUrl}` });
});

// 统一错误处理中间件（4 个参数，Express 据此识别为错误处理器）
// controller 里 next(err) 抛出的错误最终都到这里，转成统一 JSON。
app.use((err, req, res, next) => {
  const status = err.status || 500; // service 里挂的语义状态码，默认 500
  res.status(status).json({ error: err.message });
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`[06-mvc-architecture] listening on http://localhost:${PORT}`);
});

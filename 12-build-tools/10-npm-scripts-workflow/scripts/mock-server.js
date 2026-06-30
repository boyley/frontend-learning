// scripts/mock-server.js —— 一个极简的 mock 接口服务器（用 Node 内置 http，无需依赖）
// 配合 dev:all 并行启动，模拟「前端 + mock 后端」一起跑的工作流。
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*'); // 允许跨域,方便本地联调
  res.end(JSON.stringify({ code: 0, data: { msg: '这是 mock 数据', time: Date.now() } }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🧪 mock-server 已启动：http://localhost:${PORT}`);
});

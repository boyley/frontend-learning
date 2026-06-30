// ============================================================
// 07 · 原生 HTTP 服务器 —— 不依赖任何框架，手写一个 Web 服务
// 运行方式：node server.js  然后浏览器访问 http://localhost:3000
// 停止：Ctrl + C
// ============================================================

const http = require('node:http');
const { URL } = require('node:url');

const PORT = 3000;

// createServer 的回调在「每个请求到达时」都会被调用一次：
//   req = IncomingMessage（可读流）：包含请求方法、URL、请求头、请求体
//   res = ServerResponse（可写流）：用来写状态码、响应头、响应体
const server = http.createServer((req, res) => {
  // ① 解析请求行信息
  const { method } = req;                          // GET / POST ...
  const url = new URL(req.url, `http://${req.headers.host}`); // 解析路径与查询参数
  const pathname = url.pathname;

  console.log(`收到请求：${method} ${req.url}`);

  // ② 简单路由：根据 method + pathname 分发
  if (method === 'GET' && pathname === '/') {
    // 返回一段 HTML
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>你好，这是原生 Node HTTP 服务器</h1><p>试试 /api/user?name=张三</p>');

  } else if (method === 'GET' && pathname === '/api/user') {
    // 读取查询参数 ?name=xxx，返回 JSON
    const name = url.searchParams.get('name') || '匿名';
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ code: 0, data: { name, ts: Date.now() } }));

  } else if (method === 'POST' && pathname === '/api/echo') {
    // ③ 读取请求体：req 是「可读流」，body 是一块块 chunk 拼起来的
    let body = '';
    req.on('data', (chunk) => { body += chunk; }); // 持续收集数据块
    req.on('end', () => {                            // 收完了
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ youSent: body }));
    });

  } else {
    // ④ 兜底 404
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found：找不到 ' + pathname);
  }
});

// listen 启动监听；回调在服务器开始监听后触发
server.listen(PORT, () => {
  console.log(`服务器已启动 → http://localhost:${PORT}`);
  console.log('试试：');
  console.log(`  浏览器打开    http://localhost:${PORT}/`);
  console.log(`  浏览器打开    http://localhost:${PORT}/api/user?name=张三`);
  console.log(`  命令行 POST   curl -X POST -d '{"a":1}' http://localhost:${PORT}/api/echo`);
});

// 监听服务器级错误（如端口被占用 EADDRINUSE）
server.on('error', (err) => {
  console.error('服务器错误：', err.message);
});

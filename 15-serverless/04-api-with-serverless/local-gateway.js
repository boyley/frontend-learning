/**
 * 本地「API 网关」模拟器 —— 零依赖，纯 Node http。
 * ---------------------------------------------------------------
 * 作用：把真实 HTTP 请求，翻译成云函数约定的 event，调用 handler，
 *       再把 handler 返回的 { statusCode, headers, body } 翻译回 HTTP 响应。
 * 这正是 AWS API Gateway / 阿里云 API 网关 在云上替你做的事。
 *
 * 运行：  node local-gateway.js
 * 然后：  curl "http://localhost:3000/hello?name=张三"
 *        curl -X POST http://localhost:3000/echo -d '{"a":1}'
 */

const http = require('http');
const handler = require('./handler');

// 极简路由表：METHOD + path → 对应的 handler 导出函数
const routes = {
  'GET /hello': handler.hello,
  'POST /echo': handler.echo,
};

const server = http.createServer((req, res) => {
  // 收集请求体
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', async () => {
    const url = new URL(req.url, 'http://localhost');
    const routeKey = `${req.method} ${url.pathname}`;

    // ① 把 HTTP 请求「翻译」成云函数事件对象（API Gateway proxy 风格）
    const event = {
      httpMethod: req.method,
      path: url.pathname,
      headers: req.headers,
      queryStringParameters: Object.fromEntries(url.searchParams),
      body: chunks.length ? Buffer.concat(chunks).toString() : null,
    };

    const fn = routes[routeKey];
    if (!fn) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: `无此路由: ${routeKey}` }));
      return;
    }

    try {
      // ② 调用云函数
      const result = await fn(event);
      // ③ 把函数返回值「翻译」回 HTTP 响应
      res.writeHead(result.statusCode || 200, result.headers || {});
      res.end(result.body || '');
    } catch (err) {
      // 函数抛错 → 网关返回 500（真实平台亦然）
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '函数执行异常', detail: String(err) }));
    }
  });
});

server.listen(3000, () => {
  console.log('本地网关已启动: http://localhost:3000');
  console.log('  GET  /hello?name=张三');
  console.log('  POST /echo   (body 为 JSON)');
});

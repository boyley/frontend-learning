// ============================================================
// native-server.js —— 纯内置 http 模块写服务（零依赖）
// 目的：刻意暴露原生 http 的痛点，为「为什么要框架」做铺垫。
// 运行：node native-server.js
// ============================================================

const http = require('http');

const server = http.createServer((req, res) => {
  // ---- 痛点 1：url 要自己解析（path 和 query 混在一起）----
  // req.url 形如 "/users/1?verbose=1"，得手动切分。
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname; // 纯路径
  const method = req.method; // 请求方法

  // ---- 痛点 2：路由靠 if/else 硬堆，越写越长、无法优雅扩展 ----
  // 每加一个接口就多一段 if；路径参数（/users/:id）没有现成支持，得自己 split 字符串。

  // 路由：GET /
  if (method === 'GET' && pathname === '/') {
    // ---- 痛点 3：Content-Type 每次都要手动设，忘了就乱码/被当纯文本 ----
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('原生 http 首页');
    return;
  }

  // 路由：GET /users/:id —— 路径参数得手写解析
  if (method === 'GET' && pathname.startsWith('/users/')) {
    // 手动从路径里抠出 id，容错全靠自己
    const id = pathname.split('/')[2];
    // ---- 痛点 4：返回 JSON 要手动 JSON.stringify + 手动设 header ----
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ id, name: `用户${id}` }));
    return;
  }

  // 路由：POST /users —— 读 body 要监听 data/end 手动拼接
  if (method === 'POST' && pathname === '/users') {
    // ---- 痛点 5：body 解析代码每个 POST 接口都要重复写一遍 ----
    let body = '';
    req.on('data', (chunk) => {
      body += chunk; // 一块块拼接
    });
    req.on('end', () => {
      let data;
      try {
        data = JSON.parse(body); // 还得自己 try/catch 防坏 JSON
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'body 不是合法 JSON' }));
        return;
      }
      res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ created: true, received: data }));
    });
    return; // 注意：因为是异步，这里必须 return，否则会走到下面的 404
  }

  // ---- 痛点（续）：404 也得自己兜底，中间件机制根本不存在 ----
  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ error: 'Not Found', path: pathname }));
});

server.listen(3001, () => {
  console.log('native-server 运行在 http://localhost:3001');
});

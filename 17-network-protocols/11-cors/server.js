// 11 · CORS demo —— 纯 Node 内置 http 模块，无需安装任何依赖
// 目的：演示「简单请求」直接放行、「非简单请求」触发 OPTIONS 预检两条路径，
//       让你在 DevTools Network 里亲眼看到多出来的那一次 OPTIONS 请求。
//
// 运行：node server.js  然后用浏览器打开同目录 client.html
// （client.html 建议用另一个端口/file 协议打开，制造"跨域"场景）

const http = require('http');

const PORT = 4000;

// 允许跨域访问本 API 的来源。生产环境应精确指定，切勿无脑用 "*"（尤其带凭证时）。
const ALLOW_ORIGIN = '*';

function setCorsHeaders(res, origin) {
  // Access-Control-Allow-Origin：核心头，告诉浏览器"我允许这个源读我的响应"
  res.setHeader('Access-Control-Allow-Origin', origin || ALLOW_ORIGIN);
  // 允许的方法（预检响应里回给浏览器）
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // 允许的自定义请求头（浏览器预检时会问 X-Custom-Header 能不能带）
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Custom-Header');
  // 预检结果缓存 600 秒，这段时间内同样的请求不再重复预检
  res.setHeader('Access-Control-Max-Age', '600');
}

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  console.log(`\n[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}  Origin=${origin || '(无)'}`);

  setCorsHeaders(res, origin);

  // ---------- 预检请求 Preflight：浏览器自动发的 OPTIONS ----------
  // 非简单请求（如带 Content-Type: application/json、或带自定义头、或用 PUT/DELETE）
  // 浏览器会先发一个 OPTIONS "问路"，服务器同意后才发真正的请求。
  if (req.method === 'OPTIONS') {
    console.log('  → 收到预检 OPTIONS，浏览器在问：');
    console.log('     Access-Control-Request-Method =', req.headers['access-control-request-method']);
    console.log('     Access-Control-Request-Headers =', req.headers['access-control-request-headers']);
    // 204 无内容 + 上面 setCorsHeaders 里的许可头 → 浏览器据此决定放不放行真实请求
    res.writeHead(204);
    res.end();
    return;
  }

  // ---------- 简单请求 GET：无需预检，浏览器直接发，服务器带上 Allow-Origin 即可 ----------
  if (req.method === 'GET' && req.url === '/api/simple') {
    console.log('  → 简单请求 GET（无预检），直接返回数据');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ type: 'simple', msg: '这是一个简单请求的响应（没有预检）' }));
    return;
  }

  // ---------- 非简单请求 POST + JSON：上面已先经过 OPTIONS 预检，这里是真实请求 ----------
  if (req.method === 'POST' && req.url === '/api/preflight') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      console.log('  → 预检通过后的真实 POST，body =', body);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ type: 'preflight', received: body, msg: '这是预检通过后的响应' }));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log(`CORS demo API 已启动：http://localhost:${PORT}`);
  console.log('用浏览器打开 client.html（不同源），点击按钮观察简单请求 / 预检请求的区别');
});

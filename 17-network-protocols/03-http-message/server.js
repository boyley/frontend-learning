/**
 * 最小 HTTP 报文观察 demo —— 纯 Node.js 内置模块，无需 npm install。
 *
 * 作用：
 *   1) 把收到的【HTTP 请求报文】的各部分（请求行 / 请求头 / 请求体）原样打印到控制台，
 *      让你直观看到浏览器/curl 实际发出的报文长什么样。
 *   2) 根据不同路径返回不同【状态码】与【响应报文】，方便对照 2xx/3xx/4xx/5xx。
 *
 * 运行： node server.js      然后访问 http://localhost:3000
 */
const http = require('http');

const server = http.createServer((req, res) => {
  // ---------- 打印请求报文 ----------
  // 请求行：method + target + version
  console.log('\n================ 收到一个请求 ================');
  console.log(`请求行(Request Line): ${req.method} ${req.url} HTTP/${req.httpVersion}`);

  // 请求头：req.headers 是解析后的键值对（HTTP/2 下伪首部由 Node 归一化处理）
  console.log('请求头(Headers):');
  for (const [key, value] of Object.entries(req.headers)) {
    console.log(`  ${key}: ${value}`);
  }

  // 请求体：GET 通常无体，POST/PUT 才有。需要监听 data 事件流式读取。
  let body = '';
  req.on('data', (chunk) => (body += chunk));
  req.on('end', () => {
    if (body) console.log(`请求体(Body): ${body}`);

    // ---------- 按路径返回不同状态码，演示响应报文 ----------
    if (req.url === '/created' && req.method === 'POST') {
      // 201：资源已创建
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ msg: 'resource created', received: body }));
    } else if (req.url === '/nocontent') {
      // 204：成功但无响应体
      res.writeHead(204);
      res.end();
    } else if (req.url === '/old') {
      // 301：永久重定向，靠 Location 头告诉客户端新地址
      res.writeHead(301, { Location: '/' });
      res.end();
    } else if (req.url === '/boom') {
      // 500：服务器内部错误
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('服务器内部错误');
    } else if (req.url === '/') {
      // 200：正常
      const html = '<h1>HTTP 报文 demo</h1>'
        + '<p>试试: POST /created, GET /nocontent, GET /old, GET /boom, GET /notexist</p>'
        + '<p>同时看你的终端，观察请求报文被逐行打印。</p>';
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': Buffer.byteLength(html),
      });
      res.end(html);
    } else {
      // 404：找不到
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    }
  });
});

server.listen(3000, () => {
  console.log('HTTP demo 已启动: http://localhost:3000');
  console.log('用浏览器或 curl -v http://localhost:3000 访问，观察终端打印的请求报文。');
});

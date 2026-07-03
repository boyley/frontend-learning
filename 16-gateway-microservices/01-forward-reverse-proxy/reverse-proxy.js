// reverse-proxy.js
// ─────────────────────────────────────────────────────────────
// 用 Node 原生 http 模块「手写」一个反向代理：
//   客户端(curl/浏览器) → 本代理(8080) → 后端源站(5050)
// 客户端以为 8080 就是真正的服务器，其实是我们代表后端接收请求再转发。
// 这就是 Nginx / API 网关 / CDN 的最小内核。
// 纯 Node，不需要安装任何依赖。
// ─────────────────────────────────────────────────────────────

const http = require('http');

const PROXY_PORT = 8080;   // 代理对外监听的端口（客户端连这个）
const TARGET_HOST = 'localhost';
const TARGET_PORT = 5050;  // 后端源站端口（origin-server.js）

const server = http.createServer((clientReq, clientRes) => {
  console.log(`[reverse-proxy] 收到请求 ${clientReq.method} ${clientReq.url}`);

  // 1) 复制客户端请求头，准备透传给后端
  //    注意：反向代理常见做法是补几个「转发信息」头，让后端知道真实来源。
  const forwardHeaders = { ...clientReq.headers };
  // X-Real-IP：真实客户端 IP
  forwardHeaders['x-real-ip'] = clientReq.socket.remoteAddress;
  // X-Forwarded-For：经过的代理链（这里简单追加真实 IP）
  forwardHeaders['x-forwarded-for'] = clientReq.socket.remoteAddress;
  // X-Forwarded-Proto：原始协议
  forwardHeaders['x-forwarded-proto'] = 'http';

  // 2) 构造发往后端的请求选项
  const options = {
    host: TARGET_HOST,
    port: TARGET_PORT,
    method: clientReq.method,   // 透传方法
    path: clientReq.url,        // 透传路径 + query
    headers: forwardHeaders,    // 透传（并增强）请求头
  };

  // 3) 发起到后端的请求；拿到后端响应后回写给客户端
  const proxyReq = http.request(options, (proxyRes) => {
    // 把后端的响应头原样带回，并注入我们自己的标识头
    const responseHeaders = { ...proxyRes.headers };
    responseHeaders['x-proxy-by'] = 'node-reverse-proxy'; // 证明经过了本代理

    res_writeHead(clientRes, proxyRes.statusCode, responseHeaders);

    // 用管道把后端响应体流式透传给客户端（大响应也不会爆内存）
    proxyRes.pipe(clientRes);
  });

  // 4) 把客户端的请求体（POST/PUT 的 body）流式透传给后端
  clientReq.pipe(proxyReq);

  // 5) 后端连不上 / 出错时的兜底处理（否则客户端会一直挂着）
  proxyReq.on('error', (err) => {
    console.error('[reverse-proxy] 转发到后端失败：', err.message);
    if (!clientRes.headersSent) {
      clientRes.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    }
    clientRes.end(JSON.stringify({ error: 'Bad Gateway', detail: err.message }));
  });
});

// 小工具：安全地写响应头（headersSent 后再写会抛错）
function res_writeHead(res, status, headers) {
  if (!res.headersSent) {
    res.writeHead(status, headers);
  }
}

server.listen(PROXY_PORT, () => {
  console.log(`[reverse-proxy] 反向代理已启动 http://localhost:${PROXY_PORT}`);
  console.log(`[reverse-proxy] 所有请求将被转发到 http://${TARGET_HOST}:${TARGET_PORT}`);
});

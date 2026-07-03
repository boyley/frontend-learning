// origin-server.js
// ─────────────────────────────────────────────────────────────
// 这是「后端源站服务」(origin server)，也就是反向代理背后真正干活的服务。
// 它监听 5050 端口，收到任何请求都返回一段 JSON，里面带上主机标识，
// 方便我们在浏览器/curl 里确认「请求最终是被这台后端处理的」。
// 纯 Node，不需要安装任何依赖。
// ─────────────────────────────────────────────────────────────

const http = require('http');
const os = require('os');

// 端口写成常量，方便和 reverse-proxy.js 对齐
const PORT = 5050;

// http.createServer 的回调：每来一个请求就执行一次
const server = http.createServer((req, res) => {
  // 收集请求体（如果有 POST body 的话），演示透传
  let bodyChunks = [];
  req.on('data', (chunk) => bodyChunks.push(chunk));

  req.on('end', () => {
    const rawBody = Buffer.concat(bodyChunks).toString('utf8');

    // 组装一个能证明「我是后端源站」的响应对象
    const payload = {
      message: '你好，这是后端源站 (origin server) 的响应',
      servedBy: `origin-server@${os.hostname()}`, // 主机标识
      pid: process.pid,                            // 进程号，多实例时可区分
      method: req.method,                          // 透传过来的请求方法
      url: req.url,                                // 透传过来的路径
      // 把收到的部分 header 回显出来，验证代理是否透传成功
      receivedHeaders: {
        host: req.headers['host'],
        'x-real-ip': req.headers['x-real-ip'],
        'x-forwarded-for': req.headers['x-forwarded-for'],
      },
      receivedBody: rawBody || null,
      time: new Date().toISOString(),
    };

    // 设置响应头并返回 JSON
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload, null, 2));
  });
});

server.listen(PORT, () => {
  console.log(`[origin-server] 后端源站已启动，监听 http://localhost:${PORT}`);
});

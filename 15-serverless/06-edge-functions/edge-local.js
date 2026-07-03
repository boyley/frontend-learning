/**
 * 本地体验边缘函数 —— 用 Node http 适配 Web 标准 fetch handler。
 * ---------------------------------------------------------------
 * 边缘函数用的是 Web 标准 Request/Response（不是 Node req/res）。
 * Node 18+ 已全局提供 Request/Response/fetch，我们写个小适配器，
 * 把 Node 的 http 请求转成 Web Request，交给 fetch handler，
 * 再把返回的 Web Response 写回 Node —— 就能本地零依赖跑边缘代码。
 *
 * 注意：cloudflare-worker.js / vercel-edge.js 用的是平台要求的 ESM 语法
 *      （export default），无法用 require 直接引入，所以这里把等价的
 *      handler 内联一份，保证「node edge-local.js」开箱即跑。
 *
 * 运行：  node edge-local.js
 * 测试：  curl "http://localhost:3100/?name=张三"
 */

const http = require('http');

// 与 cloudflare-worker.js 中等价的边缘 fetch handler（Web 标准签名）
async function edgeFetch(request) {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') || 'world';
  const country = request.headers.get('cf-ipcountry') || '未知';

  return new Response(
    JSON.stringify({
      message: `Hello ${name}, from edge`,
      country,
      runtime: 'V8 isolate (本地模拟)',
    }),
    { headers: { 'content-type': 'application/json; charset=utf-8' } }
  );
}

const server = http.createServer(async (req, res) => {
  // ① Node 请求 → Web 标准 Request
  const webReq = new Request(`http://localhost${req.url}`, {
    method: req.method,
    headers: { ...req.headers, 'cf-ipcountry': 'CN' }, // 模拟边缘注入的国家码
  });

  // ② 调用边缘 handler
  const webRes = await edgeFetch(webReq);

  // ③ Web Response → Node 响应
  const body = await webRes.text();
  res.writeHead(webRes.status, Object.fromEntries(webRes.headers));
  res.end(body);
});

server.listen(3100, () => {
  console.log('本地边缘运行时: http://localhost:3100/?name=张三');
});

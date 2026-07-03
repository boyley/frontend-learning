/**
 * 04 · CORS 安全 —— 漏洞版 vs 安全版对照 Demo
 * ============================================================
 * Node 原生 http 服务器，无需任何 npm 依赖，直接 `node server-demo.js` 运行。
 * 监听 http://localhost:3000，提供两个接口用于对照 CORS 响应头差异：
 *
 *   GET /vulnerable  —— ❌ 错误示范：反射任意 Origin + 允许凭证
 *   GET /safe        —— ✅ 正确示范：精确白名单 + Vary: Origin
 *
 * 两个接口都返回一段「模拟的账户敏感数据」JSON，用来演示：
 * 一旦 CORS 配置错误，攻击者站点就能带着受害者的 Cookie 把这段数据读走。
 *
 * 用 curl 对照观察响应头（重点看 Access-Control-Allow-Origin）：
 *   node server-demo.js
 *   curl -s -D - -o /dev/null -H "Origin: https://evil.com" http://localhost:3000/vulnerable
 *   curl -s -D - -o /dev/null -H "Origin: https://evil.com" http://localhost:3000/safe
 *
 * 你会看到：/vulnerable 把 https://evil.com 原样回显（危险），
 * 而 /safe 因为 evil.com 不在白名单里，不返回 CORS 头（浏览器会拦截读取）。
 *
 * ⚠️ 本文件仅供安全学习，请勿在生产环境使用 /vulnerable 的写法。
 */

const http = require('http');

// ✅ 精确白名单：只有集合里「一模一样」的源才放行。
// 用 Set 做「精确相等」匹配，绝不用 endsWith / includes 之类的后缀/子串匹配
//（那些写法会被 evil-example.com、app.example.com.evil.com 之类的 Origin 绕过）。
const ALLOW = new Set([
  'https://app.example.com',
  'https://admin.example.com',
]);

// 模拟的「账户敏感数据」—— 真实场景里这可能是余额、身份证号、绑定手机号等。
// CORS 配错时，这段数据就会被任意站点带着用户凭证读走。
const SENSITIVE_ACCOUNT_DATA = {
  username: 'alice',
  realName: '爱丽丝',
  balance: 88888.88,
  phone: '138****6666',
  idCard: '3301**********1234',
  sessionNote: '这是只应被本人在受信任站点读取的敏感数据（模拟）',
};

/**
 * 把敏感数据以 JSON 返回给客户端。
 * @param {http.ServerResponse} res
 */
function sendSensitiveJson(res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.statusCode = 200;
  res.end(JSON.stringify(SENSITIVE_ACCOUNT_DATA, null, 2));
}

const server = http.createServer((req, res) => {
  const origin = req.headers.origin; // 跨源请求会自动带上 Origin 头
  const { url, method } = req;

  // ---------------------------------------------------------
  // ❌ /vulnerable —— 危险：反射任意 Origin，任何站点都能带凭证读数据 —— 仅供学习
  // ---------------------------------------------------------
  if (url === '/vulnerable') {
    // ❌ 危险：把请求里的 Origin 原样回显。无论请求来自哪个站点（包括 evil.com），
    // 都会被授权。等于对「任意源」开放。
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    // ❌ 危险：同时允许携带凭证（Cookie / HTTP 认证）。
    // 「反射任意 Origin」+「允许凭证」是 CORS 最典型、最严重的漏洞组合：
    // 攻击者页面里 fetch(url, { credentials: 'include' }) 就能带着受害者的
    // Cookie 读到下面这段敏感数据，再回传到自己的服务器。
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // 处理预检请求（OPTIONS）：非简单请求会先发 OPTIONS 询问。
    // 这里同样错误地对任意源放行方法与头。
    if (method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '600');
      res.statusCode = 204; // 预检无响应体
      res.end();
      return;
    }

    sendSensitiveJson(res);
    return;
  }

  // ---------------------------------------------------------
  // ✅ /safe —— 正确：精确白名单，命中才回显 Origin，并加 Vary: Origin
  // ---------------------------------------------------------
  if (url === '/safe') {
    // ✅ 只有 Origin 精确命中白名单时，才返回 CORS 授权头。
    // 不在白名单里的源（如 evil.com）——干脆不返回任何 CORS 头，
    // 浏览器就会拦截 JS 读取响应（尽管请求可能已经到达服务器）。
    if (origin && ALLOW.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin); // 回显「命中的那个」源
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      // ✅ 动态回显 Origin 时必须加 Vary: Origin，
      // 否则 CDN/代理缓存可能把 A 源拿到的授权响应，错误地发给 B 源。
      res.setHeader('Vary', 'Origin');
    }

    // 处理预检请求（OPTIONS）：同样只对白名单内的源声明允许的方法与头。
    if (method === 'OPTIONS') {
      if (origin && ALLOW.has(origin)) {
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Max-Age', '600');
      }
      res.statusCode = 204;
      res.end();
      return;
    }

    // 注意：即使 CORS 头没返回，服务器仍然「处理」了请求。
    // CORS 只决定「浏览器让不让 JS 读响应」，不决定「服务器要不要处理」。
    // 所以真实接口本身仍必须有身份/权限校验，CORS 不是鉴权。
    sendSensitiveJson(res);
    return;
  }

  // ---------------------------------------------------------
  // 其它路径：给个首页提示，方便直接用浏览器访问 http://localhost:3000
  // ---------------------------------------------------------
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.statusCode = 200;
  res.end(
    'CORS 安全对照 Demo\n' +
    '  ❌ /vulnerable —— 反射任意 Origin + 允许凭证（危险，仅供学习）\n' +
    '  ✅ /safe       —— 精确白名单 + Vary: Origin（正确）\n\n' +
    '用 curl 对照响应头：\n' +
    '  curl -s -D - -o /dev/null -H "Origin: https://evil.com" http://localhost:3000/vulnerable\n' +
    '  curl -s -D - -o /dev/null -H "Origin: https://evil.com" http://localhost:3000/safe\n' +
    '  curl -s -D - -o /dev/null -H "Origin: https://app.example.com" http://localhost:3000/safe\n'
  );
});

server.listen(3000, () => {
  console.log('CORS 安全对照 Demo 已启动: http://localhost:3000');
  console.log('  ❌ /vulnerable  反射任意 Origin + 允许凭证（危险，仅供学习）');
  console.log('  ✅ /safe        精确白名单 + Vary: Origin（正确）');
});

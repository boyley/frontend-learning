// 12 · Cookie / Session / Token demo —— 纯 Node 内置 http 模块，无需安装任何依赖
// 目的：演示三种会话保持方式：
//   ① Cookie + Session：服务端用内存存会话，Set-Cookie 下发 sessionId
//   ② Token(类 JWT)：服务端签发无状态 token，客户端后续用 Authorization 携带
// 让你在 DevTools 里亲眼看到 Set-Cookie、Cookie 自动回传、以及 token 的对比。
//
// 运行：node server.js  然后浏览器打开 http://localhost:5000

const http = require('http');
const crypto = require('crypto');

const PORT = 5000;
const SECRET = 'demo-secret-key-请勿用于生产'; // 签名密钥

// ---------- 服务端会话存储（有状态）：sessionId -> 用户信息 ----------
// 真实项目会用 Redis 等，这里用内存 Map 演示"服务端保存会话"这一本质。
const sessions = new Map();

// ---------- 极简 JWT 实现（仅供理解结构，生产请用成熟库）----------
const base64url = (obj) =>
  Buffer.from(JSON.stringify(obj)).toString('base64url');
function signToken(payload) {
  const header = base64url({ alg: 'HS256', typ: 'JWT' });
  const body = base64url(payload);
  // 签名 = HMAC-SHA256(header.body, secret)，防止被篡改
  const sig = crypto.createHmac('sha256', SECRET).update(header + '.' + body).digest('base64url');
  return `${header}.${body}.${sig}`; // JWT 三段式：header.payload.signature
}
function verifyToken(token) {
  const [header, body, sig] = (token || '').split('.');
  if (!header || !body || !sig) return null;
  const expect = crypto.createHmac('sha256', SECRET).update(header + '.' + body).digest('base64url');
  if (sig !== expect) return null; // 签名不符 → 被篡改，拒绝
  return JSON.parse(Buffer.from(body, 'base64url').toString());
}

// 解析请求里的 Cookie 头 -> 对象
function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((pair) => {
    const i = pair.indexOf('=');
    if (i > -1) out[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
  });
  return out;
}

const server = http.createServer((req, res) => {
  console.log(`\n[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

  // ---------- 首页说明 ----------
  if (req.url === '/' ) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="utf-8"><title>Cookie/Session/Token</title></head>
<body style="font-family:sans-serif;max-width:640px;margin:40px auto;line-height:1.7">
<h1>Cookie / Session / Token demo</h1>
<p>打开 DevTools → Network & Application，按顺序点：</p>
<h3>A. Cookie + Session（有状态）</h3>
<ol>
  <li><a href="/login-session" target="_blank">/login-session</a> —— 登录，观察响应头 <b>Set-Cookie: sessionId=...</b></li>
  <li><a href="/me-session" target="_blank">/me-session</a> —— 再访问，浏览器<b>自动带上 Cookie</b>，服务端查内存 session 认出你</li>
</ol>
<h3>B. Token / JWT（无状态）</h3>
<ol>
  <li><a href="/login-token" target="_blank">/login-token</a> —— 登录，服务端签发一个 token（返回在 JSON 里，前端自己存）</li>
  <li>用 fetch 带 <b>Authorization: Bearer &lt;token&gt;</b> 访问 <code>/me-token</code>（见下方脚本按钮）</li>
</ol>
<button onclick="tokenFlow()">演示 Token 全流程（看 Console）</button>
<pre id="out" style="background:#f5f5f5;padding:12px"></pre>
<script>
async function tokenFlow(){
  const out=document.getElementById('out');
  const r=await fetch('/login-token'); const {token}=await r.json();
  out.textContent='① 拿到 token:\\n'+token+'\\n\\n（前端把它存 localStorage，请求时放进 Authorization 头）';
  const r2=await fetch('/me-token',{headers:{Authorization:'Bearer '+token}});
  const me=await r2.json();
  out.textContent+='\\n\\n② 带 token 访问 /me-token 得到:\\n'+JSON.stringify(me,null,2);
}
</script>
</body></html>`);
    return;
  }

  // ===== A. Cookie + Session（有状态）=====

  // 登录：生成 sessionId 存服务端，用 Set-Cookie 下发给浏览器
  if (req.url === '/login-session') {
    const sessionId = crypto.randomBytes(16).toString('hex');
    sessions.set(sessionId, { user: 'alice', loginAt: Date.now() }); // 会话数据存在服务端
    // Set-Cookie 属性：HttpOnly(JS 读不到, 防 XSS 窃取)、SameSite=Lax(防 CSRF)、Path、Max-Age
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': `sessionId=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`,
    });
    console.log('  → 登录成功，Set-Cookie 下发 sessionId=' + sessionId.slice(0, 8) + '...');
    res.end(JSON.stringify({ ok: true, msg: '已登录，sessionId 已通过 Set-Cookie 下发（HttpOnly，JS 读不到）' }));
    return;
  }

  // 校验：浏览器会自动带上 Cookie，服务端据 sessionId 查内存里的会话
  if (req.url === '/me-session') {
    const { sessionId } = parseCookies(req);
    const sess = sessionId && sessions.get(sessionId);
    if (!sess) {
      res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, msg: '未登录或会话失效（先访问 /login-session）' }));
      return;
    }
    console.log('  → Cookie 自动回传 sessionId，命中服务端 session：' + sess.user);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, user: sess.user, source: 'server-side session（有状态）' }));
    return;
  }

  // ===== B. Token / JWT（无状态）=====

  // 登录：签发 token，服务端不保存任何东西，把状态"外包"给客户端
  if (req.url === '/login-token') {
    const token = signToken({ user: 'alice', exp: Date.now() + 3600_000 });
    console.log('  → 签发 token（服务端不存储，无状态）');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, token, msg: '请前端自行保存，后续放进 Authorization: Bearer 头' }));
    return;
  }

  // 校验：从 Authorization 头取 token，验签 + 验过期，无需查任何存储
  if (req.url === '/me-token') {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const payload = verifyToken(token);
    if (!payload || payload.exp < Date.now()) {
      res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, msg: 'token 无效或已过期' }));
      return;
    }
    console.log('  → 验签通过，用户：' + payload.user + '（服务端未查任何存储）');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, user: payload.user, source: 'stateless token（无状态，验签即可）' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log(`Cookie/Session/Token demo 已启动：http://localhost:${PORT}`);
});

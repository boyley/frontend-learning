/**
 * gateway.js —— 手写 API 网关（监听 8080）
 * ==================================================================
 * 这是整个模块的「压轴 demo」：把前面模块学到的知识点串成一条中间件管线。
 *
 * 一个请求进入网关后，会「依次」流过下面这些能力（顺序很重要）：
 *   1. 请求日志       —— 记录 method / url / requestId / 耗时
 *   2. 认证鉴权       —— 校验 Authorization: Bearer <token>，白名单放行
 *   3. 限流           —— 按 IP 令牌桶限流，超限 429
 *   4. 路由转发       —— 按路径前缀转发到对应后端服务（http-proxy）
 *   5. 错误处理/降级  —— 后端挂了返回 502 兜底
 *
 * 对应模块知识点：
 *   - 模块 03（网关是什么 / 统一入口）：所有流量先进网关，再分发到后端。
 *   - 模块 05（横切关注点：日志 / 鉴权 / 限流）：这些能力在网关统一做，后端不用重复实现。
 *   - 模块 08（反向代理 / 服务路由 / 降级）：用 http-proxy 做反向代理，proxy error 做兜底。
 * ==================================================================
 */

const express = require('express');
const httpProxy = require('http-proxy');
const crypto = require('crypto');

const app = express();
const PORT = 8080;

// 创建一个 http-proxy 代理实例（整个网关共用一个）。
const proxy = httpProxy.createProxyServer({});

/* ------------------------------------------------------------------
 * 路由表：路径前缀 → 后端服务地址
 * 对应模块 08：网关的核心职责之一就是「服务路由」。
 * 真实项目里这张表往往来自注册中心（Nacos/Consul/Eureka）动态获取。
 * ---------------------------------------------------------------- */
const ROUTES = [
  { prefix: '/api/users', target: 'http://localhost:5051' },
  { prefix: '/api/orders', target: 'http://localhost:5052' },
  { prefix: '/api/products', target: 'http://localhost:5053' },
];

/* ------------------------------------------------------------------
 * 鉴权白名单：这些路径不需要 token 也能访问。
 * 对应模块 05：鉴权是横切关注点，但要允许「登录 / 公开资源」豁免。
 * ---------------------------------------------------------------- */
const AUTH_WHITELIST = ['/login', '/public', '/health'];

// 演示用的「合法 token」集合。真实项目里应校验 JWT 签名 / 查 Redis 会话。
const VALID_TOKENS = new Set();

/* ==================================================================
 * 中间件 1：请求日志
 * 对应模块 05（可观测性 / 日志）。
 * - 给每个请求生成一个 requestId，贯穿整条链路，方便排查问题。
 * - 在响应结束时打印耗时（真实网关会上报到监控系统）。
 * ================================================================== */
function requestLogger(req, res, next) {
  const requestId = crypto.randomBytes(4).toString('hex');
  req.requestId = requestId;
  const start = Date.now();

  console.log(`➡️  [${requestId}] ${req.method} ${req.url} 进入网关`);

  // 监听响应结束事件，计算耗时。
  res.on('finish', () => {
    const cost = Date.now() - start;
    console.log(
      `⬅️  [${requestId}] ${req.method} ${req.url} → ${res.statusCode} (${cost}ms)`
    );
  });

  next();
}

/* ==================================================================
 * 中间件 2：认证鉴权
 * 对应模块 05（统一鉴权）。
 * - 白名单路径直接放行。
 * - 其它路径必须携带 Authorization: Bearer <token>，否则 401。
 * ================================================================== */
function authenticate(req, res, next) {
  // 白名单命中则放行（用 startsWith 支持 /public/xxx 这类子路径）。
  const isWhite = AUTH_WHITELIST.some((p) => req.path.startsWith(p));
  if (isWhite) {
    return next();
  }

  const auth = req.headers['authorization'] || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: '缺少 Authorization: Bearer <token> 请求头',
      hint: '先调用 POST /login 获取演示 token',
    });
  }

  const token = match[1];
  if (!VALID_TOKENS.has(token)) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'token 无效或已过期',
    });
  }

  // 鉴权通过，可把用户信息挂到 req 上传给后续中间件。
  req.user = { token };
  next();
}

/* ==================================================================
 * 中间件 3：限流（令牌桶，按 IP）
 * 对应模块 05（限流保护后端）。
 * - 每个 IP 一个桶，容量 CAPACITY，每秒补充 REFILL 个令牌。
 * - 每来一个请求消耗 1 个令牌；桶空则 429。
 * ================================================================== */
const CAPACITY = 5; // 桶容量（允许的突发量）
const REFILL_PER_SEC = 2; // 每秒补充速率
const buckets = new Map(); // ip -> { tokens, lastRefill }

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  let bucket = buckets.get(ip);
  if (!bucket) {
    bucket = { tokens: CAPACITY, lastRefill: now };
    buckets.set(ip, bucket);
  }

  // 按经过的时间补充令牌（令牌桶算法核心）。
  const elapsedSec = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(CAPACITY, bucket.tokens + elapsedSec * REFILL_PER_SEC);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `限流触发：每 IP 容量 ${CAPACITY}，补充速率 ${REFILL_PER_SEC}/s`,
    });
  }

  bucket.tokens -= 1; // 消耗一个令牌
  next();
}

/* ==================================================================
 * 中间件 4：路由转发（反向代理）
 * 对应模块 08（反向代理 / 服务路由）。
 * - 按路径前缀匹配路由表，命中则用 proxy.web 转发到后端。
 * - changeOrigin:true：让代理请求的 Host 头改成目标服务的 host。
 * - 这里把前缀（如 /api/users）从路径里去掉，只把真实业务路径转给后端，
 *   所以后端里用 '/*' 通配即可（见 all-services.js）。
 * ================================================================== */
function routeProxy(req, res, next) {
  const route = ROUTES.find((r) => req.path.startsWith(r.prefix));

  // 没匹配到任何后端服务 → 404。
  if (!route) {
    return res.status(404).json({
      error: 'Not Found',
      message: `没有匹配的后端服务：${req.path}`,
      availableRoutes: ROUTES.map((r) => r.prefix),
    });
  }

  // 去掉前缀，得到转发给后端的真实路径。
  // 例：/api/users/1  --(去掉 /api/users)-->  /1
  req.url = req.url.slice(route.prefix.length) || '/';

  console.log(`🔀 [${req.requestId}] 转发到 ${route.target}${req.url}`);

  // 真正的转发动作。第三个参数是本次转发的目标配置。
  proxy.web(req, res, { target: route.target, changeOrigin: true });
}

/* ==================================================================
 * 中间件 5：错误处理 / 降级
 * 对应模块 08（熔断降级 / 兜底响应）。
 * - 当后端服务连不上或转发出错时，proxy 会触发 'error' 事件。
 * - 我们统一返回 502，而不是把连接错误直接抛给客户端。
 * ================================================================== */
proxy.on('error', (err, req, res) => {
  console.error(`❌ [${req.requestId || '-'}] 转发失败：${err.message}`);
  // 注意：出错时响应头可能还没发送，需判断后再写。
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
  }
  res.end(
    JSON.stringify({
      error: 'Bad Gateway',
      message: '后端服务不可用，网关已降级兜底',
      detail: err.message,
    })
  );
});

/* ==================================================================
 * 组装中间件管线（顺序 == 请求流经顺序）
 * ================================================================== */
app.use(requestLogger); // 1. 日志（最先，覆盖全链路）
app.use(authenticate); // 2. 鉴权
app.use(rateLimit); // 3. 限流

/* ------------------------------------------------------------------
 * /login：演示用登录接口，返回一个临时 token。
 * 放在鉴权之后但它本身在白名单里，所以无需 token 即可访问。
 * ---------------------------------------------------------------- */
app.post('/login', (req, res) => {
  const token = 'demo-' + crypto.randomBytes(8).toString('hex');
  VALID_TOKENS.add(token);
  console.log(`🔑 发放新 token：${token}`);
  res.json({
    token,
    tokenType: 'Bearer',
    usage: `curl -H "Authorization: Bearer ${token}" http://localhost:8080/api/users`,
  });
});

// 一个公开接口，演示白名单放行。
app.get('/public', (req, res) => {
  res.json({ message: '这是公开资源，无需 token' });
});

// 4. 路由转发（放在最后，作为「兜底路由」处理所有 /api/* 请求）
app.use(routeProxy);

app.listen(PORT, () => {
  console.log('==================================================');
  console.log(`🚪 API 网关已启动 → http://localhost:${PORT}`);
  console.log('   管线：日志 → 鉴权 → 限流 → 路由转发 → 降级');
  console.log('   路由表：');
  ROUTES.forEach((r) => console.log(`     ${r.prefix}  →  ${r.target}`));
  console.log('==================================================');
  console.log('👉 请确保已在另一个终端执行 `npm run services` 启动后端。\n');
});

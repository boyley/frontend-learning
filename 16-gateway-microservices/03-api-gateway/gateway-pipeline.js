// gateway-pipeline.js
// ─────────────────────────────────────────────────────────────
// 用「中间件数组」模拟 API 网关的请求处理管线（pipeline）：
//   logging（日志）→ auth（认证鉴权）→ rateLimit（限流）→ route（路由转发）
// 每个阶段是一个函数，请求像流水线一样依次穿过；任一阶段可「拦截并短路」。
// 纯 Node，零依赖，`node gateway-pipeline.js` 直接看控制台演示。
// ─────────────────────────────────────────────────────────────

// ===== 模拟一个进入网关的请求对象 =====
function makeRequest(overrides = {}) {
  return {
    id: Math.random().toString(36).slice(2, 8), // 请求唯一标识（用于日志追踪）
    method: 'GET',
    path: '/orders/123',
    headers: { authorization: 'Bearer valid-token' }, // 带一个合法令牌
    clientIp: '203.0.113.7',
    ...overrides,
  };
}

// ===== 阶段 1：日志 logging =====
// 记录请求进入，并在响应结束后打印耗时（网关的可观测性职责）
function logging(req, res, next) {
  req._startTime = Date.now();
  console.log(`\n[logging] → 收到请求 #${req.id} ${req.method} ${req.path} from ${req.clientIp}`);
  next(); // 放行到下一阶段
  const cost = Date.now() - req._startTime;
  console.log(`[logging] ← 请求 #${req.id} 处理完成，状态=${res.statusCode} 耗时=${cost}ms`);
}

// ===== 阶段 2：认证鉴权 auth =====
// 检查 Authorization 头，令牌不合法就短路返回 401（不再往下走）
function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (token !== 'valid-token') {
    console.log(`[auth]    ✗ 令牌无效，拦截请求 #${req.id}`);
    return res.end(401, { error: 'Unauthorized' }); // 短路
  }
  req.user = { id: 'u_1001', name: 'alice' }; // 认证通过，挂载用户信息供后续使用
  console.log(`[auth]    ✓ 认证通过，用户=${req.user.name}`);
  next();
}

// ===== 阶段 3：限流 rateLimit =====
// 用一个内存计数器模拟「同一 IP 每窗口最多 N 次」，超了短路返回 429
const HITS = new Map();
const LIMIT = 3; // 演示用：同一 IP 超过 3 次就限流
function rateLimit(req, res, next) {
  const count = (HITS.get(req.clientIp) || 0) + 1;
  HITS.set(req.clientIp, count);
  if (count > LIMIT) {
    console.log(`[rateLimit] ✗ IP ${req.clientIp} 第 ${count} 次，超过阈值 ${LIMIT}，限流！`);
    return res.end(429, { error: 'Too Many Requests' }); // 短路
  }
  console.log(`[rateLimit] ✓ IP ${req.clientIp} 第 ${count}/${LIMIT} 次，放行`);
  next();
}

// ===== 阶段 4：路由转发 route =====
// 按 path 前缀决定转发到哪个后端微服务（真实网关这里会发起 HTTP 转发）
const ROUTES = [
  { prefix: '/orders', service: 'order-service:8081' },
  { prefix: '/users', service: 'user-service:8082' },
];
function route(req, res, next) {
  const matched = ROUTES.find((r) => req.path.startsWith(r.prefix));
  if (!matched) {
    console.log(`[route]   ✗ 没有匹配的后端服务，返回 404`);
    return res.end(404, { error: 'Not Found' });
  }
  console.log(`[route]   → 转发 #${req.id} 到后端服务 [${matched.service}]`);
  // 模拟后端返回
  res.end(200, { data: `来自 ${matched.service} 的响应`, user: req.user.name });
}

// ===== 极简的「管线执行器」：把中间件数组串起来依次执行 =====
function runPipeline(middlewares, req) {
  // 一个假的响应对象：end() 一旦被调用就标记已结束，阻止后续 next
  const res = {
    statusCode: null,
    ended: false,
    end(status, body) {
      if (this.ended) return;
      this.ended = true;
      this.statusCode = status;
      console.log(`           [响应] ${status}`, JSON.stringify(body));
    },
  };

  let index = 0;
  function next() {
    if (res.ended) return;            // 已被某阶段短路，停止推进
    const mw = middlewares[index++];
    if (!mw) return;                  // 所有阶段走完
    mw(req, res, next);               // 执行当前阶段，由它决定是否调用 next
  }
  next();
  return res;
}

// ===== 演示：跑几个不同场景的请求，观察它们如何穿过管线 =====
const pipeline = [logging, auth, rateLimit, route];

console.log('========== 场景 A：正常请求（应一路放行到 order-service）==========');
runPipeline(pipeline, makeRequest());

console.log('\n========== 场景 B：令牌无效（应在 auth 阶段被 401 拦截）==========');
runPipeline(pipeline, makeRequest({ headers: { authorization: 'Bearer bad-token' } }));

console.log('\n========== 场景 C：连打多次触发限流（第 4 次起返回 429）==========');
const spammer = '198.51.100.9';
for (let i = 1; i <= 4; i++) {
  runPipeline(pipeline, makeRequest({ clientIp: spammer, path: '/users/1' }));
}

console.log('\n========== 场景 D：路径无匹配后端（应 route 阶段 404）==========');
runPipeline(pipeline, makeRequest({ path: '/unknown/x' }));

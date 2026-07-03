// ============================================================
// app.js：基于 JWT 的无状态鉴权 demo（Express 5 + jsonwebtoken 9）
//
// 流程：
//   1) POST /login  校验账号密码 → 用 jwt.sign 签发一枚 token 返回
//   2) 客户端把 token 放到 Authorization: Bearer <token> 头里
//   3) 鉴权中间件 authGuard 取出 token → jwt.verify 校验签名和过期
//      - 通过：把解码出的 payload 挂到 req.user，放行
//      - 失败：直接返回 401，不进业务
//   4) GET /profile 是受保护接口，只有带合法 token 才能访问
// ============================================================

const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json()); // 解析 JSON 请求体（Express 5 内置）

// ⚠️ 密钥：真实项目必须放环境变量 / 密钥管理，绝不能硬编码进代码库。
// 这里为了 demo 可直接运行，给一个默认值。
const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-key-change-me';
const JWT_EXPIRES_IN = '1h'; // token 有效期 1 小时

// 假的用户表（真实项目查数据库 + bcrypt 校验密码哈希）
const USERS = [
  { id: 1, username: 'alice', password: '123456', role: 'admin' },
  { id: 2, username: 'bob', password: 'abcdef', role: 'user' },
];

// ---------- 1. 登录：签发 JWT ----------
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) {
    // 账号或密码错误统一返回 401，不透露到底是哪个错（防枚举）
    return res.status(401).json({ error: '账号或密码错误' });
  }

  // payload 只放非敏感的、鉴权需要的最小信息（id/username/role）
  // ❌ 绝不要把密码、手机号等敏感信息放进 payload——它只是 base64，能被任何人解开
  const payload = { sub: user.id, username: user.username, role: user.role };

  // jwt.sign(载荷, 密钥, 选项) → 生成 header.payload.signature 三段字符串
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.json({ token, tokenType: 'Bearer', expiresIn: JWT_EXPIRES_IN });
});

// ---------- 2. 鉴权中间件：从 Bearer 头取 token 并校验 ----------
function authGuard(req, res, next) {
  const auth = req.headers.authorization || '';
  // 标准格式：Authorization: Bearer <token>
  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: '缺少或格式错误的 Authorization 头' });
  }

  try {
    // 校验签名 + 过期时间；任一不通过都抛异常
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // 把用户信息挂到请求上，后续 handler 直接用
    next();
  } catch (err) {
    // TokenExpiredError（过期）/ JsonWebTokenError（签名无效、被篡改）
    const reason = err.name === 'TokenExpiredError' ? 'token 已过期' : 'token 无效';
    return res.status(401).json({ error: reason });
  }
}

// ---------- 3. 受保护接口：必须带合法 token ----------
app.get('/profile', authGuard, (req, res) => {
  // 走到这里说明 authGuard 已放行，req.user 一定存在
  res.json({ message: '这是受保护的个人信息', user: req.user });
});

// 公开接口，方便对比（不需要 token）
app.get('/public', (req, res) => {
  res.json({ message: '这是公开接口，无需鉴权' });
});

const PORT = process.env.PORT || 3012;
app.listen(PORT, () => {
  console.log(`[12-auth-jwt] listening on http://localhost:${PORT}`);
});

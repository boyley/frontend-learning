// ============================================================
// 参数校验（zod）+ 统一错误处理
// 核心思想：
//   1. 校验逻辑集中到【校验中间件】，路由处理函数拿到的一定是合法数据。
//   2. 所有错误（校验错误 / 业务错误 / 未知错误）统一由一个
//      【错误处理中间件】兜住，转成一致的 JSON： { code, message, details }。
//   3. 用自定义 AppError 类携带 HTTP 状态码和业务错误码，让错误“可分类”。
// ============================================================

const express = require('express');
const { z } = require('zod');

const app = express();
app.use(express.json());

// ------------------------------------------------------------
// 1) 自定义错误类：让业务错误带上状态码 + 业务码 + 细节
// ------------------------------------------------------------
class AppError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', details = null } = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status; // HTTP 状态码
    this.code = code; // 业务错误码（字符串，前端可 switch）
    this.details = details; // 附加信息（如校验失败的字段列表）
  }
}

// ------------------------------------------------------------
// 2) zod schema：声明式定义“请求体长什么样”
//    比手写 if 判断更简洁，且能一次性收集所有错误。
// ------------------------------------------------------------
const registerSchema = z.object({
  username: z.string().min(3, 'username 至少 3 个字符').max(20, 'username 最多 20 个字符'),
  email: z.string().email('email 格式不正确'),
  age: z.number().int('age 必须是整数').min(0, 'age 不能为负').max(150, 'age 不合理').optional(),
});

// ------------------------------------------------------------
// 3) 校验中间件工厂：传入一个 schema，返回一个中间件。
//    校验失败 → 抛统一的 AppError(400)，交给错误处理中间件。
//    校验成功 → 用“清洗后”的数据覆盖 req.body，后续拿到的都是干净数据。
// ------------------------------------------------------------
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body); // safeParse 不抛异常，返回 {success, ...}
    if (!result.success) {
      // 把 zod 的 issues 整理成简洁的 details 数组
      const details = result.error.issues.map((i) => ({
        field: i.path.join('.'), // 出错字段路径
        message: i.message, // 人类可读的错误信息
      }));
      return next(
        new AppError('请求参数校验失败', {
          status: 400,
          code: 'VALIDATION_ERROR',
          details,
        })
      );
    }
    req.body = result.data; // 用校验通过后的数据替换（已做类型转换/去除多余字段）
    next();
  };
}

// ------------------------------------------------------------
// 4) 业务路由：到这里 req.body 一定合法，专注写业务。
//    演示一条“业务错误”路径：username 为 admin 视为被占用（409）。
// ------------------------------------------------------------
app.post('/api/users', validateBody(registerSchema), (req, res, next) => {
  const { username, email, age } = req.body;
  // 模拟业务规则：用户名被占用 → 抛业务错误（非校验错误）
  if (username === 'admin') {
    return next(
      new AppError('用户名已被占用', { status: 409, code: 'USERNAME_TAKEN' })
    );
  }
  // 成功
  res.status(201).json({
    code: 0,
    message: 'created',
    data: { id: Date.now(), username, email, age: age ?? null },
  });
});

// 一个故意抛未知错误的路由，演示 500 兜底
app.get('/api/boom', () => {
  throw new Error('未预料到的崩溃'); // 普通 Error，非 AppError
});

// ------------------------------------------------------------
// 5) 404 兜底：没有路由匹配
// ------------------------------------------------------------
app.use((req, res, next) => {
  next(new AppError(`找不到 ${req.method} ${req.originalUrl}`, { status: 404, code: 'NOT_FOUND' }));
});

// ------------------------------------------------------------
// 6) 统一错误处理中间件（4 参数）—— 所有错误的唯一出口
//    把三类错误统一成 { code, message, details }：
//      - AppError：用它自带的 status/code/details
//      - 其它未知 Error：一律 500 + INTERNAL_ERROR，避免泄漏堆栈
// ------------------------------------------------------------
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }
  // 未知错误：打日志（真实项目接入日志系统），对外只给通用信息
  console.error('[UNEXPECTED]', err);
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: '服务器内部错误',
    details: null,
  });
});

const PORT = process.env.PORT || 3013;
app.listen(PORT, () => {
  console.log(`[13-validation-error] listening on http://localhost:${PORT}`);
});

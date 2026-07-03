// ============================================================
// Controller 层：解析请求 / 组织响应（HTTP 适配层）
// 职责：从 req 里取出参数（params/body/query），调用 Service，
// 再把 Service 的返回值组织成 HTTP 响应（状态码 + JSON）。
// 不写业务规则（那是 Service 的事），也不直接读写数据（那是 Model 的事）。
// 出错时用 next(err) 交给统一错误处理中间件。
// ============================================================

const userService = require('../services/userService');

// GET /api/users —— 列表
function list(req, res) {
  const users = userService.listUsers();
  res.json({ data: users });
}

// GET /api/users/:id —— 单个
function detail(req, res, next) {
  try {
    // req.params.id 是字符串，转成数字再交给 service
    const user = userService.getUser(Number(req.params.id));
    res.json({ data: user });
  } catch (err) {
    next(err); // 交给 app.js 里的错误处理中间件
  }
}

// POST /api/users —— 创建
function create(req, res, next) {
  try {
    const { name, email } = req.body;
    const user = userService.createUser({ name, email });
    res.status(201).json({ data: user }); // 201 Created
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/:id —— 更新
function update(req, res, next) {
  try {
    const { name, email } = req.body;
    const user = userService.updateUser(Number(req.params.id), { name, email });
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/users/:id —— 删除
function remove(req, res, next) {
  try {
    userService.deleteUser(Number(req.params.id));
    res.status(204).end(); // 204 No Content：删除成功无响应体
  } catch (err) {
    next(err);
  }
}

module.exports = { list, detail, create, update, remove };

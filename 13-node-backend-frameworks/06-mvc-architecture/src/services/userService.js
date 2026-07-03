// ============================================================
// Service 层：业务逻辑（Business Logic）
// 职责：编排业务规则、做校验/判断，然后调用 Model 存取数据。
// 不碰 req/res（不关心 HTTP），也不直接操作数组（不关心存储细节）。
// 这样业务逻辑可以被单元测试直接调用，也能被别的入口（定时任务/CLI）复用。
// ============================================================

const userModel = require('../models/userModel');

// 列出所有用户
function listUsers() {
  return userModel.findAll();
}

// 获取单个用户；不存在时抛业务错误（用 err.status 携带语义）
function getUser(id) {
  const user = userModel.findById(id);
  if (!user) {
    const err = new Error(`用户 ${id} 不存在`);
    err.status = 404; // 让上层控制器知道该回 404
    throw err;
  }
  return user;
}

// 创建用户：这里体现“业务规则”——name/email 必填、email 不能重复
function createUser({ name, email }) {
  if (!name || !email) {
    const err = new Error('name 和 email 均为必填');
    err.status = 400;
    throw err;
  }
  const exists = userModel.findAll().some((u) => u.email === email);
  if (exists) {
    const err = new Error(`email ${email} 已被占用`);
    err.status = 409; // 冲突
    throw err;
  }
  return userModel.create({ name, email });
}

// 更新用户：先确保存在（复用 getUser 的“不存在即抛错”规则）
function updateUser(id, fields) {
  getUser(id); // 不存在会抛 404
  return userModel.update(id, fields);
}

// 删除用户
function deleteUser(id) {
  const ok = userModel.remove(id);
  if (!ok) {
    const err = new Error(`用户 ${id} 不存在`);
    err.status = 404;
    throw err;
  }
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };

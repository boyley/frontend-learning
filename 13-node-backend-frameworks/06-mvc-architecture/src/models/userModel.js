// ============================================================
// Model 层：数据存取（Data Access）
// 职责：只负责“数据怎么存、怎么取”，不关心 HTTP，也不写业务规则。
// 这里用一个内存数组当“数据库”，真实项目里这层会换成
// SQL 查询 / ORM(Sequelize) / Prisma，但对上层暴露的方法签名不变。
// ============================================================

// 内存“表”：存放所有 user 记录
const users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
];

// 自增主键：模拟数据库的 AUTO_INCREMENT
let nextId = 3;

// 查询全部
function findAll() {
  // 返回副本，避免外层直接改到内存里的原始对象（模拟“查出来的是快照”）
  return users.map((u) => ({ ...u }));
}

// 按 id 查询单个，查不到返回 null
function findById(id) {
  const found = users.find((u) => u.id === id);
  return found ? { ...found } : null;
}

// 新增一条，返回新建的记录
function create({ name, email }) {
  const user = { id: nextId++, name, email };
  users.push(user);
  return { ...user };
}

// 更新（按 id），查不到返回 null；只更新传入的字段
function update(id, fields) {
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  if (fields.name !== undefined) user.name = fields.name;
  if (fields.email !== undefined) user.email = fields.email;
  return { ...user };
}

// 删除（按 id），删掉返回 true，找不到返回 false
function remove(id) {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  return true;
}

module.exports = { findAll, findById, create, update, remove };

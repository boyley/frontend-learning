// ============================================================
// app/service/user.js：服务层（约定放在 app/service/ 下自动加载）
//
// Service 层职责：封装真正的业务逻辑 / 数据访问（查库、调外部 API 等）。
// controller 通过 ctx.service.user.xxx() 调用，实现关注点分离：
//   - controller 管「怎么收请求、怎么回响应」
//   - service 管「业务本身怎么算」
//
// 文件名 user.js → 自动挂到 ctx.service.user（多级目录也支持，如
// app/service/foo/bar.js → ctx.service.foo.bar）。
// ============================================================

const { Service } = require('egg');

// 模拟数据源（真实项目这里会是数据库 / RPC 调用）
const MOCK_USERS = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
  { id: 3, name: '王五', email: 'wangwu@example.com' },
];

class UserService extends Service {
  // 返回全部用户
  async list() {
    // this.ctx / this.app / this.config 在 service 里都能用
    this.ctx.logger.info('[UserService] 查询全部用户');
    return MOCK_USERS;
  }

  // 按 id 查单个用户
  async findById(id) {
    return MOCK_USERS.find(u => u.id === id) || null;
  }
}

module.exports = UserService;

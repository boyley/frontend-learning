// ============================================================
// app/controller/home.js：控制器（约定放在 app/controller/ 下自动加载）
//
// Controller 层职责：解析请求参数、调用 service 处理业务、组织响应。
// 不写复杂业务逻辑（那是 service 的活），保持「薄控制器」。
//
// 类里的每个方法通过 this.ctx 拿到当前请求的上下文（Context）。
// ctx 融合了 request/response，还挂着 service、logger 等。
// ============================================================

const { Controller } = require('egg');

class HomeController extends Controller {
  // GET /
  async index() {
    const { ctx } = this;
    // ctx.body 设置响应体（Egg 基于 Koa，用法和 Koa 的 ctx 一致）
    ctx.body = {
      msg: 'Hello Egg！这是一个约定优于配置的企业级框架',
      tips: '试试 GET /users 和 GET /users/1',
    };
  }

  // GET /users —— controller 调 service 拿数据
  async users() {
    const { ctx } = this;
    // this.ctx.service.user 自动对应 app/service/user.js（约定式装配）
    const list = await ctx.service.user.list();
    ctx.body = { total: list.length, users: list };
  }

  // GET /users/:id
  async userById() {
    const { ctx } = this;
    const id = Number(ctx.params.id); // 路由参数从 ctx.params 取
    const user = await ctx.service.user.findById(id);
    if (!user) {
      ctx.status = 404; // 设置状态码
      ctx.body = { error: `找不到 id=${id} 的用户` };
      return;
    }
    ctx.body = user;
  }
}

module.exports = HomeController;

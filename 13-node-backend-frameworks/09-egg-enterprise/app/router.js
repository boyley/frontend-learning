// ============================================================
// app/router.js：路由约定文件（Egg 启动时自动加载）
//
// Egg「约定优于配置」：这个文件名和位置是固定约定的，
// Egg 会自动 require 它并注入 app，无需你手动 new Router / app.use。
//
// 路由只负责「URL → controller 方法」的映射，不写业务逻辑。
// ============================================================

module.exports = app => {
  const { router, controller } = app;

  // GET / → controller/home.js 的 index 方法
  router.get('/', controller.home.index);

  // GET /users → controller/home.js 的 users 方法（内部调 service）
  router.get('/users', controller.home.users);

  // GET /users/:id → 按 id 查单个用户
  router.get('/users/:id', controller.home.userById);
};

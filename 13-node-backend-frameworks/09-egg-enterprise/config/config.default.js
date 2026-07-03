// ============================================================
// config/config.default.js：默认配置（约定文件，自动加载合并）
//
// Egg 的配置约定：config.default.js 是基线，
// config.prod.js / config.local.js 等按运行环境（EGG_SERVER_ENV）叠加覆盖。
// 框架启动时把它们合并成最终的 app.config，全局可通过 this.config 访问。
// ============================================================

module.exports = appInfo => {
  const config = {};

  // cookie 签名密钥（Egg 要求必填；真实项目改成随机私密值并放环境变量）
  config.keys = appInfo.name + '_09_egg_demo_1699999999999';

  // 关掉 CSRF 方便用 curl 测试 GET/POST（真实项目按需开启安全中间件）
  config.security = {
    csrf: { enable: false },
  };

  return config;
};

// Jest 配置文件（CommonJS 格式）
// 官方配置项文档：https://jestjs.io/docs/configuration
/** @type {import('jest').Config} */
module.exports = {
  // 测试运行环境：'node'（默认）用于纯 JS/后端；测 DOM 用 'jsdom'（见 06 模块）
  testEnvironment: 'node',
  // 匹配哪些文件当作测试：*.test.js / *.spec.js
  testMatch: ['**/*.test.js', '**/*.spec.js'],
  // 打印每个用例的详细结果
  verbose: true,
};

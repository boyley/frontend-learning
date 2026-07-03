// 组件测试的关键：把测试环境从 node 换成 jsdom，
// jsdom 用纯 JS 实现了 document / window / DOM API，让 Node 里也能“渲染”组件。
// 官方配置：https://jestjs.io/docs/configuration
/** @type {import('jest').Config} */
module.exports = {
  // ⭐ 与 01~05 的最大区别：环境改成 jsdom（需装 jest-environment-jsdom）
  testEnvironment: 'jsdom',
  testMatch: ['**/*.test.js'],
  // 每个测试文件运行前，先加载 jest-dom，注入 toBeInTheDocument 等 DOM 断言
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
};

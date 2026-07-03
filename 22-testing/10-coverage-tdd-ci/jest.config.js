// Jest 覆盖率与阈值配置
// 官方：https://jestjs.io/docs/configuration#collectcoverage-boolean
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  // 从哪些源码统计覆盖率（排除测试文件本身）
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js'],
  // 覆盖率报告格式：命令行文本 + lcov(给 CI/Codecov) + html(本地看)
  coverageReporters: ['text', 'lcov', 'html'],
  // ⭐ 覆盖率“红线”：低于阈值 jest 退出码非 0，CI 直接判失败
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
  verbose: true,
};

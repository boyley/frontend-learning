// Cypress 配置
// 官方：https://docs.cypress.io/guides/references/configuration
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // 被测站点地址：cy.visit('/') 会拼到这个 baseUrl 上。
    // Cypress 自己不托管静态资源，需先用 npm run serve 起 public/。
    baseUrl: 'http://localhost:5173',
    // 测试文件位置
    specPattern: 'cypress/e2e/**/*.cy.js',
    // 关掉官方示例视频以精简
    video: false,
  },
});

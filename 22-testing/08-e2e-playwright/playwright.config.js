// Playwright 配置
// 官方：https://playwright.dev/docs/test-configuration
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  // 所有测试共享的基础 URL（页面里 goto('/') 即指向它）
  use: {
    baseURL: 'http://localhost:5173',
    // 失败时保留 trace，便于用 show-report 回放每一步
    trace: 'on-first-retry',
  },
  // ⭐ 让 Playwright 自动启动一个静态服务器托管 public/（用系统自带 python3，免装依赖）
  // 跑测试前它会等端口就绪，跑完自动关闭。
  webServer: {
    command: 'python3 -m http.server 5173 --directory public',
    port: 5173,
    reuseExistingServer: true,
  },
  // 跨浏览器矩阵：一套用例三种内核都跑（需先 npx playwright install）
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});

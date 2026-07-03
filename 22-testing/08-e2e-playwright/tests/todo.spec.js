// ============================================================
// Playwright E2E：驱动【真实浏览器】按用户流程操作，断言页面结果
// 核心优势：
//   1) 自动等待（auto-waiting）——locator 会自动等元素可见/可点，几乎不用 sleep
//   2) web-first 断言——expect(locator).toХxx 会重试直到通过或超时，天然抗 flaky
//   3) 跨浏览器（chromium/firefox/webkit）一套用例全跑
// 官方：https://playwright.dev/docs/writing-tests
// ============================================================
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/'); // baseURL 来自 playwright.config.js
});

test('页面初始状态：标题正确、剩余为 0', async ({ page }) => {
  await expect(page).toHaveTitle(/待办清单/);
  await expect(page.getByTestId('remaining')).toHaveText('0');
});

test('添加两条待办，剩余数变为 2', async ({ page }) => {
  const input = page.getByLabel('新待办');

  await input.fill('写测试');
  await page.getByRole('button', { name: '添加' }).click();

  await input.fill('跑 CI');
  await input.press('Enter'); // 也支持回车添加

  // getByRole('listitem') 拿到所有 <li>，断言数量
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByTestId('remaining')).toHaveText('2');
  await expect(page.getByText('写测试')).toBeVisible();
});

test('点击待办标记完成，剩余数减一', async ({ page }) => {
  const input = page.getByLabel('新待办');
  await input.fill('买咖啡');
  await input.press('Enter');
  await expect(page.getByTestId('remaining')).toHaveText('1');

  // 点文字切换完成态
  await page.getByText('买咖啡').click();

  await expect(page.getByTestId('remaining')).toHaveText('0');
  // 完成的项加了 .done 类（划线）
  await expect(page.getByRole('listitem')).toHaveClass(/done/);
});

test('删除待办', async ({ page }) => {
  const input = page.getByLabel('新待办');
  await input.fill('临时任务');
  await input.press('Enter');
  await expect(page.getByRole('listitem')).toHaveCount(1);

  await page.getByRole('button', { name: '删除 临时任务' }).click();

  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expect(page.getByTestId('remaining')).toHaveText('0');
});

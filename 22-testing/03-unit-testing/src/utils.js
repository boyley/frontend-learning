// ============================================================
// 一组“纯工具函数”——单元测试最理想的目标：
// 无副作用、无外部依赖、同样输入必得同样输出
// ============================================================

/** 千分位格式化：1234567 -> "1,234,567" */
function formatThousands(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) {
    throw new TypeError('formatThousands 需要一个数字');
  }
  const [int, decimal] = String(Math.abs(n)).split('.');
  const withComma = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = n < 0 ? '-' : '';
  return decimal ? `${sign}${withComma}.${decimal}` : `${sign}${withComma}`;
}

/** 驼峰转短横线：backgroundColor -> background-color */
function kebabCase(str) {
  return String(str).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** 数组去重（保持顺序） */
function unique(arr) {
  return [...new Set(arr)];
}

/** 简易防抖的“纯”版本：分离出“是否应触发”的判定，方便单测 */
function shouldTrigger(lastTime, now, delay) {
  return now - lastTime >= delay;
}

module.exports = { formatThousands, kebabCase, unique, shouldTrigger };

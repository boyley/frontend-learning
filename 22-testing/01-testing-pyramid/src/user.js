// ============================================================
// 被测业务代码：一个极简的“用户折扣”场景
// 用来演示：同一份代码，可以在“不同层级”被测试
// ============================================================

/**
 * 纯函数：根据会员等级计算折扣率（单元测试的最佳目标）
 * @param {'normal'|'vip'|'svip'} level 会员等级
 * @returns {number} 折扣率（0~1）
 */
function discountRate(level) {
  switch (level) {
    case 'svip':
      return 0.7;
    case 'vip':
      return 0.85;
    default:
      return 1;
  }
}

/**
 * 组合逻辑：计算应付金额（集成测试目标——组合多个函数/模块）
 * @param {number} price 原价
 * @param {string} level 会员等级
 */
function finalPrice(price, level) {
  if (typeof price !== 'number' || price < 0) {
    throw new Error('price 必须是非负数字');
  }
  return Math.round(price * discountRate(level) * 100) / 100;
}

module.exports = { discountRate, finalPrice };

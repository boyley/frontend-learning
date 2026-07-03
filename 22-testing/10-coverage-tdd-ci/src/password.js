// ============================================================
// 密码强度校验器：本模块用它演示 TDD（先写测试，再写实现）
// 这份实现是“红-绿-重构”循环后的最终产物；
// 每个分支都能被测试覆盖到（对应四类覆盖率指标）。
// ============================================================

/**
 * 评估密码强度。
 * @param {string} pwd
 * @returns {'weak'|'medium'|'strong'}
 * 规则（分支，供覆盖率演示）：
 *   - 非字符串或长度 < 6 → 直接 weak
 *   - 满足项计数：含小写、含大写、含数字、含特殊字符、长度≥12
 *   - 满足 <2 项 → weak；2~3 项 → medium；≥4 项 → strong
 */
function passwordStrength(pwd) {
  if (typeof pwd !== 'string' || pwd.length < 6) return 'weak';

  let score = 0;
  if (/[a-z]/.test(pwd)) score += 1; // 小写
  if (/[A-Z]/.test(pwd)) score += 1; // 大写
  if (/[0-9]/.test(pwd)) score += 1; // 数字
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1; // 特殊字符
  if (pwd.length >= 12) score += 1; // 足够长

  if (score >= 4) return 'strong';
  if (score >= 2) return 'medium';
  return 'weak';
}

module.exports = { passwordStrength };

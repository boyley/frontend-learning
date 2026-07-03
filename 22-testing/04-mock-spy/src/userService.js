// ============================================================
// 被测代码：依赖外部模块（api）+ 依赖日志器（logger）
// 演示为什么需要 mock：我们不想在测试里真的发网络请求
// ============================================================
const { fetchUser } = require('./api');

/**
 * 获取用户展示名，并在失败时记录日志。
 * @param {number} id 用户 id
 * @param {{warn: Function}} logger 日志器（依赖注入，便于 spy）
 */
async function getUserDisplayName(id, logger) {
  try {
    const user = await fetchUser(id); // ← 外部依赖，测试时要 mock 掉
    return user.nickname || user.name;
  } catch (err) {
    logger.warn(`获取用户 ${id} 失败: ${err.message}`);
    return '匿名用户';
  }
}

module.exports = { getUserDisplayName };

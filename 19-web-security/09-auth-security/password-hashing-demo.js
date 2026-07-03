/**
 * =============================================================================
 * password-hashing-demo.js —— 密码安全存储演示（Node 纯内置 crypto，无需依赖）
 * -----------------------------------------------------------------------------
 * 运行：node password-hashing-demo.js   （无需 npm install）
 *
 * 演示要点：
 *   1) 用 crypto.randomBytes 生成随机盐（salt），crypto.scryptSync 做慢哈希
 *   2) 存储格式 salt:hash —— 绝不存明文
 *   3) 同一个密码两次注册 → 因盐不同，哈希也完全不同（彩虹表 / “一破全破” 失效）
 *   4) 校验用 crypto.timingSafeEqual 做“定时安全比较”，防时序侧信道
 *   5) 正确密码验证通过、错误密码验证失败
 *
 * 为什么不能用明文 / MD5？（⚠️ 以下攻击视角仅供学习，用于理解防御）
 *   - 明文存储：数据库一旦被拖，所有账号密码立即全部泄露。
 *   - MD5 / SHA-1 裸哈希：它们是“快速”哈希，攻击者用 GPU 每秒可算数十亿次，
 *     再配合“彩虹表”（预先算好的 明文→哈希 对照大表），常见密码可秒破。
 *   - 不加盐：相同密码得到相同哈希 → 一张彩虹表就能“一破全破”。
 *   正确姿势：加“随机盐” + “慢哈希”（scrypt / bcrypt / argon2）。
 *     · 加盐：每人一把随机盐，相同密码哈希也不同，彩虹表失效。
 *     · 慢哈希：故意耗时/耗内存，把暴力枚举、离线爆破的成本抬到不可行。
 * =============================================================================
 */

'use strict';

const crypto = require('crypto');

// scrypt 输出哈希的字节长度（64 字节 = 128 位十六进制字符）
const KEY_LEN = 16 * 4; // 64

/**
 * 注册：把明文密码转为可安全存储的 "salt:hash"
 * @param {string} password 用户明文密码（仅在内存中短暂存在，绝不落库）
 * @returns {string} 形如 "<saltHex>:<hashHex>" 的可存储字符串
 */
function hashPassword(password) {
  // ① 生成 16 字节随机盐 —— 每次注册都不同，这是彩虹表失效的关键
  const salt = crypto.randomBytes(16).toString('hex');
  // ② scrypt 慢哈希：内部做大量计算 + 占用内存，故意“慢”以抵御暴力破解
  const hash = crypto.scryptSync(password, salt, KEY_LEN).toString('hex');
  // ③ 盐和哈希一起存（盐不需要保密，它的作用是“打乱”，不是“加密密钥”）
  return `${salt}:${hash}`;
}

/**
 * 校验：用户输入密码是否与已存储的 "salt:hash" 匹配
 * @param {string} password 用户本次输入的明文密码
 * @param {string} stored   注册时保存的 "salt:hash"
 * @returns {boolean} 是否匹配
 */
function verifyPassword(password, stored) {
  const [salt, originalHash] = stored.split(':');
  // 用“同一把盐”重新计算哈希，再和存储值比对
  const hashBuffer = crypto.scryptSync(password, salt, KEY_LEN);
  const originalBuffer = Buffer.from(originalHash, 'hex');

  // 长度不同直接判否（timingSafeEqual 要求两者等长，否则会抛错）
  if (hashBuffer.length !== originalBuffer.length) return false;

  // ④ 定时安全比较：无论从第几个字节开始不同，耗时都恒定，
  //    避免攻击者通过“比较耗时”这一侧信道逐字节猜测哈希（⚠️ 仅供学习）
  return crypto.timingSafeEqual(hashBuffer, originalBuffer);
}

// ============================ 演示开始 ============================

console.log('==================================================================');
console.log('  密码安全存储演示（加盐 + scrypt 慢哈希）');
console.log('==================================================================\n');

const password = 'S3cr3t-Passw0rd!';

// 【演示 1】同一个密码，两次注册 → 哈希完全不同（因为盐是随机的）
const record1 = hashPassword(password);
const record2 = hashPassword(password);
console.log('【1】同一密码两次注册，得到不同的 salt:hash（防彩虹表 / 防“一破全破”）');
console.log('  第一次：', record1);
console.log('  第二次：', record2);
console.log('  两条记录是否相同？', record1 === record2, '  → false 才对（盐不同）\n');

// 【演示 2】正确密码校验通过
console.log('【2】用正确密码校验第一条记录');
console.log('  输入正确密码 → 验证结果：', verifyPassword(password, record1), '（应为 true ✅）\n');

// 【演示 3】错误密码校验失败
console.log('【3】用错误密码校验第一条记录');
console.log('  输入 "wrong-password" → 验证结果：', verifyPassword('wrong-password', record1), '（应为 false ✅）\n');

// 【演示 4】反面教材：MD5 裸哈希为何不安全（⚠️ 仅供学习，切勿用于真实密码存储）
const md5a = crypto.createHash('md5').update(password).digest('hex');
const md5b = crypto.createHash('md5').update(password).digest('hex');
console.log('【4】反面教材：MD5 裸哈希（⚠️ 仅供学习，真实项目严禁这样存密码）');
console.log('  MD5(密码) 第一次：', md5a);
console.log('  MD5(密码) 第二次：', md5b);
console.log('  两次是否相同？', md5a === md5b, '  → true！无盐且极快');
console.log('  风险：相同密码哈希相同 + 计算极快 → 彩虹表可秒破，绝不可用。\n');

console.log('==================================================================');
console.log('  结论：存储密码必须用「随机盐 + 慢哈希（scrypt/bcrypt/argon2）」，');
console.log('        绝不明文、绝不 MD5/SHA1 裸哈希。');
console.log('==================================================================');

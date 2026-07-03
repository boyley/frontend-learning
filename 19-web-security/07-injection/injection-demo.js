/**
 * =============================================================================
 * SQL 注入演示（漏洞版 vs 安全版对照）—— 纯 Node 内置模块，无需 npm install
 *
 * 运行：node injection-demo.js
 *
 * ⚠️⚠️ 攻击输入部分【仅供学习】，用于理解注入原理，请勿用于任何真实系统。
 *
 * 说明：为了免依赖、可直接运行，这里用一个【内存数组】模拟数据库表 users，
 *       并写一个【极简 SQL 条件解释器】来"执行"WHERE 条件，
 *       让你真实看到「字符串拼接」如何被 ' OR '1'='1 改写成恒真、绕过登录。
 * =============================================================================
 */

'use strict';

// ---- 模拟数据库：users 表 ----------------------------------------------------
// 真实数据库里是一张表，这里用数组模拟，第一条通常是权限最高的 admin
const users = [
  { id: 1, name: 'admin',    password: 'super-secret-8f3a' }, // 攻击者最想登进来的账户
  { id: 2, name: 'zhangsan', password: 'zhang123' },
  { id: 3, name: 'lisi',     password: 'li456' },
];

/**
 * 极简 SQL WHERE 条件解释器（仅够演示本例，非真实 SQL 引擎）。
 * 支持两种片段：
 *   1) name = 'xxx'      —— 精确匹配某个用户名
 *   2) '1'='1'（或 'a'='a'）—— 常量比较，两边相等则【恒真】
 * 用 OR 连接多个片段：任一片段为真则整行匹配（模拟 SQL 的 OR 语义）。
 *
 * 这样当拼接出 WHERE name='' OR '1'='1' 时，'1'='1' 恒真 → 每一行都返回，
 * 真实复现「登录绕过」。
 */
function runWhere(users, whereClause) {
  // 按 OR 拆成若干条件片段（不区分大小写）
  const orParts = whereClause.split(/\s+or\s+/i).map(s => s.trim());

  return users.filter(row => {
    // 只要有一个 OR 片段成立，这一行就匹配
    return orParts.some(part => {
      // 情况 1：name = 'xxx'
      const nameEq = part.match(/^name\s*=\s*'([^']*)'$/i);
      if (nameEq) {
        return row.name === nameEq[1];
      }
      // 情况 2：'常量' = '常量'（如 '1'='1'），两边字符串相等即恒真
      const constEq = part.match(/^'([^']*)'\s*=\s*'([^']*)'$/);
      if (constEq) {
        return constEq[1] === constEq[2];
      }
      // 无法识别的片段一律视为不成立
      return false;
    });
  });
}

// ---- ❌ 漏洞版：字符串拼接构造 SQL ------------------------------------------
// 用户输入被直接拼进 SQL 语法中，引号能"越狱"改变查询结构
function loginVulnerable(name) {
  // ❌ 危险：把 name 直接拼进 SQL 字符串
  const sql = `SELECT * FROM users WHERE name = '${name}'`;
  console.log('   拼接出的 SQL：', sql);

  // 取出 WHERE 之后的条件交给解释器"执行"
  const whereClause = sql.slice(sql.toUpperCase().indexOf('WHERE ') + 6);
  const rows = runWhere(users, whereClause);

  return rows;
}

// ---- ✅ 安全版：参数化思路 --------------------------------------------------
// 输入只当【纯数据】，用精确相等比较，输入永远不会被解析成 SQL 语法
function loginSafe(name) {
  // ✅ 安全：等价于「WHERE name = ?」并把 name 作为纯数据绑定
  // 无论 name 里有多少引号/OR/注释符，它都只是一个要精确匹配的字符串值
  console.log('   参数化：SELECT * FROM users WHERE name = ?   绑定参数 =', JSON.stringify(name));
  const rows = users.filter(u => u.name === name);
  return rows;
}

// ---- 演示对照 ---------------------------------------------------------------
function show(title, rows) {
  if (rows.length > 0) {
    console.log(`   → 命中 ${rows.length} 行，登录成功，登入账户：` +
      rows.map(r => r.name).join(', '));
  } else {
    console.log('   → 命中 0 行，登录失败 ✅');
  }
  console.log('');
}

console.log('==============================================================');
console.log(' SQL 注入演示（仅供学习）');
console.log('==============================================================\n');

// 1) 正常登录：输入真实用户名
console.log('【1】正常输入 name = "zhangsan"（漏洞版）');
show('正常', loginVulnerable('zhangsan'));

// 2) 恶意输入 + 漏洞版 → 绕过登录
console.log('【2】❌ 恶意输入 name = "\' OR \'1\'=\'1"（漏洞版 · 仅供学习）');
console.log('     预期：\'1\'=\'1\' 恒真，返回所有用户，绕过登录登入 admin');
show('注入', loginVulnerable("' OR '1'='1"));

// 3) 同样的恶意输入 + 安全版 → 绕过失效
console.log('【3】✅ 同样恶意输入 name = "\' OR \'1\'=\'1"（安全版 · 参数化）');
console.log('     预期：整串被当纯数据，查无此用户名，登录失败');
show('参数化', loginSafe("' OR '1'='1"));

// 4) 安全版下用真实用户名依然正常工作
console.log('【4】✅ 安全版正常输入 name = "zhangsan"');
show('正常', loginSafe('zhangsan'));

console.log('==============================================================');
console.log(' 结论：字符串拼接让输入里的引号改写了查询语义（恒真绕过）；');
console.log('       参数化把输入锁定为"数据"，语义不变，注入失效。');
console.log('==============================================================');

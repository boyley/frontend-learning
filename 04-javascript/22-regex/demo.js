// 22 · 正则表达式 demo
// 本文件聚焦：创建正则、test/match/matchAll/replace、元字符/量词/分组/断言、常用校验
// 既能在浏览器运行（index.html 引入），也能 `node demo.js` 直接运行

'use strict';

const lines = [];
function log(...args) {
  const text = args
    .map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)))
    .join(' ');
  lines.push(text);
  console.log(text);
}

// ============================================================
// 一、两种创建方式
// ============================================================
log('===== 一、创建正则 =====');
// 1) 字面量：/pattern/flags —— 性能好，模式固定时首选
const re1 = /\d+/g;
// 2) 构造函数：当模式来自变量、需要动态拼接时使用（注意字符串里反斜杠要写两个）
const word = 'cat';
const re2 = new RegExp(`\\b${word}\\b`, 'i');
log('字面量正则:', re1.source, '标志:', re1.flags); // \d+  g
log('构造函数正则:', re2.source, '标志:', re2.flags); // \bcat\b  i

// 常用标志(flags)：
// g 全局匹配  i 忽略大小写  m 多行  s 让 . 匹配换行  u Unicode  y 粘连

// ============================================================
// 二、test / match / matchAll / replace
// ============================================================
log('\n===== 二、核心方法 =====');
const text = '价格 100 元，运费 20 元，共 120 元';

// test：返回布尔，判断「是否匹配」
log('是否含数字:', /\d+/.test(text)); // true

// match：不带 g 返回首个匹配 + 捕获组信息；带 g 返回所有匹配文本数组
log('match 不带 g:', text.match(/\d+/)[0]); // 100
log('match 带 g  :', text.match(/\d+/g)); // ['100','20','120']

// matchAll：带 g，返回迭代器，能拿到每个匹配的下标和捕获组
for (const m of text.matchAll(/(\d+)\s*元/g)) {
  log(`找到「${m[0]}」金额=${m[1]} 位置=${m.index}`);
}

// replace：替换；第二参可用 $1 引用捕获组，也可传函数
const masked = '手机号 13812345678 已绑定'.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
log('脱敏:', masked); // 手机号 138****5678 已绑定
const doubled = '1 2 3'.replace(/\d/g, (d) => Number(d) * 2);
log('replace 用函数:', doubled); // 2 4 6

// ============================================================
// 三、元字符 / 字符类 / 量词 / 分组 / 断言
// ============================================================
log('\n===== 三、语法要点 =====');

// 字符类：[abc] 任一字符  [a-z] 范围  [^abc] 取反
log('[aeiou] 元音:', 'hello'.match(/[aeiou]/g)); // ['e','o']

// 预定义类：\d 数字  \w 单词字符  \s 空白；大写为取反
log('\\w+ 单词:', 'a_1 b-2'.match(/\w+/g)); // ['a_1','b','2']

// 量词：* 0+  + 1+  ? 0或1  {n} 恰好n  {n,} 至少n  {n,m} n到m
log('a{2,3}:', 'a aa aaa aaaa'.match(/a{2,3}/g)); // ['aa','aaa','aaa']

// 贪婪 vs 懒惰：默认贪婪，加 ? 变懒惰（尽量少匹配）
log('贪婪 <.+> :', '<a><b>'.match(/<.+>/)[0]); // <a><b>
log('懒惰 <.+?>:', '<a><b>'.match(/<.+?>/)[0]); // <a>

// 分组与捕获组：() 捕获  (?:) 非捕获  (?<name>) 命名捕获
const dateStr = '2026-06-30';
const m = dateStr.match(/(?<y>\d{4})-(?<mo>\d{2})-(?<d>\d{2})/);
log('命名捕获组:', m.groups.y, m.groups.mo, m.groups.d); // 2026 06 30

// 断言：^ 开头  $ 结尾  \b 单词边界
// 先行断言 (?=) 后行断言 (?<=)
log('千分位:', '1234567'.replace(/\B(?=(\d{3})+(?!\d))/g, ',')); // 1,234,567

// ============================================================
// 四、常用校验示例
// ============================================================
log('\n===== 四、常用校验 =====');

// 中国大陆手机号：1 开头，第二位 3-9，共 11 位
const phoneRe = /^1[3-9]\d{9}$/;
log('手机号 13812345678:', phoneRe.test('13812345678')); // true
log('手机号 12345:', phoneRe.test('12345')); // false

// 邮箱（简化版，覆盖绝大多数日常场景）
const emailRe = /^[\w.-]+@[\w-]+(\.[\w-]+)+$/;
log('邮箱 a.b@mail.com:', emailRe.test('a.b@mail.com')); // true
log('邮箱 bad@:', emailRe.test('bad@')); // false

// 身份证（18 位，末位可为 X）
const idRe = /^\d{17}[\dXx]$/;
log('身份证:', idRe.test('11010519491231002X')); // true

// 强密码：至少 8 位，包含大小写字母和数字（用先行断言）
const pwdRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
log('密码 Abc12345:', pwdRe.test('Abc12345')); // true
log('密码 abc:', pwdRe.test('abc')); // false

// URL（简化）
const urlRe = /^https?:\/\/[\w.-]+(\/\S*)?$/;
log('URL:', urlRe.test('https://developer.mozilla.org/zh-CN')); // true

// ============================================================
// 输出到页面（仅浏览器执行）
// ============================================================
if (typeof document !== 'undefined') {
  const pre = document.getElementById('output');
  if (pre) pre.textContent = lines.join('\n');
}

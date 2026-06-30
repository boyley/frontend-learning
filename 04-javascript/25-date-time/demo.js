// 25 · 日期与时间 demo
// 本文件聚焦：Date 创建/获取/设置、时间戳、格式化、时区、月份从 0 开始坑、Intl.DateTimeFormat
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
// 一、创建 Date 的几种方式
// ============================================================
log('===== 一、创建 Date =====');
const now = new Date(); // 当前时间
log('当前时间:', now.toString().slice(0, 24));

// 注意：月份参数从 0 开始！0=一月，11=十二月
// 下面表示「2026 年 6 月 30 日 10:30」，第二参要写 5 而不是 6
const d1 = new Date(2026, 5, 30, 10, 30, 0);
log('new Date(2026, 5, 30):', d1.getMonth() + 1, '月', d1.getDate(), '日'); // 6 月 30 日

// 用时间戳（毫秒）创建
const d2 = new Date(1782000000000);
log('用时间戳创建:', d2.toISOString());

// 用字符串创建（推荐 ISO 8601 格式，跨浏览器一致）
const d3 = new Date('2026-06-30T10:30:00');
log('用 ISO 字符串创建:', d3.getFullYear()); // 2026

// ============================================================
// 二、获取各部分（get 系列）
// ============================================================
log('\n===== 二、获取日期分量 =====');
const d = new Date('2026-06-30T10:30:45.500');
log('getFullYear:', d.getFullYear()); // 2026（千万别用 getYear）
log('getMonth   :', d.getMonth(), '（0-11，需 +1）'); // 5
log('getDate    :', d.getDate()); // 30（月里的第几天）
log('getDay     :', d.getDay(), '（0=周日, 6=周六）'); // 2 周二
log('getHours   :', d.getHours()); // 10
log('getMinutes :', d.getMinutes()); // 30
log('getSeconds :', d.getSeconds()); // 45
log('getMilliseconds:', d.getMilliseconds()); // 500

// ============================================================
// 三、设置各部分（set 系列）+ 日期运算
// ============================================================
log('\n===== 三、设置与运算 =====');
const future = new Date('2026-06-30T00:00:00');
future.setDate(future.getDate() + 7); // 加 7 天（会自动跨月）
log('7 天后:', future.getMonth() + 1, '月', future.getDate(), '日'); // 7 月 7 日

// 跨月自动进位演示：1 月 31 日加 1 天 → 2 月 1 日
const jan = new Date(2026, 0, 31);
jan.setDate(jan.getDate() + 1);
log('1 月 31 日 +1 天:', jan.getMonth() + 1, '月', jan.getDate(), '日'); // 2 月 1 日

// ============================================================
// 四、时间戳
// ============================================================
log('\n===== 四、时间戳 =====');
// Date.now()：当前时间的毫秒级时间戳（1970-01-01 UTC 至今的毫秒数）
log('Date.now():', typeof Date.now(), Date.now() > 0); // number true
// getTime()：某个 Date 对象的时间戳
const t1 = new Date('2026-06-30').getTime();
const t2 = new Date('2026-07-01').getTime();
log('两天相差毫秒:', t2 - t1); // 86400000
log('换算成天数:', (t2 - t1) / 1000 / 60 / 60 / 24); // 1

// 常用：计算耗时
const start = Date.now();
let s = 0;
for (let i = 0; i < 1e5; i++) s += i;
log('循环耗时(ms):', Date.now() - start >= 0); // true

// ============================================================
// 五、格式化
// ============================================================
log('\n===== 五、格式化 =====');
const fd = new Date('2026-06-30T10:30:45');

// 1) 内置方法（格式固定，不够灵活）
log('toISOString:', fd.toISOString()); // UTC 时间的 ISO 字符串
log('toLocaleString:', fd.toLocaleString('zh-CN')); // 本地化字符串

// 2) 手写格式化函数（补零）
function format(date) {
  const pad = (n) => String(n).padStart(2, '0'); // 个位数补零
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1); // 别忘了 +1
  const da = pad(date.getDate());
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const se = pad(date.getSeconds());
  return `${y}-${mo}-${da} ${h}:${mi}:${se}`;
}
log('手写格式化:', format(fd)); // 2026-06-30 10:30:45

// 3) Intl.DateTimeFormat：官方推荐的国际化格式化
const intlFmt = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
  hour: '2-digit',
  minute: '2-digit',
});
log('Intl 格式化:', intlFmt.format(fd)); // 2026年6月30日星期二 10:30

// ============================================================
// 六、时区注意
// ============================================================
log('\n===== 六、时区 =====');
// getTimezoneOffset：本地时区与 UTC 的分钟差（中国 UTC+8 返回 -480）
log('时区偏移(分钟):', new Date().getTimezoneOffset());
// 同一时刻，ISO(UTC) 与本地显示可能差几个小时，注意区分"绝对时刻"和"墙上时间"
const sameMoment = new Date('2026-06-30T00:00:00Z'); // Z 表示 UTC
log('UTC 小时:', sameMoment.getUTCHours(), ' 本地小时:', sameMoment.getHours());

// ============================================================
// 输出到页面（仅浏览器执行）
// ============================================================
if (typeof document !== 'undefined') {
  const pre = document.getElementById('output');
  if (pre) pre.textContent = lines.join('\n');
}

// 03 · 流程控制 demo
// 聚焦：if/else、switch、for/while/do-while、for...of/for...in、break/continue
// 浏览器和 node 均可运行

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
// 一、if / else if / else
// ============================================================
log('===== 一、if / else =====');
function grade(score) {
  // 多分支判断：从上到下，命中即返回
  if (score >= 90) return 'A';
  else if (score >= 80) return 'B';
  else if (score >= 60) return 'C';
  else return 'D';
}
log('95 分 =>', grade(95));
log('72 分 =>', grade(72));
log('50 分 =>', grade(50));

// ============================================================
// 二、switch（适合等值匹配多个固定取值）
// ============================================================
log('\n===== 二、switch =====');
function weekName(day) {
  switch (day) {
    case 1:
      return '周一';
    case 6: // 多个 case 共用一段逻辑：故意不写 break 让其穿透
    case 7:
      return '周末';
    default:
      return '工作日';
  }
}
log('day=1 =>', weekName(1));
log('day=6 =>', weekName(6));
log('day=3 =>', weekName(3));
// 注意：case 不写 break 会"穿透"到下一个 case，需谨慎

// ============================================================
// 三、for 循环
// ============================================================
log('\n===== 三、for 循环 =====');
let sum = 0;
for (let i = 1; i <= 5; i++) {
  // 初始化; 条件; 步进
  sum += i;
}
log('1 到 5 求和 =', sum); // 15

// ============================================================
// 四、while 与 do-while
// ============================================================
log('\n===== 四、while / do-while =====');
let count = 3;
while (count > 0) {
  // 先判断条件再执行
  log('while 倒计时:', count);
  count--;
}

let k = 0;
do {
  // 先执行一次再判断条件（即使条件一开始就为假，也会执行 1 次）
  log('do-while 至少执行一次, k =', k);
  k++;
} while (k < 0);

// ============================================================
// 五、for...of（遍历可迭代对象的"值"：数组/字符串/Map/Set）
// ============================================================
log('\n===== 五、for...of =====');
const fruits = ['苹果', '香蕉', '橙子'];
for (const fruit of fruits) {
  log('for...of 值:', fruit);
}
for (const ch of 'Hi') {
  log('遍历字符串:', ch);
}

// ============================================================
// 六、for...in（遍历对象的"键名"，也会遍历数组索引）
// ============================================================
log('\n===== 六、for...in =====');
const person = { name: 'Tom', age: 18 };
for (const key in person) {
  log('for...in 键:', key, '值:', person[key]);
}
// 易错：for...in 遍历数组拿到的是字符串索引 "0" "1"，且会遍历到原型上可枚举属性
// 遍历数组请用 for...of 或 forEach

// ============================================================
// 七、break / continue
// ============================================================
log('\n===== 七、break / continue =====');
for (let i = 1; i <= 5; i++) {
  if (i === 4) break; // 跳出整个循环
  log('break 演示 i =', i); // 打印 1 2 3
}
for (let i = 1; i <= 5; i++) {
  if (i % 2 === 0) continue; // 跳过本次，进入下一轮
  log('continue 只打印奇数 i =', i); // 打印 1 3 5
}

// ============================================================
// 输出到页面
// ============================================================
if (typeof document !== 'undefined') {
  const pre = document.getElementById('output');
  if (pre) pre.textContent = lines.join('\n');
}

// 05 · 数组 demo
// 聚焦：创建、增删改查、push/pop/shift/unshift/slice/splice/concat/
//       indexOf/includes/join/sort/reverse、遍历
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
// 一、创建数组
// ============================================================
log('===== 一、创建数组 =====');
const a1 = [1, 2, 3]; // 字面量（最常用）
const a2 = new Array(3); // 长度为 3 的空数组
const a3 = Array.of(7); // [7]，避免 new Array(7) 的歧义
const a4 = Array.from('abc'); // 从可迭代对象生成 ['a','b','c']
log('字面量:', a1);
log('Array.of(7):', a3);
log('Array.from("abc"):', a4);
log('数组长度 a1.length =', a1.length);

// ============================================================
// 二、增删（会改变原数组的方法：push/pop/shift/unshift/splice）
// ============================================================
log('\n===== 二、增删（改原数组）=====');
const arr = [2, 3, 4];

arr.push(5); // 尾部添加，返回新长度
log('push(5) 后:', arr); // [2,3,4,5]
arr.unshift(1); // 头部添加
log('unshift(1) 后:', arr); // [1,2,3,4,5]

const last = arr.pop(); // 删除并返回尾部元素
log('pop() 取出:', last, '剩:', arr); // 5, [1,2,3,4]
const first = arr.shift(); // 删除并返回头部元素
log('shift() 取出:', first, '剩:', arr); // 1, [2,3,4]

// splice(起始索引, 删除个数, 插入项...)：万能增删改
const sp = [1, 2, 3, 4, 5];
const removed = sp.splice(1, 2, 'a', 'b'); // 从索引1删2个，插入 a b
log('splice 结果:', sp, '被删:', removed); // ['1','a','b','4','5'], [2,3]

// ============================================================
// 三、查（不改原数组）
// ============================================================
log('\n===== 三、查找 =====');
const nums = [10, 20, 30, 20];
log('indexOf(20):', nums.indexOf(20)); // 1，首个匹配的索引，没有返回 -1
log('lastIndexOf(20):', nums.lastIndexOf(20)); // 3
log('includes(30):', nums.includes(30)); // true，是否包含
log('find > 15:', nums.find((n) => n > 15)); // 20，首个满足条件的值
log('findIndex > 15:', nums.findIndex((n) => n > 15)); // 1

// ============================================================
// 四、截取 / 合并（slice / concat 不改原数组）
// ============================================================
log('\n===== 四、slice / concat（不改原数组）=====');
const src = [1, 2, 3, 4, 5];
log('slice(1,3):', src.slice(1, 3)); // [2,3] 含头不含尾
log('slice(-2):', src.slice(-2)); // [4,5] 负数从末尾算
log('原数组未变:', src); // [1,2,3,4,5]
log('concat 合并:', [1, 2].concat([3, 4], 5)); // [1,2,3,4,5]
log('扩展运算符合并:', [...[1, 2], ...[3, 4]]); // [1,2,3,4]

// ============================================================
// 五、转字符串 / 排序 / 反转
// ============================================================
log('\n===== 五、join / sort / reverse =====');
log('join("-"):', ['a', 'b', 'c'].join('-')); // "a-b-c"

// sort 默认按字符串比较，数字排序要传比较函数；且 sort 会改原数组
const toSort = [10, 1, 21, 2];
log('默认 sort（按字符串）:', [...toSort].sort()); // [1,10,2,21] 错误直觉
log('数字升序 sort((a,b)=>a-b):', [...toSort].sort((a, b) => a - b)); // [1,2,10,21]
log('数字降序:', [...toSort].sort((a, b) => b - a)); // [21,10,2,1]

const toRev = [1, 2, 3];
log('reverse:', toRev.reverse(), '(原数组也被改)'); // [3,2,1]

// ============================================================
// 六、遍历
// ============================================================
log('\n===== 六、遍历 =====');
const list = [1, 2, 3];

// forEach：纯遍历，无返回值
list.forEach((item, index) => log(`forEach index=${index} item=${item}`));

// map：映射成新数组
log('map 翻倍:', list.map((x) => x * 2)); // [2,4,6]

// filter：过滤
log('filter 偶数:', [1, 2, 3, 4].filter((x) => x % 2 === 0)); // [2,4]

// reduce：聚合
log('reduce 求和:', list.reduce((acc, x) => acc + x, 0)); // 6

// for...of：直接拿值
let s = '';
for (const x of list) s += x;
log('for...of 拼接:', s); // "123"

// ============================================================
// 输出到页面
// ============================================================
if (typeof document !== 'undefined') {
  const pre = document.getElementById('output');
  if (pre) pre.textContent = lines.join('\n');
}

// 24 · 高阶函数 demo
// 本文件聚焦：高阶函数概念、map/filter/reduce/forEach/find/some/every/sort、
//            函数作为参数与返回值、链式调用、柯里化简介
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
// 一、什么是高阶函数
// ============================================================
log('===== 一、高阶函数概念 =====');
// 高阶函数 = 满足以下任一条件的函数：
//   1) 接收「函数」作为参数
//   2) 返回一个「函数」
// 数组的 map/filter/reduce 等都是高阶函数（参数是回调函数）

// 函数作为参数：把"要做什么"传进去
function repeat(n, action) {
  for (let i = 0; i < n; i++) action(i);
}
repeat(3, (i) => log('第', i, '次执行'));

// 函数作为返回值：根据配置生成新函数
function makeMultiplier(factor) {
  return (x) => x * factor; // 返回一个记住了 factor 的新函数（闭包）
}
const double = makeMultiplier(2);
const triple = makeMultiplier(3);
log('double(5):', double(5), ' triple(5):', triple(5)); // 10 15

// ============================================================
// 二、数组常用高阶函数
// ============================================================
log('\n===== 二、数组高阶函数 =====');
const nums = [1, 2, 3, 4, 5, 6];

// map：一对一变换，返回等长新数组
log('map 平方:', nums.map((n) => n * n)); // [1,4,9,16,25,36]

// filter：按条件筛选，返回符合条件的子集
log('filter 偶数:', nums.filter((n) => n % 2 === 0)); // [2,4,6]

// reduce：把数组"折叠"成一个值（求和、最大值、分组都靠它）
const sum = nums.reduce((acc, n) => acc + n, 0); // acc 累加器，初始 0
log('reduce 求和:', sum); // 21

// forEach：仅遍历执行副作用，无返回值（不能链式）
let total = 0;
nums.forEach((n) => (total += n));
log('forEach 累加:', total); // 21

// find：返回第一个满足条件的元素（找不到返回 undefined）
log('find 第一个大于 3:', nums.find((n) => n > 3)); // 4

// some：只要有一个满足就返回 true
log('some 有偶数:', nums.some((n) => n % 2 === 0)); // true

// every：必须全部满足才返回 true
log('every 全为正:', nums.every((n) => n > 0)); // true

// sort：排序（会改变原数组！比较函数返回负数表示 a 在前）
log('sort 降序:', [...nums].sort((a, b) => b - a)); // [6,5,4,3,2,1]

// ============================================================
// 三、链式调用
// ============================================================
log('\n===== 三、链式调用 =====');
// map/filter/sort 都返回新数组，可串起来形成"数据管道"
const products = [
  { name: '键盘', price: 199, stock: 0 },
  { name: '鼠标', price: 89, stock: 12 },
  { name: '显示器', price: 1299, stock: 3 },
  { name: '耳机', price: 299, stock: 0 },
];
const result = products
  .filter((p) => p.stock > 0) // 1) 只要有货的
  .map((p) => ({ name: p.name, price: p.price })) // 2) 只保留名称和价格
  .sort((a, b) => a.price - b.price); // 3) 按价格升序
log('链式结果:', result); // [{鼠标,89},{显示器,1299}]

// reduce 做分组：把数组按是否有货分类
const grouped = products.reduce((acc, p) => {
  const key = p.stock > 0 ? '有货' : '缺货';
  (acc[key] ||= []).push(p.name); // 没有该键就先建空数组
  return acc;
}, {});
log('reduce 分组:', grouped);

// ============================================================
// 四、柯里化简介
// ============================================================
log('\n===== 四、柯里化 =====');
// 柯里化：把"多参数函数"变成"一次接收一个参数的函数链"
// 普通：add(1, 2, 3)；柯里化：add(1)(2)(3)
const add = (a) => (b) => (c) => a + b + c;
log('柯里化 add(1)(2)(3):', add(1)(2)(3)); // 6

// 实用价值：固定前面的参数，复用生成专用函数
const addTax = (rate) => (price) => price * (1 + rate);
const withVat = addTax(0.13); // 固定 13% 税率
log('含税价 100 元:', withVat(100)); // 113

// ============================================================
// 输出到页面（仅浏览器执行）
// ============================================================
if (typeof document !== 'undefined') {
  const pre = document.getElementById('output');
  if (pre) pre.textContent = lines.join('\n');
}

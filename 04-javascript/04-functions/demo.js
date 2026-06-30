// 04 · 函数 demo
// 聚焦：函数声明 vs 表达式、箭头函数、默认参数 / 剩余参数、arguments、递归
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
// 一、函数声明 vs 函数表达式
// ============================================================
log('===== 一、声明 vs 表达式 =====');

// 函数声明：会被整体提升，定义之前就能调用
log('提升调用 declared() =>', declared());
function declared() {
  return '我是函数声明';
}

// 函数表达式：把函数赋给变量，不会被提升（变量提升但值是 undefined）
const expressed = function () {
  return '我是函数表达式';
};
log('表达式调用 expressed() =>', expressed());
// expressedBefore(); // 报错：在赋值前调用会失败

// ============================================================
// 二、箭头函数
// ============================================================
log('\n===== 二、箭头函数 =====');
const add = (a, b) => a + b; // 单表达式可省略 return 和大括号
const square = (x) => x * x; // 单参数可省略括号
const sayHi = () => '你好'; // 无参数要写空括号
log('add(2,3) =>', add(2, 3));
log('square(5) =>', square(5));
log('sayHi() =>', sayHi());

// 箭头函数没有自己的 this，它继承外层作用域的 this
const counter = {
  count: 0,
  // 用箭头函数包裹定时回调，this 仍指向 counter（演示 this 继承）
  makeIncrementer() {
    return () => ++this.count; // 这里的 this 来自 makeIncrementer
  },
};
const inc = counter.makeIncrementer();
log('箭头函数继承 this:', inc(), inc()); // 1 2

// ============================================================
// 三、默认参数
// ============================================================
log('\n===== 三、默认参数 =====');
function greet(name = '游客', greeting = '欢迎') {
  // 不传或传 undefined 时使用默认值
  return `${greeting}，${name}`;
}
log(greet());
log(greet('Tom'));
log(greet('Tom', '你好'));

// ============================================================
// 四、剩余参数（rest）与 arguments
// ============================================================
log('\n===== 四、剩余参数 / arguments =====');

// 剩余参数：用 ...names 把多余实参收集成一个真正的数组
function sum(...nums) {
  return nums.reduce((acc, n) => acc + n, 0);
}
log('sum(1,2,3,4) =>', sum(1, 2, 3, 4));

// arguments：传统函数内部的类数组对象，包含所有实参（箭头函数没有）
function showArguments() {
  // arguments 不是真数组，但有 length 和索引
  log('arguments.length =>', arguments.length);
  log('arguments[0] =>', arguments[0]);
  // 转成真数组再用数组方法
  const arr = Array.from(arguments);
  log('转数组后 map:', arr.map((x) => x * 2));
}
showArguments(10, 20, 30);
// 现代写法推荐用剩余参数代替 arguments

// ============================================================
// 五、递归（函数调用自身）
// ============================================================
log('\n===== 五、递归 =====');

// 阶乘：n! = n * (n-1)!
function factorial(n) {
  if (n <= 1) return 1; // 递归出口（基线条件），必须有，否则栈溢出
  return n * factorial(n - 1); // 递归调用，规模缩小
}
log('5! =>', factorial(5)); // 120

// 斐波那契：fib(n) = fib(n-1) + fib(n-2)
function fib(n) {
  if (n < 2) return n; // 出口：fib(0)=0, fib(1)=1
  return fib(n - 1) + fib(n - 2);
}
log('fib(10) =>', fib(10)); // 55

// ============================================================
// 输出到页面
// ============================================================
if (typeof document !== 'undefined') {
  const pre = document.getElementById('output');
  if (pre) pre.textContent = lines.join('\n');
}

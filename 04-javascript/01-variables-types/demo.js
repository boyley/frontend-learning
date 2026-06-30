// 01 · 变量与数据类型 demo
// 本文件聚焦：var/let/const 区别、7 种原始类型 + object、typeof、类型判断
// 既能在浏览器运行（index.html 引入），也能 `node demo.js` 直接运行

'use strict';

// 收集所有输出，最后统一打印到页面 + 控制台
const lines = [];
function log(...args) {
  // 把每条结果同时存入数组并打印到控制台
  const text = args
    .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
    .join(' ');
  lines.push(text);
  console.log(text);
}

// ============================================================
// 一、var / let / const 的区别
// ============================================================
log('===== 一、var / let / const =====');

// 1) 作用域：var 是函数作用域，let/const 是块级作用域
function scopeDemo() {
  if (true) {
    var a = 'var 变量'; // 泄漏到整个函数
    let b = 'let 变量'; // 只在 if 块内有效
    const c = 'const 变量'; // 只在 if 块内有效
  }
  log('var 能在块外访问:', a); // 正常
  // log(b); // ReferenceError：b 是块级作用域，这里访问不到
}
scopeDemo();

// 2) 变量提升：var 提升且初始化为 undefined；let/const 有"暂时性死区"(TDZ)
log('var 提升后的值:', typeof hoisted); // undefined（声明被提升）
var hoisted = 1;
// log(tdz); // 报错：Cannot access 'tdz' before initialization
let tdz = 2;

// 3) const 声明的变量不能重新赋值，但对象内部可变
const PI = 3.14;
// PI = 3; // TypeError：Assignment to constant variable
const obj = { n: 1 };
obj.n = 2; // 合法：改的是属性，不是绑定本身
log('const 对象属性可改:', obj.n);

// 4) 重复声明：var 允许，let/const 不允许
var x = 1;
var x = 2; // 合法
log('var 可重复声明:', x);
// let y = 1; let y = 2; // SyntaxError

// ============================================================
// 二、7 种原始类型（primitive） + object
// ============================================================
log('\n===== 二、数据类型 =====');

// 原始类型：string / number / boolean / undefined / null / symbol / bigint
const sStr = 'hello'; // 字符串
const sNum = 42; // 数字（整数和浮点共用一种）
const sBool = true; // 布尔
let sUndef; // undefined：声明未赋值
const sNull = null; // null：人为表示"空对象"
const sSym = Symbol('id'); // symbol：唯一标识
const sBig = 9007199254740993n; // bigint：超大整数，结尾加 n

log('string :', sStr);
log('number :', sNum);
log('boolean:', sBool);
log('undefined:', sUndef);
log('null   :', sNull);
log('symbol :', sSym.toString());
log('bigint :', sBig.toString());

// 引用类型 object：对象 / 数组 / 函数等
const refObj = { name: 'Tom' };
const refArr = [1, 2, 3];
const refFn = function () {};
log('object :', refObj, refArr);

// number 的特殊值
log('特殊数字:', Infinity, -Infinity, NaN);
log('NaN 自己不等于自己:', NaN === NaN); // false，这是判断 NaN 要用 Number.isNaN 的原因

// ============================================================
// 三、typeof 运算符
// ============================================================
log('\n===== 三、typeof =====');
log('typeof "x"      =>', typeof 'x'); // string
log('typeof 1        =>', typeof 1); // number
log('typeof true     =>', typeof true); // boolean
log('typeof undefined=>', typeof undefined); // undefined
log('typeof null     =>', typeof null); // object（著名历史 bug！）
log('typeof Symbol() =>', typeof Symbol()); // symbol
log('typeof 1n       =>', typeof 1n); // bigint
log('typeof {}       =>', typeof {}); // object
log('typeof []       =>', typeof []); // object（数组也是 object）
log('typeof func     =>', typeof refFn); // function（唯一被特殊对待的对象）

// ============================================================
// 四、可靠的类型判断
// ============================================================
log('\n===== 四、类型判断 =====');

// 1) 判断数组：Array.isArray（typeof 无法区分数组和普通对象）
log('Array.isArray([]):', Array.isArray(refArr)); // true
log('Array.isArray({}):', Array.isArray(refObj)); // false

// 2) 判断 null：直接全等
log('值是否为 null:', sNull === null); // true

// 3) 判断 NaN：Number.isNaN
log('Number.isNaN(NaN):', Number.isNaN(NaN)); // true

// 4) 通用万能法：Object.prototype.toString
function typeOf(value) {
  // 返回如 "[object Array]" 的字符串，截取中间的类型名
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}
log('typeOf([])  =>', typeOf([])); // array
log('typeOf(null)=>', typeOf(null)); // null
log('typeOf({})  =>', typeOf({})); // object
log('typeOf(/x/) =>', typeOf(/x/)); // regexp
log('typeOf(new Date()) =>', typeOf(new Date())); // date

// ============================================================
// 把结果输出到页面（仅浏览器环境执行，保证 node 也能跑）
// ============================================================
if (typeof document !== 'undefined') {
  const pre = document.getElementById('output');
  if (pre) pre.textContent = lines.join('\n');
}

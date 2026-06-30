// 11 · 原型与原型链（Prototype & Prototype Chain）demo
// 本文件聚焦：[[Prototype]]/__proto__/prototype、原型链查找、构造函数、
//             Object.create、instanceof、hasOwnProperty
// 既能在浏览器运行（index.html 引入），也能 `node demo.js` 直接运行

'use strict';

// 收集所有输出，最后统一打印到页面 + 控制台
const lines = [];
function log(...args) {
  const text = args
    .map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)))
    .join(' ');
  lines.push(text);
  console.log(text);
}

// ============================================================
// 一、三个核心概念：prototype / [[Prototype]] / __proto__
// ============================================================
log('===== 一、prototype / [[Prototype]] / __proto__ =====');

// 1) prototype：只有「函数」才有的属性，指向「该构造函数创建的实例」的原型对象
// 2) [[Prototype]]：每个「对象」内部都有的隐藏槽位，指向自己的原型（规范术语）
// 3) __proto__：访问 [[Prototype]] 的非标准但被广泛支持的访问器（现代推荐用 Object.getPrototypeOf）

function Animal(name) {
  // 构造函数：约定首字母大写，配合 new 使用
  this.name = name; // 实例自身属性
}
// 把方法挂在原型上：所有实例共享同一份，节省内存
Animal.prototype.eat = function () {
  return this.name + ' 正在吃东西';
};

const cat = new Animal('猫');

// 实例的 [[Prototype]] === 构造函数的 prototype
log('cat.__proto__ === Animal.prototype:', cat.__proto__ === Animal.prototype); // true
log('推荐写法 getPrototypeOf:', Object.getPrototypeOf(cat) === Animal.prototype); // true
// 只有函数有 prototype 属性，普通对象没有
log('cat 自己有 prototype 属性吗:', cat.prototype); // undefined
log('Animal 函数有 prototype 属性吗:', typeof Animal.prototype); // object

// ============================================================
// 二、原型链查找：找属性时一层层往上找，直到 null
// ============================================================
log('\n===== 二、原型链查找 =====');

// 访问 cat.eat 时：
//   1. 先在 cat 自身找 -> 没有
//   2. 去 cat.__proto__（即 Animal.prototype）找 -> 找到了！
//   3. 如果还没有，继续去 Animal.prototype.__proto__（即 Object.prototype）找
//   4. 最后 Object.prototype.__proto__ 是 null，找不到就返回 undefined
log('cat.eat():', cat.eat()); // 来自 Animal.prototype

// 验证整条链
log('链条1 cat.__proto__ === Animal.prototype:', Object.getPrototypeOf(cat) === Animal.prototype);
log(
  '链条2 Animal.prototype.__proto__ === Object.prototype:',
  Object.getPrototypeOf(Animal.prototype) === Object.prototype
);
log('链条3 Object.prototype.__proto__ === null:', Object.getPrototypeOf(Object.prototype) === null);

// toString 是谁的？自身没有 -> 一路找到 Object.prototype.toString
log('cat.toString 来自 Object.prototype:', cat.toString === Object.prototype.toString); // true

// ============================================================
// 三、Object.create：直接指定一个对象作为原型
// ============================================================
log('\n===== 三、Object.create =====');

const base = {
  greet() {
    return '你好，我是 ' + this.who;
  },
};
// 创建一个新对象，它的 [[Prototype]] 就是 base
const child = Object.create(base);
child.who = '小明'; // 自身属性
log('child.greet():', child.greet()); // greet 来自 base
log('child 的原型就是 base:', Object.getPrototypeOf(child) === base); // true

// Object.create(null) 创建「无原型」的纯净对象，连 toString 都没有
const pure = Object.create(null);
pure.x = 1;
log('pure 没有原型:', Object.getPrototypeOf(pure)); // null
log('pure.toString 不存在:', pure.toString); // undefined

// ============================================================
// 四、instanceof：判断「构造函数.prototype」是否在对象的原型链上
// ============================================================
log('\n===== 四、instanceof =====');
log('cat instanceof Animal:', cat instanceof Animal); // true
log('cat instanceof Object:', cat instanceof Object); // true（Object.prototype 也在链上）
log('cat instanceof Array:', cat instanceof Array); // false

// 手写一个 instanceof，理解其本质
function myInstanceof(obj, Ctor) {
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === Ctor.prototype) return true; // 在链上找到了
    proto = Object.getPrototypeOf(proto); // 继续往上
  }
  return false; // 到 null 都没找到
}
log('myInstanceof(cat, Animal):', myInstanceof(cat, Animal)); // true
log('myInstanceof(cat, Array):', myInstanceof(cat, Array)); // false

// ============================================================
// 五、hasOwnProperty：区分「自身属性」与「继承属性」
// ============================================================
log('\n===== 五、hasOwnProperty =====');
log('cat 自身有 name 吗:', cat.hasOwnProperty('name')); // true（构造函数里赋的）
log('cat 自身有 eat 吗:', cat.hasOwnProperty('eat')); // false（eat 在原型上，是继承来的）
log('"eat" in cat:', 'eat' in cat); // true（in 会顺着原型链找）

// 安全写法：用 Object.prototype.hasOwnProperty.call 避免对象自己覆盖了该方法
const tricky = { hasOwnProperty: () => '被劫持了' };
log('安全判断:', Object.prototype.hasOwnProperty.call(tricky, 'hasOwnProperty')); // true

// for...in 会遍历到继承的可枚举属性，常配合 hasOwnProperty 过滤
Animal.prototype.color = '黑色';
const own = [];
for (const key in cat) {
  if (Object.prototype.hasOwnProperty.call(cat, key)) own.push(key);
}
log('for...in 中过滤出的自身属性:', own.join(',')); // name

// ============================================================
// 把结果输出到页面（仅浏览器环境执行，保证 node 也能跑）
// ============================================================
if (typeof document !== 'undefined') {
  const pre = document.getElementById('output');
  if (pre) pre.textContent = lines.join('\n');
}

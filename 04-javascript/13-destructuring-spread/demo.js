// 13 · 解构赋值与展开运算符（Destructuring & Spread）demo
// 本文件聚焦：数组/对象解构、默认值、嵌套解构、重命名、
//             展开运算符 ...、剩余元素、函数参数解构
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
// 一、数组解构：按位置取值
// ============================================================
log('===== 一、数组解构 =====');

const arr = [10, 20, 30];
const [a, b, c] = arr; // 按顺序对应
log('a, b, c =', a, b, c);

// 跳过元素：用逗号占位
const [first, , third] = arr;
log('跳过第二个:', first, third);

// 默认值：原值为 undefined 时才生效
const [x = 1, y = 2, z = 3] = [100, undefined];
log('默认值（仅 undefined 触发）:', x, y, z); // 100 2 3

// 交换变量：无需中间变量
let m = 1,
  n = 2;
[m, n] = [n, m];
log('交换后 m, n =', m, n);

// ============================================================
// 二、对象解构：按属性名取值
// ============================================================
log('\n===== 二、对象解构 =====');

const user = { id: 1, name: 'Tom', city: '北京' };
const { name, city } = user; // 变量名要与属性名一致
log('name, city =', name, city);

// 重命名：属性名:新变量名
const { name: userName, id: userId } = user;
log('重命名 userName, userId =', userName, userId);

// 默认值 + 重命名 同时使用
const { role: userRole = '游客' } = user; // user 没有 role，取默认
log('默认角色:', userRole);

// ============================================================
// 三、嵌套解构：一次性取出深层数据
// ============================================================
log('\n===== 三、嵌套解构 =====');

const profile = {
  user: { name: 'Alice', address: { city: '上海', zip: '200000' } },
  tags: ['vip', 'new'],
};
// 注意：左边写结构，右边对应值；冒号后是「进一步解构」而非新变量
const {
  user: {
    name: pName,
    address: { city: pCity },
  },
  tags: [firstTag],
} = profile;
log('嵌套取值:', pName, pCity, firstTag); // Alice 上海 vip

// ============================================================
// 四、剩余元素 / 剩余属性（rest）：用 ... 收集剩下的
// ============================================================
log('\n===== 四、剩余元素 rest =====');

const [head, ...tail] = [1, 2, 3, 4]; // tail 收集成新数组
log('head, tail =', head, tail); // 1 [2,3,4]

const { id, ...others } = user; // others 收集除 id 外的属性
log('rest 收集对象剩余:', others); // {name, city}

// ============================================================
// 五、展开运算符 spread：把可迭代对象/对象「摊开」
// ============================================================
log('\n===== 五、展开运算符 spread =====');

// 1) 数组合并 / 复制（浅拷贝）
const arr1 = [1, 2];
const arr2 = [3, 4];
const merged = [...arr1, ...arr2, 5];
log('数组合并:', merged); // [1,2,3,4,5]

// 2) 对象合并 / 复制（后者覆盖前者同名属性）
const base = { theme: 'dark', size: 14 };
const patch = { size: 16 };
const config = { ...base, ...patch };
log('对象合并（size 被覆盖）:', config); // {theme:'dark', size:16}

// 3) 把数组展开成函数参数
log('Math.max 展开数组:', Math.max(...[7, 3, 9, 1])); // 9

// 4) 字符串也可被展开（可迭代）
log('字符串展开:', [...'abc']); // ['a','b','c']

// ============================================================
// 六、函数参数解构 + 剩余参数
// ============================================================
log('\n===== 六、函数参数解构 =====');

// 直接在形参里解构对象，配合默认值，调用更清晰
function createUser({ name, age = 18, vip = false } = {}) {
  return `${name}，${age} 岁，${vip ? 'VIP' : '普通'}用户`;
}
log(createUser({ name: '小红', age: 25, vip: true }));
log(createUser({ name: '小明' })); // age/vip 用默认
log(createUser()); // 整个参数缺省，靠 = {} 兜底，避免解构 undefined 报错

// 剩余参数 rest：把不定数量实参收集成数组（区别于展开）
function sum(...nums) {
  return nums.reduce((acc, v) => acc + v, 0);
}
log('sum(1,2,3,4):', sum(1, 2, 3, 4)); // 10

// ============================================================
// 把结果输出到页面（仅浏览器环境执行，保证 node 也能跑）
// ============================================================
if (typeof document !== 'undefined') {
  const pre = document.getElementById('output');
  if (pre) pre.textContent = lines.join('\n');
}

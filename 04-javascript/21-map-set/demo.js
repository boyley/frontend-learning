// 21 · Map 与 Set demo
// 本文件聚焦：Map vs 普通对象、Set 去重与集合运算、WeakMap/WeakSet 与垃圾回收
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
// 一、Map：键值对集合（键可以是任意类型）
// ============================================================
log('===== 一、Map 基本操作 =====');

// 创建 Map，可传入二维数组初始化
const map = new Map([
  ['name', '小明'],
  ['age', 18],
]);

// set：新增/修改，返回 Map 本身，可链式调用
map.set('city', '北京').set('age', 19);

// get：读取；has：判断是否存在；size：键值对数量
log('get name :', map.get('name')); // 小明
log('has city :', map.has('city')); // true
log('size     :', map.size); // 3

// delete：删除某个键
map.delete('city');
log('删除 city 后 size:', map.size); // 2

// Map 的键可以是对象、函数等任意类型（普通对象的键只能是字符串/Symbol）
const objKey = { id: 1 };
const fnKey = function () {};
map.set(objKey, '对象作为键');
map.set(fnKey, '函数作为键');
log('对象键取值:', map.get(objKey)); // 对象作为键

// 遍历：Map 保持插入顺序
log('--- 遍历 Map（for...of） ---');
for (const [key, value] of map) {
  // 只打印字符串键，避免对象键显示成 [object Object]
  if (typeof key === 'string') log(`${key} => ${value}`);
}
log('keys :', [...map.keys()].filter((k) => typeof k === 'string'));
log('values:', [...map.values()]);

// ============================================================
// 二、Map vs 普通对象 对比
// ============================================================
log('\n===== 二、Map vs 普通对象 =====');
// 1) 键类型：对象只能用 字符串/Symbol，Map 可用任意类型
// 2) 顺序：Map 严格保持插入顺序；对象数字键会被排序
// 3) 大小：Map 直接 .size；对象需 Object.keys(obj).length
// 4) 默认键：对象原型上有 toString 等，Map 没有任何预置键，更纯净
const plainObj = {};
plainObj[1] = 'a';
plainObj[0] = 'b';
log('普通对象数字键被重排:', Object.keys(plainObj)); // ['0','1']
const orderMap = new Map();
orderMap.set(1, 'a').set(0, 'b');
log('Map 保持插入顺序:', [...orderMap.keys()]); // [1, 0]

// ============================================================
// 三、Set：值的集合（自动去重）
// ============================================================
log('\n===== 三、Set 去重 =====');

// 用 Set 给数组去重，是最常见用法
const arr = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(arr)];
log('原数组:', arr);
log('去重后:', unique); // [1,2,3,4]

const set = new Set();
set.add('x').add('y').add('x'); // 重复的 x 被忽略
log('Set size:', set.size); // 2
log('has y   :', set.has('y')); // true
set.delete('x');
log('删除 x 后:', [...set]); // ['y']

// ============================================================
// 四、Set 实现集合运算（并集 / 交集 / 差集）
// ============================================================
log('\n===== 四、集合运算 =====');
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5, 6]);

// 并集：合并去重
const union = new Set([...a, ...b]);
log('并集 A∪B:', [...union]); // [1,2,3,4,5,6]

// 交集：a 中也在 b 里的元素
const intersection = new Set([...a].filter((x) => b.has(x)));
log('交集 A∩B:', [...intersection]); // [3,4]

// 差集：a 中不在 b 里的元素
const difference = new Set([...a].filter((x) => !b.has(x)));
log('差集 A-B:', [...difference]); // [1,2]

// ============================================================
// 五、WeakMap / WeakSet：弱引用与垃圾回收
// ============================================================
log('\n===== 五、WeakMap / WeakSet =====');
// 特点：
// 1) 键（WeakMap）/ 值（WeakSet）只能是对象
// 2) 是"弱引用"：若对象没有其他引用，会被垃圾回收，对应条目自动消失
// 3) 不可遍历、没有 size（因为内容随时可能被回收，无法保证一致）
// 用途：给对象挂"私有数据"或缓存，不阻止对象被回收，避免内存泄漏
const wm = new WeakMap();
let user = { name: '临时用户' };
wm.set(user, { lastLogin: Date.now() });
log('WeakMap 取值:', wm.get(user).lastLogin > 0); // true
user = null; // 解除引用后，该条目会在某次 GC 时被自动清理

const ws = new WeakSet();
let node = { tag: 'div' };
ws.add(node);
log('WeakSet has node:', ws.has(node)); // true
node = null; // 同理，node 可被回收

// ============================================================
// 把结果输出到页面（仅浏览器环境执行，保证 node 也能跑）
// ============================================================
if (typeof document !== 'undefined') {
  const pre = document.getElementById('output');
  if (pre) pre.textContent = lines.join('\n');
}

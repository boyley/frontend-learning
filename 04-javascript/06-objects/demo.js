// ============================================================
// 06 · 对象（Objects）演示
// 浏览器和 Node 都能运行：node demo.js 直接看输出
// 关键结果通过 print() 既输出到页面 <pre>，也 console.log
// ============================================================

// ---------- 通用输出工具：浏览器写进页面，Node 打印到终端 ----------
const lines = [];
function print(label, value) {
  // 对象/数组用 JSON 美化，其他类型直接转字符串
  const text =
    typeof value === 'object' && value !== null
      ? JSON.stringify(value, null, 2)
      : String(value);
  const line = label + ' => ' + text;
  lines.push(line);
  console.log(line);
}

// ============================================================
// 1) 对象字面量：用 {} 一次性声明一组「键值对」
// ============================================================
const user = {
  name: '小明',          // 字符串属性
  age: 18,               // 数字属性
  isStudent: true,       // 布尔属性
  hobbies: ['篮球', '编程'], // 值可以是数组
  address: {             // 值也可以是另一个对象（嵌套）
    city: '北京',
    zip: '100000',
  },
};
print('对象字面量 user', user);

// ============================================================
// 2) 属性读写、删除
// ============================================================
// 读：点语法（推荐）/ 方括号语法（属性名是变量或含特殊字符时用）
print('点语法读 user.name', user.name);
print('方括号读 user["age"]', user['age']);
const key = 'isStudent';
print('用变量做键名 user[key]', user[key]);

// 写：已有键则修改，没有则新增
user.age = 19;          // 修改
user.email = 'xm@a.com'; // 新增
print('修改+新增后 user', user);

// 删除：delete 运算符
delete user.email;
print('删除 email 后是否还有 email 键', 'email' in user); // false

// 判断属性是否存在
print('"name" in user', 'name' in user);
print('hasOwnProperty("toString")', user.hasOwnProperty('toString')); // false（继承的不算自身属性）

// ============================================================
// 3) 方法 与 方法简写
// ============================================================
const calculator = {
  base: 10,
  // 传统写法：属性值是一个函数
  add: function (n) {
    return this.base + n; // this 指向调用它的对象 calculator
  },
  // ES6 方法简写：省略 function 关键字（推荐）
  sub(n) {
    return this.base - n;
  },
};
print('方法 add(5)', calculator.add(5)); // 15
print('简写方法 sub(3)', calculator.sub(3)); // 7

// 属性简写：变量名与键名相同时可省略
const name = '小红';
const age = 20;
const person = { name, age }; // 等价于 { name: name, age: age }
print('属性简写 person', person);

// ============================================================
// 4) 引用类型 vs 值类型（核心易错点）
// ============================================================
// 值类型（number/string/boolean...）：复制的是「值」本身
let a = 1;
let b = a; // 把 1 这个值复制给 b
b = 99;
print('值类型 a 不受 b 影响', a); // 1

// 引用类型（object/array...）：复制的是「内存地址（引用）」
const obj1 = { count: 1 };
const obj2 = obj1; // obj2 和 obj1 指向同一块内存
obj2.count = 999;
print('引用类型 obj1 被 obj2 改了', obj1.count); // 999（同一个对象！）
print('obj1 === obj2 同一引用', obj1 === obj2); // true

// ============================================================
// 5) 浅拷贝 vs 深拷贝
// ============================================================
const original = {
  title: '原对象',
  nested: { level: 1 }, // 嵌套对象
};

// 浅拷贝：只复制第一层，嵌套对象仍是「共享引用」
const shallow = { ...original }; // 展开运算符浅拷贝（也可用 Object.assign）
shallow.title = '改了浅拷贝标题';   // 第一层互不影响
shallow.nested.level = 100;        // 第二层是共享的，会污染原对象！
print('浅拷贝后 original.title 不变', original.title); // 原对象
print('浅拷贝后 original.nested.level 被污染', original.nested.level); // 100

// 深拷贝：递归复制每一层，彻底独立
const source = { title: 'A', nested: { level: 1 } };
// 现代浏览器/Node 17+ 内置 structuredClone；这里用 JSON 方案保证到处能跑
const deep = JSON.parse(JSON.stringify(source));
deep.nested.level = 888;
print('深拷贝后 source.nested.level 不变', source.nested.level); // 1

// ============================================================
// 6) Object 常用静态方法
// ============================================================
const score = { chinese: 90, math: 85, english: 95 };
print('Object.keys 取所有键', Object.keys(score));       // ['chinese','math','english']
print('Object.values 取所有值', Object.values(score));   // [90,85,95]
print('Object.entries 取键值对数组', Object.entries(score)); // [['chinese',90],...]

// Object.assign(目标, 源...)：把源对象属性合并进目标（浅合并），返回目标
const merged = Object.assign({}, { a: 1 }, { b: 2 }, { a: 9 });
print('Object.assign 合并（后者覆盖前者）', merged); // {a:9, b:2}

// Object.freeze：冻结对象，禁止增删改属性（浅冻结）
const config = Object.freeze({ debug: false });
config.debug = true; // 静默失败（严格模式下会报错）
print('Object.freeze 后修改无效', config.debug); // false
print('Object.isFrozen', Object.isFrozen(config)); // true

// ============================================================
// 7) getter / setter：用「访问器属性」包装读写逻辑
// ============================================================
const temperature = {
  _celsius: 0, // 约定下划线表示「内部属性」
  // get：读取 fahrenheit 时自动计算
  get fahrenheit() {
    return this._celsius * 1.8 + 32;
  },
  // set：给 fahrenheit 赋值时自动换算回摄氏度
  set fahrenheit(value) {
    this._celsius = (value - 32) / 1.8;
  },
};
temperature._celsius = 25;
print('getter 读华氏度', temperature.fahrenheit); // 77（像读普通属性，无需括号）
temperature.fahrenheit = 212; // 像赋值普通属性一样触发 setter
print('setter 反推摄氏度', temperature._celsius); // 100

// ============================================================
// DOM 输出：仅浏览器环境执行（Node 下跳过，避免报错）
// ============================================================
if (typeof document !== 'undefined') {
  const out = document.getElementById('output');
  if (out) out.textContent = lines.join('\n');
}

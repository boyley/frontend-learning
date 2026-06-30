// ============================================================
// 10 · this 绑定（this Binding）演示
// 浏览器和 Node 都能运行：node demo.js 直接看输出
// 核心：this 的值在「函数被调用时」才确定，看「谁调用、怎么调用」
// ============================================================

const lines = [];
function print(label, value) {
  const text =
    typeof value === 'object' && value !== null
      ? JSON.stringify(value)
      : String(value);
  const line = label + ' => ' + text;
  lines.push(line);
  console.log(line);
}

// ============================================================
// 规则 1：默认绑定 —— 独立调用，this 指向全局对象，严格模式下为 undefined
// ============================================================
function showThisType() {
  // 非严格模式：浏览器里 this 是 window，Node 里是 global
  // 这里只判断类型，避免环境差异
  return typeof this;
}
print('默认绑定 this 类型', showThisType()); // object 或 undefined（取决于严格模式/环境）

// ============================================================
// 规则 2：隐式绑定 —— 作为对象方法调用，this 指向「点前面」那个对象
// ============================================================
const user = {
  name: '小明',
  greet() {
    return `我是 ${this.name}`; // this 指向 user
  },
};
print('隐式绑定 user.greet()', user.greet()); // 我是 小明

// 隐式丢失：把方法赋给变量后单独调用，this 不再是 user
const bareGreet = user.greet;
function safeCall(fn) {
  try {
    return fn();
  } catch (e) {
    return '报错：' + e.name; // 严格模式下 this 是 undefined，读 .name 报错
  }
}
print('隐式丢失 bareGreet()', safeCall(bareGreet)); // undefined 或 报错

// ============================================================
// 规则 3：显式绑定 —— call / apply / bind 手动指定 this
// ============================================================
function introduce(city, job) {
  return `${this.name} 来自 ${city}，职业 ${job}`;
}
const person = { name: '小红' };
// call：参数逐个传
print('call 显式绑定', introduce.call(person, '北京', '工程师'));
// apply：参数用数组传
print('apply 数组传参', introduce.apply(person, ['上海', '设计师']));
// bind：不立即执行，返回一个 this 被永久绑定的新函数
const boundIntro = introduce.bind(person, '广州');
print('bind 返回新函数后调用', boundIntro('产品经理'));

// ============================================================
// 规则 4：new 绑定 —— 用 new 调用，this 指向新创建的实例
// ============================================================
function Animal(name) {
  // new 时：① 创建空对象 ② this 指向它 ③ 自动 return this
  this.name = name;
  this.speak = function () {
    return `${this.name} 在叫`;
  };
}
const dog = new Animal('旺财');
print('new 绑定 实例属性', dog.name); // 旺财
print('new 绑定 实例方法', dog.speak()); // 旺财 在叫

// ============================================================
// 优先级演示：new > 显式(bind) > 隐式 > 默认
// ============================================================
const objA = { name: 'A', who() { return this.name; } };
const objB = { name: 'B' };
// 显式 bind 到 B，优先级高于隐式（即便从 objA 上拿方法）
const whoBoundB = objA.who.bind(objB);
print('显式 > 隐式', whoBoundB()); // B

// ============================================================
// 箭头函数：没有自己的 this，捕获「定义时」外层的 this（词法 this）
// ============================================================
const team = {
  name: '前端组',
  members: ['a', 'b'],
  // 经典坑：普通函数回调里 this 会丢失
  listWrong() {
    return this.members.map(function (m) {
      // 这里的 this 不是 team（默认绑定），this.name 取不到
      return `${m}-${this && this.name ? this.name : '丢失'}`;
    });
  },
  // 修复：箭头函数捕获外层 listRight 的 this（即 team）
  listRight() {
    return this.members.map((m) => `${m}-${this.name}`);
  },
};
print('普通函数回调 this 丢失', team.listWrong());
print('箭头函数捕获外层 this', team.listRight()); // a-前端组, b-前端组

// ============================================================
// DOM 输出：仅浏览器执行
// ============================================================
if (typeof document !== 'undefined') {
  const out = document.getElementById('output');
  if (out) out.textContent = lines.join('\n');
}

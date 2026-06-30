// 12 · ES6 类（Class）demo
// 本文件聚焦：class 语法、constructor、实例/原型方法、static、
//             extends/super 继承、getter/setter、私有字段 #
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
// 一、基本 class：constructor + 实例方法（本质是原型方法）
// ============================================================
log('===== 一、基本 class =====');

class Person {
  // 类字段：直接写在类体里，等价于在 constructor 里 this.species = ...
  species = '人类';

  constructor(name, age) {
    // constructor：用 new 时自动调用，负责初始化实例属性
    this.name = name;
    this.age = age;
  }

  // 实例方法：实际上被定义在 Person.prototype 上，所有实例共享
  intro() {
    return `我叫 ${this.name}，今年 ${this.age} 岁`;
  }
}

const tom = new Person('Tom', 20);
log('tom.intro():', tom.intro());
log('species 类字段:', tom.species);
// 验证：class 只是原型的语法糖
log('intro 其实在原型上:', Person.prototype.hasOwnProperty('intro')); // true
log('tom.__proto__ === Person.prototype:', Object.getPrototypeOf(tom) === Person.prototype); // true

// ============================================================
// 二、static 静态成员：挂在类本身上，不属于实例
// ============================================================
log('\n===== 二、static 静态成员 =====');

class MathUtil {
  static PI = 3.14159; // 静态字段
  // 静态方法：用「类名.方法」调用，常用于工具函数、工厂方法
  static add(a, b) {
    return a + b;
  }
}
log('MathUtil.PI:', MathUtil.PI);
log('MathUtil.add(2, 3):', MathUtil.add(2, 3));
// 实例上访问不到静态成员
log('实例访问静态方法:', typeof new MathUtil().add); // undefined

// ============================================================
// 三、getter / setter：把方法伪装成属性来访问
// ============================================================
log('\n===== 三、getter / setter =====');

class Circle {
  constructor(r) {
    this._r = r; // 约定下划线表示「内部」字段
  }
  // 读取 circle.area 时自动调用，无需加括号
  get area() {
    return (Math.PI * this._r * this._r).toFixed(2);
  }
  // 赋值 circle.radius = x 时自动调用，可做校验
  set radius(value) {
    if (value <= 0) throw new Error('半径必须为正数');
    this._r = value;
  }
  get radius() {
    return this._r;
  }
}
const c = new Circle(2);
log('c.area（像属性一样读）:', c.area);
c.radius = 5; // 触发 setter
log('改半径后 c.area:', c.area);

// ============================================================
// 四、私有字段 #：真正的私有，类外部无法访问
// ============================================================
log('\n===== 四、私有字段 # =====');

class BankAccount {
  #balance = 0; // 私有字段，必须在类体里先声明

  constructor(init) {
    this.#balance = init;
  }
  deposit(amount) {
    this.#balance += amount;
    return this.#balance;
  }
  get balance() {
    return this.#balance; // 只能在类内部读 #balance
  }
}
const acc = new BankAccount(100);
log('存入 50 后余额:', acc.deposit(50));
log('通过 getter 读余额:', acc.balance);
// acc.#balance  // 语法错误：Private field must be declared in an enclosing class
log('外部访问不到 #balance:', acc.balance === 150);

// ============================================================
// 五、extends / super：类继承
// ============================================================
log('\n===== 五、extends / super 继承 =====');

class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} 发出声音`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    // 子类 constructor 必须先调用 super()，否则不能用 this
    super(name); // 调用父类 constructor
    this.breed = breed;
  }
  // 重写父类方法，并用 super.method() 复用父类逻辑
  speak() {
    return super.speak() + '：汪汪！';
  }
}

const dog = new Dog('旺财', '柴犬');
log('dog.speak():', dog.speak());
log('dog.breed:', dog.breed);
// 继承链：dog -> Dog.prototype -> Animal.prototype -> Object.prototype
log('dog instanceof Dog:', dog instanceof Dog); // true
log('dog instanceof Animal:', dog instanceof Animal); // true（父类也在链上）

// ============================================================
// 把结果输出到页面（仅浏览器环境执行，保证 node 也能跑）
// ============================================================
if (typeof document !== 'undefined') {
  const pre = document.getElementById('output');
  if (pre) pre.textContent = lines.join('\n');
}

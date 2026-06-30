/**
 * 04 · 函数类型 demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 04-functions-types/demo.ts`
 *
 * 本模块聚焦：函数的参数、返回值、可选/默认/剩余参数、函数类型表达式、
 *            调用签名、重载、this 参数。
 */

// ===== 1. 参数与返回值类型 =====
function add(x: number, y: number): number {
  return x + y; // 返回值类型为 number，可省略让其推断，公共 API 建议显式写
}
console.log("add:", add(2, 3));

// ❌ 错误示范：实参类型不符
// add(2, "3");
//   报错：Argument of type 'string' is not assignable to parameter of type 'number'.

// ===== 2. 可选参数 ? 与默认参数 =====
// 可选参数必须放在必选参数之后
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}`; // greeting 未传时为 undefined
}
console.log(greet("Alice"));
console.log(greet("Bob", "Hi"));

// 默认参数：传了就用传入值，没传就用默认值（默认参数天然可选）
function power(base: number, exp: number = 2): number {
  return base ** exp;
}
console.log("power(3):", power(3)); // 9
console.log("power(2,3):", power(2, 3)); // 8

// ❌ 错误示范：可选参数放在必选参数之前
// function bad(a?: number, b: number) {} // 报错：必选参数不能跟在可选参数后面

// ===== 3. 剩余参数 ...rest =====
// 把不定数量的实参收集成一个数组
function sum(...nums: number[]): number {
  return nums.reduce((acc, n) => acc + n, 0);
}
console.log("sum:", sum(1, 2, 3, 4)); // 10

// ===== 4. 函数类型表达式 =====
// 用 (参数: 类型) => 返回类型 直接描述一个函数变量的类型
type BinaryOp = (a: number, b: number) => number;
const multiply: BinaryOp = (a, b) => a * b; // a/b 自动推断为 number
console.log("multiply:", multiply(4, 5));

// ===== 5. 调用签名 call signature =====
// 当函数本身还要带「属性」时，用对象形式的调用签名描述
type Counter = {
  (): number; // 调用签名：像函数一样被调用
  count: number; // 同时挂着属性
};
function makeCounter(): Counter {
  const fn = (() => (fn.count += 1)) as Counter;
  fn.count = 0;
  return fn;
}
const c = makeCounter();
console.log("counter:", c(), c(), "count=", c.count);

// ===== 6. 函数重载 overload =====
// 同一函数对不同参数形态有不同返回类型时，先写若干「重载签名」，
// 再写一个兼容所有情况的「实现签名」（实现签名对外不可见）。
function len(x: string): number; // 重载签名 1
function len(x: any[]): number; // 重载签名 2
function len(x: string | any[]): number {
  // 实现签名
  return x.length;
}
console.log("len str:", len("hello")); // 5
console.log("len arr:", len([1, 2, 3])); // 3

// ❌ 错误示范：调用形态不匹配任何重载
// len(123);
//   报错：No overload matches this call.

// ===== 7. this 参数（简述）=====
// 把 this 作为「第一个形参」声明其类型，仅用于类型检查，不是真实参数。
interface Card {
  suit: string;
  describe(this: Card): string; // 约束方法内 this 必须是 Card
}
const card: Card = {
  suit: "♠",
  describe(this: Card) {
    return `花色 ${this.suit}`;
  },
};
console.log(card.describe());

console.log("函数类型 demo 运行完成");

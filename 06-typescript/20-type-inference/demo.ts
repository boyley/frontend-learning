/**
 * 20 · 类型推断（Type Inference）demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 20-type-inference/demo.ts`
 *
 * 本模块只聚焦一个主题：TS 在你【不写注解】时如何自动推断类型。
 * 理解推断规则，才能知道「什么时候可以省注解、什么时候必须显式写」。
 *
 * 覆盖：变量推断、const vs let 的拓宽差异、返回值推断、
 *      最佳通用类型、上下文类型（contextual typing）。
 */

// ===== 1. 变量初始化推断：由初始值决定类型 =====
let count = 10; // 推断为 number（不是 10）
const title = "TS"; // 推断为字面量 "TS"（见第 2 点）
console.log("变量推断:", count, title);

// ❌ 错误示范：推断出的类型仍会约束后续赋值
// count = "ten";
//   报错：Type 'string' is not assignable to type 'number'.

// ===== 2. const vs let：字面量拓宽（Literal Widening）=====
// let 声明的变量可能被重新赋值，所以 TS 把字面量「拓宽」成基础类型
let mutable = "hello"; // 推断为 string（拓宽了）
// const 声明的变量不可变，TS 保留最窄的「字面量类型」
const immutable = "hello"; // 推断为字面量 "hello"（不拓宽）

// 这在联合类型场景很关键：
type Direction = "left" | "right";
function move(dir: Direction) {
  console.log("move:", dir);
}
const d1 = "left"; // 字面量 "left"，可直接传
move(d1); // ✅
let d2 = "left"; // 被拓宽成 string
// move(d2);
//   ❌ 报错：Argument of type 'string' is not assignable to parameter of type 'Direction'.
//   ✅ 解决：let d2: Direction = "left"  或  const d2 = "left"  或  "left" as const
console.log("const 不拓宽 vs let 拓宽:", d1, d2);

// ===== 3. 函数返回值推断：不写返回类型也能推 =====
function add(a: number, b: number) {
  return a + b; // 返回类型被推断为 number
}
function makeUser(name: string) {
  return { name, createdAt: new Date() }; // 推断为 { name: string; createdAt: Date }
}
const sum = add(1, 2); // number
const u = makeUser("Alice");
console.log("返回值推断:", sum, u.name);

// ===== 4. 最佳通用类型（Best Common Type）：数组元素取「共同超类型」=====
const nums = [1, 2, 3]; // number[]
const mixed = [1, "two", true]; // (string | number | boolean)[] —— 取联合
console.log("最佳通用类型(联合数组):", mixed);

// 类层次的例子：不同子类合成的数组，推断为它们的联合，而非最近公共父类
class Animal {}
class Dog extends Animal {
  bark() {}
}
class Cat extends Animal {
  meow() {}
}
const pets = [new Dog(), new Cat()]; // (Dog | Cat)[]
console.log("子类数组推断为联合:", pets.length);
// 若想要 Animal[]，需显式注解：const pets: Animal[] = [...]

// ===== 5. 上下文类型（Contextual Typing）：从「使用位置」反推参数类型 =====
// 回调参数不用写类型，TS 会根据它被赋给的函数类型反推
const names = ["a", "bb", "ccc"];
names.forEach((n) => {
  // n 被上下文推断为 string，无需写 (n: string)
  console.log("上下文推断 n 是 string:", n.toUpperCase());
});

// 把箭头函数赋给已知类型的变量，参数类型也会被上下文推断
type ClickHandler = (x: number, y: number) => void;
const onClick: ClickHandler = (x, y) => {
  // x, y 自动是 number，无需注解
  console.log("上下文推断坐标:", x + y);
};
onClick(3, 4);

// ===== 6. 何时「必须」显式注解（推断给不出你要的类型）=====
// 6.1 空数组：无初始元素，推断为 any[]，需注解
const emptyBad = []; // any[]（危险）
const emptyGood: string[] = []; // ✅ 显式声明
emptyGood.push("ok");
console.log("空数组需注解:", emptyGood);

// 6.2 稍后赋值的变量：声明与赋值分离时，建议注解
let later: number;
later = 100;
console.log("延迟赋值:", later);

export {};

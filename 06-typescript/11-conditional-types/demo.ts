/**
 * 11 · 条件类型（Conditional Types）demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 11-conditional-types/demo.ts`
 *
 * 本模块只聚焦一个主题：在类型层面写「if-else」。
 *   语法：T extends U ? X : Y
 *   含义：如果 T 可以赋给 U，则取 X，否则取 Y。
 * 进阶：嵌套条件、分布式条件类型、infer 提取子类型。
 */

// ===== 1. 最基本的条件类型：T extends U ? X : Y =====
type IsString<T> = T extends string ? "yes" : "no";
type A1 = IsString<string>; // => "yes"
type A2 = IsString<number>; // => "no"
const a1: A1 = "yes";
const a2: A2 = "no";
console.log("基础条件类型：", a1, a2);

// ===== 2. 嵌套条件类型：相当于 else if 链 =====
// 给任意值返回一个「类型名字符串」
type TypeName<T> = T extends string
  ? "string"
  : T extends number
  ? "number"
  : T extends boolean
  ? "boolean"
  : T extends undefined
  ? "undefined"
  : T extends Function
  ? "function"
  : "object";

type N1 = TypeName<string>; // => "string"
type N2 = TypeName<() => void>; // => "function"
type N3 = TypeName<string[]>; // => "object"
const n1: N1 = "string";
const n2: N2 = "function";
const n3: N3 = "object";
console.log("嵌套条件类型（else if 链）：", n1, n2, n3);

// ===== 3. 分布式条件类型（Distributive Conditional Types）=====
// 当被检查的类型是「裸的类型参数」且传入「联合类型」时，条件类型会对联合的每个成员分别计算，再合并。
type ToArray<T> = T extends any ? T[] : never;
type Arr = ToArray<string | number>;
// 会分布成 ToArray<string> | ToArray<number> => string[] | number[]
const arr: Arr = ["a", "b"]; // string[] 合法
const arr2: Arr = [1, 2]; // number[] 也合法
console.log("分布式条件类型：", arr, arr2);

// 实战：内置 Exclude 就是分布式条件类型实现的
type MyExclude<T, U> = T extends U ? never : T;
type Excluded = MyExclude<"a" | "b" | "c", "a">; // => "b" | "c"
const ex: Excluded = "b";
console.log("用分布式条件类型自实现 Exclude：", ex);

// 对比：用 [T] 包成元组可以「关闭」分布式行为
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type Arr3 = ToArrayNonDist<string | number>; // => (string | number)[]，不再分布
const arr3: Arr3 = ["a", 1];
console.log("用元组包裹关闭分布式：", arr3);

// ===== 4. infer：在条件类型里「就地声明并提取」一个类型变量 =====
// 4.1 自己实现 ReturnType：从函数类型里 infer 出返回值 R
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
function makeUser() {
  return { id: 1, name: "Alice" };
}
type UserShape = MyReturnType<typeof makeUser>; // => { id: number; name: string }
const u: UserShape = { id: 1, name: "Alice" };
console.log("infer 提取函数返回值：", u);

// 4.2 取数组元素类型：从 T[] 里 infer 出元素 E
type ElementType<T> = T extends (infer E)[] ? E : T;
type E1 = ElementType<number[]>; // => number
type E2 = ElementType<string[][]>; // => string[]（只脱一层）
type E3 = ElementType<boolean>; // => boolean（不是数组，原样返回）
const e1: E1 = 100;
const e2: E2 = ["x", "y"];
const e3: E3 = true;
console.log("infer 提取数组元素类型：", e1, e2, e3);

// 4.3 提取 Promise 解包类型（简化版 Awaited）
type Unwrap<T> = T extends Promise<infer V> ? V : T;
type U1 = Unwrap<Promise<string>>; // => string
type U2 = Unwrap<number>; // => number
const un1: U1 = "done";
const un2: U2 = 42;
console.log("infer 解包 Promise：", un1, un2);

// ❌ 错误示范：infer 只能用在 extends 的「右侧」条件里，不能凭空使用
// type Bad<T> = infer R;
//   报错：'infer' declarations are only permitted in the 'extends' clause of a conditional type.

console.log("\n===== 11 条件类型 demo 运行完成 =====");

export {};

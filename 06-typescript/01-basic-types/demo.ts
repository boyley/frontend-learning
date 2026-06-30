/**
 * 01 · 基础类型 demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 01-basic-types/demo.ts`
 *
 * 本模块只聚焦一个主题：TypeScript 的「基础类型」有哪些、怎么用、易踩的坑。
 */

// ===== 1. 原始类型：string / number / boolean =====
// 类型注解写在变量名后面，用冒号分隔
const username: string = "Alice";
const age: number = 30; // number 同时涵盖整数、浮点、二进制 0b、十六进制 0x 等
const isAdmin: boolean = true;

// ❌ 错误示范：把 number 赋给 string 类型变量
// const wrong: string = 123;
//   报错：Type 'number' is not assignable to type 'string'.
//   原因：string 只能接收字符串字面量或字符串表达式结果。

// 多数情况下类型可被「类型推断」自动得出，无需显式注解（推荐）
const inferred = "TypeScript"; // 推断为 string

// ===== 2. 数组：T[] 与 Array<T> 两种等价写法 =====
const nums1: number[] = [1, 2, 3]; // 写法一：元素类型 + []
const nums2: Array<number> = [4, 5, 6]; // 写法二：泛型 Array<T>，两者完全等价
const names: string[] = ["a", "b"];

// ❌ 错误示范：数组里混入非约定类型
// const badArr: number[] = [1, 2, "three"];
//   报错：Type 'string' is not assignable to type 'number'.

// ===== 3. 元组 tuple：固定长度、每个位置类型固定的数组 =====
// 适合表示「一组结构固定的值」，例如坐标、键值对
let point: [number, number] = [10, 20];
let entry: [string, number] = ["score", 95];

// ❌ 错误示范：元组位置类型写反 / 长度不符
// point = ["x", 20];        // 报错：第 0 位应为 number，给了 string
// entry = ["score", 95, 1]; // 报错：源元组长度 3，目标长度 2

// ✅ 正确：通过索引访问，类型会被精确推断
const key = entry[0]; // string
const val = entry[1]; // number

// ===== 4. any：关闭类型检查（尽量避免）=====
let loose: any = 4;
loose = "now a string"; // any 允许随意改类型，等于放弃 TS 保护
// ❌ 危险示范：对 any 取不存在的深层属性，编译期不报错，但运行时会崩溃
// loose.foo.bar.baz;
//   编译期：any 关闭检查，TS 放行；
//   运行期：loose 是字符串，.foo 为 undefined，再取 .bar 直接抛 TypeError —— 这正是 any 的危险之处

// ===== 5. unknown：类型安全版的 any（重点）=====
// any 与 unknown 都能接收任意值，区别在「使用时」：
//   - any   ：使用前不检查，等于裸奔
//   - unknown：使用前必须先「收窄类型」，否则报错 —— 强制你做安全校验
let input: unknown = "hello";

// ❌ 错误示范：直接对 unknown 取属性 / 调用方法
// input.toUpperCase();
//   报错：'input' is of type 'unknown'.
//   原因：unknown 在未收窄前，禁止任何成员访问，避免运行时错误。

// ✅ 正确：用 typeof 等手段做类型守卫（type guard）收窄后再用
if (typeof input === "string") {
  console.log(input.toUpperCase()); // 此分支内 input 被收窄为 string，安全
}

// 一句话总结：能用 unknown 就不要用 any。

// ===== 6. void：没有返回值的函数返回类型 =====
function logMessage(msg: string): void {
  console.log("log:", msg);
  // 不 return 任何有意义的值；void 表示「这里不该使用返回值」
}

// ===== 7. null 与 undefined =====
// 在开启 strictNullChecks 时，它们是独立类型，不能随意赋给其它类型
let maybeName: string | null = null;
maybeName = "Bob"; // 联合类型允许 string 或 null

// ❌ 错误示范（strict 模式下）：把 null 赋给 string
// const must: string = null;
//   报错：Type 'null' is not assignable to type 'string'.

// ===== 8. never：永不出现的值（简述）=====
// never 表示「不可能有返回值」：抛异常或死循环的函数返回 never
function fail(message: string): never {
  throw new Error(message);
}
// never 也是所有类型的子类型，常用于穷尽性检查（exhaustive check）

// ===== 输出验证 =====
console.log("username:", username, "| age:", age, "| isAdmin:", isAdmin);
console.log("nums1:", nums1, "| nums2:", nums2);
console.log("tuple point:", point, "| entry key/val:", key, val);
logMessage("基础类型 demo 运行完成");
console.log("maybeName:", maybeName);
// 不调用 fail() 以免中断；它的类型是 never
console.log("never 函数已定义，类型为 never，不在此处调用");

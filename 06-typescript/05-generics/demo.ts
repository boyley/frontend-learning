/**
 * 05 · 泛型（Generics）
 * ---------------------------------------------
 * 泛型 = 把「类型」当成参数传递，让函数/接口/类在「不丢失类型信息」的前提下复用。
 * 核心思想：先用一个类型变量（习惯写 T）占位，调用时再由编译器推断或显式指定真实类型。
 */

// ───────────────────────────────────────────────
// 1. 泛型函数 <T>
// ───────────────────────────────────────────────

/** identity：原样返回参数。T 在调用时被推断/指定 */
function identity<T>(value: T): T {
  return value;
}

const n1 = identity<number>(42); // 显式指定 T = number
const s1 = identity("hello"); // 自动推断 T = string

// ❌ 错误示范：不用泛型只用 any 会丢失类型信息
// function identityBad(value: any): any { return value; }
// const x = identityBad(42); // x 是 any，后续 x.toUpperCase() 不会报错，运行时却崩溃
// 报错原因：any 关闭了类型检查，泛型才能「保留并传递」类型。

// ───────────────────────────────────────────────
// 2. 多个类型参数
// ───────────────────────────────────────────────

/** 交换元组顺序，T 和 U 是两个独立的类型参数 */
function swap<T, U>(tuple: [T, U]): [U, T] {
  return [tuple[1], tuple[0]];
}
const swapped = swap<string, number>(["age", 18]); // [number, string] => [18, "age"]

// ───────────────────────────────────────────────
// 3. 泛型约束 extends
// ───────────────────────────────────────────────

interface HasLength {
  length: number;
}

/** 约束 T 必须有 length 属性，否则不能调用 .length */
function logLength<T extends HasLength>(arg: T): T {
  console.log("长度是：", arg.length);
  return arg;
}
logLength("abc"); // 字符串有 length，OK
logLength([1, 2, 3]); // 数组有 length，OK

// ❌ 错误示范：传入没有 length 的类型
// logLength(123);
// 报错：类型“number”的参数不能赋给类型“HasLength”的参数。
// 原因：number 没有 length 属性，违反了 extends HasLength 约束。

// ───────────────────────────────────────────────
// 4. keyof 配合泛型（取对象属性，类型安全）
// ───────────────────────────────────────────────

/** K 被约束为 T 的「键名联合类型」，返回值类型精确为 T[K] */
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { id: 1, name: "Tom" };
const name = getProp(user, "name"); // 类型为 string
const id = getProp(user, "id"); // 类型为 number

// ❌ 错误示范：访问不存在的键
// getProp(user, "email");
// 报错：类型“"email"”的参数不能赋给类型“"id" | "name"”的参数。
// 原因：keyof user = "id" | "name"，"email" 不在其中。

// ───────────────────────────────────────────────
// 5. 泛型接口
// ───────────────────────────────────────────────

/** 通用 API 响应结构，data 的类型由使用方决定 */
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
const userResp: ApiResponse<{ id: number; name: string }> = {
  code: 0,
  message: "ok",
  data: { id: 1, name: "Tom" },
};

// ───────────────────────────────────────────────
// 6. 默认泛型参数
// ───────────────────────────────────────────────

/** 不传类型参数时 T 默认为 string */
interface Box<T = string> {
  content: T;
}
const stringBox: Box = { content: "默认是字符串" }; // 用默认值 string
const numberBox: Box<number> = { content: 100 }; // 显式覆盖为 number

// ───────────────────────────────────────────────
// 7. 泛型类
// ───────────────────────────────────────────────

/** 一个简单的泛型栈，元素类型 T 在 new 时确定 */
class Stack<T> {
  private items: T[] = [];
  push(item: T): void {
    this.items.push(item);
  }
  pop(): T | undefined {
    return this.items.pop();
  }
  get size(): number {
    return this.items.length;
  }
}

const numStack = new Stack<number>();
numStack.push(1);
numStack.push(2);

// ❌ 错误示范：往 number 栈里塞字符串
// numStack.push("3");
// 报错：类型“string”的参数不能赋给类型“number”的参数。

// ───────────────────────────────────────────────
// 运行输出
// ───────────────────────────────────────────────
console.log("identity:", n1, s1);
console.log("swap:", swapped);
console.log("getProp name/id:", name, id);
console.log("apiResponse:", userResp.data);
console.log("boxes:", stringBox.content, numberBox.content);
console.log("stack size & pop:", numStack.size, numStack.pop());

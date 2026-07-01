/**
 * 25 · 符号（Symbols）demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 25-symbols/demo.ts`
 *
 * 本模块只聚焦一个主题：ES2015 的 symbol 原始类型在 TS 里的类型与用法。
 * symbol 的值【唯一且不可变】，常用作「不会和别人冲突」的对象键。
 *
 * 覆盖：symbol 原始类型、unique symbol、作为对象/类的键、well-known symbols 简介。
 */

// ===== 1. symbol 原始类型：每次 Symbol() 都产生一个唯一值 =====
const s1 = Symbol(); // 类型 symbol
// 显式标注为 symbol（否则 const + Symbol() 会被推断成更窄的 unique symbol，
// 导致下面的 === 比较被 TS 认为「两个 unique symbol 永不相等」而报错）
const s2: symbol = Symbol("desc"); // 参数只是「描述」，用于调试，不影响唯一性
const s3: symbol = Symbol("desc");
console.log("同描述的 symbol 也不相等:", s2 === s3); // false —— 每个都唯一

// ❌ 错误示范：symbol 不能用 new
// const bad = new Symbol();
//   报错：'Symbol' is not a constructor（symbol 是原始类型，用 Symbol() 而非 new）

// ===== 2. symbol 作为对象属性键（computed key）=====
const idKey = Symbol("id");
const user = {
  name: "Alice",
  [idKey]: 1001, // 用 [] 计算属性语法把 symbol 当键
};
console.log("用 symbol 键取值:", user[idKey]); // 1001
// 好处：idKey 是唯一的，绝不会和对象里其它字符串键（哪怕也叫 "id"）冲突
console.log("symbol 键不会和字符串键冲突:", Object.keys(user)); // 只列出 ["name"]，symbol 键不在其中

// ===== 3. unique symbol：把某个 symbol 当成「类型层面的唯一字面量」=====
// unique symbol 只能用在 const 声明 或 readonly static 属性上（保证不可变、可追踪身份）
const TAG: unique symbol = Symbol("tag");
// 它的类型不是宽泛的 symbol，而是「typeof TAG」这个独一无二的类型
let sameTag: typeof TAG = TAG; // ✅ 只能赋 TAG 本身
console.log("unique symbol:", sameTag.toString());

// ❌ 错误示范：unique symbol 不能声明在 let 上
// let notUnique: unique symbol = Symbol();
//   报错：A variable whose type is a 'unique symbol' type must be 'const'.

// 用途：把 unique symbol 当作「品牌键」实现名义类型/私有键
class Registry {
  static readonly key: unique symbol = Symbol("registry"); // readonly static 也可
}
console.log("类中的 unique symbol 静态键:", typeof Registry.key);

// ===== 4. 用 symbol 做「类的私有/内部键」=====
const secret = Symbol("secret");
class Vault {
  [secret]: string; // 以 symbol 为键的成员，外部很难意外访问
  constructor(password: string) {
    this[secret] = password;
  }
  check(input: string): boolean {
    return this[secret] === input;
  }
}
const v = new Vault("1234");
console.log("symbol 键实现半私有成员:", v.check("1234"));

// ===== 5. well-known symbols（内置符号）简介 =====
// JS 预定义了一批「知名符号」，用来定制对象的内部行为，最常用的是 Symbol.iterator。
// 实现 [Symbol.iterator] 就能让对象支持 for...of（详见 27 迭代器模块）。
class Range {
  constructor(private start: number, private end: number) {}
  // 定义 Symbol.iterator，使 Range 可迭代
  [Symbol.iterator](): Iterator<number> {
    let current = this.start;
    const end = this.end;
    return {
      next(): IteratorResult<number> {
        return current <= end
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      },
    };
  }
}
console.log("Symbol.iterator 让对象可 for...of:", [...new Range(1, 5)]); // [1,2,3,4,5]

// 其它常见 well-known symbols（了解即可）：
//   Symbol.asyncIterator —— for await...of
//   Symbol.hasInstance   —— 定制 instanceof
//   Symbol.toPrimitive   —— 定制类型转换（如对象转 number/string）
//   Symbol.toStringTag   —— 定制 Object.prototype.toString 的结果

export {};

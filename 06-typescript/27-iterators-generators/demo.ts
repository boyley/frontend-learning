/**
 * 27 · 迭代器与生成器（Iterators & Generators）demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 27-iterators-generators/demo.ts`
 *
 * 本模块只聚焦一个主题：TS 里描述「可迭代 / 迭代器 / 生成器」的类型，
 * 以及 for...of 如何工作、和 for...in 的区别。
 *
 * 关键类型：
 *   Iterable<T>    —— 有 [Symbol.iterator]() 的东西，可被 for...of / 展开
 *   Iterator<T>    —— 有 next() 的东西，逐个吐出值
 *   Generator<T>   —— function* 生成器函数返回的对象（本身既是 Iterator 又是 Iterable）
 */

// ===== 1. 手写一个迭代器：实现 Iterable<T> 接口 =====
// 一个「可迭代对象」= 拥有 [Symbol.iterator]() 方法，返回一个 Iterator
class NumberRange implements Iterable<number> {
  constructor(private start: number, private end: number) {}

  [Symbol.iterator](): Iterator<number> {
    let current = this.start;
    const end = this.end;
    return {
      // next() 返回 { value, done }：done 为 true 时迭代结束
      next(): IteratorResult<number> {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}

const range = new NumberRange(1, 5);
// 因为实现了 Iterable，可直接 for...of
const collected: number[] = [];
for (const n of range) {
  collected.push(n);
}
console.log("手写 Iterable 被 for...of 遍历:", collected); // [1,2,3,4,5]
// 也可被展开运算符 / Array.from 消费（都依赖 Symbol.iterator）
console.log("展开可迭代对象:", [...new NumberRange(10, 13)]); // [10,11,12,13]

// ===== 2. 生成器函数 function*：写迭代器的「傻瓜」方式 =====
// yield 逐个产出值；返回类型可标注为 Generator<T>（也常让 TS 自动推断）
function* countdown(from: number): Generator<number> {
  let n = from;
  while (n > 0) {
    yield n; // 每次 yield 交出一个值，函数在此「暂停」，下次 next() 再继续
    n--;
  }
}

const gen = countdown(3);
console.log("生成器 next():", gen.next()); // { value: 3, done: false }
console.log("生成器 next():", gen.next()); // { value: 2, done: false }
console.log("生成器可被 for...of:", [...countdown(3)]); // [3,2,1]

// ===== 3. 用生成器让类可迭代（比手写 next 简洁得多）=====
class Stack<T> implements Iterable<T> {
  private items: T[] = [];
  push(item: T): void {
    this.items.push(item);
  }
  // 直接用 *[Symbol.iterator]() 生成器方法，yield 出每个元素
  *[Symbol.iterator](): Iterator<T> {
    // 从栈顶往栈底迭代
    for (let i = this.items.length - 1; i >= 0; i--) {
      yield this.items[i];
    }
  }
}
const stack = new Stack<string>();
stack.push("a");
stack.push("b");
stack.push("c");
console.log("生成器方法实现可迭代类:", [...stack]); // ["c","b","a"]

// ===== 4. Generator<T, TReturn, TNext> 三个类型参数（进阶了解）=====
// Generator<产出值类型, 返回值类型(return 的), next 传入值类型>
function* withReturn(): Generator<number, string, unknown> {
  yield 1;
  yield 2;
  return "done"; // 这个字符串就是 TReturn
}
const g2 = withReturn();
g2.next(); // { value: 1, done: false }
g2.next(); // { value: 2, done: false }
console.log("生成器的 return 值:", g2.next()); // { value: "done", done: true }

// ===== 5. for...of vs for...in（极易混淆）=====
const arr = ["x", "y", "z"];
const ofValues: string[] = [];
const inKeys: string[] = [];
for (const v of arr) ofValues.push(v); // of：遍历「值」（依赖 Symbol.iterator）
for (const k in arr) inKeys.push(k); // in：遍历「键名/索引」（字符串），且会遍历可枚举属性
console.log("for...of 取值:", ofValues); // ["x","y","z"]
console.log("for...in 取键(字符串索引):", inKeys); // ["0","1","2"]

// ❌ 常见坑：想遍历数组元素却误用 for...in，拿到的是字符串索引 "0"/"1"...
// 结论：遍历「可迭代对象的值」用 for...of；遍历「对象自身键」用 for...in。

// ===== 6. Iterable<T> 作为函数参数：接受任何可迭代来源 =====
// 这样数组、Set、Map、生成器、自定义 Iterable 都能传进来
function toArray<T>(iterable: Iterable<T>): T[] {
  return [...iterable];
}
console.log("Iterable 泛型参数(数组):", toArray([1, 2, 3]));
console.log("Iterable 泛型参数(Set):", toArray(new Set(["p", "q"])));
console.log("Iterable 泛型参数(生成器):", toArray(countdown(2)));

export {};

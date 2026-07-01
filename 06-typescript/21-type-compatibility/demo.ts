/**
 * 21 · 类型兼容性（Type Compatibility）demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 21-type-compatibility/demo.ts`
 *
 * 本模块只聚焦一个主题：TS 判断「A 类型能不能赋给 B 类型」的规则。
 * TS 用的是【结构化类型系统（Structural Typing，鸭子类型）】：
 *   只看「形状/成员」是否兼容，不看名字，也不要求显式 implements。
 *
 * 覆盖：结构化兼容、多余属性检查、函数参数兼容（少参数可赋、逆变）、返回值协变。
 */

// ===== 1. 结构化类型：形状对得上就兼容，不看名字 =====
interface Point2D {
  x: number;
  y: number;
}
class Vector {
  constructor(public x: number, public y: number) {}
}
// Vector 没有 implements Point2D，但结构一致 → 可以赋给 Point2D
const p: Point2D = new Vector(1, 2); // ✅ 鸭子类型：长得像就是
console.log("结构化兼容:", p.x, p.y);

// 「属性更多」的对象可赋给「属性更少」的类型（源 ⊇ 目标即可）
const richer = { x: 1, y: 2, z: 3 };
const p2: Point2D = richer; // ✅ 多出来的 z 无所谓
console.log("多属性可赋给少属性:", p2.x);

// ❌ 错误示范：缺少必需属性
// const p3: Point2D = { x: 1 };
//   报错：Property 'y' is missing in type '{ x: number; }'.

// ===== 2. 多余属性检查（Excess Property Check）：只针对「对象字面量直接赋值」=====
// 注意上面 richer 能赋给 p2，是因为它先赋给了变量。
// 但如果把「对象字面量」直接赋给类型，TS 会额外做一次「多余属性检查」，更严格：
// ❌ 错误示范：字面量里有目标类型没有的属性
// const p4: Point2D = { x: 1, y: 2, z: 3 };
//   报错：Object literal may only specify known properties, and 'z' does not exist in type 'Point2D'.
//   直觉：直接写字面量时多写属性，通常是拼错，所以 TS 特意拦截。
// ✅ 绕过方式（确需额外属性时）：先存入变量，或用类型断言 as Point2D
const p4 = { x: 1, y: 2, z: 3 } as Point2D;
console.log("多余属性检查(用变量/断言绕过):", p4.x);

// ===== 3. 函数兼容：参数「少的」可以赋给「多的」=====
// 直觉：JS 里回调可以忽略用不到的参数，所以「需要更少参数的函数」更通用
type Callback = (a: number, b: number) => void;
const cb: Callback = (a) => console.log("只用一个参数也兼容:", a); // ✅ 少用参数 OK
cb(1, 2);

// ❌ 错误示范：参数「多的」不能赋给「少的」
// type Simple = (a: number) => void;
// const bad: Simple = (a: number, b: number) => {};
//   报错：目标只会传 1 个参数，源却要求 2 个，可能拿到 undefined → 不兼容

// ===== 4. 函数参数「逆变」（strictFunctionTypes 下）=====
// 参数类型是「逆变」的：要把 f 赋给 g，f 的参数类型必须是 g 参数类型的【父类型】。
interface Animal {
  name: string;
}
interface Dog extends Animal {
  bark(): void;
}
type HandleAnimal = (a: Animal) => void;
type HandleDog = (d: Dog) => void;

// ✅ 接收「更宽父类型 Animal」的函数，可以赋给「需要处理 Dog」的位置
//    因为它能处理任何 Animal，自然也能处理 Dog（逆变，安全）
const handleDog: HandleDog = (a: Animal) => console.log("逆变OK:", a.name);
handleDog({ name: "Rex", bark: () => {} });

// ❌ 错误示范：接收「更窄子类型 Dog」的函数，不能赋给「需要处理任意 Animal」的位置
// const handleAnimal: HandleAnimal = (d: Dog) => d.bark();
//   报错：源参数 Dog 比目标参数 Animal 窄，函数体里访问 d.bark() 对普通 Animal 不安全。
//   这正是 strictFunctionTypes（strict 的一部分）逆变检查在保护你。

// ===== 5. 返回值「协变」：返回更具体的子类型是安全的 =====
type MakeAnimal = () => Animal;
const makeDog: MakeAnimal = () => ({ name: "Buddy", bark: () => {} });
// ✅ 承诺返回 Animal，实际返回 Dog（更具体）完全没问题 → 协变
console.log("返回值协变:", makeDog().name);

// ❌ 错误示范：返回更宽的父类型不安全
// type MakeDog = () => Dog;
// const makeAnimal: MakeDog = () => ({ name: "x" });
//   报错：承诺返回 Dog，却只返回缺 bark() 的 Animal，调用方 .bark() 会崩。

export {};

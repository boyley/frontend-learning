/**
 * 02 · 接口 interface demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 02-interfaces/demo.ts`
 *
 * 本模块聚焦：用 interface 描述「对象的形状」。
 */

// ===== 1. 基础对象结构 + 可选属性 ? + 只读 readonly =====
interface User {
  readonly id: number; // readonly：初始化后不可再赋值
  name: string; // 必填属性
  email?: string; // 可选属性：加 ? 表示「可有可无」
}

const u: User = { id: 1, name: "Alice" }; // 没写 email 也合法
console.log("user:", u);

// ❌ 错误示范：修改 readonly 属性
// u.id = 2;
//   报错：Cannot assign to 'id' because it is a read-only property.

// ❌ 错误示范：缺少必填属性 name
// const u2: User = { id: 2 };
//   报错：Property 'name' is missing in type '{ id: number; }'.

// ❌ 错误示范：对象字面量出现接口里没有的属性（多余属性检查）
// const u3: User = { id: 3, name: "Bob", age: 20 };
//   报错：Object literal may only specify known properties, and 'age'
//   does not exist in type 'User'.

// ===== 2. 函数类型接口 =====
// 用接口描述「一个函数应该长什么样」：参数类型 + 返回值类型
interface Comparator {
  (a: number, b: number): number;
}
const ascend: Comparator = (a, b) => a - b; // 参数 a/b 自动推断为 number
console.log("compare 3,1 =>", ascend(3, 1));

// ===== 3. 可索引签名 index signature =====
// 当对象的 key 不固定，但都映射到同一类型的值时使用
interface StringDict {
  [key: string]: string; // 任意 string 键，值必须是 string
}
const headers: StringDict = {
  "Content-Type": "application/json",
  Accept: "*/*",
};
console.log("headers Accept:", headers["Accept"]);

// ❌ 错误示范：索引签名约束了值类型，塞入不符值会报错
// const bad: StringDict = { ok: 200 };
//   报错：Type 'number' is not assignable to type 'string'.

// ===== 4. 接口继承 extends =====
interface Animal {
  name: string;
}
interface Dog extends Animal {
  // 继承 Animal 的 name，再扩展自己的属性
  breed: string;
}
const d: Dog = { name: "旺财", breed: "柴犬" }; // 必须同时满足两边
console.log("dog:", d);

// interface 还支持多继承：interface C extends A, B {}

// ===== 5. interface 与 type 的对比（简述）=====
// 描述对象结构时，下面两种写法几乎等价：
type UserType = {
  id: number;
  name: string;
};
// 主要区别：
//   - interface 可被「声明合并」(同名自动合并)，type 不行
//   - interface 主要描述对象/类的形状；
//     type 还能写联合、交叉、元组、映射等更复杂的类型
//   - 经验法则：描述对象就用 interface，需要联合/工具类型就用 type
const ut: UserType = { id: 9, name: "type 写法" };
console.log("UserType:", ut);

// 声明合并演示：两个同名 interface 会自动合并成一个
interface Box {
  width: number;
}
interface Box {
  height: number;
}
const box: Box = { width: 100, height: 50 }; // 必须同时有 width 和 height
console.log("merged Box:", box);

console.log("接口 demo 运行完成");

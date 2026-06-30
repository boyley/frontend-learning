/**
 * 12 · 映射类型（Mapped Types）demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 12-mapped-types/demo.ts`
 *
 * 本模块只聚焦一个主题：基于一个旧类型，「逐个键」批量生成新类型。
 *   语法：{ [K in keyof T]: ... }
 *   能力：批量改值类型、增删修饰符(readonly / ?)、重映射键名(as)、配合模板字面量造键名。
 */

interface User {
  id: number;
  name: string;
  email: string;
}

// ===== 1. 最基本的映射类型：遍历 keyof T，逐键生成 =====
// 把每个属性的值类型都改成 boolean（典型场景：表单字段是否被修改过）
type Flags<T> = {
  [K in keyof T]: boolean;
};
type UserFlags = Flags<User>; // => { id: boolean; name: boolean; email: boolean }
const flags: UserFlags = { id: true, name: false, email: true };
console.log("基础映射：值类型批量改 boolean：", flags);

// 想保留原值类型，就用索引访问 T[K]
type Clone<T> = { [K in keyof T]: T[K] };
type UserClone = Clone<User>; // => 与 User 完全一致
const clone: UserClone = { id: 1, name: "Alice", email: "a@x.com" };
console.log("用 T[K] 保留原值类型：", clone);

// ===== 2. 修饰符增删：readonly 与 ? 的 + / - =====
// 2.1 加修饰符（+ 可省略）：全部变只读且可选
type Weaken<T> = {
  readonly [K in keyof T]?: T[K];
};
type WeakUser = Weaken<User>; // 全部 readonly + 可选
const wu: WeakUser = { name: "Bob" }; // 可只给部分字段
console.log("加 readonly 和 ? 修饰符：", wu);

// ❌ 错误示范：修改加了 readonly 的字段
// wu.name = "changed";
//   报错：Cannot assign to 'name' because it is a read-only property.

// 2.2 删修饰符（用 -readonly / -?）：这正是内置 Required / 可变化类型的原理
type Strict<T> = {
  -readonly [K in keyof T]-?: T[K]; // 去掉只读、去掉可选
};
// 拿一个又只读又可选的类型来「转正」
type LooseUser = { readonly id?: number; readonly name?: string };
type FixedUser = Strict<LooseUser>; // => { id: number; name: string }（可写且必填）
const fixed: FixedUser = { id: 1, name: "Cathy" };
fixed.id = 2; // ✅ 已去掉 readonly，可以改
console.log("用 -readonly / -? 删修饰符（转正）：", fixed);

// ❌ 错误示范：Strict 后漏字段
// const badFixed: FixedUser = { id: 1 };
//   报错：Property 'name' is missing（-? 已把 name 变为必填）

// ===== 3. 键名重映射 Key Remapping via as（TS 4.1+）=====
// 在 [K in keyof T as 新键名] 里用 as 改写键名
// 经典场景：为每个属性生成 getter 方法名
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
type UserGetters = Getters<User>;
// => { getId: () => number; getName: () => string; getEmail: () => string }
const userGetters: UserGetters = {
  getId: () => 1,
  getName: () => "Dan",
  getEmail: () => "d@x.com",
};
console.log("键名重映射生成 getter：", userGetters.getName());

// 3.1 用 as 过滤键：把某些键映射成 never 即可「删掉」该键
type RemoveEmail<T> = {
  [K in keyof T as Exclude<K, "email">]: T[K];
};
type NoEmailUser = RemoveEmail<User>; // => { id: number; name: string }
const noEmail: NoEmailUser = { id: 1, name: "Eve" };
console.log("用 as + never 过滤掉某些键：", noEmail);

// ===== 4. 配合模板字面量类型批量造键名 =====
// 为每个事件名生成「on + 事件名」的回调字段
type EventHandlers<T extends string> = {
  [E in T as `on${Capitalize<E>}`]: (payload: unknown) => void;
};
type DomHandlers = EventHandlers<"click" | "hover" | "focus">;
// => { onClick: ...; onHover: ...; onFocus: ... }
const handlers: DomHandlers = {
  onClick: () => console.log("clicked"),
  onHover: () => console.log("hovered"),
  onFocus: () => console.log("focused"),
};
console.log("模板字面量造键名（事件回调）：");
handlers.onClick(null);

// ❌ 错误示范：模板字面量里键名拼写不符
// const badHandlers: DomHandlers = { onclick: () => {} };
//   报错：'onclick' 不在类型中（应为 'onClick'，C 被 Capitalize 大写了）

console.log("\n===== 12 映射类型 demo 运行完成 =====");

export {};

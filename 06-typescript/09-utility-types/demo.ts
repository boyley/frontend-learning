/**
 * 09 · 内置工具类型（Utility Types）demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 09-utility-types/demo.ts`
 *
 * 本模块只聚焦一个主题：TypeScript 标准库自带的「工具类型」。
 * 它们本质上是官方预先写好的「类型函数」，输入一个类型，输出一个变形后的新类型，
 * 让你不用手写映射/条件类型就能完成常见的类型变换。
 */

// 先准备一个统一的基础类型，后面大部分例子都基于它
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // 注意 age 本身就是可选的
}

// ===== 1. Partial<T>：把所有属性变为可选 =====
// 典型场景：更新函数只想传部分字段
type PartialUser = Partial<User>;
// 等价于 { id?: number; name?: string; email?: string; age?: number }
function updateUser(id: number, patch: Partial<User>): void {
  console.log(`更新用户 ${id}：`, patch);
}
updateUser(1, { name: "Alice" }); // ✅ 只传一个字段也合法

// ❌ 错误示范：不用 Partial 时，必须传齐所有必填字段
// function updateBad(patch: User) {}
// updateBad({ name: "Alice" });
//   报错：Property 'id' is missing in type '{ name: string; }' but required in type 'User'.

// ===== 2. Required<T>：把所有属性变为必填（去掉 ?）=====
type RequiredUser = Required<User>;
// age 由可选变为必填
const fullUser: RequiredUser = { id: 1, name: "Bob", email: "b@x.com", age: 20 };
console.log("Required 后 age 必填：", fullUser.age);

// ❌ 错误示范：Required 后漏写原本可选的 age
// const badRequired: RequiredUser = { id: 1, name: "Bob", email: "b@x.com" };
//   报错：Property 'age' is missing ... 'Required<User>' 要求 age 必填。

// ===== 3. Readonly<T>：把所有属性变为只读 =====
type ReadonlyUser = Readonly<User>;
const ro: ReadonlyUser = { id: 1, name: "Cathy", email: "c@x.com" };
console.log("Readonly 读取：", ro.name);

// ❌ 错误示范：修改 Readonly 属性
// ro.name = "Changed";
//   报错：Cannot assign to 'name' because it is a read-only property.

// ===== 4. Pick<T, K>：从 T 中挑选若干键，组成新类型 =====
// 第二个参数 K 必须是 keyof T 的子集
type UserPreview = Pick<User, "id" | "name">;
const preview: UserPreview = { id: 1, name: "Dan" };
console.log("Pick 只保留 id/name：", preview);

// ❌ 错误示范：Pick 一个不存在的键
// type Bad = Pick<User, "phone">;
//   报错：Type '"phone"' does not satisfy the constraint 'keyof User'.

// ===== 5. Omit<T, K>：从 T 中剔除若干键，保留其余 =====
// 与 Pick 相反，常用于「除了某些敏感字段外都要」
type UserWithoutEmail = Omit<User, "email">;
const noEmail: UserWithoutEmail = { id: 1, name: "Eve" };
console.log("Omit 去掉 email：", noEmail);

// ===== 6. Record<K, V>：构造「键为 K、值为 V」的对象类型 =====
// 适合表示字典/映射表
type Role = "admin" | "editor" | "guest";
type RolePermissions = Record<Role, string[]>;
const perms: RolePermissions = {
  admin: ["read", "write", "delete"],
  editor: ["read", "write"],
  guest: ["read"],
};
console.log("Record 字典：", perms.admin);

// ❌ 错误示范：Record 漏掉某个键
// const badPerms: RolePermissions = { admin: [], editor: [] };
//   报错：Property 'guest' is missing ... Record 要求 K 的每个成员都出现。

// ===== 7. Exclude<U, E>：从联合类型 U 中排除可赋给 E 的成员 =====
type T1 = Exclude<"a" | "b" | "c", "a">; // => "b" | "c"
const t1: T1 = "b";
console.log("Exclude 排除 a：", t1);

// ===== 8. Extract<U, E>：从联合类型 U 中提取可赋给 E 的成员（与 Exclude 相反）=====
type T2 = Extract<"a" | "b" | "c", "a" | "z">; // => "a"（只有 a 同时存在）
const t2: T2 = "a";
console.log("Extract 提取交集：", t2);

// ===== 9. NonNullable<T>：去掉 null 和 undefined =====
type MaybeStr = string | null | undefined;
type Str = NonNullable<MaybeStr>; // => string
const s: Str = "hello";
console.log("NonNullable 去空：", s);

// ❌ 错误示范：给 NonNullable 结果赋 null
// const badNonNull: Str = null;
//   报错：Type 'null' is not assignable to type 'string'.

// ===== 10. ReturnType<F>：提取函数的返回值类型 =====
function createUser(name: string) {
  return { id: Date.now(), name, createdAt: new Date() };
}
type CreatedUser = ReturnType<typeof createUser>;
// => { id: number; name: string; createdAt: Date }
const created: CreatedUser = { id: 1, name: "Frank", createdAt: new Date() };
console.log("ReturnType 提取返回值：", created.name);

// ===== 11. Parameters<F>：以元组形式提取函数的参数类型 =====
function sendMail(to: string, subject: string, urgent: boolean) {
  return `${to}:${subject}:${urgent}`;
}
type MailArgs = Parameters<typeof sendMail>; // => [string, string, boolean]
const args: MailArgs = ["a@x.com", "Hi", true];
console.log("Parameters 提取参数元组：", sendMail(...args));

// ===== 12. Awaited<T>：递归「解包」Promise，得到 await 后的类型 =====
async function fetchUser(): Promise<User> {
  return { id: 1, name: "Grace", email: "g@x.com" };
}
type Fetched = Awaited<ReturnType<typeof fetchUser>>; // => User（脱掉 Promise）
// 即便是 Promise<Promise<number>> 也会被递归解包成 number
type DeepAwaited = Awaited<Promise<Promise<number>>>; // => number
const deep: DeepAwaited = 42;
console.log("Awaited 解包 Promise：", deep);

console.log("\n===== 09 工具类型 demo 运行完成 =====");

// 防止 TS 因「未使用变量」在某些严格配置下报错（教学示例需要保留这些声明）
export {};

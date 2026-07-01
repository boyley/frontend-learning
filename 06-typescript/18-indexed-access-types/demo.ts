/**
 * 18 · 索引访问类型（Indexed Access Types）demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 18-indexed-access-types/demo.ts`
 *
 * 本模块只聚焦一个主题：用「下标」在【类型层面】取出另一个类型里某个属性的类型。
 * 语法就是把 JS 的取值语法搬到类型世界：T["key"]、T[number]、T[keyof T] ...
 *
 * 记忆点：这是「类型上的取值」，取出来的还是一个【类型】，不是值。
 */

interface User {
  id: number;
  name: string;
  address: {
    city: string;
    zip: string;
  };
  roles: string[];
}

// ===== 1. T["key"]：取单个属性的类型 =====
type IdType = User["id"]; // => number
type NameType = User["name"]; // => string
const uid: IdType = 42;
console.log("User['id'] 的类型是 number:", uid);

// ❌ 错误示范：索引一个不存在的键
// type Bad = User["phone"];
//   报错：Property 'phone' does not exist on type 'User'.

// ===== 2. T["a" | "b"]：用联合键，取到「联合类型」 =====
type IdOrName = User["id" | "name"]; // => number | string
const mixed: IdOrName = "hello"; // string 也可以，number 也可以
console.log("联合键取到 number | string:", mixed);

// ===== 3. 配合 keyof：T[keyof T] 取「所有属性值类型的联合」=====
type AllValueTypes = User[keyof User];
// => number | string | { city: string; zip: string } | string[]
const anyValue: AllValueTypes = ["admin"];
console.log("T[keyof T] 是所有值类型的联合:", anyValue);

// ===== 4. 嵌套索引：一层层往里取 =====
type CityType = User["address"]["city"]; // => string
type ZipType = User["address"]["zip"]; // => string
const city: CityType = "Shanghai";
console.log("嵌套索引 User['address']['city']:", city);

// ===== 5. T[number]：取「数组/元组元素」的类型（极常用）=====
// roles 是 string[]，用 number 索引即可拿到元素类型
type RoleType = User["roles"][number]; // => string
const role: RoleType = "editor";
console.log("数组[number] 取元素类型:", role);

// 独立的数组类型也一样
const fruits = ["apple", "banana", "cherry"];
type Fruit = (typeof fruits)[number]; // => string
// 如果加 as const，就能取到精确的字面量联合：
const fruitsConst = ["apple", "banana", "cherry"] as const;
type FruitLiteral = (typeof fruitsConst)[number]; // => "apple" | "banana" | "cherry"
const f: FruitLiteral = "banana"; // ✅ 只能是这三者之一
console.log("as const + [number] 得到字面量联合:", f);

// ===== 6. 元组按具体下标取值类型 =====
type Pair = [name: string, age: number];
type First = Pair[0]; // => string
type Second = Pair[1]; // => number
const second: Second = 18;
console.log("元组 Pair[1] 类型是 number:", second);

// ===== 7. 实战：用索引访问类型写一个「取值函数」的返回类型 =====
// getProp 的返回类型 = 对象类型 T 中，键 K 对应的属性类型 T[K]
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user: User = {
  id: 1,
  name: "Alice",
  address: { city: "Beijing", zip: "100000" },
  roles: ["admin"],
};
const gotName = getProp(user, "name"); // TS 推断返回 string
const gotId = getProp(user, "id"); // TS 推断返回 number
console.log("泛型 + T[K] 精确返回:", gotName, gotId);

// ❌ 错误示范：注意索引类型必须用「类型」而不是「值」
// const key = "id";
// type WrongUse = User[key];
//   报错：'key' refers to a value, but is being used as a type here.
//   ✅ 正确写法：User["id"] 或 User[typeof key]

export {};

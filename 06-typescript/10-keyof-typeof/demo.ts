/**
 * 10 · keyof / typeof / 索引访问类型 demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 10-keyof-typeof/demo.ts`
 *
 * 本模块只聚焦一个主题：在「类型层面」对一个类型/对象做查询。
 *   - keyof T        取一个类型所有键，组成字符串字面量联合
 *   - typeof value   把一个「值」反推成它的「类型」
 *   - T[K]           索引访问类型，取某个键对应的值类型
 * 三者经常组合使用，是写泛型工具类型的基础。
 */

// ===== 1. keyof：取类型的键，得到联合类型 =====
interface Person {
  name: string;
  age: number;
  email: string;
}

type PersonKeys = keyof Person; // => "name" | "age" | "email"
const k1: PersonKeys = "name"; // ✅
const k2: PersonKeys = "age"; // ✅
console.log("keyof 得到键的联合：", k1, k2);

// ❌ 错误示范：keyof 联合里不存在的键
// const badKey: PersonKeys = "phone";
//   报错：Type '"phone"' is not assignable to type 'keyof Person'.

// ===== 2. typeof：从「值」反推「类型」（类型查询）=====
// 注意：这里的 typeof 是「类型上下文」里的 typeof，和 JS 运行时的 typeof 不是一回事
const config = {
  host: "localhost",
  port: 8080,
  https: false,
};

type Config = typeof config;
// => { host: string; port: number; https: boolean }
const anotherConfig: Config = { host: "127.0.0.1", port: 9090, https: true };
console.log("typeof 反推对象类型：", anotherConfig);

// ❌ 错误示范：typeof 反推后字段类型被固定
// const badConfig: Config = { host: 123, port: 80, https: true };
//   报错：Type 'number' is not assignable to type 'string'.（host 已被推断为 string）

// ===== 3. T[K]：索引访问类型，取某个键的值类型 =====
type NameType = Person["name"]; // => string
type AgeType = Person["age"]; // => number
const n: NameType = "Alice";
const a: AgeType = 30;
console.log("索引访问取单个键的值类型：", n, a);

// 也可以一次取多个键（传联合），得到值类型的联合
type NameOrAge = Person["name" | "age"]; // => string | number
const v: NameOrAge = 42;
console.log("索引访问取多个键的值类型联合：", v);

// 取数组元素类型的经典写法：T[number]
const fruits = ["apple", "banana", "cherry"];
type Fruit = (typeof fruits)[number]; // => string
const f: Fruit = "apple";
console.log("typeof + [number] 取数组元素类型：", f);

// ===== 4. 三者组合：keyof typeof，最常见的搭配 =====
// 场景：有一个「值对象」（如枚举式常量、配置表），想约束「只能取它的键」
const COLORS = {
  red: "#ff0000",
  green: "#00ff00",
  blue: "#0000ff",
} as const; // as const 让值也变成字面量类型，键更精确

// 第一步 typeof COLORS 得到类型，第二步 keyof 取键
type ColorName = keyof typeof COLORS; // => "red" | "green" | "blue"

function getColorHex(name: ColorName): string {
  return COLORS[name];
}
console.log("keyof typeof 约束键：", getColorHex("red"));

// ❌ 错误示范：传入不存在的颜色名
// getColorHex("yellow");
//   报错：Argument of type '"yellow"' is not assignable to parameter of type 'ColorName'.

// ===== 5. 综合实战：用 keyof + T[K] 写一个类型安全的取值函数 =====
// 这是 keyof/索引访问最经典的用途：getProperty 的返回值类型随键名精确变化
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person: Person = { name: "Bob", age: 25, email: "b@x.com" };
const personName = getProperty(person, "name"); // 返回类型被推断为 string
const personAge = getProperty(person, "age"); // 返回类型被推断为 number
console.log("泛型取值，返回类型随键变化：", personName, personAge);

// ❌ 错误示范：取一个不存在的键
// getProperty(person, "salary");
//   报错：Argument of type '"salary"' is not assignable to parameter of type 'keyof Person'.

console.log("\n===== 10 keyof/typeof/索引访问 demo 运行完成 =====");

export {};

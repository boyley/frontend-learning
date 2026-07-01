/**
 * 17 · satisfies 运算符（satisfies Operator，TS 4.9+）demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 17-satisfies-operator/demo.ts`
 *
 * 本模块只聚焦一个主题：satisfies 让你「校验一个值符合某类型」的同时，
 * 【保留该值被推断出的、更精确的类型】——鱼与熊掌兼得。
 *
 * 一句话对比三种写法：
 *   类型注解 (: T)      —— 校验 ✅，但类型被拓宽成 T（丢失精确信息）
 *   类型断言 (as T)     —— 不校验 ❌（甚至能瞒天过海），只是让编译器闭嘴
 *   satisfies (satisfies T) —— 校验 ✅，且保留最窄的推断类型 ✅（推荐）
 */

type Colors = "red" | "green" | "blue";
type RGB = [red: number, green: number, blue: number];

// ===== 1. 用类型注解：校验通过，但类型被拓宽 =====
const paletteAnnotated: Record<Colors, string | RGB> = {
  red: [255, 0, 0],
  green: "#00ff00",
  blue: [0, 0, 255],
};
// 问题：每个属性的类型都被拓宽成了 string | RGB
// paletteAnnotated.green 现在是 string | RGB，不能直接当字符串用：
// paletteAnnotated.green.toUpperCase();
//   ❌ 报错：Property 'toUpperCase' does not exist on type 'string | RGB'.

// ===== 2. 用 satisfies：校验通过，且保留精确类型（重点）=====
const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
  blue: [0, 0, 255],
} satisfies Record<Colors, string | RGB>;

// ✅ TS 记住了 green 具体是 string、red 具体是 number[] 元组
console.log("green 大写:", palette.green.toUpperCase()); // green 是 string，OK
console.log("red 首值:", palette.red[0]); // red 是数组，可下标访问

// ===== 3. satisfies 依然会做「约束校验」——拼错 key / 值类型不符都会报错 =====
// ❌ 错误示范：把 key 拼错成 bleu
// const badKey = {
//   red: [255, 0, 0],
//   green: "#00ff00",
//   bleu: [0, 0, 255], // 报错：Object literal may only specify known properties...
// } satisfies Record<Colors, string | RGB>;

// ❌ 错误示范：值类型不匹配
// const badValue = {
//   red: 0xff0000, // number 既不是 string 也不是 RGB 元组 → 报错
//   green: "#00ff00",
//   blue: [0, 0, 255],
// } satisfies Record<Colors, string | RGB>;

// ❌ 错误示范：漏掉某个 key（Record 要求 Colors 全覆盖）
// const missing = {
//   red: [255, 0, 0],
//   green: "#00ff00",
// } satisfies Record<Colors, string | RGB>; // 报错：缺少 blue

// ===== 4. 经典用途：既想要「宽约束」保证结构，又想要「窄类型」用于取值 =====
// 一个路由表：key 必须是合法路径，值可以是字符串或函数
type Handler = () => void;
const routes = {
  "/home": () => console.log("home"),
  "/about": "static about page", // 有的是函数，有的是字符串
} satisfies Record<`/${string}`, Handler | string>;

// 因为保留了精确类型，TS 知道 /home 是函数、/about 是字符串
routes["/home"](); // ✅ 可直接调用（函数）
console.log("about 内容:", routes["/about"].toUpperCase()); // ✅ 可当字符串用

// ❌ 若用类型注解 : Record<..., Handler | string>，两者都会被拓宽成 Handler | string，
//    routes["/home"]() 与 routes["/about"].toUpperCase() 都会报错。

// ===== 5. satisfies vs as：as 会「骗过」编译器，satisfies 不会 =====
// as 允许把不匹配的值蒙混过关（下面这行不报错，但语义是错的）：
const sneaky = { red: 1, green: 2, blue: 3 } as unknown as Record<Colors, string | RGB>;
console.log("as 蒙混过关(危险):", sneaky.red); // 运行时是数字 1，类型却谎称是 string|RGB
// satisfies 则会在编译期直接拦下这种不匹配，不给你蒙混的机会。

export {};

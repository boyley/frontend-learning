/**
 * 19 · 模板字面量类型（Template Literal Types，TS 4.1+）demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 19-template-literal-types/demo.ts`
 *
 * 本模块只聚焦一个主题：在【类型层面】用反引号拼接字符串字面量，
 * 生成新的字符串字面量类型；配合联合类型会「笛卡尔积」式展开，
 * 再配合内置的大小写工具，可推导出事件名、路由、CSS 属性等一整套字符串类型。
 */

// ===== 1. 基础拼接：把字面量类型拼进模板 =====
type World = "world";
type Greeting = `hello ${World}`; // => "hello world"
const g: Greeting = "hello world";
console.log("基础拼接:", g);

// ❌ 错误示范：拼出来的字面量必须完全匹配
// const bad: Greeting = "hello World";
//   报错：Type '"hello World"' is not assignable to type '"hello world"'.

// ===== 2. 联合类型插值 → 笛卡尔积展开 =====
type Lang = "en" | "zh" | "ja";
type Page = "home" | "about";
// 两个联合各自展开再两两组合：3 × 2 = 6 个成员
type LocalePage = `${Lang}_${Page}`;
// => "en_home" | "en_about" | "zh_home" | "zh_about" | "ja_home" | "ja_about"
const lp: LocalePage = "zh_about";
console.log("联合插值笛卡尔积:", lp);

// ===== 3. 内置字符串工具类型：大小写变换 =====
// Uppercase / Lowercase / Capitalize / Uncapitalize —— TS 内置，编译期完成
type Loud = Uppercase<"hello">; // => "HELLO"
type Quiet = Lowercase<"HELLO">; // => "hello"
type Cap = Capitalize<"hello">; // => "Hello"
type Uncap = Uncapitalize<"Hello">; // => "hello"
const loud: Loud = "HELLO";
console.log("Uppercase 变换:", loud);

// ===== 4. 经典用途一：从属性名推导「事件处理器」名（onXxx / xxxChanged）=====
// 把对象每个 key 变成 `on${Capitalize<key>}` 形式的方法名
interface FormData {
  name: string;
  email: string;
}
type Handlers = {
  [K in keyof FormData as `on${Capitalize<string & K>}Change`]: (
    value: FormData[K]
  ) => void;
};
// => { onNameChange: (value: string) => void; onEmailChange: (value: string) => void }
const handlers: Handlers = {
  onNameChange: (v) => console.log("name changed:", v),
  onEmailChange: (v) => console.log("email changed:", v),
};
handlers.onNameChange("Alice");

// ❌ 错误示范：写错事件名（大小写/拼写不符）
// const badHandlers: Handlers = { onnamechange: () => {} };
//   报错：'onnamechange' 不在 Handlers 的键里（必须是 onNameChange / onEmailChange）

// ===== 5. 经典用途二：用 infer 从模板字面量类型里「拆解」出片段 =====
// 从 "GET /users/:id" 里拆出 method 部分
type ExtractMethod<T> = T extends `${infer M} ${string}` ? M : never;
type M1 = ExtractMethod<"GET /users">; // => "GET"
type M2 = ExtractMethod<"POST /login">; // => "POST"
const m: M1 = "GET";
console.log("infer 拆解模板得到 method:", m);

// ===== 6. 经典用途三：约束「带前缀的字符串」类型 =====
// 只接受以 "/" 开头的路径
type Path = `/${string}`;
const p1: Path = "/home"; // ✅
// const p2: Path = "home"; // ❌ 报错：缺少前导 "/"
console.log("前缀约束 Path:", p1);

// CSS 尺寸单位约束：数字 + 单位
type CSSSize = `${number}px` | `${number}rem` | `${number}%`;
const w: CSSSize = "16px"; // ✅
const h: CSSSize = "100%"; // ✅
// const bad2: CSSSize = "16em"; // ❌ 报错：em 不在允许单位里
console.log("CSS 尺寸约束:", w, h);

export {};

/// <reference path="./global-lib.d.ts" />
// ↑ 三斜线指令（triple-slash directive）：显式引入同目录的全局声明文件，
//   让「单文件运行（ts-node demo.ts）」时也能加载 global-lib.d.ts 里的全局声明。
//   （整项目 tsc 编译时靠 tsconfig 的 include 自动加载，可不写此行。）

/**
 * 24 · 声明文件（Declaration Files / .d.ts）demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 24-declaration-files/demo.ts`
 *
 * 本模块只聚焦一个主题：声明文件（.d.ts）与 declare 关键字，
 * 用来「只描述类型、不含实现」，给纯 JS 库或全局环境补上类型信息。
 *
 * 配套文件：同目录下的 global-lib.d.ts 声明了一个全局库 MyLib 与全局函数 trackEvent。
 * 本文件直接使用它们（无需 import），类型来自那个 .d.ts。
 */

// ===== 0. 先提供「运行时实现」=====
// .d.ts 只有类型没有实现；真实项目里 MyLib 由 <script> 注入。
// 这里为了 demo 能跑，手动在全局挂上实现（TS 的类型来自 global-lib.d.ts）。
(globalThis as any).MyLib = {
  version: "1.0.0",
  greet: (name: string) => `Hello from MyLib, ${name}`,
};
(globalThis as any).trackEvent = (name: string, payload?: Record<string, unknown>) =>
  console.log("track:", name, payload ?? {});

// ===== 1. 使用全局声明：无需 import，类型来自 global-lib.d.ts =====
console.log("全局库 MyLib.version:", MyLib.version); // 类型是 string，编译期已知
console.log("全局库 MyLib.greet:", MyLib.greet("Alice"));
trackEvent("page_view", { path: "/home" }); // 全局函数，也有类型提示

// ❌ 错误示范：用错类型，编译期就会拦截（证明 .d.ts 生效）
// MyLib.greet(123);
//   报错：Argument of type 'number' is not assignable to parameter of type 'string'.
// console.log(MyLib.notExist);
//   报错：Property 'notExist' does not exist on type 'MyLibStatic'.

// ===== 2. 文件内的 ambient 声明：declare const / declare function =====
// declare 表示「这个东西在别处（运行时）已经存在，这里只声明它的类型」。
// 常用于描述构建工具注入的全局常量（如打包器注入的 __VERSION__）。
declare const __BUILD_ENV__: "development" | "production";
// 由于是 demo，运行时并没有真的注入它，这里不去读取它的值，只演示「声明」本身。
type BuildEnv = typeof __BUILD_ENV__; // => "development" | "production"
const envSample: BuildEnv = "production";
console.log("ambient 常量类型:", envSample);

// ===== 3. 给「没有类型的 JS 模块」补类型：declare module =====
// 真实场景：你 import 了一个纯 JS 库，但它没带 .d.ts，也没有 @types 包。
// 解决：写一个 declare module "库名" { ... } 把它的形状描述出来。
// 下面用注释演示写法（不真正 import，避免运行时找不到该模块）：
//
//   // typings.d.ts
//   declare module "cool-js-lib" {
//     export function doWork(input: string): number;
//     export const NAME: string;
//   }
//
//   // 使用处（有了上面的声明，import 就有类型了）
//   // import { doWork } from "cool-js-lib";
//
// 还可以为「非代码资源」声明通配模块，让 import 图片/样式不报错：
//   declare module "*.png" { const src: string; export default src; }
//   declare module "*.css";

// ===== 4. @types / DefinitelyTyped（了解）=====
// 大多数流行 JS 库的类型不用自己写：社区维护在 DefinitelyTyped 仓库，
// 以 `@types/包名` 发布。例如：
//   npm i -D @types/node        // Node 内置模块的类型
//   npm i -D @types/lodash      // lodash 的类型
// 安装后 TS 会自动从 node_modules/@types 里加载，无需任何 import 配置。
// 若库自带 .d.ts（package.json 有 "types" 字段），则无需再装 @types。
console.log("提示：常用库优先用 @types/xxx，实在没有再自己写 .d.ts");

export {};

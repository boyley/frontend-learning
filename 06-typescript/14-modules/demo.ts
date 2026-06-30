/**
 * 14 · 模块系统（Modules）—— ES Module 的 import / export 演示
 *
 * 在 TypeScript 里，「一个文件只要有顶层 import 或 export，就是一个模块」，
 * 模块内的变量默认私有，不会污染全局。
 *
 * 为了在「单文件」里演示 import/export 的语法，本 demo 采用一种常见技巧：
 * 把要导出的东西 export 出去，再从「本模块自身的相对路径」import 回来读取。
 * 真实项目里 import 来自其它文件，语法完全一致。
 */

// ============================================================
// 1) 命名导出（Named Export）—— 可导出多个，名字必须对上
// ============================================================
export const PI = 3.14159;

export function add(a: number, b: number): number {
  return a + b;
}

// 也可以先声明，最后用 export { ... } 统一导出，并用 as 重命名
const internalName = 'TypeScript';
export { internalName as libName }; // 对外叫 libName

// ============================================================
// 2) 默认导出（Default Export）—— 每个模块最多一个
// ============================================================
export default class Calculator {
  multiply(a: number, b: number): number {
    return a * b;
  }
}

// ============================================================
// 3) type-only 导出（仅类型导出）
//    用 `export type` 明确「这是类型，编译后会被擦除」，利于编译优化。
// ============================================================
export type Point = { x: number; y: number };

export interface Shape {
  area(): number;
}

// ============================================================
// 4) 各种导入语法（从本模块自身导入，仅为单文件演示）
//    真实项目写法相同，只是把 './demo' 换成目标文件路径。
// ============================================================

// 4.1 命名导入 + 重命名 as
import { PI as CirclePi, add as sum, libName } from './demo';

// 4.2 默认导入（名字可任意取）
import Calc from './demo';

// 4.3 整体命名空间导入 import * as
import * as MathLib from './demo';

// 4.4 仅类型导入 import type（编译后被擦除，不产生运行时代码）
import type { Point as P, Shape } from './demo';

// ❌ 错误示范：把「仅类型」当成值来用
// import type { add as addType } from './demo';
// console.log(addType(1, 2));
// 原因：`import type` 导入的东西在运行时不存在，
//       当作值调用会报 TS1361: 'addType' cannot be used as a value
//       because it was imported using 'import type'.

// ✅ 正确：值用普通 import，类型用 import type（或 import { type X }）

// ============================================================
// 5) 与 CommonJS 互操作（esModuleInterop）
//    开启 esModuleInterop 后，CommonJS 模块（module.exports = ...）
//    可以用「默认导入」语法引入，例如：
//        import path from 'path';   // 而不必写 import * as path
//    本工程 tsconfig 已开启 esModuleInterop: true。
// ============================================================

// ============================================================
// 6) namespace（命名空间）—— 仅作了解，现代项目不推荐
// ============================================================
namespace LegacyGeometry {
  // namespace 是 TS 早期「内部模块」方案，用于在没有模块系统的年代组织代码。
  export function describe(): string {
    return 'namespace 现已被 ES Module 取代，新项目请用 import/export';
  }
}

// ------------------------------------------------------------
// 运行验证
// ------------------------------------------------------------
console.log('PI =', CirclePi);
console.log('add =', sum(2, 3));
console.log('libName =', libName);

const calc = new Calc();
console.log('multiply =', calc.multiply(4, 5));

console.log('MathLib.PI =', MathLib.PI);
console.log('MathLib.add =', MathLib.add(10, 20));

const p: P = { x: 1, y: 2 }; // 仅类型用法
const square: Shape = { area: () => 4 };
console.log('point =', p, 'area =', square.area());

console.log(LegacyGeometry.describe());

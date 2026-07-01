/**
 * 23 · 命名空间（Namespaces）demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 23-namespaces/demo.ts`
 *
 * 本模块只聚焦一个主题：TS 的 namespace（早期叫「内部模块」），
 * 它在【没有模块系统的年代】用来把相关代码归组、避免污染全局命名。
 *
 * ⚠️ 重要立场（官方推荐）：现代项目请优先使用 ES Module（import/export，见 14 模块）。
 *    namespace 主要出现在：全局脚本、.d.ts 声明文件里给全局库分组、老代码维护。
 */

// ===== 1. 基础命名空间：export 的成员对外可见，未 export 的私有 =====
namespace Validation {
  // 未导出 → 命名空间内部私有，外部访问不到
  const lettersRegexp = /^[A-Za-z]+$/;

  // 导出的接口/类/函数才能通过 Validation.xxx 访问
  export interface StringValidator {
    isValid(s: string): boolean;
  }

  export class LettersOnlyValidator implements StringValidator {
    isValid(s: string): boolean {
      return lettersRegexp.test(s); // 可用命名空间内的私有成员
    }
  }
}

const v = new Validation.LettersOnlyValidator();
console.log("命名空间基础用法:", v.isValid("Hello"), v.isValid("He11o"));

// ❌ 错误示范：访问未导出的成员
// console.log(Validation.lettersRegexp);
//   报错：Property 'lettersRegexp' does not exist ... 它没有 export，是私有的。

// ===== 2. 嵌套命名空间：用「点」组织多层分组 =====
namespace App {
  export namespace Utils {
    export function greet(name: string): string {
      return `Hi, ${name}`;
    }
  }
  export const version = "1.0.0";
}
console.log("嵌套命名空间:", App.Utils.greet("Bob"), App.version);

// ===== 3. 别名：用 import X = A.B.C 给深层命名空间起短名（不是 ES import！）=====
import Utils = App.Utils; // 这是命名空间别名，仅在 TS 内部有效
console.log("命名空间别名:", Utils.greet("Carol"));

// ===== 4. 合并：同名 namespace 会自动合并（见 22 声明合并）=====
namespace Shape {
  export function area(r: number): number {
    return Math.PI * r * r;
  }
}
namespace Shape {
  export function circumference(r: number): number {
    return 2 * Math.PI * r;
  }
}
// 两个 Shape 合并，area 和 circumference 都在
console.log("命名空间合并:", Shape.area(2).toFixed(2), Shape.circumference(2).toFixed(2));

// ===== 5. namespace vs ES Module —— 何时用哪个 =====
// namespace（内部模块）:
//   - 编译后是一个 IIFE + 全局对象，所有内容仍在同一个/全局作用域里「点」访问。
//   - 无需打包器即可在浏览器 <script> 直接跑；但不利于 Tree-Shaking、按需加载。
//   - 现代唯一常见正当用途：在【全局型 .d.ts 声明文件】里给全局库分组（如 jQuery 的 $）。
//
// ES Module（外部模块，import/export）:
//   - 一个文件就是一个模块，天然隔离作用域，支持按需导入、Tree-Shaking、打包优化。
//   - 是当今官方与生态一致推荐的方式。
//
// ✅ 结论：新项目一律用 ES Module；namespace 仅在维护老代码 / 写全局声明文件时才用。

export {};

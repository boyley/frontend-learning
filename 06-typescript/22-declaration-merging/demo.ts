/**
 * 22 · 声明合并（Declaration Merging）demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 22-declaration-merging/demo.ts`
 *
 * 本模块只聚焦一个主题：TS 允许【同名声明】自动合并成一个实体。
 * 这是 TS 为「给已有 JS 代码补类型」而设计的能力。
 *
 * 覆盖：接口+接口、接口+命名空间、函数+命名空间、枚举+命名空间、类+命名空间、
 *      以及 declare global 全局扩充（模块扩充的一种）。
 */

// ===== 1. 接口 + 接口：同名 interface 自动合并成员 =====
interface Box {
  height: number;
  width: number;
}
interface Box {
  scale: number; // 与上面的 Box 合并
}
// 现在 Box = { height, width, scale }，三者都必填
const box: Box = { height: 10, width: 20, scale: 2 };
console.log("接口合并:", box);

// ❌ 错误示范：合并的接口里同名属性类型必须一致
// interface Box { height: string; }  // 与上面 height: number 冲突 → 报错

// ===== 2. 接口 + 命名空间：给接口「挂载」相关的静态成员/子类型 =====
interface Config {
  url: string;
}
namespace Config {
  // 命名空间里 export 的东西会作为 Config 的「静态成员/子命名空间」
  export const DEFAULT_URL = "http://localhost";
  export function create(): Config {
    return { url: DEFAULT_URL };
  }
}
const cfg = Config.create(); // 既能当类型 Config，又能当值 Config.create
console.log("接口+命名空间:", cfg, Config.DEFAULT_URL);

// ===== 3. 函数 + 命名空间：给函数对象挂属性（JS 里极常见的模式）=====
function buildLabel(name: string): string {
  return buildLabel.prefix + name + buildLabel.suffix;
}
namespace buildLabel {
  export let prefix = "Hello, ";
  export let suffix = "!";
}
console.log("函数+命名空间(给函数挂属性):", buildLabel("Alice")); // Hello, Alice!

// ===== 4. 枚举 + 命名空间：给枚举扩展辅助方法 =====
enum Color {
  red = 1,
  green = 2,
  blue = 4,
}
namespace Color {
  export function mix(a: Color, b: Color): number {
    return a | b;
  }
}
console.log("枚举+命名空间:", Color.red, Color.mix(Color.red, Color.blue));

// ===== 5. 类 + 命名空间：给类添加「内部类 / 静态成员」=====
class Album {
  label!: Album.AlbumLabel; // 引用同名命名空间里的类型
}
namespace Album {
  export class AlbumLabel {
    constructor(public name: string) {}
  }
}
const album = new Album();
album.label = new Album.AlbumLabel("Sony");
console.log("类+命名空间(内部类):", album.label.name);

// ===== 6. declare global：从模块内部「扩充全局」（模块扩充的一种）=====
// 因为本文件末尾有 export，它是一个模块；模块里想改全局作用域必须用 declare global。
declare global {
  interface Number {
    // 给内置 Number 原型接口补一个方法的「类型声明」
    double(): number;
  }
}
// 类型声明只负责「告诉 TS 有这个方法」，真正的实现仍要自己写：
Number.prototype.double = function (this: number): number {
  return this.valueOf() * 2;
};
console.log("declare global 扩充内置类型:", (21).double()); // 42

// ❌ 关于「不能合并」的情况（了解即可）：
//   - 类不能和另一个「类」合并；
//   - 类不能和「变量」合并；
//   需要「类 + 额外能力」时改用 Mixins（见 26 模块）或 类+命名空间（本文件第 5 点）。

export {};

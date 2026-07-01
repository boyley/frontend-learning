/**
 * global-lib.d.ts —— 一个「全局式」声明文件（ambient declaration file）
 *
 * 特征：整个文件【没有顶层 import / export】，所以它是「全局脚本式」的 .d.ts，
 *       里面的 declare 会直接进入【全局作用域】，任何文件无需 import 即可使用。
 *
 * 场景：为一个「通过 <script> 标签注入、挂在全局对象上」的假想第三方库 MyLib 补类型。
 *       真实世界里，jQuery 的 $、老版 lodash 的 _ 就是这么被描述的。
 *
 * 关键点：.d.ts 里【只有类型声明、没有实现】——用 declare 表示「这东西在运行时已存在」。
 */

// 描述这个全局库的「静态形状」
interface MyLibStatic {
  readonly version: string;
  greet(name: string): string;
}

// declare var：告诉 TS 全局作用域里存在一个名为 MyLib 的变量（实现由运行时提供）
declare var MyLib: MyLibStatic;

// declare function：也可以直接声明全局函数
declare function trackEvent(name: string, payload?: Record<string, unknown>): void;

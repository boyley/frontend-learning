// main.js —— 入口模块，演示 import 按需引入
// 浏览器会根据 import 自动构建「依赖图」并按需加载 math.js，
// 完全不用我们手动维护 <script> 的先后顺序。

import describe, { add, multiply, PI } from './math.js';
//     ↑默认导出   ↑命名导出（用花括号）

console.log('✅ 用 ESM 导入成功');
console.log('add(2, 3) =', add(2, 3));        // 5
console.log('multiply(4, 5) =', multiply(4, 5)); // 20
console.log('PI =', PI);                        // 3.14159
console.log('describe() =', describe());        // math 模块 v1.0.0

// 关键点：math.js 内部的 VERSION 在这里访问不到 —— 模块作用域隔离了它，
// 不会像传统 <script> 那样污染全局。
console.log('window.VERSION =', window.VERSION); // undefined（没被污染）

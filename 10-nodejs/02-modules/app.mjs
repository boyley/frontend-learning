// ============================================================
// ESM（ECMAScript Modules）用法演示
// 运行方式：node app.mjs
// ============================================================

// import 是静态语法，必须写在文件顶层；命名导入用 {}，默认导入直接给名字。
import multiply, { add, sub, PI } from './math.mjs';

console.log('add(2, 3)      =', add(2, 3));      // 5
console.log('sub(9, 4)      =', sub(9, 4));      // 5
console.log('multiply(2, 3) =', multiply(2, 3)); // 6（默认导出）
console.log('PI             =', PI);

// 导入内置模块（ESM 下推荐用 node: 前缀）
import os from 'node:os';
console.log('系统平台：', os.platform());

// ESM 里没有 __dirname / __filename，要用 import.meta.url 自己换算：
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log('本文件：', __filename);
console.log('本目录：', __dirname);
// Node 20.11+ 也可以直接用 import.meta.dirname / import.meta.filename：
console.log('import.meta.dirname：', import.meta.dirname);

// 动态导入：import() 返回 Promise，可在任意位置按需加载（CommonJS 模块也能这样被 ESM 引入）
const path = await import('node:path');
console.log('动态导入 path.sep =', path.sep);

// ESM 特点：
// 1) import/export 是「静态」的，编译期就能确定依赖关系（利于打包工具做 tree-shaking）。
// 2) 默认支持「顶层 await」（本文件第 33 行就用了，无需包在 async 函数里）。
// 3) 想让 .js 文件走 ESM：在 package.json 写 "type": "module"。

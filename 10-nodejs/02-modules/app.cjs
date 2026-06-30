// ============================================================
// CommonJS 用法演示
// 运行方式：node app.cjs
// ============================================================

// require 是 CommonJS 的「同步」导入函数，返回模块的 module.exports 对象。
const math = require('./math.cjs');

// 还能直接「解构」拿到想要的部分
const { add, sub, PI } = require('./math.cjs');

console.log('add(2, 3) =', add(2, 3)); // 5
console.log('sub(9, 4) =', sub(9, 4)); // 5
console.log('PI =', PI);               // 3.14159

// require 内置模块用 node: 前缀更规范（也可省略前缀）
const os = require('node:os');
console.log('CPU 核心数：', os.cpus().length);

// CommonJS 特点：
// 1) require 是同步加载，加载时立即执行被引模块的全部代码。
// 2) 模块只在「第一次 require」时执行一次，之后命中缓存（require.cache）。
// 3) __dirname / __filename / module / exports / require 是模块包装器注入的，开箱即用。
console.log('本文件目录：', __dirname);

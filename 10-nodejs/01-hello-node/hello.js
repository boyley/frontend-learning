// ============================================================
// 01 · Hello Node —— 运行第一个 Node 程序、认识全局对象
// 运行方式：node hello.js
// ============================================================

// Node 不是浏览器，没有 window / document，但它有自己的一套「全局对象」。
// 下面逐个演示最常用的全局变量与全局函数。

// ① console：和浏览器一样，用于打印日志（底层其实是写到 stdout / stderr 流）
console.log('Hello, Node.js! 你好，Node。');

// ② globalThis：标准的全局对象（浏览器里是 window，Node 里就是 global）
//    用 globalThis 写跨平台代码最稳妥。
console.log('当前运行时的全局对象类型：', typeof globalThis); // object

// ③ __filename / __dirname：当前文件的绝对路径、当前文件所在目录
//    注意：这两个只在 CommonJS（.js）下可用，ESM（.mjs）里没有，需要用 import.meta.url。
console.log('当前文件路径 __filename：', __filename);
console.log('当前目录   __dirname ：', __dirname);

// ④ process：代表「当前 Node 进程」，是最重要的全局对象之一
console.log('Node 版本 process.version：', process.version);
console.log('运行平台 process.platform：', process.platform); // darwin / win32 / linux
console.log('命令行参数 process.argv：', process.argv);
//    process.argv 是个数组：[node可执行文件路径, 脚本路径, ...你传的参数]
//    试试：node hello.js 张三 18

// ⑤ 定时器：setTimeout / setInterval / setImmediate（全局函数，无需 import）
setTimeout(() => {
  console.log('⑤ 这行在「下一轮」事件循环才打印（延迟 0ms 也是异步）');
}, 0);

// ⑥ Node 18+ 内置了浏览器同款的 fetch、URL、TextEncoder 等 Web API
//    这里演示 URL（解析网址），fetch 在 07/08 模块再展开。
const u = new URL('https://nodejs.org/zh-cn/learn?topic=basics#start');
console.log('⑥ 用全局 URL 解析：host =', u.host, ', search =', u.search);

// ⑦ 同步代码先全部执行完，再轮到上面的 setTimeout 回调 —— 这就是「事件循环」
console.log('⑦ 同步代码到此结束（注意它比 ⑤ 先打印）');

// 小结：把本文件交给 node 执行，Node 会用 V8 引擎跑 JS，
//       并注入 console / process / require / 定时器 等「Node 全局对象」。

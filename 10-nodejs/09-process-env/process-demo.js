// ============================================================
// 09 · process 进程对象 —— 环境变量 / 命令行参数 / 进程控制
// 运行方式：
//   node process-demo.js 参数1 参数2
//   NODE_ENV=production PORT=8080 node process-demo.js 张三
// ============================================================

// process 是全局对象，无需 require，代表「当前 Node 进程」。

// ① 命令行参数 argv：数组 [node路径, 脚本路径, ...用户参数]
console.log('--- 命令行参数 process.argv ---');
console.log(process.argv);
const userArgs = process.argv.slice(2); // 去掉前两个，得到用户真正传的参数
console.log('用户参数：', userArgs);

// ② 环境变量 env：一个键值对对象，常用于区分环境、读密钥/端口
console.log('\n--- 环境变量 process.env ---');
console.log('NODE_ENV =', process.env.NODE_ENV || '(未设置)');
console.log('PORT     =', process.env.PORT || '(未设置，默认 3000)');
console.log('HOME/USERPROFILE =', process.env.HOME || process.env.USERPROFILE);
// 实战：const port = process.env.PORT || 3000;

// ③ 进程与运行环境信息
console.log('\n--- 运行环境信息 ---');
console.log('Node 版本 version ：', process.version);
console.log('平台 platform     ：', process.platform); // darwin/win32/linux
console.log('CPU 架构 arch     ：', process.arch);     // x64/arm64
console.log('进程 PID          ：', process.pid);
console.log('当前工作目录 cwd  ：', process.cwd());
console.log('已运行秒数 uptime ：', process.uptime().toFixed(3), 's');

// ④ 内存占用（排查内存泄漏时常看 heapUsed）
const mem = process.memoryUsage();
console.log('堆内存使用 heapUsed：', (mem.heapUsed / 1024 / 1024).toFixed(2), 'MB');

// ⑤ 标准输入输出流：process.stdout / stderr 是可写流；process.stdin 是可读流
//    console.log 本质就是写 process.stdout
process.stdout.write('⑤ 用 stdout.write 输出（末尾没有换行）');
process.stdout.write(' —— 接着上一行\n');

// ⑥ 进程事件：exit（即将退出）、beforeExit、未捕获异常等
process.on('exit', (code) => {
  // 注意：exit 回调里只能执行同步代码
  console.log(`\n⑥ 进程即将退出，退出码 = ${code}`);
});

// ⑦ 优雅退出：监听 Ctrl+C（SIGINT 信号），做清理后再退出
//    （本 demo 跑完就结束了，这段主要用于长驻服务）
process.on('SIGINT', () => {
  console.log('\n收到 Ctrl+C，清理资源后退出...');
  process.exit(0); // 0 表示正常退出，非 0 表示异常
});

// ⑧ nextTick：把回调安排在「当前操作完成后、事件循环继续前」执行（优先级最高的异步）
process.nextTick(() => {
  console.log('\n⑧ process.nextTick 的回调（比 setTimeout 还早执行）');
});

console.log('\n（同步代码结束，nextTick 与 exit 回调随后触发）');

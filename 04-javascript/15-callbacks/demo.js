// 15 · 回调函数（Callbacks）demo
// 本文件聚焦：回调概念、同步回调 vs 异步回调、setTimeout、
//             回调地狱 callback hell、错误优先回调 error-first
// 既能在浏览器运行（index.html 引入），也能 `node demo.js` 直接运行

'use strict';

// 收集所有输出，最后统一打印到页面 + 控制台
const lines = [];
function log(...args) {
  const text = args
    .map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)))
    .join(' ');
  lines.push(text);
  console.log(text);
  flushToPage(); // 异步日志也能及时刷新到页面
}

// ============================================================
// 一、什么是回调：把「函数」当参数传给另一个函数，由后者择机调用
// ============================================================
log('===== 一、回调的概念 =====');

// greet 接收一个 callback，在合适时机调用它
function greet(name, callback) {
  const message = '你好, ' + name;
  callback(message); // 「回调」就是这一步：把控制权交还给调用者传入的函数
}
greet('小明', function (msg) {
  log('回调收到:', msg);
});

// ============================================================
// 二、同步回调：在当前函数内「立即」被调用，顺序可预测
// ============================================================
log('\n===== 二、同步回调 =====');

// 数组的 forEach/map 都是同步回调，循环过程中立刻执行
[1, 2, 3].forEach(function (n) {
  log('同步回调 forEach:', n);
});
log('forEach 之后才执行这一行'); // 一定在上面三条之后

// ============================================================
// 三、异步回调：交给「稍后」执行，先跳过、不阻塞
// ============================================================
log('\n===== 三、异步回调（setTimeout）=====');

log('① 同步：开始');
// setTimeout 把回调登记到「任务队列」，等同步代码全跑完、调用栈清空后才执行
setTimeout(function () {
  log('③ 异步：1 秒后的 setTimeout 回调（最后才出现）');
}, 1000);
// 即便延时设为 0，也排在所有同步代码之后
setTimeout(function () {
  log('④ 异步：延时 0 的回调也排在同步代码之后');
}, 0);
log('② 同步：结束（注意它在 ③④ 之前打印）');

// ============================================================
// 四、回调地狱 callback hell：异步串联导致层层嵌套
// ============================================================
log('\n===== 四、回调地狱（演示问题）=====');

// 模拟一个异步操作：延时后回调返回结果
function fakeAsync(step, callback) {
  setTimeout(function () {
    callback('完成步骤 ' + step);
  }, 300);
}

// 当多个异步必须按顺序执行时，回调不断向右缩进，形成「金字塔」难以维护
fakeAsync(1, function (r1) {
  log(r1);
  fakeAsync(2, function (r2) {
    log(r2);
    fakeAsync(3, function (r3) {
      log(r3);
      log('↑ 这种层层嵌套就是回调地狱：可读性差、错误处理重复、难以扩展');
      log('   现代方案：用 Promise 链式 .then() 或 async/await 拉平（后续模块讲）');
    });
  });
});

// ============================================================
// 五、错误优先回调 error-first（Node.js 约定）
// ============================================================
log('\n===== 五、错误优先回调 error-first =====');

// Node 风格：回调第一个参数永远是 error，成功则为 null，数据放第二个参数
function readConfig(name, callback) {
  setTimeout(function () {
    if (!name) {
      callback(new Error('缺少配置名'), null); // 出错：第一个参数传 error
    } else {
      callback(null, { name: name, value: 42 }); // 成功：error 传 null，数据在第二位
    }
  }, 200);
}

// 调用方先判断 err，再用 data —— 这是 Node 回调的固定套路
readConfig('app', function (err, data) {
  if (err) {
    log('读取失败:', err.message);
    return;
  }
  log('读取成功:', data);
});
readConfig('', function (err, data) {
  if (err) {
    log('读取失败:', err.message); // 这条会触发
    return;
  }
  log('读取成功:', data);
});

// ============================================================
// 输出到页面（仅浏览器环境执行，保证 node 也能跑）
// ============================================================
function flushToPage() {
  if (typeof document !== 'undefined') {
    const pre = document.getElementById('output');
    if (pre) pre.textContent = lines.join('\n');
  }
}

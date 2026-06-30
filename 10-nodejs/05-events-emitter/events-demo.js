// ============================================================
// 05 · 事件发射器 EventEmitter —— Node 的「发布/订阅」核心
// 运行方式：node events-demo.js
// ============================================================

// Node 大量内置对象（HTTP server、stream、process）都继承自 EventEmitter，
// 用「监听事件 + 触发事件」的方式解耦逻辑。
const EventEmitter = require('node:events');

// ① 直接 new 一个发射器
const bus = new EventEmitter();

// ② on / addListener：订阅事件（可注册多个监听器，按注册顺序触发）
bus.on('order', (id, amount) => {
  console.log(`[库存] 收到订单 ${id}，扣减库存，金额 ¥${amount}`);
});
bus.on('order', (id) => {
  console.log(`[短信] 给用户发送订单 ${id} 确认短信`);
});

// ③ once：只触发一次的监听器（触发后自动移除）
bus.once('order', (id) => {
  console.log(`[日志] 仅第一单记录埋点（once）：${id}`);
});

// ④ emit：触发事件，后面的参数原样传给所有监听器
console.log('--- 第一次下单 ---');
bus.emit('order', 1001, 99); // 三个监听器都触发
console.log('--- 第二次下单 ---');
bus.emit('order', 1002, 50); // once 的那个不再触发

// ⑤ 移除监听器
function onPing() {
  console.log('pong');
}
bus.on('ping', onPing);
bus.off('ping', onPing); // = removeListener
bus.emit('ping');         // 无输出（已移除）

// ⑥ 特殊的 'error' 事件：如果 emit('error') 时没有任何监听器，进程会直接崩溃抛错！
//    所以业务中务必给 EventEmitter 加上 error 监听。
bus.on('error', (err) => {
  console.log('捕获到错误事件：', err.message);
});
bus.emit('error', new Error('something wrong'));

// ⑦ 用「继承」封装自己的事件类（更贴近真实项目写法）
class Downloader extends EventEmitter {
  start(url) {
    this.emit('start', url);
    // 模拟分块下载进度
    let p = 0;
    const timer = setInterval(() => {
      p += 50;
      this.emit('progress', p);
      if (p >= 100) {
        clearInterval(timer);
        this.emit('done', url);
      }
    }, 100);
  }
}

const d = new Downloader();
d.on('start', (url) => console.log(`\n[下载] 开始：${url}`));
d.on('progress', (p) => console.log(`[下载] 进度：${p}%`));
d.on('done', (url) => console.log(`[下载] 完成：${url}`));
d.start('https://nodejs.org/file.zip');

// 小结：EventEmitter = 观察者模式的 Node 实现。
//   on 订阅、once 订阅一次、emit 触发、off 取消。务必监听 'error' 事件。

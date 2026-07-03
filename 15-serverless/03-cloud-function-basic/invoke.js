/**
 * 本地「调用器」——模拟云平台的运行时（Runtime）。
 * ---------------------------------------------------------------
 * 真实世界里，是 AWS Lambda / 阿里云 FC 的 Runtime 在做这件事：
 *   1. 加载你的 handler.js（首次加载 = 冷启动）
 *   2. 构造 event / context
 *   3. 调用 handler(event, context)
 *   4. 拿到返回值，序列化后返回给触发方
 *
 * 我们把这个过程用几十行 Node 代码「演」出来，方便本地零成本体验。
 * 运行：  node invoke.js
 *        node invoke.js 张三      ← 传一个 name 进去
 */

const { handler } = require('./handler');
const crypto = require('crypto');

async function runtime() {
  // ① 造一个「事件对象」——真实中由触发源（HTTP 网关 / 定时器 / 消息队列）生成
  const event = {
    name: process.argv[2] || 'Serverless', // 命令行第一个参数当 name
    source: 'local-invoke',
  };

  // ② 造一个「上下文」——真实中由平台注入
  const context = {
    requestId: crypto.randomUUID(),   // 每次调用唯一 ID
    functionName: 'cloud-function-basic',
    memoryLimitInMB: 128,
    getRemainingTimeInMillis: () => 3000, // 剩余可执行时间
  };

  console.log('=== 运行时开始调用 handler ===');
  const result = await handler(event, context); // ③ 调用你的函数
  console.log('=== handler 返回 ===');
  console.log(JSON.stringify(result, null, 2)); // ④ 输出结果
}

runtime();

/**
 * 03 · 云函数入门 —— 一个最小的 handler（处理函数）
 * ---------------------------------------------------------------
 * 这是所有 FaaS（AWS Lambda / 阿里云 FC / 腾讯云 SCF）的通用心智模型：
 *   你不写 server，不写 app.listen()，只导出一个「函数」。
 *   平台在「事件」到来时，帮你把这个函数拉起来并调用它。
 *
 * handler 的通用签名（以 Node.js 为例）：
 *   exports.handler = async (event, context) => { ... }
 *   - event   ：触发这次调用的「事件对象」（谁、带了什么数据来触发我）
 *   - context ：本次运行的「上下文」（请求 ID、剩余超时时间、内存限制等，由平台注入）
 *   - 返回值  ：函数的输出（会被平台序列化后返回给触发方）
 *
 * 关键点：函数是「无状态」的——不要依赖上一次调用留下的全局变量，
 *         因为平台随时可能销毁/新建执行环境（见 02 冷启动）。
 */

// exports.handler 是绝大多数云平台默认约定的入口名（可在配置里改）
exports.handler = async (event, context) => {
  // 1) 从事件里取数据。这里我们约定事件带一个 name 字段
  const name = (event && event.name) || 'Serverless';

  // 2) context 由平台注入，包含本次调用的元信息
  //    （本地模拟里我们自己造了一个 context，真实平台字段更多）
  console.log('[handler] 收到事件 event =', JSON.stringify(event));
  console.log('[handler] 本次请求 requestId =', context.requestId);

  // 3) 业务逻辑：这里只是拼个问候语
  const message = `Hello, ${name}! —— 来自云函数`;

  // 4) return 的东西就是函数输出，平台会把它交还给触发者
  return {
    message,
    at: new Date().toISOString(),
    invokedBy: context.requestId,
  };
};

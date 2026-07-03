/**
 * 05 · Serverless Framework 的函数实现
 * ---------------------------------------------------------------
 * 每个导出的函数，对应 serverless.yml 里 functions.*.handler 指向的名字。
 * 结构与 04 相同（AWS proxy 契约），因为 Framework 底层就是 Lambda。
 *
 * 可用命令（装了 serverless 后）：
 *   serverless invoke local --function hello           # 本地跑一次
 *   serverless offline                                  # 本地起网关
 *   serverless deploy                                   # 部署到云（需云账号凭证）
 */

// GET /hello
exports.hello = async (event) => {
  const name =
    (event.queryStringParameters && event.queryStringParameters.name) || 'world';
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ message: `Hello from Serverless Framework, ${name}!` }),
  };
};

// POST /echo
exports.echo = async (event) => {
  const payload = event.body ? JSON.parse(event.body) : {};
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ youSent: payload, stage: process.env.STAGE }),
  };
};

// 定时触发的函数：没有 HTTP 概念，event 是定时器事件，无需返回 HTTP 结构
exports.cron = async (event) => {
  console.log('[cron] 被定时触发，时间：', new Date().toISOString());
  // 定时任务通常做后台工作（清理、报表、同步），不需要返回给谁
  return { done: true };
};

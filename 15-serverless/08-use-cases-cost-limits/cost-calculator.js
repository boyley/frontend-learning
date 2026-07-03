/**
 * 08 · Serverless 计费模型计算器（以 AWS Lambda 定价模型为例）
 * ---------------------------------------------------------------
 * FaaS 计费两部分（对照 https://aws.amazon.com/lambda/pricing/）：
 *   1) 请求数：按调用次数计费
 *   2) 计算时长：按 GB-秒 计费 = 分配内存(GB) × 运行时长(秒) × 次数
 * 关键直觉：内存翻倍 → 单价翻倍（但 CPU 也翻倍，可能更快跑完，反而更省）。
 * 没有请求时缩容到零 → 0 调用 = 0 费用（传统服务器空转也要付钱）。
 *
 * 运行： node cost-calculator.js
 *        node cost-calculator.js 5000000 200 512   ← 次数 时长ms 内存MB
 */

// AWS 公开的按量单价（us-east-1，示意值，实际以官网为准）
const PRICE_PER_REQUEST = 0.20 / 1_000_000; // 每 100 万次请求 $0.20
const PRICE_PER_GB_SECOND = 0.0000166667;   // 每 GB-秒
// 免费额度（每月）
const FREE_REQUESTS = 1_000_000;
const FREE_GB_SECONDS = 400_000;

function estimate({ invocations, avgDurationMs, memoryMB }) {
  const memGB = memoryMB / 1024;
  const durationSec = avgDurationMs / 1000;

  // 计算资源消耗
  const totalGBSeconds = memGB * durationSec * invocations;

  // 扣除免费额度后的计费量
  const billableRequests = Math.max(0, invocations - FREE_REQUESTS);
  const billableGBSeconds = Math.max(0, totalGBSeconds - FREE_GB_SECONDS);

  const requestCost = billableRequests * PRICE_PER_REQUEST;
  const computeCost = billableGBSeconds * PRICE_PER_GB_SECOND;
  const total = requestCost + computeCost;

  return { totalGBSeconds, requestCost, computeCost, total };
}

// 支持命令行传参，否则用默认场景
const invocations = Number(process.argv[2]) || 3_000_000; // 300 万次/月
const avgDurationMs = Number(process.argv[3]) || 150;     // 平均 150ms
const memoryMB = Number(process.argv[4]) || 256;          // 分配 256MB

const r = estimate({ invocations, avgDurationMs, memoryMB });

console.log('=== Serverless 月度费用估算（AWS Lambda 模型）===');
console.log(`调用次数     : ${invocations.toLocaleString()} 次/月`);
console.log(`平均时长     : ${avgDurationMs} ms`);
console.log(`分配内存     : ${memoryMB} MB`);
console.log('---------------------------------------------');
console.log(`总 GB-秒     : ${r.totalGBSeconds.toFixed(0)}（免费额度 ${FREE_GB_SECONDS}）`);
console.log(`请求费用     : $${r.requestCost.toFixed(4)}`);
console.log(`计算费用     : $${r.computeCost.toFixed(4)}`);
console.log(`预计月账单   : $${r.total.toFixed(4)}`);
console.log('---------------------------------------------');
console.log('提示：无请求时缩容到零 → 该时段 0 费用。高频常驻负载可能比包月服务器更贵。');

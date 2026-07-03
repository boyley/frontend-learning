'use strict';

/**
 * 限流 / 熔断 / 降级 demo（纯 Node 零依赖）。
 *
 * Part 1：令牌桶限流 —— 对一串高频请求，打印哪些通过、哪些被拒。
 * Part 2：熔断 + 降级 —— 包裹一个「前几次故意失败」的下游，
 *         打印状态从 Closed → Open →（等待）→ Half-Open → Closed 的全过程。
 *
 * 运行：node demo.js
 */

const { TokenBucket } = require('./token-bucket');
const { CircuitBreaker } = require('./circuit-breaker');

const t0 = Date.now();
const log = (msg) => {
  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[t=${sec}s] ${msg}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ============ Part 1：令牌桶限流 ============
async function demoRateLimit() {
  log('========== Part 1：令牌桶限流 ==========');
  // 桶容量 5、每秒补 2 个令牌：允许一开始突发 5 个，之后稳定 2 个/秒
  const bucket = new TokenBucket({ capacity: 5, refillRate: 2 });
  log('限流器：capacity=5, refillRate=2/s（初始满 5 个令牌）');

  // 瞬间打 8 个请求：前 5 个能用光初始令牌，后 3 个被拒
  log('--- 瞬间打来 8 个请求 ---');
  for (let i = 1; i <= 8; i++) {
    const pass = bucket.tryRemove();
    log(`请求#${i}: ${pass ? '✅ 通过' : '❌ 被限流拒绝'}（剩余令牌≈${bucket.remaining()}）`);
  }

  // 等 1.5s，按 2/s 的速率大约补回 3 个令牌
  log('--- 等待 1.5s 让令牌补充 ---');
  await sleep(1500);

  log('--- 再打来 4 个请求 ---');
  for (let i = 9; i <= 12; i++) {
    const pass = bucket.tryRemove();
    log(`请求#${i}: ${pass ? '✅ 通过' : '❌ 被限流拒绝'}（剩余令牌≈${bucket.remaining()}）`);
  }
}

// ============ Part 2：熔断 + 降级 ============

/**
 * 造一个「前 N 次调用必失败，之后恢复正常」的下游。
 * 用来观察熔断器从跳闸到恢复的全过程。
 */
function makeFlakyDownstream(failFirst) {
  let count = 0;
  return async function callDownstream() {
    count += 1;
    if (count <= failFirst) {
      throw new Error(`下游第 ${count} 次调用失败`);
    }
    return `下游正常响应（第 ${count} 次）`;
  };
}

async function demoCircuitBreaker() {
  log('\n========== Part 2：熔断 + 降级 ==========');

  const breaker = new CircuitBreaker({
    failureThreshold: 3,   // 连续失败 3 次跳闸
    resetTimeout: 2000,    // Open 后 2s 才允许试探
    onState: (from, to) => log(`🔌 熔断状态变化：${from} → ${to}`),
  });

  // 前 4 次必失败，第 5 次起恢复正常
  const downstream = makeFlakyDownstream(4);
  const fallback = (reason) => `【降级兜底】(原因: ${reason})`;

  // 连打 10 次，每次间隔 0.6s，观察状态流转
  for (let i = 1; i <= 10; i++) {
    const result = await breaker.call(downstream, fallback);
    log(`调用#${i} [state=${breaker.state}] → ${result}`);
    await sleep(600);

    // 在第 4 次之后 Open 会持续 2s，这里额外多等一会，让它进入 Half-Open
    if (i === 5) {
      log('--- 等待 reset timeout（2s）让熔断进入 Half-Open 试探 ---');
      await sleep(1600);
    }
  }
}

async function main() {
  await demoRateLimit();
  await demoCircuitBreaker();
  log('\n========== demo 结束 ==========');
}

main();

'use strict';

/**
 * 服务注册与发现 demo（纯 Node 零依赖）。
 *
 * 剧情：
 *  1. 两个 user-service 实例（A、B）启动并注册，各自定时发心跳。
 *  2. 一个消费者 order-service 查注册表拿到实例列表，用轮询（round-robin）轮流调用。
 *  3. 实例 B 停止心跳，被注册表自动剔除。
 *  4. 消费者再查，只剩实例 A，之后只会调用 A。
 *
 * 运行：node demo.js
 */

const { ServiceRegistry } = require('./registry');

// ---- 小工具：带时间戳的日志 & 睡眠 ----
const t0 = Date.now();
const log = (msg) => {
  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[t=${sec}s] ${msg}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 模拟一个「会自注册 + 定时心跳」的服务实例。
 * @returns 一个 stopHeartbeat 函数，调用后停止心跳（模拟实例挂掉）。
 */
function startInstance(registry, serviceName, instanceId, address) {
  registry.register(serviceName, instanceId, address);
  log(`✅ 实例 ${instanceId}(${address}) 已注册到 [${serviceName}]`);

  // 每 1.5s 发一次心跳续约（心跳间隔 < TTL 才安全）
  const timer = setInterval(() => {
    const ok = registry.heartbeat(serviceName, instanceId);
    if (ok) log(`💓 ${instanceId} 心跳续约`);
  }, 1500);
  if (timer.unref) timer.unref();

  return () => clearInterval(timer);
}

/**
 * 模拟消费者：查表拿实例，用轮询指针挑一个来调用。
 */
function makeConsumer(registry, serviceName) {
  let rr = 0; // round-robin 轮询指针
  return function callOnce() {
    const instances = registry.getInstances(serviceName); // 只拿「活着」的
    if (instances.length === 0) {
      log(`⚠️  消费者：[${serviceName}] 无可用实例，调用失败`);
      return;
    }
    const target = instances[rr % instances.length];
    rr++;
    log(`➡️  消费者：查到 ${instances.length} 个实例 [${instances.join(', ')}]，本次轮询调用 → ${target}`);
  };
}

async function main() {
  // TTL 4s：超过 4s 没心跳就剔除；后台每 0.5s 扫描一次。
  const registry = new ServiceRegistry({
    ttl: 4000,
    sweepInterval: 500,
    onEvict: (svc, id) => log(`❌ 注册表：实例 ${id} 心跳超时（TTL 到期），从 [${svc}] 剔除`),
  });

  log('=== 阶段 1：两个实例注册并开始心跳 ===');
  const stopA = startInstance(registry, 'user-service', 'A', '10.0.0.1:8080');
  const stopB = startInstance(registry, 'user-service', 'B', '10.0.0.2:8080');

  const consumer = makeConsumer(registry, 'user-service');

  log('\n=== 阶段 2：消费者轮询调用（应在 A、B 之间来回）===');
  for (let i = 0; i < 4; i++) {
    await sleep(800);
    consumer();
  }

  log('\n=== 阶段 3：实例 B 停止心跳（模拟宕机）===');
  stopB();
  log('🛑 实例 B 停止发送心跳，等待 TTL 超时被剔除…');

  // 等 B 的 TTL（4s）过去 + 一点扫描余量
  await sleep(5000);

  log('\n=== 阶段 4：B 已被剔除，消费者只应调用 A ===');
  for (let i = 0; i < 3; i++) {
    await sleep(800);
    consumer();
  }

  // 清理
  stopA();
  registry.stop();
  log('\n=== demo 结束 ===');
}

main();

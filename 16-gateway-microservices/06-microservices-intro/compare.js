'use strict';

/**
 * 单体 vs 微服务 —— 用「同一个电商下单流程」跑两遍，直观对比两种架构。
 * 纯 Node 零依赖，运行：node compare.js
 *
 * 一个下单请求需要三步：校验用户 → 扣库存 → 创建订单。
 *
 *  · 单体（Monolith）：三步都是「同一个进程内的本地函数调用」——快、简单、强一致，
 *    但任何一步的代码/依赖变更都要整体重新部署；一处内存泄漏/崩溃拖垮全部。
 *
 *  · 微服务（Microservices）：三步分属 user / inventory / order 三个独立服务，
 *    靠「网络调用」协作——可独立部署、独立扩容、故障隔离，但引入了网络延迟、
 *    部分失败（partial failure）、以及跨服务的数据一致性问题。
 *
 * 本 demo 不起真实端口，用「带随机网络延迟 + 可能失败」的异步函数模拟远程调用，
 * 把两种架构在「延迟」「故障隔离」上的差别打印出来。
 */

const t0 = Date.now();
const log = (msg) => console.log(`[t=${((Date.now() - t0) / 1000).toFixed(2)}s] ${msg}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ============================================================
// A. 单体：三个「模块」是同进程本地函数，调用几乎零成本
// ============================================================
const monolith = {
  validateUser(userId) {
    // 本地调用：同进程内存操作，纳秒级
    if (!userId) throw new Error('用户不存在');
    return { userId, ok: true };
  },
  reduceStock(sku, qty) {
    if (qty > 10) throw new Error('库存不足');
    return { sku, left: 10 - qty };
  },
  createOrder(userId, sku, qty) {
    return { orderId: 'ORD-' + Math.floor(Math.random() * 10000), userId, sku, qty };
  },
  // 一个进程内把三步串起来：强一致（要么一起成功），无网络开销
  placeOrder(userId, sku, qty) {
    this.validateUser(userId);
    this.reduceStock(sku, qty);
    return this.createOrder(userId, sku, qty);
  },
};

// ============================================================
// B. 微服务：三个服务是「远程」的，用带延迟/可能失败的异步调用模拟
// ============================================================
// 模拟一次跨网络的 RPC/HTTP 调用：有网络延迟，且下游可能宕机
function remoteCall(serviceName, fn, { downMs = 0 } = {}) {
  return async (...args) => {
    const latency = 15 + Math.floor(Math.random() * 25); // 15~40ms 网络往返
    await sleep(latency);
    if (downMs && Date.now() - t0 < downMs) {
      // 该服务此刻「宕机」——微服务里这叫「部分失败 partial failure」
      throw new Error(`调用 ${serviceName} 失败：连接被拒绝（服务不可用）`);
    }
    log(`  ↳ 远程调用 ${serviceName}（网络往返 ${latency}ms）`);
    return fn(...args);
  };
}

async function microservicePlaceOrder(userSvc, invSvc, orderSvc, userId, sku, qty) {
  // 每一步都是一次真实的网络调用，延迟累加，任一步可能因下游宕机而失败
  await userSvc(userId);
  await invSvc(sku, qty);
  return orderSvc(userId, sku, qty);
}

// ============================================================
// 演示
// ============================================================
async function main() {
  console.log('======== A. 单体架构：三步本地调用 ========');
  const s = Date.now();
  const r1 = monolith.placeOrder('u-1', 'iphone', 2);
  console.log(`下单成功：${JSON.stringify(r1)}`);
  console.log(`耗时：${Date.now() - s}ms（同进程本地调用，几乎无延迟、强一致）\n`);

  console.log('======== B. 微服务架构：三步远程调用（正常）========');
  const userSvc = remoteCall('user-service', monolith.validateUser.bind(monolith));
  const invSvc = remoteCall('inventory-service', monolith.reduceStock.bind(monolith));
  const orderSvc = remoteCall('order-service', monolith.createOrder.bind(monolith));

  const s2 = Date.now();
  const r2 = await microservicePlaceOrder(userSvc, invSvc, orderSvc, 'u-1', 'iphone', 2);
  console.log(`下单成功：${JSON.stringify(r2)}`);
  console.log(`耗时：${Date.now() - s2}ms（三次网络往返累加，比单体慢，但每个服务可独立扩容/部署）\n`);

  console.log('======== C. 微服务的「故障隔离 vs 部分失败」========');
  // 让 inventory-service 在前 120ms 内「宕机」，观察下单如何失败——但 user/order 服务本身没挂
  const invDown = remoteCall('inventory-service', monolith.reduceStock.bind(monolith), { downMs: 120 });
  try {
    await microservicePlaceOrder(userSvc, invDown, orderSvc, 'u-1', 'iphone', 2);
  } catch (e) {
    console.log(`下单失败：${e.message}`);
    console.log('→ 关键点：只有 inventory-service 挂了，user/order 服务照常运行（故障被隔离）。');
    console.log('  但这次下单是「部分失败」：用户已校验通过、订单没建成——需要重试/补偿/最终一致来兜底。');
  }

  console.log('\n======== 结论 ========');
  console.log('单体：简单、快、强一致；代价是「一起部署、一起扩容、一处崩全崩」。');
  console.log('微服务：可独立部署/扩容、故障隔离；代价是「网络延迟、部分失败、分布式数据一致性」。');
  console.log('别一上来就微服务——先单体，遇到团队/扩展瓶颈再按业务边界拆（避免过度设计）。');
}

main();

'use strict';

/**
 * 消息队列（Message Queue）核心机制 demo —— 纯 Node 零依赖。
 * 手写一个极简的内存 Broker，演示消息队列解决的三件事：
 *   1) 解耦 + 异步：生产者发完就返回，不等消费者处理（下单快速响应）
 *   2) 削峰：瞬时涌入大量消息进队列排队，消费者按自己的速率慢慢消费
 *   3) 可靠投递：ack 确认 + 失败重试 + 死信队列（DLQ）+ 消费幂等
 *
 * 场景：用户下单后，要「发短信」和「加积分」。
 *   同步做：下单接口要等短信、积分都完成才返回（慢、耦合、任一挂了下单就失败）。
 *   用 MQ：下单只往队列丢一条 "order.created" 事件就立刻返回；
 *          短信服务、积分服务作为消费者各自异步处理（pub-sub，一条消息多方订阅）。
 *
 * 运行：node demo.js
 */

const t0 = Date.now();
const log = (msg) => console.log(`[t=${((Date.now() - t0) / 1000).toFixed(2)}s] ${msg}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 极简消息 Broker（发布订阅 + 手动 ack + 重试 + 死信）。
 * 每个 topic 一条队列，多个订阅者各有独立的消费进度（类似 Kafka 的消费组）。
 */
class Broker {
  constructor({ maxRetries = 2 } = {}) {
    this.queues = new Map();     // topic -> [{ id, payload, attempts }]
    this.subscribers = new Map(); // topic -> [ { name, handler } ]
    this.dlq = [];               // 死信队列：重试仍失败的消息
    this.maxRetries = maxRetries;
    this.seq = 0;
  }

  subscribe(topic, name, handler) {
    if (!this.subscribers.has(topic)) this.subscribers.set(topic, []);
    this.subscribers.get(topic).push({ name, handler });
  }

  // 生产者发布：只是把消息塞进队列就立刻返回（异步、解耦）
  publish(topic, payload) {
    if (!this.queues.has(topic)) this.queues.set(topic, []);
    const msg = { id: ++this.seq, topic, payload, attempts: 0 };
    this.queues.get(topic).push(msg);
    return msg.id; // 立即返回，不等消费
  }

  queued(topic) { return (this.queues.get(topic) || []).length; }

  // 消费者循环：从队列取一条，投递给所有订阅者；失败则重试，超限进死信
  async startConsuming(topic, ratePerMsg = 300) {
    const q = this.queues.get(topic) || [];
    const subs = this.subscribers.get(topic) || [];
    while (q.length > 0) {
      const msg = q.shift();
      msg.attempts++;
      await sleep(ratePerMsg); // 消费者按自己的速率处理（削峰的关键：慢慢消化）
      for (const sub of subs) {
        try {
          await sub.handler(msg.payload, msg);
          // handler 正常返回 = ack（确认消费成功）
        } catch (e) {
          log(`  ✗ [${sub.name}] 处理消息#${msg.id} 失败（第 ${msg.attempts} 次）：${e.message}`);
          if (msg.attempts <= this.maxRetries) {
            log(`  ↻ 消息#${msg.id} 重新入队等待重试`);
            q.push(msg); // 未 ack → 重新入队重试
          } else {
            log(`  ☠ 消息#${msg.id} 重试超限，进入死信队列 DLQ`);
            this.dlq.push(msg);
          }
        }
      }
    }
  }
}

async function main() {
  const broker = new Broker({ maxRetries: 2 });

  // ---- 消费者 1：短信服务（幂等：同一订单只发一次）----
  const sentSms = new Set();
  broker.subscribe('order.created', 'sms-service', async (order) => {
    if (sentSms.has(order.id)) { // 幂等去重：重试导致的重复消费要挡住
      log(`  · [sms] 订单 ${order.id} 已发过短信，幂等跳过`);
      return;
    }
    sentSms.add(order.id);
    log(`  ✓ [sms] 给订单 ${order.id} 发送短信通知`);
  });

  // ---- 消费者 2：积分服务（故意让某个订单前两次失败，演示重试 + DLQ）----
  const failCount = new Map();
  broker.subscribe('order.created', 'points-service', async (order) => {
    if (order.id === 'ORD-3') {
      const n = (failCount.get(order.id) || 0) + 1;
      failCount.set(order.id, n);
      throw new Error('积分服务下游数据库超时');
    }
    log(`  ✓ [points] 给订单 ${order.id} 增加积分`);
  });

  // ======== 阶段 1：生产者瞬间下 5 单（削峰）========
  log('======== 生产者：瞬间涌入 5 个下单事件 ========');
  const s = Date.now();
  for (let i = 1; i <= 5; i++) {
    const id = broker.publish('order.created', { id: `ORD-${i}`, amount: 100 * i });
    log(`下单 ORD-${i} → 已投递消息#${id}，接口立即返回（不等短信/积分）`);
  }
  log(`5 个下单接口全部返回，耗时 ${Date.now() - s}ms（发完即走，异步解耦）`);
  log(`当前队列积压：${broker.queued('order.created')} 条，交给消费者慢慢削峰\n`);

  // ======== 阶段 2：消费者按自己节奏异步消费 ========
  log('======== 消费者：按 300ms/条 的速率异步处理（削峰 + 重试 + 死信）========');
  await broker.startConsuming('order.created', 300);

  // ======== 阶段 3：结果 ========
  log('\n======== 结果 ========');
  log(`死信队列 DLQ 中的消息：${broker.dlq.map((m) => `#${m.id}(${m.payload.id})`).join(', ') || '无'}`);
  log('ORD-3 的积分处理重试 2 次仍失败 → 进 DLQ，需人工/补偿处理；其余订单正常。');
  log('全程下单接口从不被短信/积分拖慢，也不会因它们失败而下单失败——这就是 MQ 的解耦价值。');
}

main();

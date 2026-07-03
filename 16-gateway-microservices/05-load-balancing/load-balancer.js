'use strict';

/**
 * 负载均衡四种算法 demo（纯 Node 零依赖）。
 *
 * 演示：
 *   1) RoundRobin          轮询          —— 各节点命中次数应几乎相等
 *   2) WeightedRoundRobin  平滑加权轮询   —— 命中次数应≈权重比例，且不扎堆
 *   3) LeastConnections    最少连接       —— 请求总是流向当前最闲的节点
 *   4) ConsistentHash      一致性哈希     —— 删一个节点后，只有约 1/N 的 key 迁移，
 *                                          并与普通 hash % N 的重映射比例并排对比
 *
 * 运行：node load-balancer.js
 */

// ---- 一个简单稳定的 32 位哈希（FNV-1a）：把字符串映射到 0 ~ 2³²-1 ----
function fnv1a(str) {
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    // h *= 16777619，用位运算保证 32 位无符号
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

// ============ 1. 轮询 Round Robin ============
class RoundRobin {
  constructor(nodes) {
    this.nodes = nodes; // ['A','B','C']
    this.i = 0;         // 游标
  }
  next() {
    const node = this.nodes[this.i % this.nodes.length];
    this.i++; // 每来一个请求游标 +1，取模回绕
    return node;
  }
}

// ============ 2. 平滑加权轮询 Smooth Weighted Round Robin ============
// Nginx 用的算法：既保证按权重比例分配，又让命中尽量分散（不连续扎堆同一台）。
class WeightedRoundRobin {
  constructor(weights) {
    // weights = { A: 3, B: 2, C: 1 }
    this.items = Object.entries(weights).map(([node, weight]) => ({
      node,
      weight,          // 配置权重（静态）
      current: 0,      // 当前权重（动态，每轮变化）
    }));
    this.total = this.items.reduce((s, it) => s + it.weight, 0);
  }
  next() {
    // 每个节点 current += weight；挑 current 最大的那台命中；命中者 current -= total
    let best = null;
    for (const it of this.items) {
      it.current += it.weight;
      if (best === null || it.current > best.current) best = it;
    }
    best.current -= this.total;
    return best.node;
  }
}

// ============ 3. 最少连接 Least Connections ============
class LeastConnections {
  constructor(nodes) {
    // 记录每台的在途连接数
    this.conns = new Map(nodes.map((n) => [n, 0]));
  }
  // 选连接数最少的节点，并把它的连接数 +1（表示这次请求占用一个连接）
  acquire() {
    let best = null;
    let min = Infinity;
    for (const [node, c] of this.conns) {
      if (c < min) { min = c; best = node; }
    }
    this.conns.set(best, min + 1);
    return best;
  }
  // 请求处理完，释放一个连接
  release(node) {
    this.conns.set(node, Math.max(0, this.conns.get(node) - 1));
  }
  snapshot() {
    return [...this.conns.entries()].map(([n, c]) => `${n}:${c}`).join(' ');
  }
}

// ============ 4. 一致性哈希 Consistent Hashing（含虚拟节点）============
class ConsistentHash {
  constructor(nodes, vnodes = 150) {
    this.vnodes = vnodes;    // 每个真实节点在环上放多少个虚拟节点
    this.ring = [];          // [{ hash, node }] 按 hash 升序排列，即「哈希环」
    for (const n of nodes) this._add(n);
    this._sort();
  }
  _add(node) {
    for (let i = 0; i < this.vnodes; i++) {
      this.ring.push({ hash: fnv1a(`${node}#${i}`), node });
    }
  }
  _sort() { this.ring.sort((a, b) => a.hash - b.hash); }

  addNode(node) { this._add(node); this._sort(); }
  removeNode(node) {
    this.ring = this.ring.filter((e) => e.node !== node);
  }

  // 给一个 key，顺时针找到环上第一个 hash >= key 的虚拟节点；绕过尾部则回到第一个（成环）
  getNode(key) {
    const h = fnv1a(key);
    // 二分查找第一个 hash >= h
    let lo = 0, hi = this.ring.length - 1, ans = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (this.ring[mid].hash >= h) { ans = mid; hi = mid - 1; }
      else lo = mid + 1;
    }
    if (lo >= this.ring.length) ans = 0; // 绕回环首
    return this.ring[ans].node;
  }
}

// ============ 演示脚本 ============
const nodes = ['A', 'B', 'C'];
const N = 6000; // 请求 / key 数量

function tally() { return { A: 0, B: 0, C: 0 }; }
function fmt(count) {
  return Object.entries(count).map(([k, v]) => `${k}=${v}`).join('  ');
}

console.log('======== 1. 轮询 Round Robin ========');
{
  const lb = new RoundRobin(nodes);
  const count = tally();
  for (let i = 0; i < N; i++) count[lb.next()]++;
  console.log(`分发 ${N} 个请求 → ${fmt(count)}（应几乎相等）`);
}

console.log('\n======== 2. 平滑加权轮询 Weighted RR（A:B:C = 3:2:1）========');
{
  const lb = new WeightedRoundRobin({ A: 3, B: 2, C: 1 });
  const count = tally();
  for (let i = 0; i < N; i++) count[lb.next()]++;
  console.log(`分发 ${N} 个请求 → ${fmt(count)}（应≈ 3000:2000:1000）`);
  // 展示前 12 次的实际命中序列，观察「平滑」：不是 AAABBС 而是交错分布
  const lb2 = new WeightedRoundRobin({ A: 3, B: 2, C: 1 });
  const seq = [];
  for (let i = 0; i < 12; i++) seq.push(lb2.next());
  console.log(`前 12 次命中序列：${seq.join(' ')}（交错分布，不扎堆）`);
}

console.log('\n======== 3. 最少连接 Least Connections ========');
{
  const lb = new LeastConnections(nodes);
  const count = tally();
  // 模拟：每次挑最闲的发一个请求，然后随机释放一些已有连接（模拟请求处理时长不一）
  for (let i = 0; i < 18; i++) {
    const node = lb.acquire();
    count[node]++;
    // 随机释放一台的连接（模拟某些请求处理完了）
    if (Math.random() < 0.5) lb.release(nodes[Math.floor(Math.random() * nodes.length)]);
    if (i < 9) console.log(`请求#${i + 1} → ${node}    在途连接: ${lb.snapshot()}`);
  }
  console.log(`累计命中：${fmt(count)}（请求总流向当前最闲的节点）`);
}

console.log('\n======== 4. 一致性哈希 vs 普通取模（删一个节点后的重映射比例）========');
{
  const keys = Array.from({ length: N }, (_, i) => `key-${i}`);

  // ---- 4a. 一致性哈希 ----
  const ch = new ConsistentHash(nodes, 150);
  const before = new Map(keys.map((k) => [k, ch.getNode(k)]));
  // 统计分布
  const dist = tally();
  for (const n of before.values()) dist[n]++;
  console.log(`一致性哈希分布：${fmt(dist)}（靠虚拟节点才均匀）`);

  ch.removeNode('C'); // 删掉节点 C
  let chMoved = 0;
  for (const k of keys) {
    const now = ch.getNode(k);
    if (now !== before.get(k)) chMoved++;
  }

  // ---- 4b. 普通取模 hash % N ----
  const idx = ['A', 'B', 'C'];
  const idx2 = ['A', 'B']; // 删掉 C 后
  let modMoved = 0;
  for (const k of keys) {
    const beforeNode = idx[fnv1a(k) % 3];
    const afterNode = idx2[fnv1a(k) % 2];
    if (beforeNode !== afterNode) modMoved++;
  }

  const pct = (x) => ((x / N) * 100).toFixed(1) + '%';
  console.log(`\n删除节点 C 后，${N} 个 key 中「归属改变」的比例：`);
  console.log(`  一致性哈希：${chMoved} 个迁移 → ${pct(chMoved)}（理论≈ 1/3，只动了 C 那段 key）`);
  console.log(`  普通 hash%N：${modMoved} 个迁移 → ${pct(modMoved)}（分母 3→2，几乎全变 = 缓存雪崩）`);
}

console.log('\n======== demo 结束 ========');

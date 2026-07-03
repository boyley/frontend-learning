/**
 * 08a · N+1 问题 与 DataLoader（批量 + 缓存）
 * -------------------------------------------------------------------
 * GraphQL 的嵌套查询天生容易踩「N+1」：查 1 个列表（1 次） + 对列表里每个元素
 * 各查一次关联数据（N 次） = N+1 次数据库/接口调用。
 *
 * DataLoader 的两招（对照 github.com/graphql/dataloader）：
 *   ① Batching：把「同一个事件循环 tick 内」收集到的所有 key 合并成一次批量查询
 *   ② Caching ：同一个请求生命周期内，同一个 key 只查一次（memoize）
 *
 * 本文件「零依赖」手写一个迷你 DataLoader，暴露它的内部机制，并对比开/关它的调用次数。
 * 运行：node 08-subscription-caching-n1/demo.mjs   （无需 npm install）
 */

// ===== 模拟数据源，统计被「打了几次」 =====
const usersDB = { u1: { id: 'u1', name: '小明' }, u2: { id: 'u2', name: '小红' } };
let dbHits = 0;

// 单条查询（N+1 里就是它被调 N 次）
function getUserById(id) { dbHits++; return usersDB[id]; }

// 批量查询：一次拿多个 id（DataLoader 的批处理函数就长这样）
function batchGetUsers(ids) {
  dbHits++; // 无论多少 id，只算「一次」批量往返
  return ids.map((id) => usersDB[id]);
}

const posts = [
  { id: 'p1', authorId: 'u1' }, { id: 'p2', authorId: 'u1' },
  { id: 'p3', authorId: 'u2' }, { id: 'p4', authorId: 'u1' },
];

// ===== 迷你 DataLoader：揭示「攒一批、下一 tick 一次性查、结果按 key 缓存」=====
class MiniDataLoader {
  constructor(batchFn) {
    this.batchFn = batchFn;
    this.cache = new Map();   // key -> Promise，实现同 key 只查一次
    this.queue = [];          // 本 tick 内攒下的 { key, resolve }
  }
  load(key) {
    if (this.cache.has(key)) return this.cache.get(key); // 命中缓存，0 查询
    const promise = new Promise((resolve) => {
      this.queue.push({ key, resolve });
      if (this.queue.length === 1) {
        // 关键：用微任务把「本 tick 内所有 load」推迟到 tick 末尾，合并成一次批处理
        queueMicrotask(() => this.dispatch());
      }
    });
    this.cache.set(key, promise);
    return promise;
  }
  dispatch() {
    const batch = this.queue;
    this.queue = [];
    const keys = batch.map((b) => b.key);
    const results = this.batchFn(keys); // ← 一次批量查询
    batch.forEach((b, i) => b.resolve(results[i]));
  }
}

// ---- ① 不用 DataLoader：每篇文章各查一次作者 → N+1 ----
dbHits = 0;
await Promise.all(posts.map((p) => Promise.resolve(getUserById(p.authorId))));
console.log('① 朴素解析器（无 DataLoader）:');
console.log(`   文章数 = ${posts.length}，作者查询次数 = ${dbHits} 次（1 次列表之外的 N 次单查 = N+1 的 N）`);
console.log('   注意 u1 被重复查了 3 次，完全是浪费。\n');

// ---- ② 用 DataLoader：并发 load 被合并成 1 次批量查询，重复 key 走缓存 ----
dbHits = 0;
const loader = new MiniDataLoader(batchGetUsers);
const authors = await Promise.all(posts.map((p) => loader.load(p.authorId)));
console.log('② 加上 DataLoader:');
console.log(`   文章数 = ${posts.length}，批量查询次数 = ${dbHits} 次（4 篇文章的作者被合并成 1 次）`);
console.log('   去重后的作者：', authors.map((u) => u.name).join(', '));
console.log('   —— 请求内相同 authorId 只入队一次（u1 三篇文章共用一条缓存）。\n');

console.log('要点：DataLoader = 批处理(把一 tick 内的 key 合并) + 请求级缓存(同 key 只查一次)。');
console.log('     它挂在 GraphQL 的 context 上，每个请求 new 一个，避免跨请求脏缓存。');

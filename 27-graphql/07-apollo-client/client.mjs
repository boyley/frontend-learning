/**
 * 07 · Apollo Client 的灵魂：规范化缓存（Normalized InMemoryCache）
 * -------------------------------------------------------------------
 * Apollo Client 不只是「发请求」——@apollo/client 里最有价值的是 InMemoryCache：
 * 它把返回的对象按 `__typename:id` 拆成一张「扁平的规范化表」，
 * 于是 ①同一个对象在多处查询中共享一份内存 ②一处更新，处处自动更新
 * ③相同查询默认走缓存（cache-first）不再发网络请求。
 *
 * 本文件用「零依赖」纯 JS 手写一个迷你版 InMemoryCache，跑一遍归一化 / 读取 /
 * 缓存命中 / 局部更新，讲清 Apollo 缓存的工作原理。真实 API 见同目录 index.html。
 * 运行：node 07-apollo-client/client.mjs   （无需启动服务、无需 npm install）
 */

// ===== 迷你规范化缓存 =====
class MiniInMemoryCache {
  constructor() {
    this.store = new Map();      // key: "User:u1" -> 扁平对象（引用字段存成 { __ref }）
    this.queryCache = new Map(); // key: 查询指纹 -> 结果（含 __ref 指针），用于 cache-first
  }

  identify(obj) { return `${obj.__typename}:${obj.id}`; } // Apollo 的缓存主键规则

  // 归一化写入：把嵌套对象拆平，嵌套对象替换成 { __ref: "Type:id" } 指针
  write(obj) {
    if (Array.isArray(obj)) return obj.map((o) => this.write(o));
    if (obj && obj.__typename && obj.id != null) {
      const key = this.identify(obj);
      const flat = { ...(this.store.get(key) || {}) }; // 已存在则「合并」→ 跨查询共享同一条
      for (const [k, v] of Object.entries(obj)) {
        flat[k] = (v && typeof v === 'object') ? this.write(v) : v;
      }
      this.store.set(key, flat);
      return { __ref: key }; // 上层只持有指针，不复制数据
    }
    return obj;
  }

  // 读取：顺着 { __ref } 指针把对象重新拼出来（用 ancestors 防止环）
  read(ref, ancestors = new Set()) {
    if (Array.isArray(ref)) return ref.map((r) => this.read(r, ancestors));
    if (ref && ref.__ref) {
      if (ancestors.has(ref.__ref)) return { __ref: ref.__ref }; // 遇到环则停
      const flat = this.store.get(ref.__ref);
      const next = new Set(ancestors).add(ref.__ref);
      const obj = {};
      for (const [k, v] of Object.entries(flat)) {
        obj[k] = (v && (v.__ref || Array.isArray(v))) ? this.read(v, next) : v;
      }
      return obj;
    }
    return ref;
  }
}

// ===== 模拟服务端返回：一个文章列表，两篇文章共享同一个作者 u1 =====
let networkCalls = 0;
async function fetchPosts() {
  networkCalls++;
  return [
    { __typename: 'Post', id: 'p1', title: 'GraphQL',       author: { __typename: 'User', id: 'u1', name: '小明' } },
    { __typename: 'Post', id: 'p2', title: 'Apollo Client', author: { __typename: 'User', id: 'u1', name: '小明' } }, // 同一个作者
    { __typename: 'Post', id: 'p3', title: 'DataLoader',    author: { __typename: 'User', id: 'u2', name: '小红' } },
  ];
}

const cache = new MiniInMemoryCache();

// ① 第一次查询：cache-first 缓存没有 → 发网络 → 写入并归一化
console.log('① 首次查询（cache-first：缓存没有 → 发网络）');
const rootRefs = cache.write(await fetchPosts());
cache.queryCache.set('Posts', rootRefs);
console.log('   网络请求次数 =', networkCalls);

console.log('\n② 缓存被「拆平」成的规范化表（注意 User:u1 只存了一份，被 p1/p2 共享）：');
for (const [k, v] of cache.store) console.log('   ', k, '=>', JSON.stringify(v));

// ③ 再次执行同一查询：cache-first 命中，不发网络
console.log('\n③ 再次执行同一查询（cache-first：命中缓存 → 0 网络）');
const cached = cache.read(cache.queryCache.get('Posts'));
console.log('   网络请求次数 =', networkCalls, '（没变，直接读缓存）');
console.log('   读回：', JSON.stringify(cached.map((p) => ({ title: p.title, author: p.author.name }))));

// ④ 局部更新：只改 User:u1.name，p1/p2 因共享同一条记录一起变
console.log('\n④ writeFragment 更新 User:u1 的 name = "小明(改)"');
cache.write({ __typename: 'User', id: 'u1', name: '小明(改)' });
const after = cache.read(cache.queryCache.get('Posts'));
console.log('   p1.author.name =', after[0].author.name);
console.log('   p2.author.name =', after[1].author.name, '  ← 一处改，处处变（归一化缓存的威力）');
console.log('   p3.author.name =', after[2].author.name, '  ← u2 不受影响');

console.log('\n要点：Apollo Client = GraphQL 请求 + 规范化缓存。缓存按 __typename:id 归一，');
console.log('     所以列表与详情共享同一份对象，mutation 返回带 id 的最新对象即可自动刷新 UI。');

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
    this.store = new Map();      // key: "User:1" -> 扁平对象（引用类型的字段存成 { __ref })
    this.queryCache = new Map(); // key: 查询指纹 -> 根引用，用于 cache-first 命中
  }

  // identify：Apollo 用 __typename + id 生成缓存主键
  identify(obj) { return `${obj.__typename}:${obj.id}`; }

  // 归一化写入：递归把嵌套对象拆平，嵌套对象替换成 { __ref: "Type:id" } 指针
  write(obj) {
    if (Array.isArray(obj)) return obj.map((o) => this.write(o));
    if (obj && obj.__typename && obj.id != null) {
      const key = this.identify(obj);
      const flat = { ...(this.store.get(key) || {}) }; // 已存在则做「合并」，实现跨查询共享
      for (const [k, v] of Object.entries(obj)) {
        flat[k] = (v && typeof v === 'object') ? this.write(v) : v;
      }
      this.store.set(key, flat);
      return { __ref: key }; // 上层只持有指针，不复制数据
    }
    return obj;
  }

  // 读取：遇到 { __ref } 就顺着指针把对象「重新拼」出来
  read(ref) {
    if (Array.isArray(ref)) return ref.map((r) => this.read(r));
    if (ref && ref.__ref) {
      const flat = this.store.get(ref.__ref);
      const obj = {};
      for (const [k, v] of Object.entries(flat)) {
        obj[k] = (v && (v.__ref || Array.isArray(v))) ? this.read(v) : v;
      }
      return obj;
    }
    return ref;
  }
}

// ===== 模拟服务端返回 =====
let networkCalls = 0;
async function fetchUserWithPosts() {
  networkCalls++;
  return {
    __typename: 'User', id: '1', name: '小明',
    posts: [
      { __typename: 'Post', id: 'p1', title: 'GraphQL', author: { __typename: 'User', id: '1', name: '小明' } },
      { __typename: 'Post', id: 'p2', title: 'Apollo Client', author: { __typename: 'User', id: '1', name: '小明' } },
    ],
  };
}

const cache = new MiniInMemoryCache();

// ① 第一次查询：发网络 → 写入并归一化
console.log('① 首次查询（cache-first：缓存没有 → 发网络）');
const rootRef = cache.write(await fetchUserWithPosts());
cache.queryCache.set('UserWithPosts', rootRef);
console.log('   网络请求次数 =', networkCalls);

console.log('\n② 缓存里被「拆平」成的规范化表（注意 User:1 只存了一份！）：');
for (const [k, v] of cache.store) console.log('   ', k, '=>', JSON.stringify(v));

// ③ 再次执行同一查询：cache-first 命中，不发网络
console.log('\n③ 再次执行同一查询（cache-first：命中缓存 → 0 网络）');
const cached = cache.read(cache.queryCache.get('UserWithPosts'));
console.log('   网络请求次数 =', networkCalls, '（没变，直接读缓存）');
console.log('   读回结果：', JSON.stringify({ name: cached.name, posts: cached.posts.map((p) => p.title) }));

// ④ 局部更新：只改 User:1.name，两篇文章的 author 因为共享同一条记录，一起变
console.log('\n④ writeFragment 更新 User:1 的 name = "小明(改)"');
cache.write({ __typename: 'User', id: '1', name: '小明(改)' });
const after = cache.read(cache.queryCache.get('UserWithPosts'));
console.log('   posts[0].author.name =', after.posts[0].author.name);
console.log('   posts[1].author.name =', after.posts[1].author.name, '  ← 一处改，处处变（这就是归一化缓存的威力）');

console.log('\n要点：Apollo Client = GraphQL 请求 + 规范化缓存。缓存按 __typename:id 归一，');
console.log('     所以列表与详情共享同一份对象，mutation 返回带 id 的最新对象即可自动刷新 UI。');

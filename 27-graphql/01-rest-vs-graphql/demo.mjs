/**
 * 01 · REST vs GraphQL —— 用一份数据对比 over-fetching / under-fetching
 * -------------------------------------------------------------------
 * 场景：渲染「用户主页」需要以下数据：
 *   - 用户昵称 name
 *   - 该用户所有文章的标题 title
 *   - 每篇文章的评论数量 commentCount
 *
 * 本文件不依赖网络：用纯函数模拟 REST 端点，用 graphql 库真跑一次 GraphQL 查询，
 * 直接打印「往返次数 / 传输字段量」的差异。运行：node 01-rest-vs-graphql/demo.mjs
 */
import { buildSchema, graphql } from 'graphql';

// ===== 0. 后端数据（数据库里的原始记录，字段很全）=====
const db = {
  users: [{ id: '1', name: '小明', email: 'ming@x.com', avatar: 'a.png', bio: '很长的一段自我介绍……', address: '北京' }],
  posts: [
    { id: 'p1', userId: '1', title: 'GraphQL 入门', body: '正文很长很长……', cover: 'c1.png', createdAt: '2026-01-01' },
    { id: 'p2', userId: '1', title: 'Schema 设计', body: '正文很长很长……', cover: 'c2.png', createdAt: '2026-02-01' },
  ],
  comments: [
    { id: 'c1', postId: 'p1', text: '好文' }, { id: 'c2', postId: 'p1', text: '学到了' },
    { id: 'c3', postId: 'p2', text: '赞' },
  ],
};

// ===== 1. REST 方式：多个「资源端点」，各自返回「整条资源」=====
let restRoundTrips = 0;   // 网络往返次数
let restFieldsSent = 0;   // 服务端实际吐出的字段总数（越大 = over-fetching 越严重）
const countFields = (obj) => { restFieldsSent += Object.keys(obj).length; return obj; };

const REST = {
  getUser: (id) => { restRoundTrips++; return countFields(db.users.find(u => u.id === id)); },
  getPostsByUser: (id) => { restRoundTrips++; return db.posts.filter(p => p.userId === id).map(countFields); },
  getCommentsByPost: (pid) => { restRoundTrips++; return db.comments.filter(c => c.postId === pid).map(countFields); },
};

console.log('===== REST 方式 =====');
const user = REST.getUser('1');                    // ① 拿用户（返回 email/avatar/bio/address… 全都用不上 → over-fetching）
const posts = REST.getPostsByUser('1');            // ② 拿文章（返回 body/cover… 也用不上 → over-fetching）
for (const p of posts) {                            // ③ REST 没有「评论数」端点，只能逐篇取评论再自己数 → under-fetching / N+1
  p.commentCount = REST.getCommentsByPost(p.id).length;
}
console.log('结果：', { name: user.name, posts: posts.map(p => ({ title: p.title, commentCount: p.commentCount })) });
console.log(`往返次数 = ${restRoundTrips} 次（1 用户 + 1 文章列表 + ${posts.length} 篇评论 = N+2）`);
console.log(`服务端吐出字段总量 = ${restFieldsSent}（含大量前端用不到的 email/body/cover…= over-fetching）\n`);

// ===== 2. GraphQL 方式：一个 endpoint，客户端「声明」要什么字段 =====
const schema = buildSchema(`
  type User { id: ID!  name: String!  posts: [Post!]! }
  type Post { id: ID!  title: String!  commentCount: Int! }
  type Query { user(id: ID!): User }
`);
// resolver：只在被「查询到的字段」上执行，用不到的字段（email/body）根本不会计算/传输
const root = {
  user: ({ id }) => {
    const u = db.users.find(x => x.id === id);
    return {
      ...u,
      posts: () => db.posts.filter(p => p.userId === id).map(p => ({
        ...p,
        commentCount: () => db.comments.filter(c => c.postId === p.id).length,
      })),
    };
  },
};
// 前端只声明它要渲染的 3 个字段，一次请求全部拿到
const query = `
  query UserProfile {
    user(id: "1") {
      name
      posts { title commentCount }
    }
  }`;
const res = await graphql({ schema, source: query, rootValue: root });

console.log('===== GraphQL 方式 =====');
console.log('结果：', JSON.stringify(res.data, null, 0));
console.log('往返次数 = 1 次（一个 endpoint，一次请求拿到嵌套数据 → 解决 under-fetching）');
console.log('传输字段 = 精确匹配查询里声明的字段（name/title/commentCount）→ 解决 over-fetching');
console.log('\n结论：REST 端点形状固定 → 要么多传(over) 要么多次请求(under)；GraphQL 由客户端声明 → 一次拿到、不多不少。');

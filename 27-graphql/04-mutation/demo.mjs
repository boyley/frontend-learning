/**
 * 04 · 变更 Mutation（写操作）
 * -------------------------------------------------------------------
 * Query 负责「读」，Mutation 负责「写」（增删改）。约定（对照 graphql.org/learn/queries/#mutations）：
 *   - 写操作放在根类型 Mutation 下
 *   - 复杂入参用 input 类型（输入对象）承载
 *   - Mutation 也有返回值：通常返回「被修改后的对象」，让客户端一次拿到最新状态
 *   - 顶层 Mutation 字段「串行」执行（Query 的字段可并行），避免写-写竞态
 * 运行：node 04-mutation/demo.mjs
 */
import { buildSchema, graphql } from 'graphql';

const schema = buildSchema(`
  type Post { id: ID!  title: String!  likes: Int! }

  "输入对象类型：承载创建文章所需字段"
  input CreatePostInput { title: String! }

  type Query { posts: [Post!]! }

  type Mutation {
    createPost(input: CreatePostInput!): Post!   # 增：返回新建的 Post
    likePost(id: ID!): Post!                      # 改：点赞 +1，返回最新 Post
    deletePost(id: ID!): Boolean!                 # 删：返回是否成功
  }
`);

// 内存「数据库」
let seq = 1;
const store = new Map([['p1', { id: 'p1', title: 'GraphQL 入门', likes: 0 }]]);

const root = {
  posts: () => [...store.values()],
  createPost: ({ input }) => {
    const post = { id: 'p' + ++seq, title: input.title, likes: 0 };
    store.set(post.id, post);
    return post;
  },
  likePost: ({ id }) => {
    const post = store.get(id);
    if (!post) throw new Error(`文章 ${id} 不存在`);
    post.likes++;
    return post;
  },
  deletePost: ({ id }) => store.delete(id),
};

// ---- 执行一组变更 ----
const mutation = `
  mutation Demo($t: String!) {
    created: createPost(input: { title: $t }) { id title likes }
    liked:   likePost(id: "p1") { id likes }
    liked2:  likePost(id: "p1") { id likes }
    removed: deletePost(id: "p1")
  }`;

console.log('执行前 posts：', [...store.values()]);
const res = await graphql({ schema, source: mutation, rootValue: root, variableValues: { t: '新文章' } });
console.log('\nMutation 返回（每个字段都拿到了写操作后的最新对象）：');
console.log(JSON.stringify(res.data, null, 2));

// 再查一次确认状态已改变
const after = await graphql({ schema, source: `{ posts { id title likes } }`, rootValue: root });
console.log('\n执行后 posts（p1 已删除，新增 p2）：', JSON.stringify(after.data));
console.log('\n要点：① 写操作走 Mutation；② 顶层 Mutation 字段串行执行（created→liked→liked2→removed 顺序确定）；③ 返回最新对象省一次查询。');

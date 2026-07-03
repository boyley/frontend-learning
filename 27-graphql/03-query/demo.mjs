/**
 * 03 · 查询 Query（字段 / 参数 / 别名 / 片段 / 变量 / 操作名）
 * -------------------------------------------------------------------
 * GraphQL 查询语言的核心构件（对照 graphql.org/learn/queries）：
 *   - 字段 Fields：要什么写什么，支持嵌套
 *   - 参数 Arguments：给字段传参，如 post(id: "p1")
 *   - 别名 Aliases：给同名字段起不同名字，一次查两遍
 *   - 片段 Fragments：复用一组字段
 *   - 变量 Variables：把参数从查询里抽出来（$id），配合 variableValues 传入
 *   - 操作名 Operation name：query GetPost { ... } 便于调试与缓存
 * 运行：node 03-query/demo.mjs
 */
import { buildSchema, graphql } from 'graphql';

const schema = buildSchema(`
  type Post { id: ID!  title: String!  views: Int! }
  type Query { post(id: ID!): Post }
`);
const posts = {
  p1: { id: 'p1', title: 'GraphQL 入门', views: 100 },
  p2: { id: 'p2', title: 'Schema 设计', views: 42 },
};
const root = { post: ({ id }) => posts[id] };

// ---- (1) 基本字段 + 参数 Arguments ----
console.log('① 字段 + 参数：');
console.log(JSON.stringify((await graphql({ schema, source: `{ post(id: "p1") { title views } }`, rootValue: root })).data), '\n');

// ---- (2) 别名 Aliases：同一个 post 字段查两次，用别名区分 ----
console.log('② 别名 Aliases（一次请求查两篇文章）：');
const aliasQuery = `
  {
    first:  post(id: "p1") { title }
    second: post(id: "p2") { title }
  }`;
console.log(JSON.stringify((await graphql({ schema, source: aliasQuery, rootValue: root })).data), '\n');

// ---- (3) 片段 Fragments：抽出公共字段集合，多处复用 ----
console.log('③ 片段 Fragments（复用字段集合）：');
const fragQuery = `
  {
    a: post(id: "p1") { ...postFields }
    b: post(id: "p2") { ...postFields }
  }
  fragment postFields on Post { id title views }`;
console.log(JSON.stringify((await graphql({ schema, source: fragQuery, rootValue: root })).data), '\n');

// ---- (4) 变量 Variables + 操作名 Operation name ----
console.log('④ 变量 Variables + 操作名（生产环境标准写法）：');
const varQuery = `
  query GetPost($id: ID!) {   # 操作名 GetPost；声明变量 $id 类型 ID!
    post(id: $id) { title views }
  }`;
const res = await graphql({
  schema,
  source: varQuery,
  rootValue: root,
  variableValues: { id: 'p2' },   // 变量值单独传入，查询文本可被复用/缓存
});
console.log(JSON.stringify(res.data));
console.log('\n要点：变量让「查询结构」与「具体入参」分离——同一条查询文本可缓存、可预编译，只换 variableValues。');

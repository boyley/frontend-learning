/**
 * 06 · Apollo Server —— Node 客户端（用 graphql-request 打真实 HTTP 请求）
 * -------------------------------------------------------------------
 * 前提：先在另一个终端启动服务 → npm run 06 （node 06-apollo-server/server.mjs）
 * 然后运行本文件： npm run 06:client
 *
 * graphql-request 是最轻量的 GraphQL HTTP 客户端：一个函数把「查询字符串 + 变量」
 * POST 到 endpoint，拿回 data。它没有缓存（缓存看 07 章 Apollo Client）。
 */
import { GraphQLClient, gql } from 'graphql-request';

const endpoint = 'http://localhost:4000/';
const client = new GraphQLClient(endpoint);

// ---- 1. 查询：只要 title（声明式，服务端不会多传 author 以外的东西）----
const LIST = gql`
  query ListBooks {
    books { id title author }
  }
`;

// ---- 2. 变更：新增一本书，用变量传参 ----
const ADD = gql`
  mutation AddBook($title: String!, $author: String!) {
    addBook(title: $title, author: $author) { id title author }
  }
`;

try {
  console.log('① 查询现有书籍：');
  console.log(JSON.stringify(await client.request(LIST), null, 2));

  console.log('\n② 执行 Mutation 新增一本书：');
  const added = await client.request(ADD, { title: '深入 GraphQL', author: '小明' });
  console.log(JSON.stringify(added, null, 2));

  console.log('\n③ 再查一次，确认已写入：');
  console.log(JSON.stringify(await client.request(LIST), null, 2));
} catch (err) {
  console.error('请求失败 —— 请确认已先运行 `npm run 06` 启动服务：\n', err.message);
}

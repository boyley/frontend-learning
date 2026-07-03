/**
 * 06 · Apollo Server（服务端最小实现，可运行）
 * -------------------------------------------------------------------
 * 使用 Apollo Server v5 的 startStandaloneServer 起一个真实的 GraphQL HTTP 服务。
 * 启动后：
 *   - 浏览器打开 http://localhost:4000 会进入 Apollo Sandbox（内置 GraphiQL 式 IDE）
 *   - 客户端 POST http://localhost:4000 即可查询/变更（见 client.mjs 与 index.html）
 * 运行：node 06-apollo-server/server.mjs   （或 npm run 06）
 */
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// ===== 1. typeDefs：用 SDL 定义 Schema（#graphql 注释让编辑器高亮）=====
const typeDefs = `#graphql
  type Book {
    id: ID!
    title: String!
    author: String!
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
  }

  type Mutation {
    addBook(title: String!, author: String!): Book!
  }
`;

// ===== 2. 数据源（这里用内存数组；真实项目换成数据库/微服务）=====
let seq = 2;
const books = [
  { id: '1', title: 'GraphQL in Action', author: 'Samer Buna' },
  { id: '2', title: 'Production Ready GraphQL', author: 'Marc-André Giroux' },
];

// ===== 3. resolvers：字段 → 数据。键名必须与 Schema 里的类型/字段一一对应 =====
const resolvers = {
  Query: {
    books: () => books,
    book: (_parent, { id }) => books.find((b) => b.id === id),
  },
  Mutation: {
    addBook: (_parent, { title, author }) => {
      const book = { id: String(++seq), title, author };
      books.push(book);
      return book;
    },
  },
};

// ===== 4. 创建并启动服务 =====
const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });

console.log(`🚀 GraphQL 服务已启动：${url}`);
console.log('   浏览器打开该地址进入 Apollo Sandbox；或运行 npm run 06:client 用 Node 客户端查询。');

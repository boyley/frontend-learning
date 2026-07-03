/**
 * 05 · 解析器 Resolver（执行原理）
 * -------------------------------------------------------------------
 * Resolver 是「字段 → 数据」的函数。执行引擎从根类型出发，逐字段调用 resolver，
 * 沿查询树深度优先展开，把每层返回值作为下一层的 parent。
 *
 * 每个 resolver 签名固定为四个参数（对照 graphql.org/learn/execution）：
 *   resolver(parent, args, context, info)
 *     - parent  ：上一层字段的返回值（根字段的 parent 是 rootValue）
 *     - args    ：该字段的参数对象
 *     - context ：整个请求共享的对象（放 db 连接 / 当前登录用户 / DataLoader）
 *     - info    ：AST/路径等执行元信息
 * 本 demo 用 graphql-js 的「按类型」resolver 写法，并打印调用顺序观察执行流。
 * 运行：node 05-resolver/demo.mjs
 */
import { graphql, GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull } from 'graphql';

const db = {
  users: [{ id: '1', name: '小明' }],
  posts: [{ id: 'p1', authorId: '1', title: 'GraphQL' }, { id: 'p2', authorId: '1', title: 'Resolver' }],
};

let step = 0;
const trace = (msg) => console.log(`  [${++step}] ${msg}`);

// Post 类型：title 字段用「默认 resolver」（直接取 parent.title）；author 字段自定义 resolver
const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLString) },
    title: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (parent) => { trace(`Post.title  resolver, parent=${parent.id} → "${parent.title}"`); return parent.title; },
    },
    author: {
      type: UserType,
      // parent 是 Post 对象；根据 authorId 关联到 User
      resolve: (parent, args, context) => {
        trace(`Post.author resolver, parent=${parent.id} 用 context.db 查 author`);
        return context.db.users.find(u => u.id === parent.authorId);
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLString) },
    name: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (parent) => { trace(`User.name   resolver, parent=${parent.id} → "${parent.name}"`); return parent.name; },
    },
    posts: {
      type: GraphQLList(PostType),
      resolve: (parent, args, context) => {
        trace(`User.posts  resolver, parent=${parent.id} 查该用户的文章`);
        return context.db.posts.filter(p => p.authorId === parent.id);
      },
    },
  }),
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    me: {
      type: UserType,
      resolve: (parent, args, context) => { trace(`Query.me    resolver（根字段，parent=rootValue）`); return context.db.users[0]; },
    },
  },
});

const schema = new GraphQLSchema({ query: QueryType });

const query = `
  query {
    me {
      name
      posts {
        title
        author { name }
      }
    }
  }`;

console.log('执行查询，观察 resolver 的调用顺序（深度优先，逐字段展开）：\n');
const res = await graphql({ schema, source: query, contextValue: { db } });
console.log('\n最终结果：');
console.log(JSON.stringify(res.data, null, 2));
console.log('\n注意：author 被查了 2 次（每篇文章一次）——这正是 N+1 的雏形，见 08 章用 DataLoader 解决。');

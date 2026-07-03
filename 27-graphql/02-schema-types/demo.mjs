/**
 * 02 · Schema 与类型系统（Type System / SDL）
 * -------------------------------------------------------------------
 * 核心思想：GraphQL 服务由一份「强类型 Schema」定义能力边界。
 * Schema 用 SDL（Schema Definition Language）书写，包含：
 *   - 标量类型 Scalar：Int / Float / String / Boolean / ID
 *   - 对象类型 Object type（自定义，如 User / Post）
 *   - 枚举 enum、接口 interface、联合 union、输入 input
 *   - 修饰符：!（非空 Non-Null）、[]（列表 List）
 *   - 三个「根类型」：Query（读）/ Mutation（写）/ Subscription（订阅）
 * 运行：node 02-schema-types/demo.mjs
 */
import { buildSchema, graphql, printSchema, GraphQLSchema } from 'graphql';

// ===== 用 SDL 定义 Schema =====
const sdl = `
  "文章状态枚举：只能取这几个值"
  enum PostStatus { DRAFT PUBLISHED ARCHIVED }

  "对象类型：一篇文章。ID! 表示非空标识符；[Tag!]! 表示非空列表且元素非空"
  type Post {
    id: ID!                 # ! = Non-Null，一定有值
    title: String!
    status: PostStatus!     # 枚举类型
    views: Int              # 可空（无 ! ），可能返回 null
    tags: [String!]!        # 列表：外层 ! 列表本身非空，内层 ! 元素非空
  }

  "对象类型：用户，含一个带参数的字段 posts(status)"
  type User {
    id: ID!
    name: String!
    posts(status: PostStatus): [Post!]!
  }

  "根类型 Query：所有『读』操作的入口"
  type Query {
    me: User!
    post(id: ID!): Post     # 参数 id 非空；返回值可空（找不到就 null）
  }
`;

// buildSchema 把 SDL 文本编译成可执行的 GraphQLSchema 对象
const schema = buildSchema(sdl);
console.log('schema 是 GraphQLSchema 实例？', schema instanceof GraphQLSchema, '\n');

// ===== printSchema：把编译后的 Schema 再打印回标准 SDL（含内省信息）=====
console.log('===== 服务端对外公开的类型系统（printSchema）=====');
console.log(printSchema(schema));

// ===== 内省（Introspection）：Schema 自我描述，GraphiQL/Apollo Sandbox 靠它生成文档与补全 =====
const root = {
  me: () => ({ id: '1', name: '小明', posts: () => [
    { id: 'p1', title: 'GraphQL', status: 'PUBLISHED', views: 10, tags: ['gql'] },
  ] }),
};
const introspect = `
  query {
    __schema {
      queryType { name }
      types { name kind }
    }
  }`;
const res = await graphql({ schema, source: introspect, rootValue: root });
const types = res.data.__schema.types.filter(t => !t.name.startsWith('__'));
console.log('\n===== 内省结果：本 Schema 定义的类型 =====');
console.log('根 Query 类型名 =', res.data.__schema.queryType.name);
console.log('自定义/内置类型：', types.map(t => `${t.name}(${t.kind})`).join(', '));
console.log('\n要点：Schema 是「契约」——前后端只要约定好类型，客户端就能在编译期/编辑器里获得校验与自动补全。');

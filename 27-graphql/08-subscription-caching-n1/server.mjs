/**
 * 08b · 订阅 Subscription —— 基于 WebSocket 的实时推送服务
 * -------------------------------------------------------------------
 * Query/Mutation 走「请求-响应」（HTTP）；Subscription 走「长连接推送」（WebSocket）。
 * 现代标准协议是 graphql-ws（github.com/enisdenjo/graphql-ws），本文件用它 + ws 起一个
 * 纯 WebSocket 的 GraphQL 服务（同一条连接支持 query / mutation / subscription）。
 *
 * 机制：Subscription 字段的 `subscribe` 返回一个 AsyncIterator（这里用 graphql-subscriptions
 * 的 PubSub 提供）；Mutation 里 pubsub.publish(...) 发事件，所有订阅者被推送。
 *
 * 前提：npm install（需要 graphql / graphql-ws / ws / graphql-subscriptions）
 * 运行：npm run 08:server  然后另开终端 npm run 08:sub
 */
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { PubSub } from 'graphql-subscriptions';
import {
  GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLID,
  GraphQLNonNull, GraphQLList,
} from 'graphql';

const pubsub = new PubSub();
const COMMENT_ADDED = 'COMMENT_ADDED';
const comments = []; // 内存存储

// ===== 类型 =====
const CommentType = new GraphQLObjectType({
  name: 'Comment',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    text: { type: new GraphQLNonNull(GraphQLString) },
  },
});

// ===== Query：读全部评论 =====
const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    comments: { type: new GraphQLList(CommentType), resolve: () => comments },
  },
});

// ===== Mutation：新增评论 → publish 事件 =====
const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addComment: {
      type: CommentType,
      args: { text: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: (_p, { text }) => {
        const comment = { id: String(comments.length + 1), text };
        comments.push(comment);
        // 广播：所有订阅 commentAdded 的客户端都会收到
        pubsub.publish(COMMENT_ADDED, { commentAdded: comment });
        return comment;
      },
    },
  },
});

// ===== Subscription：订阅「新评论」事件流 =====
const SubscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  fields: {
    commentAdded: {
      type: CommentType,
      // subscribe 返回 AsyncIterator；每次 publish 都会向订阅者吐一个值
      subscribe: () => pubsub.asyncIterableIterator(COMMENT_ADDED),
      // 默认 resolve 会取 payload.commentAdded 作为字段值
    },
  },
});

const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  subscription: SubscriptionType,
});

// ===== 用 ws 起 WebSocket 服务，graphql-ws 负责协议握手/多路复用 =====
const wsServer = new WebSocketServer({ port: 4001, path: '/graphql' });
useServer({ schema }, wsServer);

console.log('🔌 GraphQL over WebSocket 已启动：ws://localhost:4001/graphql');
console.log('   另开一个终端运行 `npm run 08:sub`：它会先订阅，再连发几条评论，观察实时推送。');

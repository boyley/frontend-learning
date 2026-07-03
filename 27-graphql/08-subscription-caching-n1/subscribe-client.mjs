/**
 * 08c · 订阅客户端 —— 用 graphql-ws 订阅事件流并触发 Mutation
 * -------------------------------------------------------------------
 * 同一条 WebSocket 连接既能 subscribe（持续收推送），也能发 mutation（一次性结果）。
 * 本文件：① 订阅 commentAdded；② 隔 800ms 连发 3 条 addComment；③ 打印收到的实时推送。
 *
 * 前提：先运行 npm run 08:server 启动服务。
 * 运行：npm run 08:sub
 */
import { createClient } from 'graphql-ws';
import { WebSocket } from 'ws';

const client = createClient({
  url: 'ws://localhost:4001/graphql',
  webSocketImpl: WebSocket, // Node 没有内置 WebSocket，注入 ws 的实现
});

// 把 client.subscribe 包成 Promise，用于 mutation 这类「单次结果」的操作
function execute(payload) {
  return new Promise((resolve, reject) => {
    let result;
    client.subscribe(payload, {
      next: (data) => { result = data; },
      error: reject,
      complete: () => resolve(result),
    });
  });
}

// ① 订阅：持续监听服务端推送
console.log('📡 已订阅 commentAdded，等待实时推送……\n');
const unsubscribe = client.subscribe(
  { query: 'subscription { commentAdded { id text } }' },
  {
    next: ({ data }) => console.log('  ⬇️  收到推送：', JSON.stringify(data.commentAdded)),
    error: (e) => console.error('订阅出错：', e),
    complete: () => console.log('订阅结束'),
  },
);

// ② 隔一会儿连发 3 条评论（每条都会触发上面订阅的推送）
const texts = ['第一条评论', '第二条评论', '第三条评论'];
for (let i = 0; i < texts.length; i++) {
  await new Promise((r) => setTimeout(r, 800));
  const res = await execute({
    query: 'mutation($t: String!){ addComment(text: $t){ id text } }',
    variables: { t: texts[i] },
  });
  console.log('  ⬆️  已发送 mutation：', JSON.stringify(res.data.addComment));
}

// ③ 收尾
await new Promise((r) => setTimeout(r, 500));
unsubscribe();
console.log('\n完成：3 条 mutation 各触发一次订阅推送，实时性由 WebSocket 长连接保证。');
await client.dispose();
process.exit(0);

// web-bff.js
// -----------------------------------------------------------------------------
// Web 端专属的 BFF（Backend For Frontend）。
// 监听 6001 端口，只服务 Web 前端。
//
// 收到 GET /home 时，它做三件事：
//   1) 扇出（fan-out）：并发调用 user / order / product 三个下游微服务；
//   2) 聚合（aggregate）：把三个结果合并；
//   3) 裁剪（trim）：只挑「Web 首页真正需要的字段」，拼成前端友好的形状返回。
//
// 前端因此只发一次请求，就拿到正好合适的数据，不用自己调三个接口再拼。
//
// 纯 Node 内置模块，零依赖。
// 运行： node web-bff.js   然后  curl http://localhost:6001/home
// -----------------------------------------------------------------------------

const http = require('http');
// 引入上面那三个「模拟的下游微服务」
const { getUser, getOrders, getProducts } = require('./services');

const PORT = 6001;
const USER_ID = 'u_10086'; // demo 里写死一个用户；真实项目从鉴权 token 里解析

// ---------------------------------------------------------------------------
// 核心：聚合 + 裁剪，产出「Web 首页需要的形状」
// ---------------------------------------------------------------------------
async function buildHomePayload(userId) {
  const t0 = Date.now();

  // 【并发扇出】三个下游同时请求，总耗时≈最慢的那个，而不是三个相加。
  // 如果写成三次 await 串行，耗时就会累加，首屏更慢。
  const [user, orders, products] = await Promise.all([
    getUser(userId),
    getOrders(userId),
    getProducts(userId),
  ]);

  const cost = Date.now() - t0;
  console.log(`[Web BFF] /home 扇出并发完成，耗时 ${cost}ms`);

  // 【聚合 + 裁剪】只取首页要用的字段，重组成前端友好的形状。
  // 对比 services.js 里那一坨完整数据，这里明显「瘦身」了。
  return {
    // 顶部欢迎语：用 user 服务的昵称拼一句话（前端不用自己拼）
    greeting: `欢迎回来，${user.nickname}！`,
    // 首页只展示头像和 VIP 等级，不需要手机号/邮箱/地址等隐私字段
    userBrief: {
      name: user.name,
      avatar: user.avatar,
      vipLevel: user.vipLevel,
    },
    // 最近订单：首页只展示「最近 3 笔」，且每笔只要标题/金额/状态
    // （下游给了 4 笔、每笔十几个字段，这里裁成 3 笔、每笔 3 个字段）
    recentOrders: orders.slice(0, 3).map((o) => ({
      id: o.orderId,
      title: o.title,
      amount: o.amount,
      status: o.status,
    })),
    // 推荐商品：首页只展示名字/价格/封面，且过滤掉没库存的（stock=0）
    recommendations: products
      .filter((p) => p.stock > 0)
      .map((p) => ({
        id: p.productId,
        name: p.name,
        price: p.price,
        cover: p.cover,
      })),
  };
}

// ---------------------------------------------------------------------------
// http 服务
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  // 只处理 GET /home，其它路径返回 404
  if (req.method === 'GET' && req.url === '/home') {
    try {
      const payload = await buildHomePayload(USER_ID);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(payload, null, 2));
    } catch (err) {
      // 生产中更推荐 Promise.allSettled + 兜底降级，返回「部分数据」而不是整页 500
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '聚合失败', message: String(err) }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ error: 'Not Found', hint: '试试 GET /home' }));
});

server.listen(PORT, () => {
  console.log(`Web BFF 已启动： http://localhost:${PORT}`);
  console.log(`试一下：       curl http://localhost:${PORT}/home`);
});

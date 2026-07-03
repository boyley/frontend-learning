// services.js
// -----------------------------------------------------------------------------
// 用本地 async 函数「模拟」三个后端微服务：user / order / product。
// 每个服务：
//   1) 返回一坨「完整的原始数据」（字段很多，故意做得臃肿，模拟真实微服务）；
//   2) 加一点随机延迟，模拟网络/数据库耗时，方便演示 BFF 里的「并发扇出」。
//
// 这三个函数会被 web-bff.js 引用（require）。
// 也可以直接 `node services.js`，会把三个服务各自的原始返回打印出来，
// 让你直观看到「下游给的数据有多全」，再和 BFF 裁剪后的形状对比。
// -----------------------------------------------------------------------------

// 小工具：睡 ms 毫秒（返回 Promise），用来模拟服务处理耗时
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 50~200ms 之间的随机延迟，让三个服务耗时不一样，凸显并发的价值
function randomDelay() {
  return 50 + Math.floor(Math.random() * 150);
}

// ---------------------------------------------------------------------------
// user 服务：返回某个用户的「完整档案」。字段故意很多（真实项目常常几十个字段）。
// ---------------------------------------------------------------------------
async function getUser(userId) {
  await sleep(randomDelay()); // 模拟耗时
  return {
    id: userId,
    name: '张三',
    nickname: '阿三',
    avatar: 'https://cdn.example.com/avatar/zhangsan.png',
    avatarThumb: 'https://cdn.example.com/avatar/zhangsan_64.png',
    email: 'zhangsan@example.com',
    phone: '138****8888',
    gender: 'male',
    birthday: '1995-01-01',
    address: '北京市朝阳区某某街道 100 号',
    vipLevel: 3,
    points: 12800,
    registerTime: '2019-06-01T08:00:00Z',
    lastLoginTime: '2026-07-03T09:30:00Z',
    // ……真实项目里还会有更多字段，这里省略
  };
}

// ---------------------------------------------------------------------------
// order 服务：返回该用户的订单列表（这里给 4 笔，字段也很全）。
// ---------------------------------------------------------------------------
async function getOrders(userId) {
  await sleep(randomDelay());
  return [
    { orderId: 'O2026070301', title: '机械键盘', amount: 399, status: 'paid',    createTime: '2026-07-02T10:00:00Z', address: '北京市朝阳区…', logisticsNo: 'SF123' },
    { orderId: 'O2026070212', title: '显示器',   amount: 1299, status: 'shipped', createTime: '2026-07-01T18:20:00Z', address: '北京市朝阳区…', logisticsNo: 'SF456' },
    { orderId: 'O2026063099', title: '人体工学椅', amount: 899, status: 'done',    createTime: '2026-06-30T12:00:00Z', address: '北京市朝阳区…', logisticsNo: 'SF789' },
    { orderId: 'O2026062800', title: '台灯',     amount: 129,  status: 'done',    createTime: '2026-06-28T20:00:00Z', address: '北京市朝阳区…', logisticsNo: 'SF000' },
  ];
}

// ---------------------------------------------------------------------------
// product 服务：返回给该用户的推荐商品列表。
// ---------------------------------------------------------------------------
async function getProducts(userId) {
  await sleep(randomDelay());
  return [
    { productId: 'P1001', name: '无线鼠标',   price: 199, cover: 'https://cdn.example.com/p/1001.png', stock: 120, salesCount: 3400, detailDesc: '长长的商品详情描述……' },
    { productId: 'P1002', name: '机械键盘 Pro', price: 599, cover: 'https://cdn.example.com/p/1002.png', stock: 30,  salesCount: 980,  detailDesc: '长长的商品详情描述……' },
    { productId: 'P1003', name: 'USB-C 扩展坞', price: 259, cover: 'https://cdn.example.com/p/1003.png', stock: 0,   salesCount: 210,  detailDesc: '长长的商品详情描述……' },
  ];
}

// 导出给 web-bff.js 使用
module.exports = { getUser, getOrders, getProducts };

// ---------------------------------------------------------------------------
// 如果是「直接运行本文件」（node services.js），就打印三个服务的原始返回，
// 方便你直观感受「下游数据有多全」。被 require 时下面这段不会执行。
// ---------------------------------------------------------------------------
if (require.main === module) {
  (async () => {
    const userId = 'u_10086';
    console.log('=== 直接调用三个下游服务，查看它们各自返回的「完整原始数据」 ===\n');

    const user = await getUser(userId);
    console.log('[user 服务] 原始返回：');
    console.log(JSON.stringify(user, null, 2), '\n');

    const orders = await getOrders(userId);
    console.log('[order 服务] 原始返回：');
    console.log(JSON.stringify(orders, null, 2), '\n');

    const products = await getProducts(userId);
    console.log('[product 服务] 原始返回：');
    console.log(JSON.stringify(products, null, 2), '\n');

    console.log('注意：这些数据字段又多又全。前端并不需要全部。');
    console.log('接下来运行 `node web-bff.js` 再 `curl localhost:6001/home`，');
    console.log('看看 Web BFF 把它们聚合裁剪成了什么「正好合适的形状」。');
  })();
}

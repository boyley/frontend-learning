/**
 * all-services.js —— 后端微服务集群（演示用）
 * ------------------------------------------------------------------
 * 在「同一个 Node 进程」里，用 Express 起 3 个独立的后端微服务：
 *   - user-service     : http://localhost:5051   返回用户数据
 *   - order-service    : http://localhost:5052   返回订单数据
 *   - product-service  : http://localhost:5053   返回商品数据
 *
 * 真实生产环境里，这 3 个服务通常是 3 个独立进程 / 3 个容器 / 3 台机器，
 * 这里为了「一条命令就能起全套」把它们塞进一个文件，方便本地体验。
 *
 * 对应模块知识点：
 *   - 模块 03（微服务拆分）：一个业务 = 一个服务 = 一个端口，各自独立。
 *   - 模块 08（服务实例标识）：每个响应里带 instanceId，方便观察「请求打到了哪个实例」。
 * ------------------------------------------------------------------
 */

const express = require('express');

// 用一个随机字符串标识「本次启动的进程实例」，
// 让每条响应都能看出是哪个实例返回的（真实场景里会是不同的容器/机器）。
const INSTANCE_ID = 'inst-' + Math.random().toString(36).slice(2, 8);

/**
 * 工厂函数：快速创建一个「长得差不多」的微服务。
 * @param {object} opts
 * @param {string} opts.name    服务名，如 user-service
 * @param {number} opts.port    监听端口
 * @param {function} opts.data  返回该服务业务数据的函数
 * @param {boolean} [opts.flaky] 是否「偶发失败」，用于演示网关的降级/熔断
 */
function createService({ name, port, data, flaky = false }) {
  const app = express();

  // 每个服务都打印自己收到的请求，方便和网关日志对照。
  app.use((req, res, next) => {
    console.log(`[${name}] 收到请求 ${req.method} ${req.url}`);
    next();
  });

  // 健康检查接口：真实网关/K8s 会靠它判断服务是否存活。
  app.get('/health', (req, res) => {
    res.json({ service: name, status: 'UP', instanceId: INSTANCE_ID });
  });

  // 业务主接口：注意这里用 '/' 通配，
  // 因为网关转发过来的路径已经是「去掉前缀后的真实路径」（见 gateway.js 的路由说明）。
  app.get('/*', (req, res) => {
    // flaky 服务：有 30% 概率直接 500，用来演示网关侧的错误兜底 / 降级。
    if (flaky && Math.random() < 0.3) {
      console.log(`[${name}] 故意抛出 500（演示熔断/降级）`);
      return res.status(500).json({
        service: name,
        error: 'Internal Server Error（演示用偶发失败）',
        instanceId: INSTANCE_ID,
      });
    }

    res.json({
      service: name,
      instanceId: INSTANCE_ID,
      path: req.url,
      data: data(),
      timestamp: new Date().toISOString(),
    });
  });

  app.listen(port, () => {
    console.log(`✅ ${name} 已启动 → http://localhost:${port}  (instance=${INSTANCE_ID})`);
  });
}

// ---- user-service：用户数据 -------------------------------------
createService({
  name: 'user-service',
  port: 5051,
  data: () => [
    { id: 1, name: '张三', role: 'admin' },
    { id: 2, name: '李四', role: 'user' },
  ],
});

// ---- order-service：订单数据（标记为 flaky，用来演示降级） --------
createService({
  name: 'order-service',
  port: 5052,
  flaky: true,
  data: () => [
    { orderId: 'A1001', amount: 199, status: 'paid' },
    { orderId: 'A1002', amount: 59, status: 'pending' },
  ],
});

// ---- product-service：商品数据 ----------------------------------
createService({
  name: 'product-service',
  port: 5053,
  data: () => [
    { sku: 'P-01', title: '机械键盘', price: 399 },
    { sku: 'P-02', title: '人体工学椅', price: 1299 },
  ],
});

console.log('\n👉 三个后端微服务已全部启动，接下来在另一个终端执行 `npm start` 启动网关。\n');

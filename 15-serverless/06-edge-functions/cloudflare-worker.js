/**
 * 06 · Cloudflare Worker（边缘函数）示例
 * ---------------------------------------------------------------
 * Cloudflare Workers 是边缘计算的代表：代码运行在全球 300+ 数据中心，
 * 采用 V8 isolate（隔离沙箱）模型——不为每个请求起一个进程/容器，
 * 而是在一个共享的 V8 进程里为每个 Worker 建一个轻量隔离环境。
 * 结果：冷启动 ~0（毫秒级），但也因此有限制（不能用完整 Node API、
 * CPU 时间受限、包体积受限）。
 * 对照官方：https://developers.cloudflare.com/workers/
 *
 * 部署：用 wrangler（见 wrangler.toml），`npx wrangler dev` 本地跑。
 */

export default {
  // Worker 的入口就是一个 fetch handler，Web 标准 Request/Response
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const name = url.searchParams.get('name') || 'world';

    // Cloudflare 在请求头注入访问者国家码等边缘信息
    const country = request.headers.get('cf-ipcountry') || '未知';

    return new Response(
      JSON.stringify({
        message: `Hello ${name}, from Cloudflare edge`,
        country,
        // env 是绑定的环境变量 / KV / R2 等（BaaS 能力，见 07）
        runtime: 'Cloudflare Worker (V8 isolate)',
      }),
      { headers: { 'content-type': 'application/json; charset=utf-8' } }
    );
  },
};

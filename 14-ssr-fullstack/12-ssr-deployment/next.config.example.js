// ============================================================================
// Next.js 配置示例（部署形态相关）—— 教学用，带 .example 后缀避免被工具误跑。
// 实践时复制为 next.config.js（去掉 .example）放进真实 Next 项目根目录。
// 官方文档：https://nextjs.org/docs/app/api-reference/config/next-config-js/output
// ============================================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  // --------------------------------------------------------------------------
  // 选项 A：standalone（精简自包含产物）—— 容器化 / Docker 首选
  // --------------------------------------------------------------------------
  // 开启后，`next build` 会在 .next/standalone/ 生成一个「最小可运行」目录：
  //   - 只含运行时真正需要的文件（含裁剪过的 node_modules）
  //   - 附带一个 server.js，可直接 `node .next/standalone/server.js` 起服务
  // 好处：Docker 镜像体积从 GB 级降到几百 MB。
  // 注意：standalone 产物【不含】 .next/static 与 public/，
  //       Dockerfile 里要单独 COPY 进去（见 Dockerfile.example）。
  output: "standalone",

  // --------------------------------------------------------------------------
  // 选项 B：纯静态导出（SSG）—— 与选项 A 互斥，二选一
  // --------------------------------------------------------------------------
  // 打开下面这行、并注释掉上面的 output: 'standalone'，
  // `next build` 会把整站预渲染成静态 HTML 到 out/ 目录，可直接丢 CDN / 对象存储。
  // 代价：放弃 SSR、ISR、Route Handlers（API）、Node 版 next/image 优化等
  //       一切「需要服务端」的能力。仅适合纯内容站（文档 / 博客 / 营销页）。
  //
  // output: 'export',

  // 其它常见配置（与部署形态无直接关系，仅示意）
  images: {
    // 允许优化的远程图片域名（standalone/Node 服务下才生效；export 下需 unoptimized）
    remotePatterns: [{ protocol: "https", hostname: "images.example.com" }],
  },
};

module.exports = nextConfig;

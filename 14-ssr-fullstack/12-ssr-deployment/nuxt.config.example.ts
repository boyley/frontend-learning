// ============================================================================
// Nuxt 配置示例（部署形态 / Nitro preset）—— 教学用，带 .example 后缀避免误跑。
// 实践时复制为 nuxt.config.ts（去掉 .example）放进真实 Nuxt 项目根目录。
// 官方文档：https://nuxt.com/docs/getting-started/deployment
// Nitro preset 列表：https://nitro.build/deploy
// ============================================================================

// Nuxt 的构建底座是 Nitro（服务端引擎）。同一份源码，切换 preset 即可
// 产出适配不同平台的产物——这就是 Nuxt「一份源码，多种目标」的关键。
export default defineNuxtConfig({
  // SSR 默认开启（true）。设为 false 则退化为纯 SPA（客户端渲染）。
  ssr: true,

  nitro: {
    // ------------------------------------------------------------------------
    // preset：指定部署目标。留空 / 'node-server' 为默认（标准 Node 服务）。
    // 也可用环境变量覆盖：NITRO_PRESET=cloudflare_module nuxt build
    // ------------------------------------------------------------------------
    // 常见取值：
    //   'node-server'        标准 Node 服务，产物 .output/server/index.mjs（默认）
    //   'vercel'             适配 Vercel
    //   'netlify'            适配 Netlify
    //   'cloudflare_module'  Cloudflare Workers（边缘运行时，受限：无完整 Node API）
    //   'static'             等价 nuxt generate，纯静态站点 .output/public/
    preset: "node-server",

    // 也可显式声明要在构建时预渲染（SSG）的路由，Nitro 会把它们生成静态 HTML。
    prerender: {
      routes: ["/", "/about"], // 这些页面构建时直出为静态文件
    },
  },

  // 运行时配置：区分「仅服务端可见」与「客户端也可见（public）」。
  runtimeConfig: {
    apiSecret: "", // 仅服务端；用环境变量 NUXT_API_SECRET 注入
    public: {
      apiBase: "/api", // 客户端也可读；用 NUXT_PUBLIC_API_BASE 注入
    },
  },
});

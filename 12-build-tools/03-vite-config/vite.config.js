// vite.config.js —— Vite 配置文件「带详细注释的全景示例」
// 本文件演示最常用的配置项；真实项目里按需取用即可，不必全写。

import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// ⭐ 用 defineConfig 包裹，能获得完整的 TS 类型提示（即使是 .js 文件）
export default defineConfig({
  // ───────────────────────────────────────────────
  // 一、路径相关
  // ───────────────────────────────────────────────

  // root：项目根目录（index.html 所在处），默认就是当前目录，一般不用改
  root: '.',

  // base：部署时的公共基础路径。
  //  - 部署在域名根目录 → '/'（默认）
  //  - 部署在子路径（如 https://abc.com/my-app/）→ '/my-app/'
  base: '/',

  // ───────────────────────────────────────────────
  // 二、模块解析
  // ───────────────────────────────────────────────
  resolve: {
    // 路径别名：把 @ 映射到 src 目录，import 时少写一堆 ../../
    // 例：import utils from '@/utils.js'  等价于  src/utils.js
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // ───────────────────────────────────────────────
  // 三、开发服务器（只在 npm run dev 生效）
  // ───────────────────────────────────────────────
  server: {
    port: 5180,        // 指定端口（默认 5173；被占用时自动 +1）
    open: true,        // 启动后自动打开浏览器
    host: true,        // 监听所有地址，局域网其他设备可访问（等价 --host）
    strictPort: false, // true=端口被占就报错退出；false=自动换端口

    // 代理：解决开发时跨域。把以 /api 开头的请求转发到后端，
    // 浏览器仍以为是同源请求，绕过 CORS。
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 后端真实地址
        changeOrigin: true,              // 修改请求头 Host 为 target
        // 把 /api/users 重写成 /users 再发给后端（按需）
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  // ───────────────────────────────────────────────
  // 四、生产构建（只在 npm run build 生效，详见模块 08）
  // ───────────────────────────────────────────────
  build: {
    outDir: 'dist',        // 产物输出目录（默认 dist）
    assetsDir: 'assets',   // 静态资源子目录（默认 assets）
    sourcemap: false,      // 是否生成 source map（线上排错可设 true）
    // 内联阈值：小于 4KB 的资源会被转成 base64 内联，减少请求数（默认 4096）
    assetsInlineLimit: 4096,
    minify: 'esbuild',     // 压缩器：'esbuild'(默认,快) | 'terser'(更小,需装terser) | false

    // 高级：Rollup 打包选项，例如手动分包
    rollupOptions: {
      output: {
        // 把第三方库单独拆成一个 chunk，利于浏览器长期缓存
        manualChunks: {
          // vendor: ['lodash-es'],  // 示例：把 lodash 单独打包
        },
      },
    },
  },

  // ───────────────────────────────────────────────
  // 五、全局常量替换（编译时把代码里的标识符替换为字面量）
  // ───────────────────────────────────────────────
  define: {
    // 代码里写 __APP_VERSION__，构建时会被替换成 "1.0.0" 字符串
    __APP_VERSION__: JSON.stringify('1.0.0'),
  },

  // ───────────────────────────────────────────────
  // 六、CSS 相关
  // ───────────────────────────────────────────────
  css: {
    // CSS Modules 行为配置（可选）
    modules: {
      // localsConvention: 'camelCase', // 允许用驼峰访问类名
    },
    // 预处理器全局变量注入（需安装对应预处理器，如 sass）
    // preprocessorOptions: {
    //   scss: { additionalData: `@import "@/styles/vars.scss";` },
    // },
  },

  // 插件数组（见模块 05）
  plugins: [],
});

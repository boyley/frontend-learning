// vite.config.js —— 聚焦「生产构建」相关配置
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',          // 输出目录
    sourcemap: true,         // 生成 source map，方便线上排错（会多出 .map 文件）
    assetsInlineLimit: 4096, // < 4KB 的资源内联为 base64，减少请求
    minify: 'esbuild',       // 用 esbuild 压缩（默认、最快）

    // chunkSizeWarningLimit：单个 chunk 超过这个 KB 会告警（默认 500）
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        // 手动分包：把第三方库拆到单独的 vendor chunk。
        // 好处：业务代码常改、库不常改，分开后用户只需重新下载变化的部分，
        // 库 chunk 的 hash 不变可被浏览器长期缓存。
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // 自定义产物文件名（默认就带 [hash]，用于缓存失效控制）
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
});

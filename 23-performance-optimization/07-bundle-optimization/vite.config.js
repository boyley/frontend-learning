// vite.config.js —— Vite 5.x 构建配置
// 目的：演示 tree-shaking，并在 build 后生成「打包体积可视化图」。
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  // Vite 的生产构建底层用 Rollup，Rollup 天然基于 ESM 静态结构做 tree-shaking。
  plugins: [
    // rollup-plugin-visualizer：build 结束后生成一张交互式体积图（treemap）。
    visualizer({
      filename: 'dist/stats.html', // 产物：构建后打开这个文件即可看到每个模块占多大体积
      title: '打包体积分析（Bundle Size）',
      // gzipSize / brotliSize：显示压缩后的体积。
      // 关键认知：磁盘上的原始体积没意义，浏览器通过网络下载的是 gzip/brotli 压缩后的字节，
      //          这才是「网络真实成本」，也是我们真正要优化的数字。
      gzipSize: true,
      brotliSize: true,
      open: false // 设为 true 会在 build 后自动用浏览器打开图；这里关掉，README 里手动打开
    })
  ],
  build: {
    // 关闭压缩混淆，方便在 dist 里用肉眼确认「未用函数是否真的被删掉了」。
    // 真实项目请保持默认（minify: 'esbuild'），否则体积会偏大。
    minify: false,
    // 生成 sourcemap 便于观察，不影响 tree-shaking 结论
    sourcemap: false,
    rollupOptions: {
      // 我们提供两个入口：main-bad（未优化）和 main-good（优化），
      // 各自独立打包，方便对比两个产物的体积差异。
      input: {
        bad: new URL('./index-bad.html', import.meta.url).pathname,
        good: new URL('./index-good.html', import.meta.url).pathname
      }
    }
  }
})

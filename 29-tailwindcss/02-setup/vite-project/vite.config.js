// Vite 配置：v4 用官方插件 @tailwindcss/vite，无需再配 PostCSS / autoprefixer。
// 这是 v4 相比 v3 最大的工程化简化点之一。
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(), // 挂上插件，Tailwind 就会扫描源码、JIT 按需生成 CSS
  ],
})

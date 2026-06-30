import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 配置：启用官方 React 插件（提供 JSX 转译、快速刷新 HMR）
export default defineConfig({
  plugins: [react()],
})

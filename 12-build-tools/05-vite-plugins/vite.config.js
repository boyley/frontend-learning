// vite.config.js —— 演示插件的使用
import { defineConfig } from 'vite';
import myBannerPlugin from './my-banner-plugin.js';

export default defineConfig({
  // plugins 是一个数组，按顺序应用。
  // 数组里可以是：官方/社区插件（如 @vitejs/plugin-vue）、自己写的插件。
  plugins: [
    // 使用我们手写的插件，并传入配置项
    myBannerPlugin({ author: 'frontend-learning' }),

    // 真实项目里常见的官方插件示例（这里注释掉，避免引入额外依赖）：
    // import vue from '@vitejs/plugin-vue';        plugins: [vue()]
    // import react from '@vitejs/plugin-react';    plugins: [react()]
    // import legacy from '@vitejs/plugin-legacy';  plugins: [legacy()]
  ],
});

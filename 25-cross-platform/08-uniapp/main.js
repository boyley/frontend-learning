// main.js —— uni-app + Vue3 入口，创建应用实例
import { createSSRApp } from 'vue';
import App from './App.vue';

// uni-app 要求用 createSSRApp（兼容各端）导出一个 createApp 工厂
export function createApp() {
  const app = createSSRApp(App);
  // 可在此 app.use(pinia) 等注册全局插件
  return { app };
}

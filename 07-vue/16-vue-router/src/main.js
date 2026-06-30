import { createApp } from 'vue'
import App from './App.vue'
import router from './router'   // 引入路由实例

// 创建应用并通过 use(router) 安装路由插件，再挂载
createApp(App)
  .use(router)
  .mount('#app')
